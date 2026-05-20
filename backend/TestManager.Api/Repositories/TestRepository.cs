using Microsoft.EntityFrameworkCore;
using TestManager.Api.Data;
using TestManager.Api.Entities;

namespace TestManager.Api.Repositories;

public class TestRepository(AppDbContext context) : GenericRepository<TestEntity>(context), ITestRepository
{
    public async Task<IReadOnlyList<TestEntity>> GetAllWithQuestionCountsAsync(CancellationToken cancellationToken = default)
    {
        return await Context.Tests
            .AsNoTracking()
            .Include(t => t.Questions)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<TestEntity?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await Context.Tests
            .Include(t => t.Questions.OrderBy(q => q.Order))
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<TestEntity?> GetByIdForQuizAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await Context.Tests
            .AsNoTracking()
            .Include(t => t.Questions.OrderBy(q => q.Order))
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }
}
