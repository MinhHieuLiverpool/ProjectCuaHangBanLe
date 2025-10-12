using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StoreManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddProductIsFeatured : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Chỉ thêm cột is_featured vì các cột khác đã tồn tại
            migrationBuilder.AddColumn<bool>(
                name: "is_featured",
                table: "products",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Chỉ xóa cột is_featured khi rollback
            migrationBuilder.DropColumn(
                name: "is_featured",
                table: "products");
        }
    }
}
