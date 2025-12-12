
import pandas as pd
import os

input_file = 'data/GSE85217_M_exp_763_MB_SubtypeStudy_TaylorLab.txt'
output_file = 'data/GSE85217_M_exp_763_MB_SubtypeStudy_TaylorLab.csv'

print(f"Reading {input_file}...")
# Read the tab-separated file
df = pd.read_csv(input_file, sep='\t')

print(f"Dataframe shape: {df.shape}")
print("First few columns:", df.columns.tolist()[:5])

print(f"Saving to {output_file}...")
# Save as CSV
df.to_csv(output_file, index=False)

print("Conversion complete.")
