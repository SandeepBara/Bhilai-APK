import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../../utils/auth';

export const rows = value => Array.isArray(value) ? value : Object.values(value ?? {});

export const message = error => {
  const data = error.response?.data;
  return Object.values(data?.errors ?? {}).flat().join('\n') || data?.message || error.message;
};

export async function request(url, body, signal) {
  const token = await getToken();
  if (!token) throw new Error('Please sign in again.');
  const options = { headers: { Authorization: 'Bearer ' + token }, signal };
  const { data } = body == null
    ? await axios.get(url, { ...options, params: { all: 'all' } })
    : await axios.post(url, body, options);
  if (!data?.status) {
    const errors = Object.values(data?.errors ?? {}).flat().join('\n');
    throw new Error(errors || data?.message || 'The SWM request failed.');
  }
  return data.data;
}

export function useData(endpoint, body, revision = 0) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (body === undefined) return;
    const controller = new AbortController();
    request(endpoint, body, controller.signal).then(data => {
      if (!controller.signal.aborted) setResult({ body, revision, data });
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ body, revision, error: message(error) });
    });
    return () => controller.abort();
  }, [endpoint, body, revision]);
  return result?.body === body && result?.revision === revision ? result : null;
}

