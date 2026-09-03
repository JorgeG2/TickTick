using Apex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Apex.Api.Data;

public class ApexDbContext : DbContext
{
    public ApexDbContext(DbContextOptions<ApexDbContext> options) : base(options) { }

    public DbSet<UserAccount> UserAccounts => Set<UserAccount>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<CalendarEntry> CalendarEntries => Set<CalendarEntry>();
    public DbSet<ShoppingItem> ShoppingItems => Set<ShoppingItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserAccount>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).IsRequired().HasMaxLength(256);
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(100);
            e.Property(x => x.ColorHex).IsRequired().HasMaxLength(7);
        });

        modelBuilder.Entity<TaskItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).IsRequired().HasMaxLength(255);
            e.HasOne(x => x.Category)
                .WithMany(c => c.Tasks)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.ParentTask)
                .WithMany(t => t.Subtasks)
                .HasForeignKey(x => x.ParentTaskId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CalendarEntry>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.EntryDate).IsUnique();
            e.Property(x => x.BlockNoteJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.ExcalidrawJson).HasColumnType("nvarchar(max)");
        });

        modelBuilder.Entity<ShoppingItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(255);
            e.Property(x => x.EstimatedPrice).HasColumnType("decimal(18,2)");
        });
    }
}
