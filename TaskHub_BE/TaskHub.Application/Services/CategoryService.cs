using System.Collections.Generic;
using System.Linq;
using TaskHub.Application.DTOs;
using TaskHub.Application.Exceptions;
using TaskHub.Application.Interfaces;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Interfaces;

namespace TaskHub.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<List<CategoryDto>> GetAllCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.Select(c => new CategoryDto(c.Id, c.Name)).ToList();
        }

        public async Task<CategoryDto> CreateCategoryAsync(string name)
        {
            var trimmedName = name?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(trimmedName))
            {
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    [nameof(name)] = new[] { "Category name is required." }
                });
            }

            if (trimmedName.Length > 50)
            {
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    [nameof(name)] = new[] { "Category name cannot exceed 50 characters." }
                });
            }

            // Get-or-create: if a category with this name already exists, reuse it
            // instead of violating the unique index on Name.
            var existing = await _categoryRepository.GetByNameAsync(trimmedName);
            if (existing != null)
            {
                return new CategoryDto(existing.Id, existing.Name);
            }

            var category = new Category(trimmedName);
            await _categoryRepository.AddAsync(category);

            return new CategoryDto(category.Id, category.Name);
        }
    }
}
