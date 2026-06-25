using System;
using System.Collections.Generic;
using System.Text;

namespace TaskHub.Application.DTOs
{
    public record CreateTaskDto(
         string Title,
         string? Description,
         string? Category,
         DateTimeOffset? Deadline
     );
}
