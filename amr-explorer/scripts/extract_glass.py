"""Extract the WHO GLASS resistance table from its published Excel data model.

Source workbook: https://github.com/chamodSN/Antibiotic-Resistance-Gap-Analysis
(global-amr-resistance-analysis.xlsx). Its Power Pivot model holds the
`analysis_base` table: WHO GLASS resistance rates and GLASS-AMC consumption,
as republished by Our World in Data (https://ourworldindata.org/antibiotics).

    pip install pbixray
    python scripts/extract_glass.py path/to/global-amr-resistance-analysis.xlsx
"""
import sys

from pbixray import PBIXRay

model = PBIXRay(sys.argv[1])
table = model.get_table("analysis_base").drop(columns="__XL_RowNumber")
table.to_csv("data/raw/who_glass_owid_2016_2022.csv", index=False)
print(f"wrote {len(table)} rows")
