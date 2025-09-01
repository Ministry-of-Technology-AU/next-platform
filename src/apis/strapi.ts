import axios from 'axios';
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

interface queryParams{
    populate?: string | object;
    filters?: string | object;
    sort?: string | object;
    pagination?: string | object;
    [key: string]: unknown;
}

interface StrapiCallProps{
    endpoint: string;
    queryParams?: queryParams | string; // Bifurcate into population, filters, sort, pagination; accept as an object or prebuilt string
    body?: any;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: HeadersInit;
    options?: RequestInit;
}

function buildQueryString(params?: queryParams | string){
    if(!params) return '';
    if(typeof params === 'string') return params;
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if(value === undefined || value === null) return;
        if(typeof value === 'object'){
            // For complex Strapi params (filters, populate), accept object but stringify
            // If you need bracket-notation (e.g., filters[name][$eq]) pass a prebuilt string instead
            searchParams.set(key, JSON.stringify(value));
        } else {
            searchParams.set(key, String(value));
        }
    });
    const qs = searchParams.toString();
    return qs;
}

function strapiGet(endpoint:string, queryParams?:string | queryParams, headers?: HeadersInit, options?: RequestInit){
    try{
    const qs = buildQueryString(queryParams);
    const url = endpoint + (qs ? `?${qs}` : '');
    const response = strapi.get(url, { headers, ...(options as any) }); 
    return response.then(r => r.data);
    }
    catch(error){
        console.error("Error in strapiGet:", error);
        throw error;
    }
}

function strapiPost(endpoint:string, body?:any, queryParams?:string | queryParams, headers?: HeadersInit, options?: RequestInit){
    try{
    const qs = buildQueryString(queryParams);
    const url = endpoint + (qs ? `?${qs}` : '');
    const response = strapi.post(url, body, { headers, ...(options as any) });
    return response.then(r => r.data);
    }
    catch(error){
        console.error("Error in strapiPost:", error);
        throw error;
    }
}

function strapiPut(endpoint:string, body?:any, queryParams?:string | queryParams, headers?: HeadersInit, options?: RequestInit){
    try{
    const qs = buildQueryString(queryParams);
    const url = endpoint + (qs ? `?${qs}` : '');
    const response = strapi.put(url, body, { headers, ...(options as any) });
    return response.then(r => r.data);
    }
    catch(error){
        console.error("Error in strapiPut:", error);
        throw error;
    }
}

function strapiDelete(endpoint:string, queryParams?:string | queryParams, headers?: HeadersInit, options?: RequestInit){
    try{
    const qs = buildQueryString(queryParams);
    const url = endpoint + (qs ? `?${qs}` : '');
    const response = strapi.delete(url, { headers, ...(options as any) });
    return response.then(r => r.data);
    }
    catch(error){
        console.error("Error in strapiDelete:", error);
        throw error;
    }
}

async function strapiRequest<T = any>({ endpoint, queryParams, body, method, headers, options }: StrapiCallProps): Promise<T>{
    const qs = buildQueryString(queryParams);
    const url = endpoint + (qs ? `?${qs}` : '');
    try{
        switch(method){
            case 'GET':{
                const res = await strapi.get(url, { headers, ...(options as any) });
                return res.data as T;
            }
            case 'POST':{
                const res = await strapi.post(url, body, { headers, ...(options as any) });
                return res.data as T;
            }
            case 'PUT':{
                const res = await strapi.put(url, body, { headers, ...(options as any) });
                return res.data as T;
            }
            case 'DELETE':{
                const res = await strapi.delete(url, { headers, ...(options as any) });
                return res.data as T;
            }
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
    }
    catch(error){
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

export type { queryParams, StrapiCallProps };
