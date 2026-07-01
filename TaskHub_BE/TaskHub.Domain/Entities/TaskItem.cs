using System;
using System.Collections.Generic;
using System.Text;

namespace TaskHub.Domain.Entities
{
    public class TaskItem
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public bool IsCompleted { get; private set; }
        public Guid? CategoryId { get; private set; }
        public Category? Category { get; private set; }
        public DateTimeOffset? CompletedAt { get; private set; }
        public DateTimeOffset? Deadline { get; private set; }
        public DateTimeOffset CreatedAt { get; private set; }
        public DateTimeOffset? UpdatedAt { get; private set; }
        public DateTimeOffset? DeletedAt { get; private set; }

        private TaskItem() { }

        public TaskItem(string title, Guid userId, string? description, Guid? categoryId, DateTimeOffset? deadline = null)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Title = title;
            Description = description;
            CategoryId = categoryId;
            IsCompleted = false;
            Deadline = deadline;
            CreatedAt = DateTimeOffset.UtcNow;
        }

        public void Update(string title, string? description, Guid? categoryId, bool isCompleted, DateTimeOffset? deadline)
        {
            Title = title;
            Description = description;
            CategoryId = categoryId;
            Deadline = deadline;
            UpdatedAt = DateTimeOffset.UtcNow;

            if (isCompleted && !IsCompleted)
            {
                IsCompleted = true;
                CompletedAt = DateTimeOffset.UtcNow;
            }
            else if (!isCompleted && IsCompleted)
            {
                // uncompleting a task
                IsCompleted = false;
                CompletedAt = null;
            }
        }
        public void MarkAsCompleted()
        {
            IsCompleted = true;
            CompletedAt = DateTimeOffset.UtcNow;
            UpdatedAt = DateTimeOffset.UtcNow;
        }
        public void MarkAsDeleted()
        {
            DeletedAt = DateTimeOffset.UtcNow;
        }
    }
}
