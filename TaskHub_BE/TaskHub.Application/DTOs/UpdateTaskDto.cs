using System;
using System.Collections.Generic;
using System.Text;

namespace TaskHub.Application.DTOs
{
    public record UpdateTaskDto(
         string Title,
         string? Description,
         string? Category,
         DateTimeOffset? Deadline,
         bool IsCompleted
     ) : CreateTaskDto(Title, Description, Category, Deadline);
}
