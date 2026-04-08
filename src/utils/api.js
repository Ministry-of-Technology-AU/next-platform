import axios from 'axios';

const strapiAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`
  }
});

export const fetchFromAPI = async (endpoint) => {
  try {
    const response = await strapiAPI.get(`/api/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching from Strapi:', error);
    throw error;
  }
};

export const postToAPI = async (endpoint, data) => {
  try {
    const response = await strapiAPI.post(`/api/${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error('Error posting to Strapi:', error);
    throw error;
  }
};