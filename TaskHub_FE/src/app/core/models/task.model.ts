export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  categoryId?: string;
  categoryName?: string;
  completedAt?: string;
  deadline?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface TaskListResponse {
  items: TaskItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  pendingCount: number;
  completedCount: number;
}

export interface GetTasksParams {
  categoryId?: string;
  isCompleted?: boolean;
  sortBy?: TaskSortOption;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  categoryId?: string;
  deadline?: string;
}

export interface UpdateTaskPayload {
  title: string;
  description?: string;
  categoryId?: string;
  isCompleted: boolean;
  deadline?: string;
}


export enum TaskSortOption {
  TitleAsc = 'TitleAsc',
  TitleDesc = 'TitleDesc',
  CreatedAtAsc = 'CreatedAtAsc',
  CreatedAtDesc = 'CreatedAtDesc',
  Default = 'Default'
}