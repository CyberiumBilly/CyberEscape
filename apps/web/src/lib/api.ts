interface RequestConfig {
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

async function request<T = any>(method: string, path: string, body?: any, config?: RequestConfig): Promise<{ data: T }> {
  const url = new URL(path, window.location.origin);
  if (config?.params) {
    Object.entries(config.params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config?.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem('accessToken', data.accessToken);
        headers['Authorization'] = `Bearer ${data.accessToken}`;
        const retry = await fetch(url.toString(), { method, headers, body: body ? JSON.stringify(body) : undefined });
        if (!retry.ok) throw { response: { data: await retry.json() } };
        return { data: await retry.json() };
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    throw { response: { data: { message: 'Unauthorized' } } };
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ message: 'Request failed' }));
    throw { response: { data: errData } };
  }

  const data = await res.json();
  return { data };
}

export const api = {
  get: <T = any>(path: string, config?: RequestConfig) => request<T>('GET', path, undefined, config),
  post: <T = any>(path: string, body?: any, config?: RequestConfig) => request<T>('POST', path, body, config),
  put: <T = any>(path: string, body?: any, config?: RequestConfig) => request<T>('PUT', path, body, config),
  patch: <T = any>(path: string, body?: any, config?: RequestConfig) => request<T>('PATCH', path, body, config),
  delete: <T = any>(path: string, config?: RequestConfig) => request<T>('DELETE', path, undefined, config),
};
