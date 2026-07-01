using System;

namespace TaskHub.Application.DTOs
{
    public record CategoryDto(
        Guid Id,
        string Name
    );
}
