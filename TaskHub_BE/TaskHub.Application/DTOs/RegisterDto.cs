using System;
using System.Collections.Generic;
using System.Text;

namespace TaskHub.Application.DTOs
{
    public class RegisterDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
