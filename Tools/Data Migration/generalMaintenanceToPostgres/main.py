import os
import time
from processing_lib import (
    read_divisions_csv,
    format_postgres_insert,
    read_mentions_csv,
    format_mentions_insert,
    read_payment_types_csv,
    format_payment_types_insert,
    read_people_types_csv,
    format_people_types_insert,
    read_place_types_csv,
    format_place_types_insert,
    show_progress_bar
)

WORKING_FOLDER = "Working"
OUTPUT_FOLDER = "Output"
DIVISIONS_FILE = "leda_divisions_table_export.csv"
DIVISIONS_OUTPUT_FILE = "divisions_insert.sql"
MENTIONS_FILE = "leda_mention_types_export.csv"
MENTIONS_OUTPUT_FILE = "mentions_insert.sql"
PAYMENT_TYPES_FILE = "leda_payment_type_export.csv"
PAYMENT_TYPES_OUTPUT_FILE = "payment_types_insert.sql"
PEOPLE_TYPES_FILE = "leda_people_types_export.csv"
PEOPLE_TYPES_OUTPUT_FILE = "people_types_insert.sql"
PLACE_TYPES_FILE = "leda_place_type_export.csv"
PLACE_TYPES_OUTPUT_FILE = "place_types_insert.sql"

def show_menu():
    print("Select a table to process:")
    print("1. Divisions")
    print("2. Mentions")
    print("3. Payment Types")
    print("4. People Types")
    print("5. Place Types")
    choice = input("Enter choice number: ")
    return choice

# --- Processing logic uses functions from processing_lib.py ---
def main():
    choice = show_menu()
    if choice == "1":
        filepath = os.path.join(WORKING_FOLDER, DIVISIONS_FILE)
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            return
        divisions = read_divisions_csv(filepath)
        total = len(divisions)
        print("Formatting data for Postgres insert...")
        for i, _ in enumerate(divisions, 1):
            show_progress_bar(i, total)
            time.sleep(0.05)
        insert_script = format_postgres_insert(divisions)
        print("\n\nPostgres Insert Script:\n")
        print(insert_script)
        os.makedirs(OUTPUT_FOLDER, exist_ok=True)
        output_path = os.path.join(OUTPUT_FOLDER, DIVISIONS_OUTPUT_FILE)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(insert_script)
        print(f"\nInsert script written to: {output_path}")
    elif choice == "2":
        filepath = os.path.join(WORKING_FOLDER, MENTIONS_FILE)
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            return
        mentions = read_mentions_csv(filepath)
        total = len(mentions)
        print("Formatting data for Postgres insert...")
        for i, _ in enumerate(mentions, 1):
            show_progress_bar(i, total)
            time.sleep(0.05)
        insert_script = format_mentions_insert(mentions)
        print("\n\nPostgres Insert Script:\n")
        print(insert_script)
        os.makedirs(OUTPUT_FOLDER, exist_ok=True)
        output_path = os.path.join(OUTPUT_FOLDER, MENTIONS_OUTPUT_FILE)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(insert_script)
        print(f"\nInsert script written to: {output_path}")
    elif choice == "3":
        filepath = os.path.join(WORKING_FOLDER, PAYMENT_TYPES_FILE)
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            return
        payment_types = read_payment_types_csv(filepath)
        total = len(payment_types)
        print("Formatting data for Postgres insert...")
        for i, _ in enumerate(payment_types, 1):
            show_progress_bar(i, total)
            time.sleep(0.05)
        insert_script = format_payment_types_insert(payment_types)
        print("\n\nPostgres Insert Script:\n")
        print(insert_script)
        os.makedirs(OUTPUT_FOLDER, exist_ok=True)
        output_path = os.path.join(OUTPUT_FOLDER, PAYMENT_TYPES_OUTPUT_FILE)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(insert_script)
        print(f"\nInsert script written to: {output_path}")
    elif choice == "4":
        filepath = os.path.join(WORKING_FOLDER, PEOPLE_TYPES_FILE)
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            return
        people_types = read_people_types_csv(filepath)
        total = len(people_types)
        print("Formatting data for Postgres insert...")
        for i, _ in enumerate(people_types, 1):
            show_progress_bar(i, total)
            time.sleep(0.05)
        insert_script = format_people_types_insert(people_types)
        print("\n\nPostgres Insert Script:\n")
        print(insert_script)
        os.makedirs(OUTPUT_FOLDER, exist_ok=True)
        output_path = os.path.join(OUTPUT_FOLDER, PEOPLE_TYPES_OUTPUT_FILE)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(insert_script)
        print(f"\nInsert script written to: {output_path}")
    elif choice == "5":
        filepath = os.path.join(WORKING_FOLDER, PLACE_TYPES_FILE)
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            return
        place_types = read_place_types_csv(filepath)
        total = len(place_types)
        print("Formatting data for Postgres insert...")
        for i, _ in enumerate(place_types, 1):
            show_progress_bar(i, total)
            time.sleep(0.05)
        insert_script = format_place_types_insert(place_types)
        print("\n\nPostgres Insert Script:\n")
        print(insert_script)
        os.makedirs(OUTPUT_FOLDER, exist_ok=True)
        output_path = os.path.join(OUTPUT_FOLDER, PLACE_TYPES_OUTPUT_FILE)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(insert_script)
        print(f"\nInsert script written to: {output_path}")
    else:
        print("Invalid choice.")

if __name__ == "__main__":
    main()
