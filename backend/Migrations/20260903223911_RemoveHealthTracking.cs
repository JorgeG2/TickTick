using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Apex.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveHealthTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HealthLogs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HealthLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LogDate = table.Column<DateOnly>(type: "date", nullable: false),
                    SleepHours = table.Column<decimal>(type: "decimal(4,2)", nullable: false),
                    StepCount = table.Column<int>(type: "int", nullable: false),
                    WeightLbs = table.Column<decimal>(type: "decimal(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HealthLogs_LogDate",
                table: "HealthLogs",
                column: "LogDate",
                unique: true);
        }
    }
}
