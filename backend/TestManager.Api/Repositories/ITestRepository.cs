using TestManager.Api.Entities;

namespace TestManager.Api.Repositories;

public interface ITestRepository : IGenericRepository<TestEntity>
{
    Task<IReadOnlyList<TestEntity>> GetAllWithQuestionCountsAsync(CancellationToken cancellationToken = default);
    Task<TestEntity?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TestEntity?> GetByIdForQuizAsync(Guid id, CancellationToken cancellationToken = default);
}
