/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReactNode } from "react";
import { Feature } from "geojson";
import { Group, Text } from "@mantine/core";
import { Properties } from "@/components/Map/types";
import styles from "@/features/Search/Search.module.css";
import { getIdStore } from "@/utils/getLabel";

export const getId = (
  feature: Feature,
  isStringIdentifierCollection: boolean,
) => {
  if (isStringIdentifierCollection) {
    return getIdStore(feature) ?? String(feature.id);
  }

  return String(feature.id);
};

const DEFAULT_CASE_SENSITIVE = false;

const stringify = (value: any): string => {
  return ["object", "symbol", "function"].includes(typeof value)
    ? JSON.stringify(value)
    : String(value);
};

const highlightText = (
  text: string,
  term: string,
  {
    caseSensitive = DEFAULT_CASE_SENSITIVE,
    keyPrefix = "",
    strongProps = {},
  }: {
    caseSensitive?: boolean;
    keyPrefix?: string;
    strongProps?: Record<string, unknown>;
  } = {},
): ReactNode[] => {
  if (!term) {
    return [text];
  }

  const src = caseSensitive ? text : text.toLowerCase();
  const tgt = caseSensitive ? term : term.toLowerCase();

  const nodes: ReactNode[] = [];
  let i = 0;
  let matchIndex = 0;

  while (true) {
    const idx = src.indexOf(tgt, i);
    if (idx === -1) {
      // remainder
      if (i < text.length) {
        nodes.push(
          <span key={`${keyPrefix}-seg-${matchIndex}-tail`}>
            {text.slice(i)}
          </span>,
        );
      }
      break;
    }
    if (idx > i) {
      nodes.push(
        <span key={`${keyPrefix}-seg-${matchIndex}`}>
          {text.slice(i, idx)}
        </span>,
      );
    }
    nodes.push(
      <Text
        span
        inherit
        className={styles.colorDefault}
        key={`${keyPrefix}-hit-${matchIndex}`}
        {...strongProps}
      >
        {text.slice(idx, idx + term.length)}
      </Text>,
    );
    i = idx + term.length;
    matchIndex += 1;
  }

  return nodes;
};

export const highlightMatches = (
  properties: Properties,
  searchTerm: string,
  limit?: number,
  {
    caseSensitive = DEFAULT_CASE_SENSITIVE,
    quoteStringValues = true,
    strongProps = {},
  }: {
    caseSensitive?: boolean;
    quoteStringValues?: boolean;
    strongProps?: Record<string, unknown>;
  } = {},
): ReactNode[] => {
  if (!properties || !searchTerm) {
    return [];
  }

  const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

  const lines: ReactNode[] = [];

  for (const [rawKey, rawVal] of Object.entries(properties)) {
    const key = String(rawKey);
    const keyCmp = caseSensitive ? key : key.toLowerCase();

    let valueForSearch: string | null = null;
    let valueForDisplay: string | null = null;

    const keyHas = keyCmp.includes(term);

    if (!keyHas) {
      valueForSearch = stringify(rawVal);
      const valueCmp = caseSensitive
        ? valueForSearch
        : valueForSearch.toLowerCase();
      if (!valueCmp.includes(term)) {
        continue;
      }
    }

    const isString = typeof rawVal === "string";
    valueForDisplay = isString ? rawVal : stringify(rawVal);
    const valueCmp = valueForSearch ?? valueForDisplay;
    const valueCmpNorm = caseSensitive ? valueCmp : valueCmp.toLowerCase();

    const keyNodes = keyHas
      ? highlightText(key, searchTerm, {
          caseSensitive,
          keyPrefix: `${key}-k`,
          strongProps,
        })
      : [key];

    let valueNodes: ReactNode[] = [valueForDisplay];
    if (valueCmpNorm.includes(term)) {
      valueNodes = highlightText(valueForDisplay, searchTerm, {
        caseSensitive,
        keyPrefix: `${key}-v`,
        strongProps,
      });
    }

    const wrappedValue = (
      <Text
        key={`${key}-value`}
        size="xs"
        c="dimmed"
        className={styles.breakWord}
      >
        {quoteStringValues && typeof rawVal === "string" ? '"' : null}
        {valueNodes}
        {quoteStringValues && typeof rawVal === "string" ? '"' : null}
      </Text>
    );

    lines.push(
      <Group
        key={`kv-${key}`}
        component="span"
        gap="calc(var(--default-spacing) / 8)"
      >
        <Text size="xs" c="dimmed">
          {keyNodes}
        </Text>
        <Text size="xs" c="dimmed">
          {": "}
        </Text>
        {wrappedValue}
      </Group>,
    );

    if (limit && limit === lines.length) {
      break;
    }
  }

  return lines;
};
