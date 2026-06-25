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
        public async Task<(List<TaskItem> Items, int TotalCount, int PendingCount, int CompletedCount, List<string> Categories)>
        GetFilteredAsync(Guid userId, string? category, bool? isCompleted, TaskSortOption sortBy, int pageNumber, int pageSize)
        {
            var baseQuery = _context.Tasks.Where(t => t.UserId == userId && t.DeletedAt == null);

            var categories = await GetUniqueCategoriesAsync(baseQuery);

            var categoryFilteredQuery = ApplyCategoryFilter(baseQuery, category);

            var (pendingCount, completedCount) = await GetStatusCountsAsync(categoryFilteredQuery);

            var finalQuery = ApplyCompletionFilter(categoryFilteredQuery, isCompleted);
            var totalCount = await finalQuery.CountAsync();

            var items = await ApplySorting(finalQuery, sortBy)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount, pendingCount, completedCount, categories);
        }

        

        public async Task<TaskItem?> GetByIdAsync(Guid id, Guid userId)
        {
            return await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId && t.DeletedAt == null);
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

        private static async Task<List<string>> GetUniqueCategoriesAsync(IQueryable<TaskItem> query)
        {
            return await query
                .Where(t => !string.IsNullOrWhiteSpace(t.Category) && t.Category != "default")
                .Select(t => t.Category!)
                .Distinct()
                .ToListAsync();
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

        private static IQueryable<TaskItem> ApplyCategoryFilter(IQueryable<TaskItem> query, string? category)
        {
            return string.IsNullOrWhiteSpace(category)
                ? query
                : query.Where(t => t.Category == category);
        }

        private static IQueryable<TaskItem> ApplyCompletionFilter(IQueryable<TaskItem> query, bool? isCompleted)
        {
            return isCompleted.HasValue
                ? query.Where(t => t.IsCompleted == isCompleted.Value)
                : query;
        }

    }
}
