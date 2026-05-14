import csv
import json
from tqdm import tqdm

# File paths
schedule_csv = r'Working\leda_schedule_table_export.csv'
lookup_csv = r'Lookup\leda_teams_table_export.csv'
seasons_csv = r'Lookup\leda_seasons_table_export.csv'
output_sql = r'Output\leda_schedule_insert.sql'
output_csv = r'Output\leda_schedule_normalized.csv'

# Menu for output format selection
def show_menu():
    print("\n=== Schedule Export Format ===")
    print("1. SQL Insert Statement (PostgreSQL JSON)")
    print("2. Normalized CSV")
    print("==============================")
    while True:
        choice = input("Select output format (1 or 2): ").strip()
        if choice in ['1', '2']:
            return choice
        print("Invalid choice. Please enter 1 or 2.")

# Read schedule and lookup CSVs using csv module
def read_csv_dicts(filepath):
    with open(filepath, 'r', encoding='latin1') as f:
        reader = csv.DictReader(f)
        return list(reader)

schedule_rows = read_csv_dicts(schedule_csv)
lookup_rows = read_csv_dicts(lookup_csv)
seasons_rows = read_csv_dicts(seasons_csv)

# Build team name lookup: {teamId: teamName}
team_lookup = {}
for row in lookup_rows:
    team_lookup[str(row['ID Number'])] = row['Team Name']

# Build season dates lookup: {seasonCode: {week_num: date_string}}
season_dates_lookup = {}
for row in seasons_rows:
    season_code = row['Season Code'].upper()
    dates = {}
    for i in range(1, 16):  # Date1 through Date15
        date_key = f'Date{i}'
        if date_key in row and row[date_key]:
            # Parse the date string (format: "9/13/2000 0:00:00")
            date_str = row[date_key].strip()
            if date_str:
                # Extract just the date part (before the space)
                date_part = date_str.split(' ')[0]
                dates[i] = date_part
    season_dates_lookup[season_code] = dates

# Helper: get team name by id
def get_team_name(team_id):
    return team_lookup.get(str(team_id), "")

# Helper: get home/away (home if opponent letter is uppercase)
def is_home(team_letter, opponent_letter):
    return opponent_letter.isupper()

# Helper: check if opponent is BYE team
def is_bye_team(opp_id):
    return str(opp_id).strip() == '0' or str(opp_id).strip() == ''

# Helper: get match date based on season code and week number
def get_match_date(season_code, week_num):
    """
    Get match date from the seasons lookup table.
    Returns the date string in M/D/YYYY format.
    """
    season_code_upper = season_code.upper()
    if season_code_upper in season_dates_lookup:
        dates = season_dates_lookup[season_code_upper]
        if week_num in dates:
            return dates[week_num]
    # Fallback if date not found
    return ""

# Normalize season codes to uppercase
for row in schedule_rows:
    row['Season Code'] = row['Season Code'].upper()

def process_season_to_csv(season):
    """Process season data and return list of normalized CSV rows"""
    season_rows = [r for r in schedule_rows if r['Season Code'] == season]
    divisions = sorted(set(r['Division'] for r in season_rows))
    csv_rows = []
    
    for division in divisions:
        div_rows = [r for r in season_rows if r['Division'] == division]
        subdivisions = sorted(set(str(r['Subdivision']) for r in div_rows))
        
        for subdivision in subdivisions:
            sub_rows = [r for r in div_rows if str(r['Subdivision']) == subdivision]
            
            for team_row in sub_rows:
                team_letter = team_row['Team Letter']
                team_id = team_row['Team ID Number']
                
                # Skip BYE team rows (teamId=0) - only real teams are emitted
                if is_bye_team(team_id):
                    continue
                
                team_name = get_team_name(team_id)
                num_weeks = int(team_row['Number of Weeks'])
                
                for week in range(1, num_weeks+1):
                    opp_letter = team_row.get(f'Week {week} Opponent', '')
                    if opp_letter is None or opp_letter == '':
                        continue
                    
                    # Find opponent team id in same subdivision
                    opp_row = next((r for r in sub_rows if str(r['Team Letter']).upper() == str(opp_letter).upper()), None)
                    opp_id = opp_row['Team ID Number'] if opp_row else "0"
                    
                    # Normalize BYE team to consistent values
                    if is_bye_team(opp_id):
                        opp_id = "0"
                        opp_letter = "X"
                    
                    # Determine if home (BYE team handling)
                    if opp_id == "0":
                        home = True
                    else:
                        home = is_home(team_letter, opp_letter)
                    
                    match_date = get_match_date(season, week)
                    
                    csv_rows.append({
                        'seasonCode': season.upper(),
                        'weekNum': week,
                        'division': division,
                        'subdivision': f'Subdivision {subdivision}',
                        'teamId': str(team_id),
                        'teamName': team_name,
                        'teamLetter': team_letter,
                        'oppTeamId': opp_id,
                        'oppTeamLetter': opp_letter if opp_id == "0" else str(opp_letter).upper(),
                        'matchDate': match_date,
                        'matchTime': '19:30',
                        'home': str(home)
                    })
    
    return csv_rows

# Group by seasonCode (already normalized to upper)
seasons = sorted(set(r['Season Code'] for r in schedule_rows))

# Get user's choice
output_format = show_menu()

if output_format == '1':
    # SQL Output - Normalized format
    all_rows = []
    
    for season in tqdm(seasons, desc="Processing seasons"):
        season_rows_data = process_season_to_csv(season)
        all_rows.extend(season_rows_data)
    
    # Build SQL insert values
    values = []
    for row in all_rows:
        # Combine matchDate and matchTime into matchTimestamp
        match_date = row['matchDate']
        match_time = row['matchTime']
        if match_date and match_time:
            # Format: YYYY-MM-DD HH:MM:SS (PostgreSQL time without timezone format)
            # Convert M/D/YYYY to YYYY-MM-DD
            date_parts = match_date.split('/')
            if len(date_parts) == 3:
                month, day, year = date_parts
                match_timestamp = f"{year}-{month.zfill(2)}-{day.zfill(2)} {match_time}:00"
            else:
                match_timestamp = ""
        else:
            match_timestamp = ""
        
        # Escape single quotes in strings
        season_code = row['seasonCode']
        division = row['division'].replace("'", "''")
        subdivision = row['subdivision'].replace("'", "''")
        team_name = row['teamName'].replace("'", "''")
        home = row['home'].lower()
        
        values.append(
            f"('{season_code}', {row['weekNum']}, '{division}', '{subdivision}', "
            f"{row['teamId']}, '{team_name}', '{row['teamLetter']}', {row['oppTeamId']}, "
            f"'{row['oppTeamLetter']}', '{match_timestamp}', {home})"
        )
    
    # Write output SQL
    with open(output_sql, 'w', encoding='utf-8') as f:
        f.write('INSERT INTO public.leda_schedule ("seasonCode", "weekNum", "division", "subdivision", '
                '"teamId", "teamName", "teamLetter", "oppTeamId", "oppTeamLetter", "matchDateTime", "home") VALUES\n')
        f.write(",\n".join(values))
        f.write(";\n")
    
    print(f"SQL insert script written to {output_sql}")
    print(f"Total matchups: {len(values)}")

elif output_format == '2':
    # CSV Output
    all_csv_rows = []
    
    for season in tqdm(seasons, desc="Processing seasons"):
        season_csv_rows = process_season_to_csv(season)
        all_csv_rows.extend(season_csv_rows)
    
    # Write normalized CSV
    fieldnames = ['seasonCode', 'weekNum', 'division', 'subdivision', 'teamId', 'teamName', 
                  'teamLetter', 'oppTeamId', 'oppTeamLetter', 'matchDate', 'matchTime', 'home']
    
    with open(output_csv, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_csv_rows)
    
    print(f"Normalized CSV written to {output_csv}")
    print(f"Total matchups: {len(all_csv_rows)}")
