using TestManager.Api.DTOs;
using TestManager.Api.Entities;

namespace TestManager.Api.Services;

public static class TestMapper
{
    public static TestListItemDto ToListItem(TestEntity test) =>
        new(test.Id, test.Title, test.Description, test.Questions.Count, test.CreatedAt);

    public static TestDetailDto ToDetail(TestEntity test) =>
        new(
            test.Id,
            test.Title,
            test.Description,
            test.CreatedAt,
            test.Questions
                .OrderBy(q => q.Order)
                .Select(ToQuestion)
                .ToList());

    public static TestForQuizDto ToQuiz(TestEntity test) =>
        new(
            test.Id,
            test.Title,
            test.Description,
            test.Questions
                .OrderBy(q => q.Order)
                .Select(q => new QuestionForQuizDto(
                    q.Id,
                    q.Order,
                    q.Text,
                    q.Type,
                    q.Options.Select(o => new AnswerOptionForQuizDto(o.Id, o.Text)).ToList()))
                .ToList());

    private static QuestionDto ToQuestion(Question question) =>
        new(
            question.Id,
            question.Order,
            question.Text,
            question.Type,
            question.Options.Select(o => new AnswerOptionDto(o.Id, o.Text, o.IsCorrect)).ToList());

    public static TestEntity FromCreate(CreateTestDto dto)
    {
        var test = new TestEntity
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        ApplyQuestions(test, dto.Questions);
        return test;
    }

    public static void ApplyUpdate(TestEntity test, UpdateTestDto dto)
    {
        test.Title = dto.Title.Trim();
        test.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        test.Questions.Clear();
        ApplyQuestions(test, dto.Questions);
    }

    private static void ApplyQuestions(TestEntity test, IReadOnlyList<QuestionInputDto> questions)
    {
        for (var i = 0; i < questions.Count; i++)
        {
            var input = questions[i];
            var question = new Question
            {
                Id = Guid.NewGuid(),
                TestId = test.Id,
                Order = i,
                Text = input.Text.Trim(),
                Type = input.Type
            };

            foreach (var optionInput in input.Options)
            {
                question.Options.Add(new AnswerOption
                {
                    Id = Guid.NewGuid(),
                    QuestionId = question.Id,
                    Text = optionInput.Text.Trim(),
                    IsCorrect = optionInput.IsCorrect
                });
            }

            test.Questions.Add(question);
        }
    }
}
