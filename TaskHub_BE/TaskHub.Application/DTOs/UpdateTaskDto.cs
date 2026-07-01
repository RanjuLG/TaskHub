using System;

namespace TaskHub.Application.DTOs
{
    public record UpdateTaskDto(
         string Title,
         string? Description,
         Guid? CategoryId,
         DateTimeOffset? Deadline,
         bool IsCompleted
     ) : CreateTaskDto(Title, Description, CategoryId, Deadline);
}
