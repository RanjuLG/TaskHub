using System;

namespace TaskHub.Domain.Entities
{
    public class Category
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;

        private Category() { }

        public Category(string name)
        {
            Id = Guid.NewGuid();
            Name = name;
        }
    }
}
