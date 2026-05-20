using TestManager.Api.Entities;

namespace TestManager.Api.DTOs;

public record TestListItemDto(Guid Id, string Title, string? Description, int QuestionCount, DateTime CreatedAt);

public record AnswerOptionDto(Guid Id, string Text, bool IsCorrect);

public record QuestionDto(Guid Id, int Order, string Text, QuestionType Type, IReadOnlyList<AnswerOptionDto> Options);

public record TestDetailDto(Guid Id, string Title, string? Description, DateTime CreatedAt, IReadOnlyList<QuestionDto> Questions);

public record AnswerOptionInputDto(string Text, bool IsCorrect);

public record QuestionInputDto(string Text, QuestionType Type, IReadOnlyList<AnswerOptionInputDto> Options);

public record CreateTestDto(string Title, string? Description, IReadOnlyList<QuestionInputDto> Questions);

public record UpdateTestDto(string Title, string? Description, IReadOnlyList<QuestionInputDto> Questions);

public record AnswerOptionForQuizDto(Guid Id, string Text);

public record QuestionForQuizDto(Guid Id, int Order, string Text, QuestionType Type, IReadOnlyList<AnswerOptionForQuizDto> Options);

public record TestForQuizDto(Guid Id, string Title, string? Description, IReadOnlyList<QuestionForQuizDto> Questions);

public record QuestionAnswerDto(Guid QuestionId, IReadOnlyList<Guid> SelectedOptionIds);

public record SubmitAttemptDto(IReadOnlyList<QuestionAnswerDto> Answers);

public record AttemptResultDto(double Score, double MaxScore, double Percentage, string ScoreFormatted, string PercentageFormatted);
