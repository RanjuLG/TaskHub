using System;
using System.Collections.Generic;
using System.Text;
using TaskHub.Application.Enums;
using TaskHub.Domain.Entities;

namespace TaskHub.Domain.Interfaces
{
    public interface ITaskRepository
    {
        Task<(List<TaskItem> Items, int TotalCount, int PendingCount, int CompletedCount, List<string> Categories)> GetFilteredAsync(Guid userId, string? category, bool? isCompleted, TaskSortOption sortBy, int pageNumber, int pageSize);
        Task<TaskItem?> GetByIdAsync(Guid id, Guid userId);
        Task AddAsync(TaskItem task);
        Task UpdateAsync(TaskItem task);
        Task DeleteAsync(TaskItem task);
    }
}
