/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

type CsvRowOutput = {
  url: string;
  id: string;
  collectionId: string;
  name: string;
  locationTypeName: string;
};

// Utility to escape quotes/commas properly
function toCsvRow(row: CsvRowOutput): string {
  return [
    row.url,
    row.id,
    row.collectionId,
    row.name?.replace(/"/g, '""'), // escape quotes
    row.locationTypeName?.replace(/"/g, '""'),
  ]
    .map((field) => `"${field}"`) // wrap each field in quotes
    .join(",");
}

(async () => {
  // Print CSV header once
  console.log("url,id,collectionId,name,locationTypeName");

  // First dataset
  const riseItems = await fetch(
    "https://api.wwdh.internetofwater.app/collections/rise-edr/items?limit=10000"
  ).then((res) => res.json());

  riseItems.features.forEach((item: any) => {
    const csvRow: CsvRowOutput = {
      id: item.id,
      url: `https://api.wwdh.internetofwater.app/collections/rise-edr/items/${item.id}`,
      collectionId: "rise",
      name: item.properties.locationName,
      locationTypeName: item.properties.locationTypeName,
    };
    console.log(toCsvRow(csvRow));
  });

  // Second dataset
  const usaceItems = await fetch(
    "https://api.wwdh.internetofwater.app/collections/usace-edr/items?limit=10000"
  ).then((res) => res.json());

  usaceItems.features.forEach((item: any) => {
    const csvRow: CsvRowOutput = {
      id: item.id,
      url: `https://api.wwdh.internetofwater.app/collections/usace-edr/items/${item.id}`,
      collectionId: "usace",
      name: item.properties.public_name,
      locationTypeName: "Dam/Reservoir",
    };
    console.log(toCsvRow(csvRow));
  });

  // Third dataset
  const resvizeItems = await fetch(
    "https://api.wwdh.internetofwater.app/collections/resviz-edr/items?limit=10000"
  ).then((res) => res.json());

  resvizeItems.features.forEach((item: any) => {
    const csvRow: CsvRowOutput = {
      id: item.id,
      url: `https://api.wwdh.internetofwater.app/collections/resviz-edr/items/${item.id}`,
      collectionId: "resviz",
      name: item.properties.site_name,
      locationTypeName: "Dam/Reservoir",
    };
    console.log(toCsvRow(csvRow));
  });
})();
