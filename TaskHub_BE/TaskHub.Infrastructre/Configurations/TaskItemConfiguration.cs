using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;
using TaskHub.Domain.Entities;

namespace TaskHub.Infrastructre.Configurations
{
    public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
    {
        public void Configure(EntityTypeBuilder<TaskItem> builder)
        {
            builder.HasKey(t => t.Id);

            // Database constraints
            builder.Property(t => t.Title).IsRequired().HasMaxLength(100);
            builder.Property(t => t.Description).HasMaxLength(1000);

            builder.HasOne<User>()
               .WithMany()
               .HasForeignKey(t => t.UserId)
               .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(t => t.Category)
               .WithMany()
               .HasForeignKey(t => t.CategoryId)
               .OnDelete(DeleteBehavior.SetNull);


            // filters by UserId and commonly narrows by CategoryId/IsCompleted.
            builder.HasIndex(t => new { t.UserId, t.CategoryId, t.IsCompleted });

            // Global Query Filter for Soft Delete
            builder.HasQueryFilter(t => t.DeletedAt == null);
        }
    }
}
