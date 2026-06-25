using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using TaskHub.Application.DTOs;
using TaskHub.Application.Enums;

namespace TaskHub.Application.Interfaces
{
    public interface ITaskService
    {
        Task<TaskListResponse> GetAllTasksAsync(Guid userId, string? category, bool? isCompleted, TaskSortOption sortBy, int pageNumber, int pageSize);
        Task<TaskDto?> GetTaskByIdAsync(Guid userId,Guid id);
        Task<TaskDto> CreateTaskAsync(Guid userId, CreateTaskDto dto);
        Task UpdateTaskAsync(Guid userId,Guid id, UpdateTaskDto dto);
        Task DeleteTaskAsync(Guid userId,Guid id);
        Task MarkAsCompleteAsync(Guid userId,Guid id);
    }
}
