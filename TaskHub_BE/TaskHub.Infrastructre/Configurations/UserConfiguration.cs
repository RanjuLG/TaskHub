using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;
using TaskHub.Domain.Entities;

namespace TaskHub.Infrastructre.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Username).IsRequired().HasMaxLength(50);

            // Ensure usernames are unique at the database level
            builder.HasIndex(u => u.Username).IsUnique();

            builder.Property(e => e.PasswordHash).IsRequired();

        }
    }
}
