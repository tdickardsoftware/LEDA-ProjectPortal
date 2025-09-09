import csv
import json
import os
import re
from datetime import datetime
from typing import Dict, List, Any

def parse_date(raw: str) -> str:
    if not raw or raw.strip() == '':
        return '1970-01-01 00:00:00'
    raw = raw.strip()
    fmts = [
        '%m/%d/%Y %H:%M:%S',
        '%m/%d/%Y %H:%M',
        '%m/%d/%Y %H:%M:%S',
        '%m/%d/%Y',
    ]
    for f in fmts:
        try:
            dt = datetime.strptime(raw, f)
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        except ValueError:
            continue
    try:
        from dateutil import parser  # type: ignore
        dt = parser.parse(raw)
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except Exception:
        return '1970-01-01 00:00:00'


def sanitize(s: str) -> str:
    if s is None:
        return ''
    s = re.sub(r'[\r\n]+', ' ', s)
    s = s.strip()
    return s.replace("'", "''")


def load_team_players(players_csv: str) -> Dict[int, List[str]]:
    mapping: Dict[int, List[str]] = {}
    with open(players_csv, newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                team_no = int(row['TeamNumber'])
            except (KeyError, ValueError):
                continue
            player_no = row.get('PlayerNumber')
            if not player_no:
                continue
            mapping.setdefault(team_no, []).append(player_no)
    for k in list(mapping.keys()):
        mapping[k] = sorted(mapping[k], key=lambda x: int(x))
    return mapping


def build_member_json(player_ids: List[str], captain_id: str | None) -> str:
    obj: Dict[str, Any] = {}
    for idx, pid in enumerate(player_ids, start=1):
        obj[f'player{idx}'] = {
            'ledaId': str(pid),
            'isCaptain': (captain_id is not None and str(pid) == str(captain_id))
        }
    return json.dumps(obj, separators=(',', ':'))


def dict_reader_fallback(path: str) -> List[Dict[str, str]]:
    encodings = ['utf-8-sig', 'utf-8', 'cp1252', 'latin-1']
    for enc in encodings:
        try:
            with open(path, newline='', encoding=enc) as f:
                return list(csv.DictReader(f))
        except UnicodeDecodeError:
            continue
    with open(path, newline='', encoding='latin-1', errors='replace') as f:
        return list(csv.DictReader(f))


def generate_insert(place_csv: str, players_csv: str, output_sql: str) -> None:
    team_players = load_team_players(players_csv)
    rows_sql: List[str] = []
    place_rows = dict_reader_fallback(place_csv)
    for row in place_rows:
        id_raw = row.get('ID Number') or row.get('ID Number'.lower())
        if not id_raw or not id_raw.isdigit():
            continue
        team_id = int(id_raw)
        if team_id not in team_players:
            continue
        # Support both legacy and team column names
        team_name = sanitize(row.get('Team Name') or row.get('Place Name') or '')
        established_date = parse_date(row.get('Establish Date', '') or row.get('Establish Date'.lower(), ''))
        memo = sanitize(row.get('Team Memo') or row.get('Place Memo') or '')
        last_fee = sanitize(row.get('Last Team Fee Payment') or row.get('Last Bar Fee Payment') or '')
        # Captain comes from Last Captain Id Number column
        captain_id = row.get('Last Captain Id Number') or row.get('Last Captain Id Number'.lower())
        if captain_id and not captain_id.isdigit():
            captain_id = None
        member_json = build_member_json(team_players[team_id], captain_id)
        member_json_sql = member_json.replace("'", "''")
        value = f"({team_id},'{team_name}','{established_date}','{memo}','{last_fee}','{member_json_sql}'::json)"
        rows_sql.append(value)

    if not rows_sql:
        print('No matching teams found. No SQL generated.')
        return

    header = 'INSERT INTO public.leda_team_info ("ledaId","teamName","establishedDate","memo","lastTeamFeePayment","memberIdList") VALUES\n'
    body = ',\n'.join(rows_sql) + ';\n'

    os.makedirs(os.path.dirname(output_sql), exist_ok=True)
    with open(output_sql, 'w', encoding='utf-8') as out:
        out.write(header)
        out.write(body)
    print(f'Wrote SQL for {len(rows_sql)} teams to {output_sql}')


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    place_csv = os.path.join(base_dir, 'Working', 'leda_teams_table_export.csv')
    players_csv = os.path.join(base_dir, 'Lookups', 'leda_latest_team_players.csv')
    output_sql = os.path.join(base_dir, 'Output', 'insert_leda_team_info.sql')

    if not os.path.isfile(place_csv):
        print(f'Missing place CSV: {place_csv}')
        return
    if not os.path.isfile(players_csv):
        print(f'Missing players CSV: {players_csv}')
        return

    generate_insert(place_csv, players_csv, output_sql)


if __name__ == '__main__':
    main()