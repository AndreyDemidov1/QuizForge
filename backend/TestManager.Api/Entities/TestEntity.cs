namespace TestManager.Api.Entities;

public class TestEntity
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public ICollection<Question> Questions { get; set; } = [];
}
