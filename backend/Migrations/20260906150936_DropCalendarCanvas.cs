using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Apex.Api.Migrations
{
    /// <inheritdoc />
    public partial class DropCalendarCanvas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExcalidrawJson",
                table: "CalendarEntries");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExcalidrawJson",
                table: "CalendarEntries",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
