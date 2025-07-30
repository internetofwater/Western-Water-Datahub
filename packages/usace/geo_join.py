import pathlib
import geopandas as gpd
import json


def generate_mapper():
    print("Generating nid to grand id mapper...")
    current_dir = pathlib.Path(__file__).parent

    # Load the dam datasets
    global_dams = gpd.read_file(current_dir / "ReservoirsGRanD.gpkg")

    print(f"Loaded {len(global_dams)} global dams.")

    nid_dams = gpd.read_file(current_dir / "national_inventory_of_dams.gpkg")

    print(f"Loaded {len(nid_dams)} NID dams.")

    # Ensure same CRS (reproject to EPSG:3857 for accurate distance calculations in meters)
    global_dams = global_dams.to_crs(epsg=3857)
    nid_dams = nid_dams.to_crs(epsg=3857)

    # Perform spatial join between buffered NID dams and global dams
    joined = gpd.sjoin_nearest(nid_dams, global_dams, how="inner", max_distance=20)

    grand_to_nid = dict(zip(joined["GRAND_ID"], joined["nidId"]))

    # Export to JSON
    with open(current_dir / "grand_to_nid.json", "w") as f:
        json.dump(grand_to_nid, f, indent=2)

    print(f"Mapped {len(grand_to_nid)} dams.")


if __name__ == "__main__":
    generate_mapper()
