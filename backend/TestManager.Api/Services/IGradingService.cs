using TestManager.Api.DTOs;
using TestManager.Api.Entities;

namespace TestManager.Api.Services;

public interface IGradingService
{
    AttemptResultDto Grade(TestEntity test, SubmitAttemptDto submission);
}
