using TestManager.Api.DTOs;

namespace TestManager.Api.Services;

public static class TestValidation
{
    public static void Validate(CreateTestDto dto)
    {
        ValidateCore(dto.Title, dto.Questions);
    }

    public static void Validate(UpdateTestDto dto)
    {
        ValidateCore(dto.Title, dto.Questions);
    }

    private static void ValidateCore(string title, IReadOnlyList<QuestionInputDto> questions)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException("Название теста обязательно.");
        }

        if (title.Length > 200)
        {
            throw new ArgumentException("Название теста не должно превышать 200 символов.");
        }

        if (questions.Count == 0)
        {
            throw new ArgumentException("Тест должен содержать хотя бы один вопрос.");
        }

        for (var i = 0; i < questions.Count; i++)
        {
            var question = questions[i];

            if (string.IsNullOrWhiteSpace(question.Text))
            {
                throw new ArgumentException($"Текст вопроса {i + 1} обязателен.");
            }

            if (question.Options.Count < 2)
            {
                throw new ArgumentException($"Вопрос {i + 1} должен иметь минимум 2 варианта ответа.");
            }

            foreach (var option in question.Options)
            {
                if (string.IsNullOrWhiteSpace(option.Text))
                {
                    throw new ArgumentException($"Текст варианта ответа в вопросе {i + 1} обязателен.");
                }
            }

            var correctCount = question.Options.Count(o => o.IsCorrect);

            if (question.Type == Entities.QuestionType.SingleChoice && correctCount != 1)
            {
                throw new ArgumentException($"Вопрос {i + 1} (одиночный выбор) должен иметь ровно один правильный ответ.");
            }

            if (question.Type == Entities.QuestionType.MultipleChoice && correctCount < 1)
            {
                throw new ArgumentException($"Вопрос {i + 1} (множественный выбор) должен иметь хотя бы один правильный ответ.");
            }
        }
    }
}
