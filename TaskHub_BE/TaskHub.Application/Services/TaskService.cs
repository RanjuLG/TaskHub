using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using TaskHub.Application.DTOs;
using TaskHub.Application.Enums;
using TaskHub.Application.Exceptions;
using TaskHub.Application.Interfaces;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Interfaces;

namespace TaskHub.Application.Services
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _taskRepository;

        public TaskService(ITaskRepository taskRepository)
        {
            _taskRepository = taskRepository;
        }

        public async Task<TaskListResponse> GetAllTasksAsync(
            Guid userId, Guid? categoryId, bool? isCompleted,
            TaskSortOption sortBy, int pageNumber, int pageSize)
        {
            var safePageNumber = pageNumber < 1 ? 1 : pageNumber;
            var safePageSize = pageSize < 1 ? 8 : pageSize;

            var (items, totalCount, pendingCount, completedCount) =
                await _taskRepository.GetFilteredAsync(userId, categoryId, isCompleted, sortBy, safePageNumber, safePageSize);

            var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)safePageSize);

            return new TaskListResponse(
                items.Select(MapTask).ToList(),
                safePageNumber, safePageSize,
                totalCount, totalPages,
                pendingCount, completedCount
            );
        }


        public async Task<TaskDto?> GetTaskByIdAsync(Guid userId,Guid id)
        {
            var task = await _taskRepository.GetByIdAsync(id,userId);

            if (task == null)
            {
                return null;
            }
            return MapTask(task);

        }

        public async Task<TaskDto> CreateTaskAsync(Guid userId, CreateTaskDto dto)
        {
            var task = new TaskItem(
                            dto.Title,
                            userId,
                            dto.Description,
                            dto.CategoryId,
                            dto.Deadline
                            );

            await _taskRepository.AddAsync(task);

            var created = await _taskRepository.GetByIdAsync(task.Id, userId);
            return MapTask(created!);
        }


        public async Task UpdateTaskAsync(Guid userId, Guid id, UpdateTaskDto dto)
        {
            var task = await _taskRepository.GetByIdAsync(id, userId);

            if (task == null)
            {
                throw new NotFoundException($"Task with ID {id} was not found.");
            }

            task.Update(dto.Title, dto.Description, dto.CategoryId, dto.IsCompleted, dto.Deadline);

            await _taskRepository.UpdateAsync(task);
        }


        public async Task MarkAsCompleteAsync(Guid userId,Guid id)
        {
            var task = await _taskRepository.GetByIdAsync(id,userId);

            if (task == null)
            {
                throw new NotFoundException($"Task with ID {id} was not found.");
            }

            task.MarkAsCompleted();

            await _taskRepository.UpdateAsync(task);
        }

        public async Task DeleteTaskAsync(Guid userId,Guid id)
        {
            var task = await _taskRepository.GetByIdAsync(id,userId);

            if (task == null)
            {
                throw new NotFoundException($"Task with ID {id} was not found.");
            }

            task.MarkAsDeleted();

            await _taskRepository.UpdateAsync(task);
        }

        private static TaskDto MapTask(TaskItem task)
        {
            return new TaskDto(
                task.Id,
                task.Title,
                task.Description,
                task.IsCompleted,
                task.CategoryId,
                task.Category?.Name,
                task.Deadline,
                task.CompletedAt,
                task.CreatedAt
            );
        }
    }
}
