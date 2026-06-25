using System;
using System.Collections.Generic;
using System.Text;
using TaskHub.Domain.Entities;

namespace TaskHub.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username);
    }
}
