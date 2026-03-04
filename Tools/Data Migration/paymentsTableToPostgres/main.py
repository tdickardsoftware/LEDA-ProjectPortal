import os
import csv
from tqdm import tqdm
from dateutil import parser

def generate_payment_history(id_column, output_filename, table_name):
    """
    Generic payment history generator for player, team, and place records.
    Args:
        id_column: The column name for the unique ID (e.g., 'Member ID Number', 'Team ID Number', 'Place ID Number')
        output_filename: Output SQL filename
        table_name: SQL table name
    """
    working_folder = os.path.join(os.path.dirname(__file__), 'Working')
    output_folder = os.path.join(os.path.dirname(__file__), 'Output')
    source_file = None

    # Find the source file in the Working folder
    for fname in os.listdir(working_folder):
        if fname.lower().endswith('.csv'):
            source_file = os.path.join(working_folder, fname)
            break

    if not source_file:
        print("No CSV source file found in Working folder.")
        return

    output_file = os.path.join(output_folder, output_filename)

    # First pass: collect payment rows and partial payment info
    values = []
    part_payments = {}
    payment_rows = []
    with open(source_file, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)
        for row in tqdm(rows, desc=f"Reading {table_name} payment records"):
            id_value = row.get(id_column, '').strip()
            if not id_value or not id_value.isdigit() or int(id_value) == 0:
                continue
            leda_id = int(id_value)
            type_code = row.get('Payment Type', '').strip()
            raw_amount = row.get('Payment Amount', '').strip()
            # Parse payment amount, default to 0.0 if missing/invalid
            if not raw_amount:
                amount_float = 0.0
            else:
                amount = raw_amount.replace('$', '').replace(',', '').strip()
                try:
                    amount_float = float(amount)
                except ValueError:
                    print(f"WARNING: Invalid payment amount '{raw_amount}' for {id_column} {id_value}. Setting to 0.0.")
                    amount_float = 0.0
            season_code = row.get('Season Code', '').replace("'", "''").upper()
            comp = 'true' if row.get('Comp', '').strip().lower() == 'true' else 'false'
            notes = row.get('Notes', '').replace("'", "''")
            # Paid off logic
            if type_code == 'Part':
                paid_off = 'true' if row.get('Paid Off', '').strip().lower() == 'true' else 'false'
            else:
                paid_off = 'true'
            # Parse and format date
            raw_date = row.get('Creation Date', '').strip()
            parsed_date = ''
            if raw_date:
                try:
                    dt = parser.parse(raw_date)
                    parsed_date = dt.strftime('%Y-%m-%d')
                except Exception:
                    parsed_date = ''
            date = parsed_date.replace("'", "''")

            payment_rows.append({
                'leda_id': leda_id,
                'type_code': type_code,
                'type_': type_code.replace("'", "''"),
                'amount_float': amount_float,
                'season_code': season_code,
                'comp': comp,
                'notes': notes,
                'paid_off': paid_off,
                'date': date
            })

            # Track partial payments for each id/seasonCode
            if type_code == 'Part':
                key = (leda_id, season_code)
                if key not in part_payments:
                    part_payments[key] = []
                part_payments[key].append(amount_float)

    # Second pass: build output values with paymentType logic
    part_payment_counts = {}
    for row in tqdm(payment_rows, desc=f"Generating {table_name} output records"):
        type_code = row['type_code']
        payment_type = 'Full' if type_code != 'Part' else 'Part'
        if type_code == 'Part':
            key = (row['leda_id'], row['season_code'])
            if key not in part_payment_counts:
                part_payment_counts[key] = 0
            part_payment_counts[key] += 1
            # If there are at least two partials and sum > 30, mark second as Full
            if part_payment_counts[key] == 2:
                if sum(part_payments[key]) > 30.0:
                    payment_type = 'Full'
        value = (
            f"({row['leda_id']}, '{row['type_']}', '{payment_type}', {row['amount_float']}, "
            f"'{row['season_code']}', {row['comp']}, '{row['notes']}', {row['paid_off']}, '{row['date']}')"
        )
        values.append(value)

    if not values:
        print(f"No valid {table_name} payment records found.")
        return

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(
            f'INSERT INTO maint.{table_name}\n'
            '("ledaId", type, "paymentType", amount, "seasonCode", comp, notes, "paidOff", date)\n'
            'VALUES\n'
        )
        f.write(',\n'.join(values) + ';\n')

    print(f"SQL insert file written to: {output_file}")

def get_player_payment_history():
    generate_payment_history(
        id_column='Member ID Number',
        output_filename='player_payment_history_inserts.sql',
        table_name='leda_maint_player_payment_history'
    )

def get_team_payment_history():
    generate_payment_history(
        id_column='Team ID Number',
        output_filename='team_payment_history_inserts.sql',
        table_name='leda_maint_team_payment_history'
    )

def get_place_payment_history():
    generate_payment_history(
        id_column='Place ID Number',
        output_filename='place_payment_history_inserts.sql',
        table_name='leda_maint_place_payment_history'
    )

def main():
    """
    Main menu for running payment history generation.
    """
    print("\nMenu:")
    print("1. Get Player Payment History")
    print("2. Get Team Payment History")
    print("3. Get Place Payment History")
    print("4. Get All Payment Histories")
    print("0. Exit")
    choice = input("Select an option: ")
    if choice == '1':
        get_player_payment_history()
        return
    elif choice == '2':
        get_team_payment_history()
        return
    elif choice == '3':
        get_place_payment_history()
        return
    elif choice == '4':
        get_player_payment_history()
        get_team_payment_history()
        get_place_payment_history()
        return
    elif choice == '0':
        return
    else:
        print("Invalid option.")

if __name__ == "__main__":
    main()