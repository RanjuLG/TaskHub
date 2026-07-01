using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;
using TaskHub.Application.DTOs;

namespace TaskHub.Application.Validations
{
    public class UpdateTaskDtoValidator : AbstractValidator<UpdateTaskDto>
    {
        public UpdateTaskDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required.")
                .MaximumLength(100).WithMessage("Title cannot exceed 100 characters.");

            RuleFor(x => x.CategoryId)
                .NotEqual(Guid.Empty).WithMessage("CategoryId is invalid.")
                .When(x => x.CategoryId.HasValue);
        }
    }
}
