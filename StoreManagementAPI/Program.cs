using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using StoreManagementAPI.Data;
using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;
using StoreManagementAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Load appsettings.Local.json (ignored by git) for local development
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
    });

// Configure MySQL Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<StoreDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// BỎ JWT Authentication - không cần token nữa

// Register Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IPromotionService, PromotionService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();
builder.Services.AddScoped<IWarehouseService, WarehouseService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

// Add HttpContextAccessor for getting HTTP context in services
builder.Services.AddHttpContextAccessor();

// Configure Swagger - Bỏ JWT authentication
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Store Management API",
        Version = "v1",
        Description = "API quản lý cửa hàng bán lẻ - Hệ thống quản lý đầy đủ cho cửa hàng bán lẻ (No Authentication)"
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// ⚠️ AUTO-MIGRATION & SEEDING ĐÃ BỊ TẮT
// Database được setup bằng SQL script thủ công (store_management.sql)
// Nếu cần chạy lại: Xóa database và chạy file SQL
/*
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
        try
        {
            db.Database.Migrate(); // Tự động chạy migrations khi start
            Console.WriteLine("✅ Database migrations applied successfully!");
            await DbSeeder.SeedDatabase(db, app.Environment);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Migration error: {ex.Message}");
        }
    }
}
*/

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Store Management API v1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at app's root
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

// BỎ Authentication & Authorization - không cần kiểm tra token
// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();

app.Run();
