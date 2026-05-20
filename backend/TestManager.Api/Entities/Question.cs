namespace TestManager.Api.Entities;

public class Question
{
    public Guid Id { get; set; }
    public Guid TestId { get; set; }
    public int Order { get; set; }
    public string Text { get; set; } = string.Empty;
    public QuestionType Type { get; set; }
    public TestEntity Test { get; set; } = null!;
    public ICollection<AnswerOption> Options { get; set; } = [];
}
