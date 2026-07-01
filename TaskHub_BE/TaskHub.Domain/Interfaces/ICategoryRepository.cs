using System;
using System.Collections.Generic;
using TaskHub.Domain.Entities;

namespace TaskHub.Domain.Interfaces
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllAsync();
        Task<Category?> GetByNameAsync(string name);
        Task AddAsync(Category category);
    }
}
