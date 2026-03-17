import AsyncStorage from "@react-native-async-storage/async-storage";

const getBaseUrl = () => {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api`;
  return "/api";
};

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${getBaseUrl()}${path}`, { ...options, headers });
  return res;
}

export async function apiGet(path: string) {
  return apiRequest(path, { method: "GET" });
}

export async function apiPost(path: string, body: unknown) {
  return apiRequest(path, { method: "POST", body: JSON.stringify(body) });
}

export async function apiPut(path: string, body: unknown) {
  return apiRequest(path, { method: "PUT", body: JSON.stringify(body) });
}

export async function apiDelete(path: string) {
  return apiRequest(path, { method: "DELETE" });
}
