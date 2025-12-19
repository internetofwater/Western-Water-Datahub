# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import json
from pathlib import Path

metadata_file = Path(__file__).parent.parent / "usace" / "usace" / "usace_metadata.json"
averages_file = (
    Path(__file__).parent.parent / "resops" / "30_year_averages_by_nid_id.json"
)

with metadata_file.open() as f:
    metadata_data = json.load(f)

with averages_file.open() as f:
    averages_data = json.load(f)

created = 0
for nid in averages_data:
    if nid not in metadata_data:
        print(f"nid {nid} not in usace metadata file. creating it..")
        metadata_data[nid] = {}
        created += 1
    metadata_data[nid]["averages"] = averages_data[nid]["averages"]

print(f"Created {created} new entries in usace metadata file")
print(f"Added {len(averages_data)} entries to usace metadata file")

output = Path(__file__).parent.parent / "usace" / "usace" / "usace_metadata.json"
with output.open("w") as f:
    json.dump(metadata_data, f, indent=2)
