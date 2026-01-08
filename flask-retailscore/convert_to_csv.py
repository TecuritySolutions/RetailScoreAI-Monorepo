#!/usr/bin/env python3
"""
Convert Excel file to CSV for Vercel deployment.
This removes the need for openpyxl dependency, saving ~2 MB in deployment size.
"""

import pandas as pd

# Read Excel file
print("Reading Excel file...")
df = pd.read_excel('data/retail_data_with_area_type.xlsx')

# Save as CSV
print(f"Converting {len(df)} rows to CSV...")
df.to_csv('data/retail_data_with_area_type.csv', index=False)

print("✓ Conversion complete!")
print(f"  - Rows: {len(df)}")
print(f"  - Columns: {len(df.columns)}")
print(f"  - Output: data/retail_data_with_area_type.csv")
