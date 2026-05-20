import type {
  AttemptResult,
  CreateTestPayload,
  TestDetail,
  TestForQuiz,
  TestListItem,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5180/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `Ошибка ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getTests: () => request<TestListItem[]>("/tests"),
  getTest: (id: string) => request<TestDetail>(`/tests/${id}`),
  getQuiz: (id: string) => request<TestForQuiz>(`/tests/${id}/quiz`),
  createTest: (payload: CreateTestPayload) =>
    request<TestDetail>("/tests", { method: "POST", body: JSON.stringify(payload) }),
  updateTest: (id: string, payload: CreateTestPayload) =>
    request<TestDetail>(`/tests/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteTest: (id: string) => request<void>(`/tests/${id}`, { method: "DELETE" }),
  submitAttempt: (id: string, answers: { questionId: string; selectedOptionIds: string[] }[]) =>
    request<AttemptResult>(`/tests/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
};
