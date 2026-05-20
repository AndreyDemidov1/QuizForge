using TestManager.Api.Entities;

namespace TestManager.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (context.Tests.Any())
        {
            return;
        }

        var astronomy = new TestEntity
        {
            Id = Guid.NewGuid(),
            Title = "Астрономия: планеты",
            Description = "Небольшой тест о космосе",
            CreatedAt = DateTime.UtcNow
        };

        var q1 = new Question
        {
            Id = Guid.NewGuid(),
            TestId = astronomy.Id,
            Order = 0,
            Text = "На какой планете мы живём?",
            Type = QuestionType.SingleChoice
        };
        q1.Options.Add(new AnswerOption { Id = Guid.NewGuid(), QuestionId = q1.Id, Text = "Земля", IsCorrect = true });
        q1.Options.Add(new AnswerOption { Id = Guid.NewGuid(), QuestionId = q1.Id, Text = "Марс", IsCorrect = false });
        q1.Options.Add(new AnswerOption { Id = Guid.NewGuid(), QuestionId = q1.Id, Text = "Венера", IsCorrect = false });

        var q2 = new Question
        {
            Id = Guid.NewGuid(),
            TestId = astronomy.Id,
            Order = 1,
            Text = "Какие из перечисленных являются планетами?",
            Type = QuestionType.MultipleChoice
        };
        q2.Options.Add(new AnswerOption { Id = Guid.NewGuid(), QuestionId = q2.Id, Text = "Юпитер", IsCorrect = true });
        q2.Options.Add(new AnswerOption { Id = Guid.NewGuid(), QuestionId = q2.Id, Text = "Луна", IsCorrect = false });
        q2.Options.Add(new AnswerOption { Id = Guid.NewGuid(), QuestionId = q2.Id, Text = "Сатурн", IsCorrect = true });
        q2.Options.Add(new AnswerOption { Id = Guid.NewGuid(), QuestionId = q2.Id, Text = "Солнце", IsCorrect = false });

        var q3 = new Question
        {
            Id = Guid.NewGuid(),
            TestId = astronomy.Id,
            Order = 2,
            Text = "Что является спутником Земли?",
            Type = QuestionType.SingleChoice
        };
        q3.Options.Add(new AnswerOption { Id = Guid.NewGuid(), QuestionId = q3.Id, Text = "Луна", IsCorrect = true });
        q3.Options.Add(new AnswerOption { Id = Guid.NewGuid(), QuestionId = q3.Id, Text = "Солнце", IsCorrect = false });
        q3.Options.Add(new AnswerOption { Id = Guid.NewGuid(), QuestionId = q3.Id, Text = "Венера", IsCorrect = false });

        astronomy.Questions.Add(q1);
        astronomy.Questions.Add(q2);
        astronomy.Questions.Add(q3);

        await context.Tests.AddAsync(astronomy);
        await context.SaveChangesAsync();
    }
}
