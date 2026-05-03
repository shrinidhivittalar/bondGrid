const fallbackBaseUrl = 'http://localhost:3333';

export const apiClient = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? fallbackBaseUrl,
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);

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
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => undefined);
      throw new Error(errorBody?.error?.message ?? `Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  },
};
