import sys
from pathlib import Path
import pandas as pd
import datetime as dt
import re
import time
from tqdm import tqdm

# Configuration
TABLE_NAME = 'public.leda_trails_history'
TARGET_COLS = [
    'ledaId',
    'notes',
    'singlesPlace',
    'doublesPlace',
    'trailsPoints',
    'trailsDate',
]
REQUIRED_COLS = ['ledaId', 'singlesPlace', 'doublesPlace', 'trailsPoints', 'trailsDate']


def norm(name: str) -> str:
    return re.sub(r'[^a-z0-9]', '', str(name).lower())


def find_source_csv(working_dir: Path) -> Path:
    csvs = sorted(working_dir.glob('*.csv'))
    if not csvs:
        raise FileNotFoundError(f'No .csv file found in {working_dir}')
    # Prefer a file that mentions trails if multiple exist
    for p in csvs:
        if 'trail' in p.stem.lower():
            return p
    return csvs[0]


def build_column_mapping(df_cols) -> dict:
    # Try to map source columns to TARGET_COLS flexibly
    target_norm = {norm(c): c for c in TARGET_COLS}
    synonyms = {
        'ledaid': 'ledaId',
        'memberidnumber': 'ledaId',
        'memberid': 'ledaId',
        'member_id': 'ledaId',
        'singlesplace': 'singlesPlace',
        'singleplace': 'singlesPlace',
        'singlesposition': 'singlesPlace',
        'doublesplace': 'doublesPlace',
        'doubleplace': 'doublesPlace',
        'doublesposition': 'doublesPlace',
        'trailspoints': 'trailsPoints',
        'points': 'trailsPoints',
        'trailsdate': 'trailsDate',
        'date': 'trailsDate',
        'notes': 'notes',
        'note': 'notes',
        'comment': 'notes',
        'comments': 'notes',
    }

    mapping = {t: None for t in TARGET_COLS}

    # Exact normalized name match first
    for src in df_cols:
        n = norm(src)
        if n in target_norm:
            mapping[target_norm[n]] = src

    # Fill remaining via synonyms
    for src in df_cols:
        n = norm(src)
        if n in synonyms:
            t = synonyms[n]
            if mapping.get(t) is None:
                mapping[t] = src

    return mapping


def coerce_and_validate(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()

    # Notes can be null; normalize blanks to None
    if 'notes' in out.columns:
        out['notes'] = (
            out['notes']
            .astype(str)
            .map(lambda s: s if str(s).strip() not in ('', 'nan', 'None') else None)
        )

    # Numeric required columns
    for col in ['ledaId', 'singlesPlace', 'doublesPlace', 'trailsPoints']:
        out[col] = pd.to_numeric(out[col], errors='coerce')

    # Date required column
    out['trailsDate'] = pd.to_datetime(out['trailsDate'], errors='coerce').dt.date

    # Drop rows missing any required fields
    before = len(out)
    out = out.dropna(subset=REQUIRED_COLS)

    # Cast numerics to integers (still okay for SQL rendering if left numeric)
    for col in ['ledaId', 'singlesPlace', 'doublesPlace', 'trailsPoints']:
        out[col] = out[col].astype('int64')

    # Ensure column order
    out = out[TARGET_COLS]
    return out


def sql_escape(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return 'NULL'
    # Dates
    if isinstance(value, (dt.date, )):
        return f"'{value.strftime('%Y-%m-%d')}'"
    # Pandas Timestamps
    if hasattr(value, 'to_pydatetime'):
        return f"'{value.to_pydatetime().strftime('%Y-%m-%d')}'"
    # Strings
    if isinstance(value, str):
        return "'" + value.replace("'", "''") + "'"
    # Numerics and others
    try:
        # Prefer integer-like representation
        ival = int(value)
        return str(ival)
    except Exception:
        return "'" + str(value).replace("'", "''") + "'"


def dataframe_to_insert_sql(df: pd.DataFrame) -> str:
    if df.empty:
        return ''
    cols_sql = ', '.join([
        '"ledaId"', '"notes"', '"singlesPlace"', '"doublesPlace"', '"trailsPoints"', '"trailsDate"'
    ])
    values_sql_parts = []
    for _, row in df.iterrows():
        vals = [
            sql_escape(row['ledaId']),
            sql_escape(row.get('notes', None)),
            sql_escape(row['singlesPlace']),
            sql_escape(row['doublesPlace']),
            sql_escape(row['trailsPoints']),
            sql_escape(row['trailsDate']),
        ]
        values_sql_parts.append('(' + ', '.join(vals) + ')')

    return f'INSERT INTO {TABLE_NAME} ({cols_sql})\nVALUES\n' + \
           ',\n'.join(values_sql_parts) + \
           ';\n'


def menu():
    print("Select an option:")
    print("1. Get all Trails History")
    print("2. Get Trails Audit Trail")
    choice = input("Enter option number: ").strip()
    return choice


def build_audit_trail(df: pd.DataFrame) -> pd.DataFrame:
    # Sort by ledaId and trailsDate
    df_sorted = df.sort_values(['ledaId', 'trailsDate'])
    audit_rows = []
    prev_points = {}
    now = dt.datetime.now()
    for idx, row in tqdm(df_sorted.iterrows(), total=len(df_sorted), desc="Processing audit trail"):
        leda_id = row['ledaId']
        trails_points = row['trailsPoints']
        prev_total = prev_points.get(leda_id, 0)
        change_by = trails_points - prev_total
        audit_rows.append({
            'ledaId': leda_id,
            'modifyDate': now,
            'previousTotalPoints': prev_total,
            'totalPoints': trails_points,
            'changeBy': change_by,
            'trailsDate': row['trailsDate'],
            'singlesPlace': row['singlesPlace'],
            'doublesPlace': row['doublesPlace'],
        })
        prev_points[leda_id] = trails_points
    return pd.DataFrame(audit_rows)


def audit_dataframe_to_insert_sql(df: pd.DataFrame) -> str:
    if df.empty:
        return ''
    cols_sql = ', '.join([
        '"ledaId"', '"modifyDate"', '"previousTotalPoints"', '"totalPoints"', '"changeBy"', '"trailsDate"', '"singlesPlace"', '"doublesPlace"'
    ])
    values_sql_parts = []
    for _, row in df.iterrows():
        vals = [
            sql_escape(row['ledaId']),
            f"'{row['modifyDate'].strftime('%Y-%m-%d %H:%M:%S')}'",
            sql_escape(row['previousTotalPoints']),
            sql_escape(row['totalPoints']),
            sql_escape(row['changeBy']),
            sql_escape(row['trailsDate']),
            sql_escape(row['singlesPlace']),
            sql_escape(row['doublesPlace']),
        ]
        values_sql_parts.append('(' + ', '.join(vals) + ')')
    return 'INSERT INTO public.leda_trails_point_totals_audit (' + cols_sql + ')\nVALUES\n' + ',\n'.join(values_sql_parts) + ';\n'


def main():
    base_dir = Path(__file__).resolve().parent
    working_dir = base_dir / 'Working'
    output_dir = base_dir / 'Output'
    working_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)

    choice = menu()
    if choice == '1':
        print("Processing Trails History...")
        try:
            src_path = find_source_csv(working_dir)
        except FileNotFoundError as e:
            print(str(e))
            sys.exit(1)
        df_raw = pd.read_csv(src_path, dtype=str, encoding='utf-8-sig')
        mapping = build_column_mapping(df_raw.columns)
        missing_targets = [c for c in REQUIRED_COLS if mapping.get(c) is None]
        if missing_targets:
            print('Missing required columns in source file: ' + ', '.join(missing_targets))
            sys.exit(1)
        df_norm = pd.DataFrame()
        for t in TARGET_COLS:
            src_col = mapping.get(t)
            if src_col is not None and src_col in df_raw.columns:
                df_norm[t] = df_raw[src_col]
            else:
                df_norm[t] = None
        df_ready = coerce_and_validate(df_norm)
        if df_ready.empty:
            print('No valid rows to export after validation.')
            sys.exit(0)
        for _ in tqdm(range(100), desc="Writing SQL file"):
            time.sleep(0.01)
        sql = dataframe_to_insert_sql(df_ready)
        ts = dt.datetime.now().strftime('%Y%m%d_%H%M%S')
        out_file = output_dir / f'leda_trails_history_insert_{ts}.sql'
        out_file.write_text(sql, encoding='utf-8')
        print(f'Wrote {len(df_ready)} rows to {out_file}')
    elif choice == '2':
        print("Processing Trails Audit Trail...")
        try:
            src_path = find_source_csv(working_dir)
        except FileNotFoundError as e:
            print(str(e))
            sys.exit(1)
        df_raw = pd.read_csv(src_path, dtype=str, encoding='utf-8-sig')
        mapping = build_column_mapping(df_raw.columns)
        missing_targets = [c for c in REQUIRED_COLS if mapping.get(c) is None]
        if missing_targets:
            print('Missing required columns in source file: ' + ', '.join(missing_targets))
            sys.exit(1)
        df_norm = pd.DataFrame()
        for t in TARGET_COLS:
            src_col = mapping.get(t)
            if src_col is not None and src_col in df_raw.columns:
                df_norm[t] = df_raw[src_col]
            else:
                df_norm[t] = None
        df_ready = coerce_and_validate(df_norm)
        if df_ready.empty:
            print('No valid rows to export after validation.')
            sys.exit(0)
        audit_df = build_audit_trail(df_ready)
        for _ in tqdm(range(100), desc="Writing SQL file"):
            time.sleep(0.01)
        sql = audit_dataframe_to_insert_sql(audit_df)
        out_file = output_dir / 'leda_trails_audit_history_insert.sql'
        out_file.write_text(sql, encoding='utf-8')
        print(f'Wrote {len(audit_df)} rows to {out_file}')
    else:
        print("Invalid option.")
        sys.exit(1)

if __name__ == '__main__':
    main()
