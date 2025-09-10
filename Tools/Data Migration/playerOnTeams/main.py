import os
import csv
import sys
from typing import List, Optional
from tqdm import tqdm 

try:
    import pandas as pd  # type: ignore
except ImportError:  # Fallback if pandas is not installed
    pd = None  # noqa

if pd is None:
    raise ImportError('pandas is required for this script. Please install pandas (pip install pandas).')

# Configuration: source and output filenames (can be overridden via CLI)
SOURCE_FILE = 'leda_weekly_scoresheets_table.csv'
OUTPUT_FILE = 'leda_players_by_season.csv'
LATEST_OUTPUT_FILE = 'leda_latest_team_players.csv'
WORKING_SUBDIR = 'Working'
OUTPUT_SUBDIR = 'Output'

# Potential column name variants (case-insensitive matching)
SEASON_COL_CANDIDATES = [
    'seasoncode', 'season_code', 'season', 'season id', 'seasonid'
]
PLAYER_COL_CANDIDATES = [
    'playernumber', 'player_number', 'player no', 'player_no', 'player #', 'player', 'playerid', 'player id'
]
HOME_TEAM_COL_CANDIDATES = [
    'hometeamnumber', 'home_team_number', 'home team number', 'home team', 'home_team', 'hometeam', 'home team no'
]
AWAY_TEAM_COL_CANDIDATES = [
    'awayteamnumber', 'away_team_number', 'away team number', 'away team', 'away_team', 'awayteam', 'away team no'
]
HOME_AWAY_FLAG_CANDIDATES = [
    'homeaway', 'home_away', 'home or away', 'home_or_away', 'h/a', 'hoa', 'homeawayflag', 'teamdesignation', 'ha'
]


def find_column(columns: List[str], candidates: List[str]) -> Optional[str]:
    lower_map = {c.lower(): c for c in columns}
    for cand in candidates:
        if cand in lower_map:
            return lower_map[cand]
    return None


def load_rows_with_csv_module(path: str):
    with open(path, 'r', newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    return rows


def normalize_columns(rows):
    if not rows:
        return rows
    normalized = []
    for r in rows:
        normalized.append({k.strip().lstrip('\ufeff'): v for k, v in r.items()})
    return normalized


def extract_unique(records):
    unique = set()
    for rec in records:
        unique.add((rec['SeasonCode'], rec['PlayerNumber'], rec['TeamNumber']))
    return sorted(unique)


def debug(msg: str):
    if os.environ.get('PLAYER_TEAM_DEBUG') == '1':
        print(msg)

def progress_bar(current: int, total: int, width: int = 40):
    if total <= 0:
        return
    ratio = min(max(current / total, 0), 1)
    filled = int(ratio * width)
    bar = '#' * filled + '-' * (width - filled)
    percent = int(ratio * 100)
    print(f"\rProcessing: [{bar}] {percent:3d}% ({current}/{total})", end='', flush=True)
    if current >= total:
        print()  # newline at end


def main():
    # Optional CLI: python main.py [--in path_to_csv] [--out output.csv]
    src_override = None
    out_override = None
    # New explicit column override args
    season_col_override = None
    player_col_override = None
    home_team_col_override = None
    away_team_col_override = None
    ha_flag_col_override = None
    mode = None  # 1 or 2

    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] in ('--in', '--input') and i + 1 < len(args):
            src_override = args[i + 1]
            i += 2
        elif args[i] in ('--out', '--output') and i + 1 < len(args):
            out_override = args[i + 1]
            i += 2
        elif args[i] == '--season-col' and i + 1 < len(args):
            season_col_override = args[i + 1]
            i += 2
        elif args[i] == '--player-col' and i + 1 < len(args):
            player_col_override = args[i + 1]
            i += 2
        elif args[i] == '--home-team-col' and i + 1 < len(args):
            home_team_col_override = args[i + 1]
            i += 2
        elif args[i] == '--away-team-col' and i + 1 < len(args):
            away_team_col_override = args[i + 1]
            i += 2
        elif args[i] == '--ha-col' and i + 1 < len(args):
            ha_flag_col_override = args[i + 1]
            i += 2
        elif args[i] == '--mode' and i + 1 < len(args):
            mode = args[i + 1]
            i += 2
        else:
            i += 1

    base_dir = os.path.dirname(os.path.abspath(__file__))
    working_dir = os.path.join(base_dir, WORKING_SUBDIR)

    if src_override:
        source_path = os.path.abspath(src_override)
    else:
        if os.path.isdir(working_dir):
            source_path = os.path.join(working_dir, SOURCE_FILE)
        else:
            source_path = os.path.join(base_dir, SOURCE_FILE)

    # Fallback: if not found in Working, try base folder automatically
    if not os.path.isfile(source_path):
        alt_path = os.path.join(base_dir, SOURCE_FILE)
        if os.path.isfile(alt_path):
            source_path = alt_path
        else:
            raise FileNotFoundError(f'Source file not found in Working or base directory. Tried: {source_path}')

    # Load data
    df = pd.read_csv(source_path, dtype=str).fillna('')
    df.columns = [c.strip().lstrip('\ufeff') for c in df.columns]
    original_columns = list(df.columns)

    # Early exit if empty
    if not original_columns:
        print('Input file has no columns / is empty.')
        return

    # Normalization helpers (reuse existing ones above)...
    def _normalize_key(s: str) -> str:
        return ''.join(ch for ch in s.lower().strip() if ch.isalnum())

    normalized_lookup = {}
    for orig in original_columns:
        k_lower = orig.lower().strip()
        k_norm = _normalize_key(orig)
        normalized_lookup.setdefault(k_lower, orig)
        normalized_lookup.setdefault(k_norm, orig)

    def resolve_column(candidates, fallback_prefixes):
        for cand in candidates:
            cand_lower = cand.lower().strip()
            cand_norm = _normalize_key(cand_lower)
            if cand_lower in normalized_lookup:
                return normalized_lookup[cand_lower]
            if cand_norm in normalized_lookup:
                return normalized_lookup[cand_norm]
        for prefix in fallback_prefixes:
            p_norm = _normalize_key(prefix)
            for key, orig in normalized_lookup.items():
                if key.startswith(p_norm):
                    return orig
        return None

    # Apply overrides or detection
    season_col = season_col_override if season_col_override in original_columns else None
    player_col = player_col_override if player_col_override in original_columns else None
    home_team_col = home_team_col_override if home_team_col_override in original_columns else None
    away_team_col = away_team_col_override if away_team_col_override in original_columns else None
    ha_flag_col = ha_flag_col_override if ha_flag_col_override in original_columns else None

    if season_col is None:
        season_col = resolve_column(SEASON_COL_CANDIDATES, ['season'])
    if player_col is None:
        player_col = resolve_column(PLAYER_COL_CANDIDATES, ['player'])
    if home_team_col is None:
        home_team_col = resolve_column(HOME_TEAM_COL_CANDIDATES, ['hometeam', 'home'])
    if away_team_col is None:
        away_team_col = resolve_column(AWAY_TEAM_COL_CANDIDATES, ['awayteam', 'away'])
    if ha_flag_col is None:
        ha_flag_col = resolve_column(HOME_AWAY_FLAG_CANDIDATES, ['homeaway', 'hoa', 'ha'])

    missing = [
        name for name, val in [
            ('season', season_col),
            ('player number', player_col),
        ] if val is None
    ]
    if missing:
        print('Could not detect required columns: ' + ', '.join(missing))
        print('Available columns:')
        for c in original_columns:
            print('  ' + c)
        print('Hints: use --season-col <exact name> and/or --player-col <exact name>.')
        return

    debug(f"Resolved columns: Season={season_col}, Player={player_col}, HomeTeam={home_team_col}, AwayTeam={away_team_col}, HA={ha_flag_col}")

    # Defer processing until after user selects a mode
    # If mode not provided via CLI, prompt user now (before heavy processing)
    if mode is None:
        print('Select an option:')
        print('  1 - Export players by team per season (all seasons)')
        print('  2 - Export latest season players for each team')
        mode = input('Enter choice (1/2): ').strip()

    if mode not in ('1', '2'):
        print('Invalid mode selection. Use 1 or 2 (or --mode 1/2).')
        return

    # Now process rows building output records with progress bar
    output_records = []
    total_rows = len(df)
    if total_rows == 0:
        print('No data rows present.')
        return

    # Use itertuples for speed
    col_index = {c: i for i, c in enumerate(df.columns)}
   
    for idx, row in enumerate(tqdm(df.itertuples(index=False, name=None), total=total_rows, desc='Processing rows'), start=1):
        ha_val = ''
        if ha_flag_col:
            ha_val = str(row[col_index[ha_flag_col]]).strip().upper()
        team_number = ''
        if ha_val.startswith('H') and home_team_col:
            team_number = str(row[col_index[home_team_col]]).strip()
        elif ha_val.startswith('A') and away_team_col:
            team_number = str(row[col_index[away_team_col]]).strip()
        elif not ha_val and home_team_col and away_team_col:
            team_number = str(row[col_index[home_team_col]]).strip()
        season_code = str(row[col_index[season_col]]).strip().upper()
        player_number = str(row[col_index[player_col]]).strip()
        if season_code and player_number and team_number:
            output_records.append({'SeasonCode': season_code, 'PlayerNumber': player_number, 'TeamNumber': team_number})

    if not output_records:
        print('No records produced after processing.')
        return

    # Deduplicate base records
    unique_tuples = extract_unique(output_records)

    def parse_season(season: str):
        season = season.upper().strip()
        if not season:
            return (-1, -1)
        letter = season[0]
        digits = ''.join(ch for ch in season[1:] if ch.isdigit())
        try:
            num = int(digits) if digits else -1
        except ValueError:
            num = -1
        order_map = {'W': 0, 'S': 1, 'T': 2, 'F': 3}
        letter_rank = order_map.get(letter, 9)
        return (num, letter_rank)

    if mode == '1':
        unique_tuples.sort(key=lambda x: (x[0], x[2], x[1]))
        target_filename = OUTPUT_FILE
        rows_to_write = unique_tuples
    else:
        from collections import defaultdict
        team_seasons = defaultdict(set)
        for season_code, player_number, team_number in unique_tuples:
            team_seasons[team_number].add(season_code)
        latest_per_team = {team: max(seasons, key=lambda s: parse_season(s)) for team, seasons in team_seasons.items()}
        latest_records = [t for t in unique_tuples if latest_per_team.get(t[2]) == t[0]]
        latest_records.sort(key=lambda x: (x[0], x[2], x[1]))
        target_filename = LATEST_OUTPUT_FILE
        rows_to_write = latest_records

    if out_override:
        out_path = os.path.abspath(out_override)
    else:
        out_dir = os.path.join(base_dir, OUTPUT_SUBDIR)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, target_filename)

    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['SeasonCode', 'PlayerNumber', 'TeamNumber'])
        for tup in rows_to_write:
            writer.writerow(tup)

    print(f'Wrote {len(rows_to_write)} unique rows to {out_path}')


if __name__ == '__main__':
    main()