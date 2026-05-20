using TestManager.Api.DTOs;
using TestManager.Api.Repositories;

namespace TestManager.Api.Services;

public class TestService(ITestRepository testRepository, IGradingService gradingService) : ITestService
{
    public async Task<IReadOnlyList<TestListItemDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var tests = await testRepository.GetAllWithQuestionCountsAsync(cancellationToken);
        return tests.Select(TestMapper.ToListItem).ToList();
    }

    public async Task<TestDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdWithDetailsAsync(id, cancellationToken);
        return test is null ? null : TestMapper.ToDetail(test);
    }

    public async Task<TestForQuizDto?> GetForQuizAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdForQuizAsync(id, cancellationToken);
        return test is null ? null : TestMapper.ToQuiz(test);
    }

    public async Task<TestDetailDto> CreateAsync(CreateTestDto dto, CancellationToken cancellationToken = default)
    {
        TestValidation.Validate(dto);
        var entity = TestMapper.FromCreate(dto);
        await testRepository.AddAsync(entity, cancellationToken);
        await testRepository.SaveChangesAsync(cancellationToken);
        var created = await testRepository.GetByIdWithDetailsAsync(entity.Id, cancellationToken);
        return TestMapper.ToDetail(created!);
    }

    public async Task<TestDetailDto?> UpdateAsync(Guid id, UpdateTestDto dto, CancellationToken cancellationToken = default)
    {
        TestValidation.Validate(dto);
        var test = await testRepository.GetByIdWithDetailsAsync(id, cancellationToken);
        if (test is null)
        {
            return null;
        }

        TestMapper.ApplyUpdate(test, dto);
        testRepository.Update(test);
        await testRepository.SaveChangesAsync(cancellationToken);

        var updated = await testRepository.GetByIdWithDetailsAsync(id, cancellationToken);
        return TestMapper.ToDetail(updated!);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(id, cancellationToken);
        if (test is null)
        {
            return false;
        }

        testRepository.Remove(test);
        await testRepository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<AttemptResultDto?> SubmitAttemptAsync(
        Guid id,
        SubmitAttemptDto dto,
        CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdWithDetailsAsync(id, cancellationToken);
        if (test is null)
        {
            return null;
        }

        return gradingService.Grade(test, dto);
    }
}
