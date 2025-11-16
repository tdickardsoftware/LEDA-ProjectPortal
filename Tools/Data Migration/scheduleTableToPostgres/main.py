import csv
import json
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor

# File paths
schedule_csv = r'Working\leda_schedule_table_export.csv'
lookup_csv = r'Lookup\leda_teams_table_export.csv'
output_sql = r'Output\leda_schedule_insert.sql'

# Read schedule and lookup CSVs using csv module
def read_csv_dicts(filepath):
    with open(filepath, 'r', encoding='latin1') as f:
        reader = csv.DictReader(f)
        return list(reader)

schedule_rows = read_csv_dicts(schedule_csv)
lookup_rows = read_csv_dicts(lookup_csv)

# Build team name lookup: {teamId: teamName}
team_lookup = {}
for row in lookup_rows:
    team_lookup[str(row['ID Number'])] = row['Team Name']

# Helper: get team name by id
def get_team_name(team_id):
    return team_lookup.get(str(team_id), "")

# Helper: get home/away (home if opponent letter is uppercase)
def is_home(team_letter, opponent_letter):
    return opponent_letter.isupper()

# Helper: get match date (Week N: Jan 3 + 7*(N-1) days, 2024 season assumed)
def get_match_date(week_num):
    from datetime import datetime, timedelta
    base_date = datetime(2024, 1, 3)
    match_date = base_date + timedelta(days=7*(week_num-1))
    return f"{match_date.month}/{match_date.day}/{match_date.year}"

# Normalize season codes to uppercase
for row in schedule_rows:
    row['Season Code'] = row['Season Code'].upper()

def process_season(season):
    season_rows = [r for r in schedule_rows if r['Season Code'] == season]
    divisions = sorted(set(r['Division'] for r in season_rows))
    schedule_json = {}
    for division in tqdm(divisions, desc=f"Season {season} divisions", leave=False):
        div_rows = [r for r in season_rows if r['Division'] == division]
        subdivisions = sorted(set(str(r['Subdivision']) for r in div_rows))
        division_obj = {}
        for subdivision in tqdm(subdivisions, desc=f"Season {season} {division} subdivisions", leave=False):
            sub_rows = [r for r in div_rows if str(r['Subdivision']) == subdivision]
            subdivision_obj = {}
            for team_row in tqdm(sub_rows, total=len(sub_rows), desc=f"Season {season} {division} Subdiv {subdivision} teams", leave=False):
                team_letter = team_row['Team Letter']
                team_id = team_row['Team ID Number']
                team_name = get_team_name(team_id)
                matches_obj = {}
                num_weeks = int(team_row['Number of Weeks'])
                for week in range(1, num_weeks+1):
                    opp_letter = team_row.get(f'Week {week} Opponent', '')
                    if opp_letter is None or opp_letter == '':
                        continue
                    # Find opponent team id in same subdivision
                    opp_row = next((r for r in sub_rows if str(r['Team Letter']).upper() == str(opp_letter).upper()), None)
                    opp_id = opp_row['Team ID Number'] if opp_row else ""
                    match_key = f'Date{week}'
                    matches_obj[match_key] = {
                        "matchDate": get_match_date(week),
                        "matchTime": "19:30",
                        "home": is_home(team_letter, opp_letter),
                        "opposingTeamId": str(opp_id),
                        "opposingTeamLetter": str(opp_letter).upper(),
                        "subdivisionId": f"{division}-Subdivision {subdivision}"
                    }
                subdivision_obj[team_letter] = {
                    "teamName": team_name,
                    "teamId": str(team_id),
                    "matchesData": matches_obj
                }
            division_obj[f"Subdivision {subdivision}"] = subdivision_obj
        schedule_json[division] = division_obj
    # Properly escape the JSON string for SQL insertion
    json_string = json.dumps(schedule_json, separators=(',', ':')).replace("'", "''")
    return f"('{season.upper()}', '{json_string}')"

# Group by seasonCode (already normalized to upper)
seasons = sorted(set(r['Season Code'] for r in schedule_rows))
values = []

with ThreadPoolExecutor() as executor:
    results = list(tqdm(executor.map(process_season, seasons), total=len(seasons), desc="Processing seasons"))
    values.extend(results)

# Write output SQL with properly escaped JSON
with open(output_sql, 'w', encoding='utf-8') as f:
    f.write("INSERT INTO public.leda_schedule (\"seasonCode\", \"scheduleData\") VALUES\n")
    f.write(",\n".join(values))
    f.write(";\n")

print(f"SQL insert script written to {output_sql}")
