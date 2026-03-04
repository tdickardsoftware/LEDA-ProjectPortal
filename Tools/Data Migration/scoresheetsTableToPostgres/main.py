"""
LEDA Weekly Scoresheets Migration Tool

This script processes weekly scoresheet data and migrates it to PostgreSQL format.
It now leverages the normalized schedule CSV to ensure complete matchup data,
including proper handling of BYE weeks.

Requirements:
- Run scheduleTableToPostgres migration first to generate leda_schedule_normalized.csv
- The normalized schedule CSV will be automatically copied to Lookups folder if needed

BYE Week Handling:
- All matchups against team ID 0 (BYE) are automatically included
- BYE week games have 0 points for both teams
- Teams facing BYE are always marked as "home"
"""

def load_schedule_matchups():
    """Load all matchups from the normalized schedule CSV"""
    matchups = {}
    try:
        with open(SCHEDULE_LOOKUP_PATH, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                season = row['seasonCode'].upper()
                week = int(row['weekNum'])
                division = row['division']
                subdivision = row['subdivision']
                team_id = row['teamId']
                opp_team_id = row['oppTeamId']
                home = row['home'].lower() == 'true'
                
                key = (season, week, division, subdivision, team_id)
                matchups[key] = {
                    'oppTeamId': opp_team_id,
                    'home': home,
                    'isBye': opp_team_id == '0'
                }
    except FileNotFoundError:
        print(f"Warning: Schedule lookup file not found at {SCHEDULE_LOOKUP_PATH}")
        print("BYE week entries may be incomplete. Please run the schedule migration first.")
    return matchups

def export_weekly_team_scores():
    # Load schedule matchups for complete data
    schedule_matchups = load_schedule_matchups()
    
    # Load all scoresheet rows
    with open(INPUT_CSV, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    # Determine which weeks exist in the scoresheet data for filtering
    existing_weeks_per_season = {}
    for row in rows:
        season = row['Season Code'].upper()
        week = int(row['Week Number'])
        if season not in existing_weeks_per_season:
            existing_weeks_per_season[season] = set()
        existing_weeks_per_season[season].add(week)

    # Sort rows by season, week, team
    rows.sort(key=lambda r: (r['Season Code'].upper(), int(r['Week Number']), r['Home Team Number'], r['Away Team Number']))

    # Progress bar setup
    try:
        from tqdm import tqdm
        pbar = tqdm(total=len(rows), desc='Exporting team scores', unit='row')
        
    except ImportError:
        tqdm = None
        pbar = None

    # Only use the first occurrence of each (season, week, team)
    # Store: key -> (points, division, subdivision)
    team_week_points = {}
    for row in rows:
        season = row['Season Code'].upper()
        week = int(row['Week Number'])
        division = row.get('Division', '').strip()
        subdivision_raw = row.get('Subdivision', '').strip()
        subdivision = f"Subdivision {subdivision_raw}" if subdivision_raw and not subdivision_raw.startswith('Subdivision ') else subdivision_raw
        
        # Home team
        home_team_id = row.get('Home Team Number', '').strip()
        away_team_id = row.get('Away Team Number', '').strip()
        
        # Check if this is a BYE week (either team is 0)
        is_bye_week = (home_team_id == '0' or away_team_id == '0')
        
        home_points = row.get('Home Points', row.get('Home Score', ''))
        try:
            home_points = int(home_points) if home_points and str(home_points).isdigit() else 0
        except Exception:
            home_points = 0
        
        # BYE week: no points scored
        if is_bye_week:
            home_points = 0
        
        if home_team_id:
            key = (season, week, home_team_id)
            if key not in team_week_points:
                team_week_points[key] = (home_points, division, subdivision)
        
        # Away team
        away_points = row.get('Away Points', row.get('Away Score', ''))
        try:
            away_points = int(away_points) if away_points and str(away_points).isdigit() else 0
        except Exception:
            away_points = 0
        
        # BYE week: no points scored
        if is_bye_week:
            away_points = 0
        
        if away_team_id:
            key = (season, week, away_team_id)
            if key not in team_week_points:
                team_week_points[key] = (away_points, division, subdivision)

    # Add entries from schedule for any missing matchups (especially BYE weeks)
    # Only for weeks that exist in the scoresheet data
    for key, matchup_info in schedule_matchups.items():
        season, week, division, subdivision, team_id = key
        # Only add if this week exists in the scoresheet data for this season
        if season in existing_weeks_per_season and week in existing_weeks_per_season[season]:
            if (season, week, team_id) not in team_week_points:
                # No scoresheet entry - add with 0 points (BYE week or missing data)
                team_week_points[(season, week, team_id)] = (0, division, subdivision)
    
    # Now calculate prevTotalPoints and totalPoints for each team across weeks
    # Sort keys for cumulative calculation
    sorted_keys = sorted(team_week_points.keys(), key=lambda k: (k[0], k[2], k[1]))  # season, team, week
    prev_points = {}
    values = []
    if tqdm:
        pbar = tqdm(total=len(sorted_keys), desc='Exporting team scores', unit='team-week')
    else:
        pbar = None
    for key in sorted_keys:
        season, week, team_id = key
        points, division, subdivision = team_week_points[key]
        prev_total = prev_points.get((season, team_id), 0)
        total = prev_total + points
        values.append(f"('{season}', {week}, '{division.replace("'", "''")}', '{subdivision.replace("'", "''")}', {team_id}, {prev_total}, {total})")
        prev_points[(season, team_id)] = total
        if pbar:
            pbar.update(1)
    if pbar:
        pbar.close()

    # Write SQL insert
    if values:
        with open(TEAM_SCORES_OUTPUT, 'w', encoding='utf-8') as f:
            f.write('INSERT INTO leda_weekly_team_scores ("seasonCode", "weekNum", "division", "subdivision", "teamLedaId", "prevTotalPoints", "totalPoints") VALUES\n')
            f.write(",\n".join(values))
            f.write(';\n')
# c:\Users\tyler\Projects\LEDA-ProjectPortal\Tools\Data Migration\scoresheetsTableToPostgres\csv_to_json_scoresheets.py

import csv
import json
import os
from collections import defaultdict

# ========== FILE PATHS ==========
# Input files
INPUT_CSV = 'Working/leda_weekly_scoresheets_table.csv'

# Lookup files
PENALTY_LOOKUP_PATH = os.path.join('Lookups', 'leda_penalty_points_export.csv')
TEAMS_LOOKUP_PATH = os.path.join('Lookups', 'leda_teams_table_export.csv')
PEOPLE_LOOKUP_PATH = os.path.join('Lookups', 'leda_people_table_export.csv')
SCHEDULE_LOOKUP_PATH = os.path.join('Lookups', 'leda_schedule_normalized.csv')

# To be copied from schedule migration output
SCHEDULE_SOURCE_PATH = r'..\scheduleTableToPostgres\Output\leda_schedule_normalized.csv'

# Output files
PLAYER_INFO_OUTPUT = 'Output/weekly_scoresheets_player_info_inserts.sql'
TEAM_GAME_INFO_OUTPUT = 'Output/weekly_scoresheets_team_game_info_inserts.sql'
TEAM_INFO_OUTPUT = 'Output/weekly_scoresheets_team_info_inserts.sql'
TEAM_SCORES_OUTPUT = 'Output/team_scores_inserts.sql'
PLAYER_POINTS_OUTPUT = 'Output/player_points_inserts.sql'
# ================================

def load_schedule_matchups():
    """Load all matchups from the normalized schedule CSV"""
    matchups = {}
    
    # Check if file exists in Lookups, if not try to copy from source
    if not os.path.exists(SCHEDULE_LOOKUP_PATH):
        if os.path.exists(SCHEDULE_SOURCE_PATH):
            import shutil
            os.makedirs('Lookups', exist_ok=True)
            shutil.copy(SCHEDULE_SOURCE_PATH, SCHEDULE_LOOKUP_PATH)
            print(f"Copied schedule from {SCHEDULE_SOURCE_PATH}")
        else:
            print(f"Warning: Schedule lookup file not found at {SCHEDULE_LOOKUP_PATH}")
            print(f"Also not found at source: {SCHEDULE_SOURCE_PATH}")
            print("BYE week entries may be incomplete. Please run the schedule migration first.")
            return matchups
    
    try:
        with open(SCHEDULE_LOOKUP_PATH, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                season = row['seasonCode'].upper()
                week = int(row['weekNum'])
                division = row['division']
                subdivision = row['subdivision']
                team_id = row['teamId']
                opp_team_id = row['oppTeamId']
                home = row['home'].lower() == 'true'
                team_letter = row['teamLetter']
                opp_team_letter = row['oppTeamLetter']
                
                key = (season, week, division, subdivision, team_id)
                matchups[key] = {
                    'oppTeamId': opp_team_id,
                    'home': home,
                    'isBye': opp_team_id == '0',
                    'teamLetter': team_letter,
                    'oppTeamLetter': opp_team_letter
                }
        print(f"Loaded {len(matchups)} matchups from schedule")
    except Exception as e:
        print(f"Error loading schedule: {e}")
    
    return matchups

def parse_bool(val):
    val = str(val).strip().upper()
    if val == '1':
        return True
    if val == '0':
        return False
    return val == 'X'

def get_team_id(row, prefix):
    if prefix == 'home':
        return row['Home Team Number']
    else:
        return row['Away Team Number']

def get_team_letter(row, prefix):
    if prefix == 'home':
        return row['Home Team Letter']
    else:
        return row['Away Team Letter']

def get_team_name(row, prefix):
    # No team name column in CSV, return blank or placeholder
    return ""

def get_home_flag(row, prefix):
    # The CSV has 'Home or Away' column, but not per team. Use prefix to infer.
    if prefix == 'home':
        return row['Home or Away'].strip().upper() == 'H'
    else:
        return row['Home or Away'].strip().upper() == 'A'

def parse_game_stats(row, prefix):
    stats = {}
    for i in range(1, 12):
        stats[f'Game {i}'] = parse_bool(row[f'{prefix}Game{i}'])
    return stats

def parse_game_points(row, prefix):
    return row.get(f'{prefix}Points', '')

def parse_team_members(row, prefix):
    # Use Player Number as the player ID for now, assign UNKNOWN as name
    members = {}
    # Only add if the player is on the correct team (home/away)
    if prefix == 'home' and row.get('Home or Away', '').strip().upper() == 'H':
        player_id = str(row.get('Player Number', '')).strip()
        if player_id:
            members[player_id] = {
                "name": "UNKNOWN",
                "gameStats": {f"Game {i}": parse_bool(row.get(f"Game {i}", '')) for i in range(1, 12)},
                "gamePoints": row.get('Home Score', '')
            }
    elif prefix == 'away' and row.get('Home or Away', '').strip().upper() == 'A':
        player_id = str(row.get('Player Number', '')).strip()
        if player_id:
            members[player_id] = {
                "name": "UNKNOWN",
                "gameStats": {f"Game {i}": parse_bool(row.get(f"Game {i}", '')) for i in range(1, 12)},
                "gamePoints": row.get('Away Score', '')
            }
    return members

def parse_penalties(row, prefix):
    # Leave blank as requested
    return {}

def parse_game_information(row):
    games = {}
    for i in range(1, 12):
        home_points = row.get(f'Points Game {i}', '')
        # If home points is not blank and is numeric, set away points to 0 if home points > 0 and away points is blank
        away_points = row.get(f'Away Points Game {i}', '') if f'Away Points Game {i}' in row else ""
        if away_points == "" and home_points != "" and home_points.isdigit() and int(home_points) > 0:
            away_points = "0"
        games[f'Game {i}'] = {
            "homeWin": parse_bool(row.get(f'Won Game {i}', '')),
            "homePoints": home_points,
            "awayPoints": away_points
        }
    return games

def parse_team_points(row):
    home_points = row.get('Home Score', '')
    away_points = row.get('Away Score', '')
    # If away points is blank and home points is not blank and > 0, set away points to '0'
    if (away_points == '' or away_points is None) and home_points != '' and str(home_points).isdigit() and int(home_points) > 0:
        away_points = '0'
    return {
        "homePoints": home_points,
        "awayPoints": away_points
    }

def main():
    # Load schedule matchups early
    schedule_matchups = load_schedule_matchups()
    
    PENALTY_CODE_DESCRIPTION = {
        "LSS": "Late Score Sheet",
        "WF": "Weekly Fee",
        "TF": "Team Fee",
        "IF": "Incorrect Funds",
        "PWC": "Paid With Cash",
        "NF": "No Form",
        "IP": "Illegal Player",
        "CO": "Call Office",
        "BC": "Bounced Check",
        "MF": "Membership Fee",
        "P": "Pending",
        "O": "Other"
    }
    # Penalty code mapping
    PENALTY_TYPE_MAP = {
        "Late Sheet": "LSS",
        "Weekly Fee": "WF",
        "Team Fee": "TF",
        "Incorrect Funds": "IF",
        "Paid With Cash": "PWC",
        "No Form": "NF",
        "Illegal Player": "IP",
        "Call Office": "CO",
        "Bounced Check": "BC",
        "Membership Fee": "MF",
        "Pending": "P",
        "Other": "O"
    }
    PENALTY_LETTER_MAP = {
        "L": "LSS",
        "N": "WF",
        "T": "TF",
        "F": "IF",
        "C": "PWC",
        "X": "IP",
        "O": "O",
        "B": "BC",
        "M": "MF",
        "P": "P",
        "Q": "CO",
        "Z": "NF"
    }
    # Load penalty points from Working/leda_penalty_points_export.csv
    penalties_by_key = {}
    if os.path.exists(PENALTY_LOOKUP_PATH):
        def map_penalty_code(type_val, letter_val):
            # Prefer mapping by type, fallback to letter
            code = PENALTY_TYPE_MAP.get(type_val.strip(), None)
            if not code and letter_val:
                code = PENALTY_LETTER_MAP.get(letter_val.strip(), None)
            return code or "O"
        def map_penalty_description(code):
            return PENALTY_CODE_DESCRIPTION.get(code, "Other")
        try:
            with open(PENALTY_LOOKUP_PATH, newline='', encoding='utf-8') as penaltyfile:
                penalty_reader = csv.DictReader(penaltyfile)
                for prow in penalty_reader:
                    season = prow['Season Code'].upper()
                    week = str(int(prow['Week Number'])) if prow['Week Number'] else '0'
                    team_id = str(prow['Team ID Number']).strip()
                    key = (season, week, team_id)
                    code = map_penalty_code(prow['Penalty Type'], prow['Penalty Code Letter'])
                    penalty = {
                        "penaltyCode": code,
                        "penaltyTypeDescription": map_penalty_description(code),
                        "points": int(prow['Penalty Points']) if prow['Penalty Points'] else 0,
                        "notes": prow['Notes'] or ""
                    }
                    if key not in penalties_by_key:
                        penalties_by_key[key] = {}
                    penalties_by_key[key][prow['Penalty Record Number']] = penalty
        except UnicodeDecodeError:
            with open(PENALTY_LOOKUP_PATH, newline='', encoding='latin1') as penaltyfile:
                penalty_reader = csv.DictReader(penaltyfile)
                for prow in penalty_reader:
                    season = prow['Season Code'].upper()
                    week = str(int(prow['Week Number'])) if prow['Week Number'] else '0'
                    team_id = str(prow['Team ID Number']).strip()
                    key = (season, week, team_id)
                    code = map_penalty_code(prow['Penalty Type'], prow['Penalty Code Letter'])
                    penalty = {
                        "penaltyCode": code,
                        "penaltyTypeDescription": map_penalty_description(code),
                        "points": int(prow['Penalty Points']) if prow['Penalty Points'] else 0,
                        "notes": prow['Notes'] or ""
                    }
                    if key not in penalties_by_key:
                        penalties_by_key[key] = {}
                    penalties_by_key[key][prow['Penalty Record Number']] = penalty
    # Load team names from lookup CSV
    team_names = {}
    if os.path.exists(TEAMS_LOOKUP_PATH):
        try:
            with open(TEAMS_LOOKUP_PATH, newline='', encoding='utf-8') as teamsfile:
                teams_reader = csv.DictReader(teamsfile)
                for trow in teams_reader:
                    tid = str(trow['ID Number']).strip()
                    tname = trow['Team Name'].strip()
                    team_names[tid] = tname
        except UnicodeDecodeError:
            with open(TEAMS_LOOKUP_PATH, newline='', encoding='latin1') as teamsfile:
                teams_reader = csv.DictReader(teamsfile)
                for trow in teams_reader:
                    tid = str(trow['ID Number']).strip()
                    tname = trow['Team Name'].strip()
                    team_names[tid] = tname

    # Load player names from lookup CSV
    player_names = {}
    if os.path.exists(PEOPLE_LOOKUP_PATH):
        try:
            with open(PEOPLE_LOOKUP_PATH, newline='', encoding='utf-8') as peoplefile:
                people_reader = csv.DictReader(peoplefile)
                for prow in people_reader:
                    pid = str(prow['ID Number']).strip()
                    name = f"{prow['First Name']} {prow['Middle Initial'] + ' ' if prow['Middle Initial'] else ''}{prow['Last Name']}".strip()
                    player_names[pid] = name
        except UnicodeDecodeError:
            with open(PEOPLE_LOOKUP_PATH, newline='', encoding='latin1') as peoplefile:
                people_reader = csv.DictReader(peoplefile)
                for prow in people_reader:
                    pid = str(prow['ID Number']).strip()
                    name = f"{prow['First Name']} {prow['Middle Initial'] + ' ' if prow['Middle Initial'] else ''}{prow['Last Name']}".strip()
                    player_names[pid] = name
    
    # New multi-table output files
    grouped = defaultdict(list)
    with open(INPUT_CSV, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        # Dynamically determine game columns
        game_columns = [col for col in reader.fieldnames if col.startswith('Game ') and not col.startswith('Game Points')]
        points_columns = [col for col in reader.fieldnames if col.startswith('Points Game')]
        won_columns = [col for col in reader.fieldnames if col.startswith('Won Game')]
        # Store these for use in process_week
        global GAME_COLUMNS, POINTS_COLUMNS, WON_COLUMNS
        GAME_COLUMNS = game_columns
        POINTS_COLUMNS = points_columns
        WON_COLUMNS = won_columns
        for row in reader:
            season_code = row['Season Code'].upper()
            key = (season_code, row['Week Number'])
            # Also update the row's season code to upper for consistency in output
            row['Season Code'] = season_code
            grouped[key].append(row)
    
    # Supplement with BYE week entries from schedule
    if schedule_matchups:
        print("Checking for missing BYE week entries...")
        # First, determine which weeks exist in the scoresheet data
        existing_weeks = set(grouped.keys())  # Set of (season, week) tuples
        
        bye_entries_added = 0
        for (season, week, division, subdivision, team_id), matchup_info in schedule_matchups.items():
            if matchup_info['isBye']:
                # Only process if this week exists in the scoresheet data
                key = (season, str(week))
                if key not in existing_weeks:
                    continue
                    
                # Check if this BYE week entry exists in grouped data
                existing_entry = False
                for row in grouped.get(key, []):
                    if (row.get('Home Team Number') == team_id or row.get('Away Team Number') == team_id):
                        existing_entry = True
                        break
                
                if not existing_entry:
                    # Add placeholder rows for this BYE week
                    # BYE weeks always have the real team as HOME and BYE (0) as AWAY
                    home_team_id = team_id
                    home_team_letter = matchup_info['teamLetter']
                    away_team_id = '0'
                    away_team_letter = matchup_info['oppTeamLetter']
                    
                    # Extract subdivision number for proper formatting
                    sub_num = subdivision.replace('Subdivision ', '').strip()
                    
                    # Create HOME team row (the real team)
                    home_bye_row = {
                        'Season Code': season,
                        'Week Number': str(week),
                        'Division': division,
                        'Subdivision': sub_num,
                        'Home Team Number': home_team_id,
                        'Home Team Letter': home_team_letter,
                        'Away Team Number': away_team_id,
                        'Away Team Letter': away_team_letter,
                        'Home or Away': 'H',
                        'Home Score': '0',
                        'Away Score': '0',
                        'Player Number': '',
                    }
                    # Add empty game columns
                    for col in game_columns:
                        home_bye_row[col] = ''
                    for col in points_columns:
                        home_bye_row[col] = '0'
                    for col in won_columns:
                        home_bye_row[col] = ''
                    
                    # Create AWAY team row (BYE team)
                    away_bye_row = {
                        'Season Code': season,
                        'Week Number': str(week),
                        'Division': division,
                        'Subdivision': sub_num,
                        'Home Team Number': home_team_id,
                        'Home Team Letter': home_team_letter,
                        'Away Team Number': away_team_id,
                        'Away Team Letter': away_team_letter,
                        'Home or Away': 'A',
                        'Home Score': '0',
                        'Away Score': '0',
                        'Player Number': '',
                    }
                    # Add empty game columns
                    for col in game_columns:
                        away_bye_row[col] = ''
                    for col in points_columns:
                        away_bye_row[col] = '0'
                    for col in won_columns:
                        away_bye_row[col] = ''
                    
                    grouped[key].append(home_bye_row)
                    grouped[key].append(away_bye_row)
                    bye_entries_added += 1
        
        if bye_entries_added > 0:
            print(f"Added {bye_entries_added} BYE week entries from schedule")

    def process_week(args):
        """Process a (season, week) group into three sets of insert value rows for:
        - leda_weekly_scoresheets_player_info
        - leda_weekly_scoresheets_team_game_info
        - leda_weekly_scoresheets_team_info
        """
        (season, week), rows = args
        try:
            week_int = int(week)
        except Exception:
            week_int = int(str(week).strip() or 0)
        player_values = []
        team_game_values = []
        team_info_values = []
        
        # Track teams in this week for penalty accumulation
        teams_in_week = set()
        
        # Track unique team info entries to avoid duplicates
        # Key: (season, week, division, subdivision, teamId)
        unique_team_info = {}

        # Group rows by matchup (home/away team letters) and by team (home/away)
        matchups = {}
        for row in rows:
            division = row['Division']
            subdivision = row['Subdivision']
            matchup = f"{row['Home Team Letter']} - {row['Away Team Letter']}"
            if (division, subdivision, matchup) not in matchups:
                matchups[(division, subdivision, matchup)] = {'home': [], 'away': []}
            hoa = row.get('Home or Away', '').strip().upper()
            if hoa == 'H':
                matchups[(division, subdivision, matchup)]['home'].append(row)
            elif hoa == 'A':
                matchups[(division, subdivision, matchup)]['away'].append(row)

        for (division, subdivision, matchup), teams in matchups.items():
            formatted_subdivision = f"Subdivision {subdivision}" if not str(subdivision).startswith("Subdivision ") else subdivision
            home_rows = teams['home']
            away_rows = teams['away']
            home_row = home_rows[0] if home_rows else None
            away_row = away_rows[0] if away_rows else None
            home_team_id = str(get_team_id(home_row, 'home')) if home_row else ''
            away_team_id = str(get_team_id(away_row, 'away')) if away_row else ''
            home_team_letter = get_team_letter(home_row, 'home') if home_row else ''
            away_team_letter = get_team_letter(away_row, 'away') if away_row else ''
            home_team_name = team_names.get(home_team_id, '')
            away_team_name = team_names.get(away_team_id, '')

            # Build game info JSON for team_game_info
            # Create this whenever we have both team IDs (including BYE weeks)
            if home_team_id and away_team_id:
                # Check if this is a BYE week (opponent ID is 0)
                is_bye_week = (home_team_id == '0' or away_team_id == '0')
                
                games = {}
                for col in GAME_COLUMNS:
                    game_num = ''.join(filter(str.isdigit, col))
                    points_col = f'Points Game {game_num}'
                    won_col = f'Won Game {game_num}'
                    
                    if is_bye_week:
                        # BYE week: no points scored, no winners
                        home_points = '0'
                        away_points = '0'
                        home_win = False
                    else:
                        home_points = home_row.get(points_col, '0') if home_row else '0'
                        away_points = away_row.get(points_col, '0') if away_row else '0'
                        if away_points == '' or away_points is None:
                            away_points = '0'
                        home_win = parse_bool(home_row.get(won_col, '')) if home_row else False
                    
                    games[col] = {
                        "homeWin": home_win,
                        "homePoints": home_points,
                        "awayPoints": away_points
                    }
                game_info_json = json.dumps(games).replace("'", "''")
                
                # Determine team points (integers, default 0)
                if is_bye_week:
                    # BYE week: no points for either team
                    h_pts = 0
                    a_pts = 0
                else:
                    try:
                        h_pts = int(home_row.get('Home Score', '0')) if home_row and str(home_row.get('Home Score', '0')).isdigit() else 0
                    except Exception:
                        h_pts = 0
                    try:
                        a_raw = away_row.get('Away Score', '0') if away_row else '0'
                        a_pts = int(a_raw) if a_raw and str(a_raw).isdigit() else 0
                    except Exception:
                        a_pts = 0
                # Assume completed true per requirement
                completed_flag = 'true'
                team_game_values.append(
                    f"('{season}', {week_int}, '{division.replace("'", "''")}', '{formatted_subdivision.replace("'", "''")}', {home_team_id}, {away_team_id}, {h_pts}, {a_pts}, '{game_info_json}', {completed_flag})"
                )

            # Penalties lookup per team
            def penalties_json_for(team_id):
                # BYE weeks have no penalties
                is_bye_week = (home_team_id == '0' or away_team_id == '0')
                if is_bye_week:
                    return '{}'
                key = (season, str(week_int), str(team_id))
                penalties = penalties_by_key.get(key, {})
                if not penalties:
                    return '{}'
                return json.dumps(penalties).replace("'", "''")
            
            def calculate_penalty_points(team_id):
                """Calculate total penalty points for this team in this week."""
                key = (season, str(week_int), str(team_id))
                penalties = penalties_by_key.get(key, {})
                total = 0
                for penalty_data in penalties.values():
                    total += penalty_data.get('points', 0)
                return total

            # Team info rows (home and away separately)
            if home_team_id and away_team_id:
                # Check if this is a BYE week
                is_bye_week = (home_team_id == '0' or away_team_id == '0')
                
                # For BYE weeks, no new penalties are added (0 points)
                if is_bye_week:
                    home_penalty_pts = 0
                    away_penalty_pts = 0
                else:
                    # Calculate penalty points for home team
                    home_penalty_pts = calculate_penalty_points(home_team_id)
                    # Calculate penalty points for away team
                    away_penalty_pts = calculate_penalty_points(away_team_id)
                
                teams_in_week.add((home_team_id, home_penalty_pts))
                teams_in_week.add((away_team_id, away_penalty_pts))
                
                # Extract subdivision number (e.g., "Subdivision 1" -> "1")
                subdivision_num = subdivision if not str(subdivision).startswith("Subdivision ") else str(subdivision).replace("Subdivision ", "").strip()
                
                # Build teamLabel: (first letter of division)(subdivision number)(teamLetter)
                # Format: D1A, C2B, etc.
                home_team_label = f"{division[0].upper()}{subdivision_num}{home_team_letter.upper()}"
                away_team_label = f"{division[0].upper()}{subdivision_num}{away_team_letter.upper()}"
                
                # Add team info for home team (including BYE teams) - only if not already added
                home_key = (season, week_int, division, formatted_subdivision, home_team_id)
                if home_key not in unique_team_info:
                    unique_team_info[home_key] = (
                        season, week_int, division, formatted_subdivision, True, home_team_id, 
                        home_team_name, home_team_letter, away_team_id, 
                        penalties_json_for(home_team_id), home_penalty_pts, home_team_label
                    )
                
                # Add team info for away team (including BYE teams) - only if not already added
                away_key = (season, week_int, division, formatted_subdivision, away_team_id)
                if away_key not in unique_team_info:
                    unique_team_info[away_key] = (
                        season, week_int, division, formatted_subdivision, False, away_team_id,
                        away_team_name, away_team_letter, home_team_id,
                        penalties_json_for(away_team_id), away_penalty_pts, away_team_label
                    )

            # Player info rows: aggregate game stats across multiple rows per player
            def aggregate_players(team_rows, is_home):
                players = {}
                opposing_team = away_team_id if is_home else home_team_id
                team_id = home_team_id if is_home else away_team_id
                
                # Don't create player records for BYE team (ID 0)
                if team_id == '0':
                    return
                
                # Check if this is a BYE week
                is_bye_week = (opposing_team == '0')
                
                for r in team_rows:
                    player_id = str(r.get('Player Number', '')).strip()
                    if not player_id:
                        continue
                    if player_id not in players:
                        players[player_id] = {col: False for col in GAME_COLUMNS}
                    
                    for col in GAME_COLUMNS:
                        if is_bye_week:
                            # BYE week: no games won, keep all as False
                            players[player_id][col] = False
                        else:
                            players[player_id][col] = players[player_id][col] or parse_bool(r.get(col, ''))
                
                for pid, stats in players.items():
                    stats_json = json.dumps(stats).replace("'", "''")
                    player_values.append(
                        f"('{season}', {week_int}, '{division.replace("'", "''")}', '{formatted_subdivision.replace("'", "''")}', {pid}, {team_id}, '{stats_json}')"
                    )
            
        
        # Convert unique team info dict to list
        team_info_values = list(unique_team_info.values())
        if home_rows:
            aggregate_players(home_rows, True)
        if away_rows:
            aggregate_players(away_rows, False)

        return (season, week_int, player_values, team_game_values, team_info_values)

    # Dictionary to track cumulative penalty points per team per season
    # Key: (season, team_id), Value: cumulative penalty points
    penalty_accumulator = {}
    
    sql_results = []  # will hold tuples (season, week, player_values, team_game_values, team_info_values)
    # Sort by seasonCode and weekNum (as int)
    items = sorted(grouped.items(), key=lambda x: (x[0][0], int(x[0][1])))
    total = len(items)
    try:
        from tqdm import tqdm
        pbar = tqdm(total=total, desc='Processing weeks', unit='week')
    except ImportError:
        tqdm = None
        pbar = None
        print('tqdm not installed, progress bar will not be shown.')

    # Process weeks sequentially
    for idx, item in enumerate(items, 1):
        result = process_week(item)
        sql_results.append(result)
        if pbar:
            pbar.update(1)
        else:
            print(f'Processed {idx}/{total} weeks', end='\r')
    
    if pbar:
        pbar.close()
    elif total > 0:
        print()  # New line after progress

    # Flatten and sort outputs by (season, week) for deterministic ordering
    all_player_values = []
    all_team_game_values = []
    all_team_info_values = []
    
    # Process results in order to calculate cumulative penalties
    for season, week, pvals, tgvals, tivals in sorted(sql_results, key=lambda x: (x[0], x[1])):
        all_player_values.extend(pvals)
        all_team_game_values.extend(tgvals)
        
        # Process team info with penalty accumulation
        for ti_tuple in tivals:
            # ti_tuple: (season, week_int, division, formatted_subdivision, is_home, team_id, 
            #            team_name, team_letter, opposing_team_id, penalties_json, current_week_penalty_pts, team_label)
            season_val, week_val, division, subdivision, is_home, team_id, team_name, team_letter, opposing_team_id, penalties_json, current_week_penalty_pts, team_label = ti_tuple
            
            # Get previous cumulative penalty points for this team
            key = (season_val, team_id)
            prev_total = penalty_accumulator.get(key, 0)
            
            # Calculate new total
            new_total = prev_total + current_week_penalty_pts
            
            # Update accumulator
            penalty_accumulator[key] = new_total
            
            # Build the SQL insert value string with the new columns
            all_team_info_values.append(
                f"('{season_val}', {week_val}, '{division.replace("'", "''")}', '{subdivision.replace("'", "''")}', {str(is_home).lower()}, {team_id}, '{team_name.replace("'", "''")}', '{team_letter.replace("'", "''")}', {opposing_team_id}, '{penalties_json}', {prev_total}, {new_total}, '{team_label}')"
            )

    # Write player info inserts
    if all_player_values:
        with open(PLAYER_INFO_OUTPUT, 'w', encoding='utf-8') as f:
            f.write('INSERT INTO leda_weekly_scoresheets_player_info ("seasonCode","weekNum","division","subdivision","ledaId","teamId","gameStats") VALUES\n')
            f.write(',\n'.join(all_player_values))
            f.write(';\n')
    # Write team game info inserts
    if all_team_game_values:
        with open(TEAM_GAME_INFO_OUTPUT, 'w', encoding='utf-8') as f:
            f.write('INSERT INTO leda_weekly_scoresheets_team_game_info ("seasonCode","weekNum","division","subdivision","homeTeamId","awayTeamId","homePoints","awayPoints","gameInfo","completed") VALUES\n')
            f.write(',\n'.join(all_team_game_values))
            f.write(';\n')
    # Write team info inserts
    if all_team_info_values:
        with open(TEAM_INFO_OUTPUT, 'w', encoding='utf-8') as f:
            f.write('INSERT INTO leda_weekly_scoresheets_team_info ("seasonCode","weekNum",division,subdivision,home,"teamId","teamName","teamLetter","opposingTeamId",penalties,"previousPenaltyPoints","totalPenaltyPoints","teamLabel") VALUES\n')
            f.write(',\n'.join(all_team_info_values))
            f.write(';\n')
    print('Weekly scoresheets conversion complete:')
    print(f'  Player info rows: {len(all_player_values)} -> {PLAYER_INFO_OUTPUT}')
    print(f'  Team game info rows: {len(all_team_game_values)} -> {TEAM_GAME_INFO_OUTPUT}')
    print(f'  Team info rows: {len(all_team_info_values)} -> {TEAM_INFO_OUTPUT}')

def export_weekly_player_scores():
    # Load schedule matchups for complete week coverage
    schedule_matchups = load_schedule_matchups()
    
    # Load all rows
    with open(INPUT_CSV, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    # Determine which weeks exist in the scoresheet data per season and team
    existing_weeks_per_season_team = {}
    for row in rows:
        season = row['Season Code'].upper()
        week = int(row['Week Number'])
        home_team_id = row.get('Home Team Number', '').strip()
        away_team_id = row.get('Away Team Number', '').strip()
        
        for team_id in [home_team_id, away_team_id]:
            if team_id and team_id != '0':
                key = (season, team_id)
                if key not in existing_weeks_per_season_team:
                    existing_weeks_per_season_team[key] = set()
                existing_weeks_per_season_team[key].add(week)

    # Sort rows by season, week, then team, then player
    rows.sort(key=lambda r: (r['Season Code'].upper(), int(r['Week Number']), r['Home Team Number'], r['Away Team Number'], r.get('Player Number', '')))

    # First pass: collect all player-team-season combinations and their scores per week
    player_week_data = {}  # key: (season, week, team_id, player_id), value: points
    player_team_seasons = {}  # key: (season, team_id), value: set of player_ids
    
    for row in rows:
        season = row['Season Code'].upper()
        week = int(row['Week Number'])
        division = row.get('Division', '').strip()
        subdivision_raw = row.get('Subdivision', '').strip()
        subdivision = f"Subdivision {subdivision_raw}" if subdivision_raw and not subdivision_raw.startswith('Subdivision ') else subdivision_raw
        
        home_team_id = row.get('Home Team Number', '').strip()
        away_team_id = row.get('Away Team Number', '').strip()
        
        # Check if this is a BYE week
        is_bye_week = (home_team_id == '0' or away_team_id == '0')
        
        if row.get('Home or Away', '').strip().upper() == 'H':
            team_id = home_team_id
            points = row.get('Home Score', '')
        elif row.get('Home or Away', '').strip().upper() == 'A':
            team_id = away_team_id
            points = row.get('Away Score', '')
        else:
            continue
            
        player_id = row.get('Player Number', '').strip()
        if not player_id or not team_id or team_id == '0':
            continue
        
        try:
            points = int(points) if points and str(points).isdigit() else 0
        except Exception:
            points = 0
        
        # BYE week: no points for players
        if is_bye_week:
            points = 0
        
        # Track this player-team combination
        pts_key = (season, team_id)
        if pts_key not in player_team_seasons:
            player_team_seasons[pts_key] = set()
        player_team_seasons[pts_key].add(player_id)
        
        # Store the week data
        week_key = (season, week, team_id, player_id)
        if week_key not in player_week_data:
            player_week_data[week_key] = {
                'points': points,
                'division': division,
                'subdivision': subdivision
            }
    
    # Second pass: ensure all players have entries for all their team's weeks (including BYE weeks)
    # Only for weeks that exist in the scoresheet data for that team
    if schedule_matchups:
        for (season, week, division, subdivision, team_id), matchup_info in schedule_matchups.items():
            pts_key = (season, team_id)
            # Only add if this week exists in the scoresheet data for this team
            weeks_key = (season, team_id)
            if weeks_key in existing_weeks_per_season_team and week in existing_weeks_per_season_team[weeks_key]:
                if pts_key in player_team_seasons:
                    # This team has players, ensure all players have entries for this week
                    for player_id in player_team_seasons[pts_key]:
                        week_key = (season, week, team_id, player_id)
                        if week_key not in player_week_data:
                            # Missing entry - add with 0 points (likely a BYE week)
                            player_week_data[week_key] = {
                                'points': 0,
                                'division': division,
                                'subdivision': subdivision
                            }
    
    # Build final output with cumulative points
    prev_points = {}
    values = []
    
    # Sort by season, team, player, then week for proper cumulative calculation
    sorted_keys = sorted(player_week_data.keys(), key=lambda k: (k[0], k[2], k[3], k[1]))
    
    try:
        from tqdm import tqdm
        pbar = tqdm(total=len(sorted_keys), desc='Exporting player scores', unit='record')
    except ImportError:
        tqdm = None
        pbar = None
    
    for key in sorted_keys:
        season, week, team_id, player_id = key
        data = player_week_data[key]
        points = data['points']
        division = data['division']
        subdivision = data['subdivision']
        
        prev_key = (season, player_id, team_id)
        prev_total = prev_points.get(prev_key, 0)
        total = prev_total + points
        
        values.append(f"('{season}', {week}, '{division.replace("'", "''")}', '{subdivision.replace("'", "''")}', {player_id}, {prev_total}, {total}, {team_id})")
        
        # Update for next week
        prev_points[prev_key] = total
        
        if pbar:
            pbar.update(1)
    
    if pbar:
        pbar.close()

    # Write SQL insert
    if values:
        with open(PLAYER_POINTS_OUTPUT, 'w', encoding='utf-8') as f:
            f.write('INSERT INTO leda_weekly_player_points ("seasonCode", "weekNum", "division", "subdivision", "ledaId", "prevTotalPoints", "totalPoints", "teamLedaId") VALUES\n')
            f.write(",\n".join(values))
            f.write(';\n')

if __name__ == "__main__":
    print("LEDA Scoresheet Data Migration Tool")
    print("1. Convert Weekly Scoresheets")
    print("2. Export Weekly Team Scores")
    print("3. Export Weekly Player Scores")
    print("4. Run All Extracts")
    choice = input("Select an option (1): ").strip()
    if choice == "1" or choice == "":
        main()
    elif choice == "2":
        export_weekly_team_scores()
    elif choice == "3":
        export_weekly_player_scores()
    elif choice == "4":
        print("\n=== Running All Extracts ===")
        print("\n--- Step 1/3: Converting Weekly Scoresheets ---")
        main()
        print("\n--- Step 2/3: Exporting Weekly Team Scores ---")
        export_weekly_team_scores()
        print("\n--- Step 3/3: Exporting Weekly Player Scores ---")
        export_weekly_player_scores()
        print("\n=== All Extracts Complete ===")
    else:
        print("Invalid option. Exiting.")