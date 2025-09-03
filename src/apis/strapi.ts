import axios from 'axios';
import qs from 'qs';

const secret =
  process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || "";
const axiosConfig = {
  baseURL: process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337/api",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${secret}`,
  },
};

const strapi = axios.create(axiosConfig);
// Strapi-specific query parameter types
interface StrapiPopulate {
    [key: string]: boolean | StrapiPopulate | string | string[] | {
        populate?: StrapiPopulate | string | string[];
        filters?: StrapiFilters;
        sort?: StrapiSort | string | string[];
        [key: string]: unknown;
    };
}

interface StrapiFilters {
    [key: string]: 
        | string 
        | number 
        | boolean 
        | StrapiFilters
        | StrapiFilters[]
        | {
            $eq?: string | number | boolean;
            $ne?: string | number | boolean;
            $lt?: string | number;
            $lte?: string | number;
            $gt?: string | number;
            $gte?: string | number;
            $in?: (string | number | boolean)[];
            $notIn?: (string | number | boolean)[];
            $contains?: string | number;
            $notContains?: string | number;
            $containsi?: string;
            $notContainsi?: string;
            $null?: boolean;
            $notNull?: boolean;
            $between?: [string | number, string | number];
            $startsWith?: string;
            $endsWith?: string;
            $or?: StrapiFilters[];
            $and?: StrapiFilters[];
            $not?: StrapiFilters;
        };
}

interface StrapiSort {
    [key: string]: 'asc' | 'desc';
}

interface StrapiPagination {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
}

interface StrapiFields {
    [key: string]: string[];
}

interface StrapiQueryParams {
    populate?: StrapiPopulate | string | string[];
    filters?: StrapiFilters;
    sort?: StrapiSort | string | string[];
    pagination?: StrapiPagination;
    fields?: string[] | StrapiFields;
    locale?: string;
    publicationState?: 'live' | 'preview';
    [key: string]: unknown;
}

interface StrapiCallProps {
    endpoint: string;
    queryParams?: StrapiQueryParams | string;
    body?: Record<string, unknown> | FormData;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    options?: Record<string, unknown>;
}

function buildQueryString(params?: StrapiQueryParams | string): string {
    if (!params) return '';
    if (typeof params === 'string') return params;
    
    // Use qs to properly serialize Strapi query parameters
    // This handles nested objects correctly for Strapi's API format
    return qs.stringify(params, {
        encodeValuesOnly: true, // Keep brackets in parameter names
        arrayFormat: 'brackets', // Use array[0]=value&array[1]=value format
    });
}

function strapiGet(endpoint: string, queryParams?: string | StrapiQueryParams, headers?: Record<string, string>, options?: Record<string, unknown>) {
    try {
        const qs = buildQueryString(queryParams);
        const url = endpoint + (qs ? `?${qs}` : '');
        const response = strapi.get(url, { headers, ...options });
        return response.then(r => r.data);
    }
    catch (error) {
        console.error("Error in strapiGet:", error);
        throw error;
    }
}

function strapiPost(endpoint: string, body?: Record<string, unknown> | FormData, queryParams?: string | StrapiQueryParams, headers?: Record<string, string>, options?: Record<string, unknown>) {
    try {
        const qs = buildQueryString(queryParams);
        const url = endpoint + (qs ? `?${qs}` : '');
        const response = strapi.post(url, body, { headers, ...options });
        return response.then(r => r.data);
    }
    catch (error) {
        console.error("Error in strapiPost:", error);
        throw error;
    }
}

function strapiPut(endpoint: string, body?: Record<string, unknown> | FormData, queryParams?: string | StrapiQueryParams, headers?: Record<string, string>, options?: Record<string, unknown>) {
    try {
        const qs = buildQueryString(queryParams);
        const url = endpoint + (qs ? `?${qs}` : '');
        const response = strapi.put(url, body, { headers, ...options });
        return response.then(r => r.data);
    }
    catch (error) {
        console.error("Error in strapiPut:", error);
        throw error;
    }
}

function strapiDelete(endpoint: string, queryParams?: string | StrapiQueryParams, headers?: Record<string, string>, options?: Record<string, unknown>) {
    try {
        const qs = buildQueryString(queryParams);
        const url = endpoint + (qs ? `?${qs}` : '');
        const response = strapi.delete(url, { headers, ...options });
        return response.then(r => r.data);
    }
    catch (error) {
        console.error("Error in strapiDelete:", error);
        throw error;
    }
}

async function strapiRequest<T = unknown>({ endpoint, queryParams, body, method, headers, options }: StrapiCallProps): Promise<T> {
    const qs = buildQueryString(queryParams);
    const url = endpoint + (qs ? `?${qs}` : '');
    try {
        switch (method) {
            case 'GET': {
                const res = await strapi.get(url, { headers, ...options });
                return res.data as T;
            }
            case 'POST': {
                const res = await strapi.post(url, body, { headers, ...options });
                return res.data as T;
            }
            case 'PUT': {
                const res = await strapi.put(url, body, { headers, ...options });
                return res.data as T;
            }
            case 'DELETE': {
                const res = await strapi.delete(url, { headers, ...options });
                return res.data as T;
            }
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
    }
    catch (error) {
        console.error("Error in strapiRequest:", error);
        throw error;
    }
}

export {
    strapi,
    buildQueryString,
    strapiGet,
    strapiPost,
    strapiPut,
    strapiDelete,
    strapiRequest,
}

export type { 
    StrapiQueryParams, 
    StrapiCallProps,
    StrapiPopulate,
    StrapiFilters,
    StrapiSort,
    StrapiPagination,
    StrapiFields
};
