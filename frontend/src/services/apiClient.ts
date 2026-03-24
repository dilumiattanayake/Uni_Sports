// services/apiClient.ts

const BASE_URL = "http://localhost:5001/api";

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}, isFormData = false) => {
  const token = localStorage.getItem("token");
  
  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Only set Content-Type to JSON if we are NOT sending FormData (like images).
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};