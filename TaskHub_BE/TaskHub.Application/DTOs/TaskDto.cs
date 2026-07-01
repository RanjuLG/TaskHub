using System;

namespace TaskHub.Application.DTOs
{
    public record TaskDto(
        Guid Id,
        string Title,
        string? Description,
        bool IsCompleted,
        Guid? CategoryId,
        string? CategoryName,
        DateTimeOffset? Deadline,
        DateTimeOffset? CompletedAt,
        DateTimeOffset CreatedAt
    );
}
