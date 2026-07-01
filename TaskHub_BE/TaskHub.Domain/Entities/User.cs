using System;
using System.Collections.Generic;
using System.Text;

namespace TaskHub.Domain.Entities
{
    public class User
    {
        public Guid Id { get; private set; }
        public string Username { get; private set; } = string.Empty;
        public string PasswordHash { get; private set; } = string.Empty;

        private User() { }

        public User(string username, string passwordHash)
        {
            Id = Guid.NewGuid();
            Username = username;
            PasswordHash = passwordHash;
        }
    }
}
