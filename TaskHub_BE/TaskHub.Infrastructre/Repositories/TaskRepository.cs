using System;
using System.Collections.Generic;
using System.Text;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Interfaces;
using TaskHub.Infrastructre.Data;
using Microsoft.EntityFrameworkCore;
using TaskHub.Application.Enums;

namespace TaskHub.Infrastructre.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private readonly TaskDbContext _context;

        public TaskRepository(TaskDbContext context)
        {
            _context = context;
        }
        public async Task<(List<TaskItem> Items, int TotalCount, int PendingCount, int CompletedCount)>
        GetFilteredAsync(Guid userId, Guid? categoryId, bool? isCompleted, TaskSortOption sortBy, int pageNumber, int pageSize)
        {
            var baseQuery = _context.Tasks.Include(t => t.Category).Where(t => t.UserId == userId && t.DeletedAt == null);

            var categoryFilteredQuery = ApplyCategoryFilter(baseQuery, categoryId);

            var (pendingCount, completedCount) = await GetStatusCountsAsync(categoryFilteredQuery);

            var finalQuery = ApplyCompletionFilter(categoryFilteredQuery, isCompleted);
            var totalCount = await finalQuery.CountAsync();

            var items = await ApplySorting(finalQuery, sortBy)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount, pendingCount, completedCount);
        }



        public async Task<TaskItem?> GetByIdAsync(Guid id, Guid userId)
        {
            return await _context.Tasks.Include(t => t.Category).FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId && t.DeletedAt == null);
        }

        public Task AddAsync(TaskItem task)
        {
            _context.Tasks.Add(task);
            return _context.SaveChangesAsync();
        }

        public Task UpdateAsync(TaskItem task)
        {
            _context.Tasks.Update(task);
            return _context.SaveChangesAsync();
        }

        public Task DeleteAsync(TaskItem task)
        {
            _context.Tasks.Remove(task);
            return _context.SaveChangesAsync();
        }




        // --- HELPER METHODS ---

        private static IQueryable<TaskItem> ApplySorting(IQueryable<TaskItem> query, TaskSortOption sortBy)
        {
            return sortBy switch
            {
                TaskSortOption.TitleAsc => query.OrderBy(t => t.Title),
                TaskSortOption.TitleDesc => query.OrderByDescending(t => t.Title),
                TaskSortOption.CreatedAtAsc => query.OrderBy(t => t.CreatedAt),
                _ => query.OrderByDescending(t => t.CreatedAt)
            };
        }

        private static async Task<(int Pending, int Completed)> GetStatusCountsAsync(IQueryable<TaskItem> query)
        {
            var statusCounts = await query
                .GroupBy(t => t.IsCompleted)
                .Select(g => new { IsCompleted = g.Key, Count = g.Count() })
                .ToListAsync();

            var pendingCount = statusCounts.FirstOrDefault(c => !c.IsCompleted)?.Count ?? 0;
            var completedCount = statusCounts.FirstOrDefault(c => c.IsCompleted)?.Count ?? 0;

            return (pendingCount, completedCount);
        }

        private static IQueryable<TaskItem> ApplyCategoryFilter(IQueryable<TaskItem> query, Guid? categoryId)
        {
            return categoryId.HasValue
                ? query.Where(t => t.CategoryId == categoryId.Value)
                : query;
        }

        private static IQueryable<TaskItem> ApplyCompletionFilter(IQueryable<TaskItem> query, bool? isCompleted)
        {
            return isCompleted.HasValue
                ? query.Where(t => t.IsCompleted == isCompleted.Value)
                : query;
        }

    }
}
