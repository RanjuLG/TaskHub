using System;
using System.Collections.Generic;
using System.Text;

namespace TaskHub.Application.DTOs
{
    public record TaskDto(
        Guid Id,
        string Title,
        string? Description,
        bool IsCompleted,
        string? Category,
        DateTimeOffset? Deadline,
        DateTimeOffset? CompletedAt,
        DateTimeOffset CreatedAt
    );
}
