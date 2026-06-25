export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  category?: string;
  completedAt?: string;
  deadline?: string;
  createdAt: string; 
}

export interface TaskListResponse {
  items: TaskItem[];
  categories: string[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  pendingCount: number;
  completedCount: number;
}

export interface GetTasksParams {
  category?: string;
  isCompleted?: boolean;
  sortBy?: TaskSortOption;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  category?: string;
  deadline?: string;
}

export interface UpdateTaskPayload {
  title: string;
  description?: string;
  category?: string;
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