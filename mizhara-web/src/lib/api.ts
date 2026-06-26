import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export function isAxiosError(error: unknown): error is import("axios").AxiosError<{ error?: string; message?: string }> {
  return axios.isAxiosError(error);
}

export function apiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (isAxiosError(error)) {
    return error.response?.data?.error ?? error.response?.data?.message ?? fallback;
  }
  return fallback;
}
