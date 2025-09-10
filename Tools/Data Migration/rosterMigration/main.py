import pandas as pd
import json
from tqdm import tqdm

# File paths
schedule_path = r"Working/leda_schedule_table_export.csv"
teams_path = r"Lookup/leda_teams_table_export.csv"

# Read CSVs
schedule_df = pd.read_csv(schedule_path)
try:
    teams_df = pd.read_csv(teams_path, encoding='utf-8')
except UnicodeDecodeError:
    teams_df = pd.read_csv(teams_path, encoding='latin1')

# Build teamId -> teamName lookup
tid_to_name = dict(zip(teams_df['ID Number'], teams_df['Team Name']))

def build_team_info(season_code):
    season_df = schedule_df[schedule_df['Season Code'] == season_code]
    team_info = {}
    for division in season_df['Division'].unique():
        div_df = season_df[season_df['Division'] == division]
        subdivisions = {}
        for subdiv in div_df['Subdivision'].unique():
            sub_df = div_df[div_df['Subdivision'] == subdiv]
            teams = {}
            for _, row in tqdm(sub_df.iterrows(), total=sub_df.shape[0], desc=f"{division} Subdivision {subdiv}"):
                letter = row['Team Letter']
                tid = row['Team ID Number']
                tname = tid_to_name.get(tid, "Unknown")
                teams[letter] = {
                    "teamId": str(tid),
                    "placeId": str(subdiv),
                    "teamName": tname
                }
            subdivisions[f"Subdivision {subdiv}"] = teams
        team_info[division] = {"subdivisions": subdivisions}
    return team_info

if __name__ == "__main__":
    season_codes = schedule_df['Season Code'].unique()
    rows = []
    for season_code in tqdm(season_codes, desc="Processing season codes"):
        team_info_json = build_team_info(season_code)
        # Escape single quotes for SQL
        json_str = json.dumps(team_info_json).replace("'", "''")
        rows.append(f"('{str(season_code).upper()}', '{json_str}')")
    # Build the insert statement
    insert_sql = "INSERT INTO public.leda_roster_info (seasonCode, teamInformation) VALUES\n" + ",\n".join(rows) + ";"
    # Write to file
    with open("Output/leda_roster_info_insert.sql", "w", encoding="utf-8") as f:
        f.write(insert_sql)
    print("Postgres insert script written to Output/leda_roster_info_insert.sql")