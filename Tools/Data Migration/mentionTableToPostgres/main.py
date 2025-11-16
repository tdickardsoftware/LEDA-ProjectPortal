import csv

from tqdm import tqdm
from datetime import datetime
import csv

# Input CSV file path
input_file = 'Working/leda_mentions_export.csv'
# Output SQL file path
output_file = 'Output/mention_inserts.sql'

# Lookup CSV file paths
lookup_file = 'Lookup/leda_mention_types_export.csv'
players_season_file = 'Lookup/leda_players_by_season.csv'


# Build mention type -> description mapping
mention_type_desc = {}
with open(lookup_file, newline='', encoding='utf-8') as lookupcsv:
	reader = csv.DictReader(lookupcsv)
	for row in reader:
		code = row['Mention Code']
		desc = row['Description']
		mention_type_desc[code] = desc.replace("'", "''")

# Build (seasonCode, playerId) -> teamId mapping
season_player_team = {}
with open(players_season_file, newline='', encoding='utf-8') as pscsv:
	reader = csv.DictReader(pscsv)
	for row in reader:
		season = row['SeasonCode'].strip('"')
		player = int(row['PlayerNumber'])
		team = int(row['TeamNumber'])
		season_player_team[(season, player)] = team

# Read CSV and prepare data
with open(input_file, newline='', encoding='utf-8') as csvfile:
	reader = csv.DictReader(csvfile)
	rows = list(reader)

# Track mentionId per (ledaId, seasonCode, weekNum)
mention_counters = {}

# Write a single INSERT statement with multiple value lines
with open(output_file, 'w', encoding='utf-8') as sqlfile:
	sqlfile.write('INSERT INTO public.leda_player_mention_history (\n')
	sqlfile.write('    "ledaId", "mentionCode", "mentionDesc", "mentionPoints", "seasonCode", "weekNum", notes, "creationDate", "mentionId", count, "teamId"\n')
	sqlfile.write(') VALUES\n')
	values = []
	for row in tqdm(rows, desc='Generating SQL'):
		ledaId = int(row['Player ID Number'])
		mentionCode = row['Mention Type'].replace("'", "''")
		mentionDesc = mention_type_desc.get(mentionCode, 'Unknown')
		mentionPoints = int(row['Top Darter Points']) if row['Top Darter Points'] else 0
		seasonCode = row['Season Code'].strip('"').replace("'", "''").upper()
		weekNum = int(row['Week Number'])
		notes = row['Notes'].replace("'", "''") if row['Notes'] else ''
		creationDate = datetime.strptime(row['Creation Date'].split(' ')[0], '%m/%d/%Y').strftime('%Y-%m-%d')
		key = (ledaId, seasonCode, weekNum)
		mention_counters[key] = mention_counters.get(key, 0) + 1
		mentionId = mention_counters[key]
		count = int(row['Number of Darts or Count']) if row['Number of Darts or Count'] else 0
		teamId = season_player_team.get((seasonCode, ledaId), 0)
		value = f"({ledaId}, '{mentionCode}', '{mentionDesc}', {mentionPoints}, '{seasonCode}', {weekNum}, '{notes}', '{creationDate}', {mentionId}, {count}, {teamId})"
		values.append(value)
	sqlfile.write(',\n'.join(values))
	sqlfile.write(';\n')
