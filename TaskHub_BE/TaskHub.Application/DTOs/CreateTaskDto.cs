using System;

namespace TaskHub.Application.DTOs
{
    public record CreateTaskDto(
         string Title,
         string? Description,
         Guid? CategoryId,
         DateTimeOffset? Deadline
     );
}
