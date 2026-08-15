const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export type PriorityLevel = 0 | 1 | 2;

export interface TaskDto {
  id: string;
  title: string;
  priority: PriorityLevel;
  isCompleted: boolean;
  dueDate: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  parentTaskId: string | null;
  subtasks: TaskDto[] | null;
}

export interface CategoryDto {
  id: string;
  name: string;
  colorHex: string;
}

export interface CalendarEntryDto {
  id: string | null;
  date: string;
  blockNoteJson: string | null;
  excalidrawJson: string | null;
}

export interface HealthLogDto {
  id: string;
  date: string;
  stepCount: number;
  sleepHours: number;
  weightLbs: number;
}

export interface ShoppingItemDto {
  id: string;
  name: string;
  estimatedPrice: number;
  isPurchased: boolean;
}

export interface UserAccountDto {
  id: string;
  email: string;
  currentStreak: number;
  lastLoginDate: string;
}

export interface GeneratePlanRequest {
  goal: string;
  timelineDate: string;
  intensityLevel: 'daily' | 'weekly';
  userContext: string;
}

export const api = {
  getTasks: (categoryId?: string) =>
    request<TaskDto[]>(categoryId ? `/tasks?categoryId=${categoryId}` : '/tasks'),

  createTask: (data: {
    title: string;
    priority: PriorityLevel;
    dueDate?: string | null;
    categoryId?: string | null;
    subtasks?: { title: string; priority: PriorityLevel }[];
  }) => request<TaskDto>('/tasks', { method: 'POST', body: JSON.stringify(data) }),

  toggleTask: (id: string) =>
    request<TaskDto>(`/tasks/${id}/toggle`, { method: 'PUT' }),

  deleteTask: (id: string) =>
    request<void>(`/tasks/${id}`, { method: 'DELETE' }),

  getCategories: () => request<CategoryDto[]>('/categories'),

  getCalendar: (date: string) => request<CalendarEntryDto>(`/calendar/${date}`),

  updateCalendar: (date: string, data: { blockNoteJson?: string; excalidrawJson?: string }) =>
    request<CalendarEntryDto>(`/calendar/${date}`, { method: 'PUT', body: JSON.stringify(data) }),

  generatePlan: (data: GeneratePlanRequest) =>
    request<{ goal: string; tasksCreated: number; tasks: TaskDto[] }>('/ai/generate-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getHealthLogs: (days = 30) => request<HealthLogDto[]>(`/health?days=${days}`),

  upsertHealth: (data: { date: string; steps: number; sleepHours: number; weightLbs: number }) =>
    request<HealthLogDto>('/health/webhook', { method: 'POST', body: JSON.stringify(data) }),

  getShopping: () => request<ShoppingItemDto[]>('/shopping'),

  toggleShopping: (id: string) =>
    request<ShoppingItemDto>(`/shopping/${id}/toggle`, { method: 'PUT' }),

  getUser: () => request<UserAccountDto>('/user'),
};

export const priorityLabels: Record<PriorityLevel, string> = {
  0: 'Day',
  1: 'Week',
  2: 'Month',
};

export function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}
