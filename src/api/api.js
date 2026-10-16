const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.message || "Ошибка запроса");
  return data;
}

export const authApi = {
  me: () => request("/auth/me"),
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  logout: () => request("/auth/logout", { method: "POST" }),
};

export const taskApi = {
  list: () => request("/tasks"),
  create: (task) => request("/tasks", { method: "POST", body: JSON.stringify(task) }),
  update: (id, task) => request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(task) }),
  remove: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
  removeAll: () => request("/tasks", { method: "DELETE" }),
};