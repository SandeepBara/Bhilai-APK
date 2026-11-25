import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../../utils/auth';

export const list = value => Array.isArray(value) ? value : Object.values(value ?? {});
export const errorMessage = error => {
  const data = error.response?.data;
  return Object.values(data?.errors ?? {}).flat().join('\n') || data?.message || error.message;
};

export async function shopRentRequest(url, body, signal) {
  const token = await getToken();
  if (!token) throw new Error('Please sign in again.');
  const headers = { Authorization: `Bearer ${token}` };
  if (body instanceof FormData) headers['Content-Type'] = 'multipart/form-data';
  const { data } = await axios.post(url, body, { headers, signal });
  if (!data?.status) {
    throw new Error(Object.values(data?.errors ?? {}).flat().join('\n') ||
      data?.message || 'The Shop Rent request failed.');
  }
  return data.data;
}

export function useShopRentData(url, body, revision = 0) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!body) return;
    const controller = new AbortController();
    shopRentRequest(url, body, controller.signal).then(data => {
      if (!controller.signal.aborted) setResult({ url, body, revision, data });
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ url, body, revision, error: errorMessage(error) });
    });
    return () => controller.abort();
  }, [url, body, revision]);
  return result?.url === url && result?.body === body && result?.revision === revision ? result : null;
}
