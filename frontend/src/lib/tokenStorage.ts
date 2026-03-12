// src/lib/tokenStorage.ts
const KEY = "ACCESS_TOKEN";

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(KEY);
  },

  set(token: string | null): void {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  },

  clear(): void {
    localStorage.removeItem(KEY);
  },
};
