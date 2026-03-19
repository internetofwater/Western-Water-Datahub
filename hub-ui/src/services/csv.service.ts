/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { BlobReader, BlobWriter, HttpReader, ZipWriter } from "@zip.js/zip.js";

export type TZipLink = {
  fileName: string;
  url: string;
};

/**
 * Define performance options and provide helper callbacks
 * to manage progress, concurrency, fallbacks, or entry‑level errors.
 *
 * Properties:
 * - compressionLevel?: number - 0 (no compression) to 9 (max). Default: 6.
 * - zip64?: boolean - Enable ZIP64 for extremely large archives (>4GB). Default: false.
 * - concurrency?: number - Maximum parallel downloads. Default: 4.
 * - signal?: AbortSignal - Allows aborting in‑flight work.
 * - onEntryProgress?: (name: string, loaded: number, total?: number) => void -
 *     Per‑entry progress callback.
 * - onOverallProgress?: (loaded: number, total?: number) => void -
 *     Aggregated progress callback.
 * - onEntryError?: (name: string, error: unknown) => boolean | Promise<boolean> -
 *     Handle per‑entry failure; return true to skip, false to abort.
 * - fallbackToBlobReader?: boolean - Use fetch+BlobReader if HttpReader fails (e.g., CORS). Default: false.
 *
 * @type {Object}
 */
export type ZipServiceOptions = {
  compressionLevel?: number;
  zip64?: boolean;
  concurrency?: number;
  signal?: AbortSignal | undefined;
  onEntryProgress?: (name: string, loaded: number, total?: number) => void;
  onOverallProgress?: (loaded: number, total?: number) => void;
  onEntryError?: (name: string, error: unknown) => boolean | Promise<boolean>;
  fallbackToBlobReader?: boolean;
};

/**
 * A service responsible for generating ZIP archives from a list of remote resources.
 * Each entry in the ZIP is downloaded (with configurable concurrency and fallbacks)
 * and added under a specified filename. Optional performance and error‑handling
 * settings can be provided when instantiating the service or when calling the method.
 *
 * Methods:
 * - getZipFileBlob(links: TZipLink[], options: ZipServiceOptions = {}): Promise<Blob> -
 *     Accepts an array of link objects, each containing the source URL and the desired
 *     output filename. Downloads each resource, packages them into a ZIP archive,
 *     and resolves with a `Blob` representing the final ZIP file.
 *
 * @class ZipService
 */
export class ZipService {
  constructor(
    private readonly defaults: ZipServiceOptions = {
      compressionLevel: 6,
      zip64: true,
      concurrency: 4,
    },
  ) {}

  private async addOne(
    zipWriter: ZipWriter<Blob>,
    link: TZipLink,
    opts: Required<
      Pick<ZipServiceOptions, "onEntryError" | "fallbackToBlobReader">
    > &
      Pick<
        ZipServiceOptions,
        "compressionLevel" | "signal" | "onEntryProgress"
      >,
  ): Promise<void> {
    const { signal, onEntryProgress, onEntryError, fallbackToBlobReader } =
      opts;
    const name = link.fileName;

    const addViaHttpReader = async () => {
      await zipWriter.add(name, new HttpReader(link.url), {
        level: opts.compressionLevel,
        signal,
        async onprogress(loaded, total) {
          onEntryProgress?.(
            name,
            loaded,
            typeof total === "number" ? total : undefined,
          );
        },
      });
    };

    const addViaBlobReader = async () => {
      const resp = await fetch(link.url, { signal });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} for ${link.url}`);
      }
      const blob = await resp.blob();
      await zipWriter.add(name, new BlobReader(blob), {
        level: opts.compressionLevel,
        async onprogress(loaded, total) {
          onEntryProgress?.(
            name,
            loaded,
            typeof total === "number" ? total : undefined,
          );
        },
      });
    };

    try {
      await addViaHttpReader();
    } catch (err) {
      if (fallbackToBlobReader) {
        try {
          await addViaBlobReader();
          return;
        } catch (err2) {
          const shouldContinue = await onEntryError?.(name, err2);
          if (shouldContinue) {
            return;
          }
          throw err2;
        }
      }
      const shouldContinue = await onEntryError?.(name, err);
      if (shouldContinue) {
        return;
      }
      throw err;
    }
  }

  private async runWithConcurrency<T>(
    items: T[],
    limit: number,
    worker: (item: T, index: number) => Promise<void>,
  ): Promise<void> {
    if (limit <= 1) {
      for (let i = 0; i < items.length; i++) {
        await worker(items[i], i);
      }
      return;
    }

    let i = 0;
    const runners: Promise<void>[] = new Array(Math.min(limit, items.length))
      .fill(0)
      .map(async () => {
        while (i < items.length) {
          const idx = i++;
          await worker(items[idx], idx);
        }
      });
    await Promise.all(runners);
  }

  public async getZipFileBlob(
    links: TZipLink[],
    options: ZipServiceOptions = {},
  ): Promise<Blob> {
    const {
      compressionLevel = 0,
      zip64 = true,
      concurrency = 4,
      signal,
      onEntryProgress,
      onOverallProgress,
      onEntryError,
      fallbackToBlobReader = false,
    } = { ...this.defaults, ...options };

    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const progressMap = new Map<string, { loaded: number; total?: number }>();
    const wrappedOnEntryProgress =
      onOverallProgress || onEntryProgress
        ? (name: string, loaded: number, total?: number) => {
            progressMap.set(name, {
              loaded,
              total: typeof total === "number" ? total : undefined,
            });
            onEntryProgress?.(name, loaded, total);
            if (onOverallProgress) {
              let sumLoaded = 0;
              let sumTotal = 0;
              let allHaveTotals = true;
              progressMap.forEach((v) => {
                sumLoaded += v.loaded;
                if (typeof v.total === "number") {
                  sumTotal += v.total;
                } else {
                  allHaveTotals = false;
                }
              });
              onOverallProgress(
                sumLoaded,
                allHaveTotals ? sumTotal : undefined,
              );
            }
          }
        : undefined;

    const blobWriter = new BlobWriter("application/zip");
    const zipWriter = new ZipWriter(blobWriter, { zip64 });

    const addEntry = (link: TZipLink) =>
      this.addOne(zipWriter, link, {
        signal,
        onEntryProgress: wrappedOnEntryProgress,
        onEntryError: onEntryError ?? (async () => false), // default: abort on errors
        fallbackToBlobReader,
        compressionLevel,
      });

    await this.runWithConcurrency(links, concurrency, async (item) => {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      await addEntry(item);
    });
    return await zipWriter.close(); // resolves to Blob
  }
}
