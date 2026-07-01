using System;
using System.Collections.Generic;
using System.Text;

namespace TaskHub.Infrastructre.Seeders
{
    using Microsoft.EntityFrameworkCore;
    using TaskHub.Domain.Entities;
    using TaskHub.Infrastructre.Data;

    namespace SoftOne.Infrastructure.Seeders
    {
        public static class DatabaseSeeder
        {
            public static async Task SeedAsync(TaskDbContext context)
            {
                // 1. Automatically apply any pending migrations
                if (context.Database.IsSqlServer())
                {
                    await context.Database.MigrateAsync();
                }

                // 2. Seed Default User
                var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Username == "admin");

                if (adminUser == null)
                {
                    adminUser = new User("admin", BCrypt.Net.BCrypt.HashPassword("admin123"));

                    await context.Users.AddAsync(adminUser);
                    await context.SaveChangesAsync();
                }

                // 3. Seed Default Categories
                var categoryNames = new[] { "Work", "Study", "Personal" };
                var existingCategories = await context.Categories
                    .Where(c => categoryNames.Contains(c.Name))
                    .ToDictionaryAsync(c => c.Name);

                foreach (var name in categoryNames)
                {
                    if (!existingCategories.ContainsKey(name))
                    {
                        var category = new Category(name);
                        existingCategories[name] = category;
                        await context.Categories.AddAsync(category);
                    }
                }
                await context.SaveChangesAsync();

                //Seed some dummy tasks
                if (!await context.Tasks.AnyAsync())
                {
                    var tasks = new List<TaskItem>
                    {
                        new TaskItem("Setup Azure DevOps Pipeline", adminUser.Id, "Create the YAML file for CI/CD", existingCategories["Work"].Id, DateTimeOffset.UtcNow.AddDays(7)),
                        new TaskItem("Review CS101", adminUser.Id, "Read up on the chapter", existingCategories["Study"].Id, DateTimeOffset.UtcNow.AddDays(3)),
                        new TaskItem("Buy groceries", adminUser.Id, "Milk, Eggs, Coffee", existingCategories["Personal"].Id, DateTimeOffset.UtcNow.AddDays(1))
                    };

                    await context.Tasks.AddRangeAsync(tasks);
                    await context.SaveChangesAsync();
                }

            }
        }
    }
}
