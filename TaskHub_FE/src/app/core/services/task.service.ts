import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTaskPayload, GetTasksParams, TaskItem, TaskListResponse, UpdateTaskPayload } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly http = inject(HttpClient);
  
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  getTasks(query: GetTasksParams = {}): Observable<TaskListResponse> {
    let params = new HttpParams();

    if (query.category) {
      params = params.set('category', query.category);
    }

    if (query.isCompleted !== undefined) {
      params = params.set('isCompleted', String(query.isCompleted));
    }

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }

    if (query.pageNumber !== undefined) {
      params = params.set('pageNumber', String(query.pageNumber));
    }

    if (query.pageSize !== undefined) {
      params = params.set('pageSize', String(query.pageSize));
    }

    return this.http.get<TaskListResponse>(this.apiUrl, { params });
  }

  getTaskById(id: string): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.apiUrl}/${id}`);
  }

  createTask(payload: CreateTaskPayload): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, payload);
  }

  updateTask(id: string, payload: UpdateTaskPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  markAsComplete(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/complete`, {});
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}