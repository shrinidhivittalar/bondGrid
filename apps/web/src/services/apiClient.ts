const fallbackBaseUrl = 'http://localhost:3333';
const fallbackApiKey = 'admin-secret';

function authHeaders(): Record<string, string> {
  const key = process.env.NEXT_PUBLIC_API_KEY ?? fallbackApiKey;
  return { 'x-api-key': key };
}

export const apiClient = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? fallbackBaseUrl,
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  },
  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => undefined);
      throw new Error(errorBody?.error?.message ?? `Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  },
  async patch<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => undefined);
      throw new Error(errorBody?.error?.message ?? `Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  },
  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => undefined);
      throw new Error(errorBody?.error?.message ?? `Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  },
};
