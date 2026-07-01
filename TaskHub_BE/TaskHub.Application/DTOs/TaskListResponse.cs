using System.Collections.Generic;

namespace TaskHub.Application.DTOs
{
    public record TaskListResponse(
        IReadOnlyList<TaskDto> Items,
        int PageNumber,
        int PageSize,
        int TotalCount,
        int TotalPages,
        int PendingCount,
        int CompletedCount
    );
}