using System.Collections.Generic;
using TaskHub.Application.DTOs;

namespace TaskHub.Application.Interfaces
{
    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetAllCategoriesAsync();
        Task<CategoryDto> CreateCategoryAsync(string name);
    }
}
