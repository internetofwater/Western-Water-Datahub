from rise.rise_api_types import JsonPayload, Url

"""This function is a separate file solely to prevent circular imports due to three files all need to import this, but can't import each other"""


def merge_pages(pages: dict[Url, JsonPayload]):
    # Initialize variables to hold the URL and combined data
    combined_url = None
    combined_data = None

    for url, content in pages.items():
        if combined_url is None:
            combined_url = url  # Set the URL from the first dictionary
        if combined_data is None:
            combined_data = content
        else:
            data = content.get("data", [])
            if not data:
                continue

            combined_data["data"].extend(data)

    # Create the merged dictionary with the combined URL and data
    merged_dict = {combined_url: combined_data}

    return merged_dict
