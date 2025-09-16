/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

/**
 * send get request
 * @param url
 * @param params
 */
export async function request<T>(options: IRequestOptions): Promise<T> {
  const { url, init } = toRequestArgs(options);
  const res: Response = await fetch(url, init);

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  if (res.status === 204) {
    return null as T;
  }

  // no content
  const json = res.json();

  return json as Promise<T>;
}

const CONTENT_TYPE_HEADER = "content-type";
const APPLICATION_X_WWW_FORM_URLENCODED = "application/x-www-form-urlencoded";
const APPLICATION_JSON = "application/json";

function toBody(params: IRequestParams, headers: IRequestHeaders) {
  const contentType = getContentType(headers).toLowerCase();

  if (contentType.startsWith(APPLICATION_X_WWW_FORM_URLENCODED)) {
    return toSearchParams(params);
  } else if (contentType.startsWith(APPLICATION_JSON)) {
    return toJSON(params);
  }

  return JSON.stringify(params);
}

function getContentType(headers: IRequestHeaders): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const contentType = Object.keys(headers)
    .filter((header) => header.toLowerCase() === CONTENT_TYPE_HEADER)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .map((header) => headers[header])[0];

  return typeof contentType === "string"
    ? contentType
    : APPLICATION_X_WWW_FORM_URLENCODED;
}

function toSearchParams(params: IRequestParams) {
  const searchParams = new URLSearchParams();
  // if (!("f" in params)) {
  //   searchParams.append("f", "json");
  // }
  for (const key in params) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    searchParams.append(key, params[key].toString());
  }
  return searchParams;
}

function toJSON(params: IRequestParams) {
  return JSON.stringify(params);
}

const getRequestArgsMap: Record<TRequestMethods, TRequestArgsGetter> = {
  GET: ({
    url: baseUrl,
    signal,
    headers = { Accept: "application/json" },
    params = {},
  }: IRequestOptions): TRequestArgs => {
    const url = `${baseUrl}?${toSearchParams(params).toString()}`;
    const init = {
      signal,
      headers,
      method: "GET",
    };
    return { url, init };
  },
  POST: ({
    url,
    signal,
    params = {},
    headers = {},
  }: IRequestOptions): TRequestArgs => {
    const init = {
      signal,
      headers,
      method: "POST",
      body: toBody(params, headers),
    };
    return { url, init };
  },
  DELETE: ({
    url: baseUrl,
    signal,
    params = {},
    headers = {},
  }: IRequestOptions): TRequestArgs => {
    const url = `${baseUrl}?${toSearchParams(params).toString()}`;
    const init = {
      signal,
      headers,
      method: "DELETE",
    };
    return { url, init };
  },
};

const toRequestArgs = (params: IRequestOptions): TRequestArgs => {
  const getRequestArgs = getRequestArgsMap[params.method ?? "GET"];
  if (!getRequestArgs) {
    throw new Error(`Unsupported HTTP method "${params.method}"`);
  }
  const requestArgs = getRequestArgs(params);
  return requestArgs;
};

type TRequestArgsGetter = (params: IRequestOptions) => TRequestArgs;

type TRequestArgs = { url: string; init: RequestInit };

export interface IRequestParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface IRequestHeaders {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type TRequestMethods = "GET" | "POST" | "DELETE";

export interface IRequestOptions {
  url: string;
  params?: IRequestParams;
  headers?: IRequestHeaders;
  method?: TRequestMethods;
  signal?: AbortSignal;
}
