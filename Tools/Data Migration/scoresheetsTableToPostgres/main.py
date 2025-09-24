def export_weekly_team_scores():
    input_csv = 'Working/leda_weekly_scoresheets_table.csv'
    output_file = 'Output/team_scores_inserts.sql'
    # Load all rows
    with open(input_csv, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

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
    team_week_points = {}
    for row in rows:
        season = row['Season Code'].upper()
        week = int(row['Week Number'])
        # Home team
        home_team_id = row.get('Home Team Number', '').strip()
        home_points = row.get('Home Points', row.get('Home Score', ''))
        try:
            home_points = int(home_points) if home_points and str(home_points).isdigit() else 0
        except Exception:
            home_points = 0
        if home_team_id:
            key = (season, week, home_team_id)
            if key not in team_week_points:
                team_week_points[key] = home_points
        # Away team
        away_team_id = row.get('Away Team Number', '').strip()
        away_points = row.get('Away Points', row.get('Away Score', ''))
        try:
            away_points = int(away_points) if away_points and str(away_points).isdigit() else 0
        except Exception:
            away_points = 0
        if away_team_id:
            key = (season, week, away_team_id)
            if key not in team_week_points:
                team_week_points[key] = away_points

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
        points = team_week_points[key]
        prev_total = prev_points.get((season, team_id), 0)
        total = prev_total + points
        values.append(f"('{season}', {week}, {team_id}, {prev_total}, {total})")
        prev_points[(season, team_id)] = total
        if pbar:
            pbar.update(1)
    if pbar:
        pbar.close()

    # Write SQL insert
    if values:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('INSERT INTO leda_weekly_team_scores ("seasonCode", "weekNum", "teamLedaId", "prevTotalPoints", "totalPoints") VALUES\n')
            f.write(",\n".join(values))
            f.write(';\n')
# c:\Users\tyler\Projects\LEDA-ProjectPortal\Tools\Data Migration\scoresheetsTableToPostgres\csv_to_json_scoresheets.py

import csv
import json
import os
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

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
    penalty_lookup_path = os.path.join('Working', 'leda_penalty_points_export.csv')
    penalties_by_key = {}
    if os.path.exists(penalty_lookup_path):
        def map_penalty_code(type_val, letter_val):
            # Prefer mapping by type, fallback to letter
            code = PENALTY_TYPE_MAP.get(type_val.strip(), None)
            if not code and letter_val:
                code = PENALTY_LETTER_MAP.get(letter_val.strip(), None)
            return code or "O"
        def map_penalty_description(code):
            return PENALTY_CODE_DESCRIPTION.get(code, "Other")
        try:
            with open(penalty_lookup_path, newline='', encoding='utf-8') as penaltyfile:
                penalty_reader = csv.DictReader(penaltyfile)
                for prow in penalty_reader:
                    season = prow['Season Code'].upper()
                    week = str(prow['Week Number']).strip()
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
            with open(penalty_lookup_path, newline='', encoding='latin1') as penaltyfile:
                penalty_reader = csv.DictReader(penaltyfile)
                for prow in penalty_reader:
                    season = prow['Season Code'].upper()
                    week = str(prow['Week Number']).strip()
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
    teams_lookup_path = os.path.join('Lookups', 'leda_teams_table_export.csv')
    team_names = {}
    if os.path.exists(teams_lookup_path):
        try:
            with open(teams_lookup_path, newline='', encoding='utf-8') as teamsfile:
                teams_reader = csv.DictReader(teamsfile)
                for trow in teams_reader:
                    tid = str(trow['ID Number']).strip()
                    tname = trow['Team Name'].strip()
                    team_names[tid] = tname
        except UnicodeDecodeError:
            with open(teams_lookup_path, newline='', encoding='latin1') as teamsfile:
                teams_reader = csv.DictReader(teamsfile)
                for trow in teams_reader:
                    tid = str(trow['ID Number']).strip()
                    tname = trow['Team Name'].strip()
                    team_names[tid] = tname

    # Load player names from lookup CSV
    people_lookup_path = os.path.join('Lookups', 'leda_people_table_export.csv')
    player_names = {}
    if os.path.exists(people_lookup_path):
        try:
            with open(people_lookup_path, newline='', encoding='utf-8') as peoplefile:
                people_reader = csv.DictReader(peoplefile)
                for prow in people_reader:
                    pid = str(prow['ID Number']).strip()
                    name = f"{prow['First Name']} {prow['Middle Initial'] + ' ' if prow['Middle Initial'] else ''}{prow['Last Name']}".strip()
                    player_names[pid] = name
        except UnicodeDecodeError:
            with open(people_lookup_path, newline='', encoding='latin1') as peoplefile:
                people_reader = csv.DictReader(peoplefile)
                for prow in people_reader:
                    pid = str(prow['ID Number']).strip()
                    name = f"{prow['First Name']} {prow['Middle Initial'] + ' ' if prow['Middle Initial'] else ''}{prow['Last Name']}".strip()
                    player_names[pid] = name
    input_csv = 'Working/leda_weekly_scoresheets_table.csv'
    sql_output_file = 'Output/scoresheets_inserts.sql'

    grouped = defaultdict(list)
    with open(input_csv, newline='', encoding='utf-8') as csvfile:
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

    def process_week(args):
        (season, week), rows = args
        scoresheet = defaultdict(lambda: defaultdict(dict))
        # Group rows by matchup (home/away team letters) and by team (home/away)
        matchups = {}
        for row in rows:
            division = row['Division']
            subdivision = row['Subdivision']
            matchup = f"{row['Home Team Letter']} - {row['Away Team Letter']}"
            if (division, subdivision, matchup) not in matchups:
                matchups[(division, subdivision, matchup)] = {'home': [], 'away': []}
            if row.get('Home or Away', '').strip().upper() == 'H':
                matchups[(division, subdivision, matchup)]['home'].append(row)
            elif row.get('Home or Away', '').strip().upper() == 'A':
                matchups[(division, subdivision, matchup)]['away'].append(row)

        for (division, subdivision, matchup), teams in matchups.items():
            # Format subdivision as 'Subdivision X'
            formatted_subdivision = f"Subdivision {subdivision}" if not str(subdivision).startswith("Subdivision ") else subdivision
            def build_team_info(team_rows, prefix, is_home):
                team_id = get_team_id(team_rows[0], prefix) if team_rows else ''
                team_letter = get_team_letter(team_rows[0], prefix) if team_rows else ''
                # Lookup team name from team_names dict
                team_name = team_names.get(str(team_id), "")
                # Aggregate all player numbers for this team
                team_members = {}
                for row in team_rows:
                    player_id = str(row.get('Player Number', '')).strip()
                    if player_id:
                        name = player_names.get(player_id, "UNKNOWN")
                        team_members[player_id] = {
                            "name": name,
                            "gameStats": {col: parse_bool(row.get(col, '')) for col in GAME_COLUMNS},
                            "gamePoints": row.get('Home Score', '') if is_home else row.get('Away Score', '')
                        }
                # Lookup penalties for this team, season, and week
                penalties = {}
                if team_rows:
                    season = team_rows[0]['Season Code'].upper()
                    week = str(team_rows[0]['Week Number']).strip()
                    key = (season, week, str(team_id))
                    penalties = penalties_by_key.get(key, {})
                return {
                    "teamLetter": team_letter,
                    "teamName": team_name,
                    "home": is_home,
                    "teamMembers": team_members,
                    "penalties": penalties
                }

            team_info = {}
            team_info[get_team_id(teams['home'][0], 'home') if teams['home'] else ''] = build_team_info(teams['home'], 'home', True)
            team_info[get_team_id(teams['away'][0], 'away') if teams['away'] else ''] = build_team_info(teams['away'], 'away', False)

            # Find the home and away rows for this matchup
            home_row = teams['home'][0] if teams['home'] else None
            away_row = teams['away'][0] if teams['away'] else None

            def matchup_game_information(home_row, away_row):
                games = {}
                for col in GAME_COLUMNS:
                    # Extract game number from column name
                    game_num = ''.join(filter(str.isdigit, col))
                    points_col = f'Points Game {game_num}'
                    won_col = f'Won Game {game_num}'
                    home_points = home_row.get(points_col, '') if home_row else ''
                    away_points = away_row.get(points_col, '') if away_row else ''
                    if away_points == '':
                        away_points = '0'
                    # Use parse_bool so that '1' means win, '0' means not win
                    home_win = parse_bool(home_row.get(won_col, '')) if home_row else False
                    games[col] = {
                        "homeWin": home_win,
                        "homePoints": home_points,
                        "awayPoints": away_points
                    }
                return games

            def matchup_team_points(home_row, away_row):
                home_points = home_row.get('Home Score', '') if home_row else ''
                away_points = away_row.get('Away Score', '') if away_row else ''
                if away_points == '' or away_points is None:
                    away_points = '0'
                return {
                    "homePoints": home_points,
                    "awayPoints": away_points
                }

            scoresheet[division][formatted_subdivision][matchup] = {
                "teamInformation": team_info,
                "gameInformation": matchup_game_information(home_row, away_row),
                "teamPoints": matchup_team_points(home_row, away_row)
            }
        scoresheet_json = json.dumps(scoresheet).replace("'", "''")
        return (season, int(week), f"('{season}', {week}, '{scoresheet_json}', NULL)")

    sql_results = []
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

    with ThreadPoolExecutor() as executor:
        futures = {executor.submit(process_week, item): item for item in items}
        completed = 0
        for future in as_completed(futures):
            sql_results.append(future.result())
            completed += 1
            if pbar:
                pbar.n = completed
                pbar.refresh()
            else:
                print(f'Processed {completed}/{total} weeks', end='\r')
        if pbar:
            pbar.close()

    # Sort results by season and week before writing
    sql_values = [row for _, _, row in sorted(sql_results, key=lambda x: (x[0], x[1]))]

    # Determine finishedScoresheet for each row
    finished_flags = []
    # Find the last week for F25
    f25_weeks = [int(x[0][1]) for x in items if x[0][0] == 'F25']
    last_f25_week = max(f25_weeks) if f25_weeks else None
    for (season, week), _ in sorted(items, key=lambda x: (x[0][0], int(x[0][1]))):
        if season == 'F25' and int(week) == last_f25_week:
            finished_flags.append('false')
        else:
            finished_flags.append('true')

    # Write SQL insert statements for leda_weekly_scoresheets
    if sql_values:
        with open(sql_output_file, 'w', encoding='utf-8') as f:
            f.write(
                'INSERT INTO leda_weekly_scoresheets ("seasonCode", "weekNum", "scoresheetData", "finishedScoresheet") VALUES\n'
            )
            for i, row in enumerate(sql_values):
                if i > 0:
                    f.write(",\n")
                # Replace the NULL with the correct finishedScoresheet value
                f.write(row.rsplit(',', 1)[0] + f', {finished_flags[i]})')
            f.write(";\n")

def export_weekly_player_scores():
    input_csv = 'Working/leda_weekly_scoresheets_table.csv'
    output_file = 'Output/player_points_inserts.sql'
    # Load all rows
    with open(input_csv, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    # Sort rows by season, week, then team, then player
    rows.sort(key=lambda r: (r['Season Code'].upper(), int(r['Week Number']), r['Home Team Number'], r['Away Team Number'], r.get('Player Number', '')))

    # Progress bar setup
    try:
        from tqdm import tqdm
        pbar = tqdm(total=len(rows), desc='Exporting player scores', unit='row')
    except ImportError:
        tqdm = None
        pbar = None
    prev_points = {}
    values = []
    for idx, row in enumerate(rows):
        season = row['Season Code'].upper()
        week = int(row['Week Number'])
        # Determine team and player
        if row.get('Home or Away', '').strip().upper() == 'H':
            team_id = row['Home Team Number']
            points = row.get('Home Score', '')
        elif row.get('Home or Away', '').strip().upper() == 'A':
            team_id = row['Away Team Number']
            points = row.get('Away Score', '')
        else:
            if pbar:
                pbar.update(1)
            continue
        player_id = row.get('Player Number', '').strip()
        if not player_id or not team_id:
            if pbar:
                pbar.update(1)
            continue
        try:
            points = int(points) if points and str(points).isdigit() else 0
        except Exception:
            points = 0
        key = (season, player_id, team_id)
        prev_key = (season, player_id, team_id, week-1)
        prev_total = prev_points.get(key, 0)
        total = prev_total + points
        values.append(f"('{season}', {week}, {player_id}, {prev_total}, {total}, {team_id})")
        # Update for next week
        prev_points[key] = total
        if pbar:
            pbar.update(1)
    if pbar:
        pbar.close()

    # Write SQL insert
    if values:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('INSERT INTO leda_weekly_player_points ("seasonCode", "weekNum", "ledaId", "prevTotalPoints", "totalPoints", "teamLedaId") VALUES\n')
            f.write(",\n".join(values))
            f.write(';\n')

if __name__ == "__main__":
    print("LEDA Scoresheet Data Migration Tool")
    print("1. Convert Weekly Scoresheets")
    print("2. Export Weekly Team Scores")
    print("3. Export Weekly Player Scores")
    choice = input("Select an option (1): ").strip()
    if choice == "1" or choice == "":
        main()
    elif choice == "2":
        export_weekly_team_scores()
    elif choice == "3":
        export_weekly_player_scores()
    else:
        print("Invalid option. Exiting.")