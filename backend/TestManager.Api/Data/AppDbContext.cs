using Microsoft.EntityFrameworkCore;
using TestManager.Api.Entities;

namespace TestManager.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<TestEntity> Tests => Set<TestEntity>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<AnswerOption> AnswerOptions => Set<AnswerOption>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TestEntity>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Title).HasMaxLength(200).IsRequired();
            e.HasMany(t => t.Questions)
                .WithOne(q => q.Test)
                .HasForeignKey(q => q.TestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Question>(e =>
        {
            e.HasKey(q => q.Id);
            e.Property(q => q.Text).IsRequired();
            e.HasMany(q => q.Options)
                .WithOne(o => o.Question)
                .HasForeignKey(o => o.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AnswerOption>(e =>
        {
            e.HasKey(o => o.Id);
            e.Property(o => o.Text).IsRequired();
        });
    }
}
