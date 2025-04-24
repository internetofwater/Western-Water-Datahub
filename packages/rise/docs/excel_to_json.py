import pandas as pd
import json

"""
Convert the Excel file "Reservoirs_and_Capacity_Data.xlsx" to a JSON file
for easier use in web APIs / frontend apps
"""

# Read the Excel file
data = pd.read_excel("Reservoirs_and_Capacity_Data.xlsx")

# Replace NaN with None to make JSON cleaner
data = data.astype(object).where(pd.notnull(data), None)

# Convert to dictionary with rise_name as the top-level key
data_dict = {
    row["rise_name"]: {k: v for k, v in row.items() if k != "rise_name"}
    for _, row in data.iterrows()
}

# Write to JSON file
with open("Reservoirs_and_Capacity_Data.json", "w") as json_file:
    json.dump(data_dict, json_file, indent=2)
