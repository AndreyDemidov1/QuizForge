using TestManager.Api.DTOs;
using TestManager.Api.Entities;

namespace TestManager.Api.Services;

public class GradingService : IGradingService
{
    public AttemptResultDto Grade(TestEntity test, SubmitAttemptDto submission)
    {
        var answersByQuestion = submission.Answers.ToDictionary(a => a.QuestionId, a => a.SelectedOptionIds);
        var orderedQuestions = test.Questions.OrderBy(q => q.Order).ToList();
        var maxScore = orderedQuestions.Count;
        double totalScore = 0;

        foreach (var question in orderedQuestions)
        {
            answersByQuestion.TryGetValue(question.Id, out var selectedIds);
            selectedIds ??= [];
            totalScore += ScoreQuestion(question, selectedIds);
        }

        var percentage = maxScore == 0 ? 0 : totalScore / maxScore * 100;

        return new AttemptResultDto(
            Math.Round(totalScore, 2),
            maxScore,
            Math.Round(percentage, 1),
            $"{totalScore:0.##} / {maxScore}",
            $"{percentage:0.#}%");
    }

    private static double ScoreQuestion(Question question, IReadOnlyList<Guid> selectedIds)
    {
        var correctIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
        var selected = selectedIds.ToHashSet();

        if (question.Type == QuestionType.SingleChoice)
        {
            if (selected.Count != 1)
            {
                return 0;
            }

            return correctIds.Count == 1 && selected.SetEquals(correctIds) ? 1 : 0;
        }

        if (correctIds.Count == 0)
        {
            return 0;
        }

        var weight = 1.0 / correctIds.Count;
        var correctSelected = selected.Count(id => correctIds.Contains(id));
        var incorrectSelected = selected.Count(id => !correctIds.Contains(id));
        var score = correctSelected * weight - incorrectSelected * weight;

        return Math.Max(0, score);
    }
}
