using TestManager.Api.DTOs;

namespace TestManager.Api.Services;

public interface ITestService
{
    Task<IReadOnlyList<TestListItemDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TestDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TestForQuizDto?> GetForQuizAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TestDetailDto> CreateAsync(CreateTestDto dto, CancellationToken cancellationToken = default);
    Task<TestDetailDto?> UpdateAsync(Guid id, UpdateTestDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<AttemptResultDto?> SubmitAttemptAsync(Guid id, SubmitAttemptDto dto, CancellationToken cancellationToken = default);
}
