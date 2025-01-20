import csv

def csv_to_postgres_values(input_csv: str, output_file: str):
    try:
        with open(input_csv, mode='r', newline='', encoding='utf-8') as csv_file:
            reader = csv.reader(csv_file)
            headers = next(reader)  # Skip header row
            
            with open(output_file, mode='w', encoding='utf-8') as outfile:
                values_list = []
                
                for row in reader:
                    # Escape single quotes in values and wrap strings in single quotes
                    formatted_row = [
                        f"'{value.replace('\'', '\'\'')}'" if isinstance(value, str) else value 
                        for value in row
                    ]
                    # Join the row as a tuple
                    values_list.append(f"({', '.join(formatted_row)})")

                # Write to output file
                outfile.write(",\n".join(values_list))
        
        print(f"Data from '{input_csv}' has been converted and saved to '{output_file}' in VALUES format.")
    
    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage
input_csv = './Working/convert.csv'  # Path to the CSV file
output_file = './Output/output.sql'  # Output file path
csv_to_postgres_values(input_csv, output_file)
