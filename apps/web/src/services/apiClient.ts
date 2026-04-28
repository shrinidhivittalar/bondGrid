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
};
