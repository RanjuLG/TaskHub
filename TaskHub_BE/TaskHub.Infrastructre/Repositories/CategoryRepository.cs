using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Interfaces;
using TaskHub.Infrastructre.Data;

namespace TaskHub.Infrastructre.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly TaskDbContext _context;

        public CategoryRepository(TaskDbContext context)
        {
            _context = context;
        }

        public async Task<List<Category>> GetAllAsync()
        {
            return await _context.Categories
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Category?> GetByNameAsync(string name)
        {
            return await _context.Categories
                .FirstOrDefaultAsync(c => c.Name == name);
        }

        public Task AddAsync(Category category)
        {
            _context.Categories.Add(category);
            return _context.SaveChangesAsync();
        }
    }
}
