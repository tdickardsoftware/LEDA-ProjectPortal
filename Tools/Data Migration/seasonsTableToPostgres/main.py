import pandas as pd
import json
from tqdm import tqdm
import os

# Input and output paths
script_dir = os.path.dirname(os.path.abspath(__file__))
input_path = os.path.join(script_dir, 'Working', 'leda_seasons_table_export.csv')
output_path = os.path.join(script_dir, 'Output', 'output_seasons_insert.sql')

# Read CSV
# Remove comment lines if present
with open(input_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    lines = [line for line in lines if not line.strip().startswith('//')]

with open(input_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

df = pd.read_csv(input_path)

# Uppercase seasonCode
if 'Season Code' in df.columns:
    df['Season Code'] = df['Season Code'].str.upper()

# Date columns
date_cols = [col for col in df.columns if col.startswith('Date')]

# Prepare values for insert
values = []
for _, row in tqdm(df.iterrows(), total=len(df), desc='Processing rows'):
    season_code = row['Season Code']
    desc = row['Description'].replace("'", "''") if not pd.isna(row['Description']) else ''
    fiscal_year = str(row['Fiscal Year']).zfill(4)
    # Dates as JSON
    dates_dict = {col: str(row[col]).split(' ')[0] for col in date_cols if not pd.isna(row[col]) and str(row[col]).strip() != ''}
    dates_json = json.dumps(dates_dict)
    # isCurrentSeason: True for latest season, else False
    is_current = 'true' if season_code == df['Season Code'].iloc[-1] else 'false'
    values.append(f"('{season_code}', '{desc}', '{fiscal_year}', '{dates_json.replace("'", "''")}', {is_current})")

# Build insert statement
insert_sql = "INSERT INTO maint.leda_maint_seasons (\"seasonCode\", \"desc\", \"fiscalYear\", dates, \"isCurrentSeason\") VALUES\n"
insert_sql += ',\n'.join(values) + ';\n'

# Write to output file
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(insert_sql)

print(f"SQL insert file written to: {output_path}")
