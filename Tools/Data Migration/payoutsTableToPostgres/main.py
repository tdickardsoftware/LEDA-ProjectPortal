import csv
import json
import time
from pathlib import Path
from collections import defaultdict
from decimal import Decimal

def main():
    # File paths
    payouts_file = Path(__file__).parent / "Working" / "leda_payouts_table_export.csv"
    adjustments_file = Path(__file__).parent / "Working" / "leda_adjustments_export.csv"
    output_file = Path(__file__).parent / "Output" / "insert_payouts.sql"
    
    # Make sure output directory exists
    output_file.parent.mkdir(exist_ok=True)
    
    # Payout amounts by place
    payout_amounts = {
        1: 300,
        2: 200,
        3: 150,
        4: 100,
        5: 75,
        6: 70,
        7: 60,
        8: 50
    }
    
    # Read payouts CSV and organize data by season code
    season_data = defaultdict(lambda: defaultdict(lambda: defaultdict(dict)))
    
    with open(payouts_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            division = row['Division']
            subdivision = row['Subdivision']
            standings = int(row['Standings'])
            team_id = row['Team ID Number']
            season_code = row['Season Code'].upper()
            
            # Skip if standings is 0
            if standings == 0:
                continue
            
            # Build nested structure: Division -> Subdivision -> TeamID
            subdivision_key = f"Subdivision {subdivision}"
            
            if subdivision_key not in season_data[season_code]:
                season_data[season_code][subdivision_key] = {}
            
            if division not in season_data[season_code][subdivision_key]:
                season_data[season_code][subdivision_key][division] = {}
            
            # Store team data
            season_data[season_code][subdivision_key][division][team_id] = {
                "place": standings,
                "amount": payout_amounts.get(standings, 0),
                "adjustments": {},
                "adjustmentAmount": 0
            }
    
    # Read adjustments CSV and process adjustments
    adjustments_by_season = defaultdict(list)
    
    with open(adjustments_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            standings = float(row['Standings'])
            
            # Skip if standings is 0
            if standings == 0:
                continue
            
            team_id = row['Team ID Number']
            season_code = row['Season Code'].upper()
            division = row['Division']
            subdivision = row['Subdivision']
            
            # Parse adjustment amount
            adjustment_str = row['Payout Check Adjustment Amount'].replace('$', '').replace('(', '-').replace(')', '').replace(',', '')
            adjustment_amount = float(adjustment_str) if adjustment_str else 0.0
            
            # Parse adjustment reason
            adjustment_reason = row['Payout Check Adjustment Reason'].strip() if row['Payout Check Adjustment Reason'] else ""
            
            if adjustment_amount != 0:
                adjustments_by_season[season_code].append({
                    'team_id': team_id,
                    'division': division,
                    'subdivision': subdivision,
                    'amount': adjustment_amount,
                    'reason': adjustment_reason
                })
    
    # Process adjustments and determine if global or team-specific
    for season_code, adjustments in adjustments_by_season.items():
        if season_code not in season_data:
            continue
        
        # Group adjustments by amount and reason to detect global adjustments
        adjustment_groups = defaultdict(list)
        for adj in adjustments:
            key = (adj['amount'], adj['reason'])
            adjustment_groups[key].append(adj)
        
        # Get all teams in this season
        all_teams = set()
        for subdivision in season_data[season_code].values():
            for division_teams in subdivision.values():
                for team_id in division_teams.keys():
                    all_teams.add(team_id)
        
        # Generate unique timestamp-based IDs for each unique adjustment
        current_time_ms = int(time.time() * 1000)
        
        for (amount, reason), adj_list in adjustment_groups.items():
            teams_with_adjustment = set(adj['team_id'] for adj in adj_list)
            
            # Determine if this is a global adjustment
            is_global = len(teams_with_adjustment) == len(all_teams)
            
            # Create adjustment ID
            adj_id = f"{'global' if is_global else 'team'}_adj_{current_time_ms}"
            current_time_ms += 1  # Increment for next adjustment
            
            # Apply adjustment to teams
            for adj in adj_list:
                team_id = adj['team_id']
                subdivision_key = f"Subdivision {adj['subdivision']}"
                
                # Find the team in the season data
                if subdivision_key in season_data[season_code]:
                    for division, teams in season_data[season_code][subdivision_key].items():
                        if team_id in teams:
                            # Add adjustment (adjustments dict already initialized)
                            teams[team_id]['adjustments'][adj_id] = {
                                "notes": reason if reason else "Adjustment made by user",
                                "credit": amount > 0,
                                "global": is_global,
                                "adjustmentAmount": int(amount)
                            }
                            
                            # Update total adjustment amount
                            teams[team_id]['adjustmentAmount'] += int(amount)
    
    # Generate SQL file with single INSERT statement
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- PostgreSQL INSERT statement for leda_payouts table\n")
        f.write("-- Generated from leda_payouts_table_export.csv\n\n")
        f.write("INSERT INTO public.leda_payouts (\"seasonCode\", \"payoutsData\")\n")
        f.write("VALUES\n")
        
        values_list = []
        
        for season_code in sorted(season_data.keys()):
            # Reorganize data for this season: Division -> Subdivision -> Team
            payouts_data = defaultdict(dict)
            
            for subdivision_key in season_data[season_code]:
                for division in season_data[season_code][subdivision_key]:
                    if division not in payouts_data:
                        payouts_data[division] = {}
                    
                    payouts_data[division][subdivision_key] = season_data[season_code][subdivision_key][division]
            
            # Convert to regular dict for JSON serialization
            payouts_dict = {k: dict(v) for k, v in payouts_data.items()}
            
            # Skip if no data for this season
            if not payouts_dict:
                continue
            
            # Convert to JSON string and escape single quotes for PostgreSQL
            json_str = json.dumps(payouts_dict, indent=2)
            json_str_escaped = json_str.replace("'", "''")
            
            # Add to values list with comment
            values_list.append(f"  -- Season: {season_code}\n  ('{season_code}', '{json_str_escaped}')")
        
        # Write all values separated by commas
        f.write(",\n".join(values_list))
        f.write(";\n")
    
    print(f"✓ SQL file generated: {output_file}")
    print(f"✓ Processed {len(season_data)} seasons")
    
    # Show summary
    print("\nSeasons with data:")
    for season_code in sorted(season_data.keys()):
        team_count = sum(
            len(teams)
            for subdivision in season_data[season_code].values()
            for division_teams in subdivision.values()
            for teams in division_teams.values()
        )
        print(f"  {season_code}: {team_count} teams")

if __name__ == "__main__":
    main()
