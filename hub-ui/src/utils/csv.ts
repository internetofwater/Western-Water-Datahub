/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';

export const createEmptyCsv = () => {
  const worksheet = XLSX.utils.aoa_to_sheet([['parameter', 'datetime', 'value', 'unit', 'x', 'y']]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datasets');

  const csvData = XLSX.write(workbook, {
    bookType: 'csv',
    type: 'array',
  }) as BlobPart;

  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

  return URL.createObjectURL(blob);
};
