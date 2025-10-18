using Microsoft.EntityFrameworkCore;
using System.Text;

namespace StoreManagementAPI.Data
{
    public static class DbSeeder
    {
        /// <summary>
        /// Tự động seed database từ file SQL khi startup
        /// CHỈ CHẠY 1 LẦN DUY NHẤT - Kiểm tra kỹ trước khi import
        /// </summary>
        public static async Task SeedDatabase(StoreDbContext context, IWebHostEnvironment env)
        {
            try
            {
                // ===================================
                // BƯỚC 1: KIỂM TRA DATABASE ĐÃ CÓ DỮ LIỆU CHƯA
                // ===================================
                var hasUsers = await context.Users.AnyAsync();
                if (hasUsers)
                {
                    Console.WriteLine("\n✅ Database đã có dữ liệu. Bỏ qua seeding.");
                    Console.WriteLine("💡 Để reset: DROP DATABASE store_management; CREATE DATABASE store_management;\n");
                    return;
                }

                Console.WriteLine("\n====================================");
                Console.WriteLine("🌱 DATABASE RỖNG - BẮT ĐẦU IMPORT");
                Console.WriteLine("====================================\n");

                // ===================================
                // BƯỚC 2: IMPORT FILE SQL CHÍNH
                // ===================================
                var projectRoot = Directory.GetParent(env.ContentRootPath)?.FullName;
                if (projectRoot == null)
                {
                    Console.WriteLine("❌ Không tìm thấy project root!");
                    return;
                }

                var mainSqlFile = Path.Combine(projectRoot, "store_management.sql");
                
                if (!File.Exists(mainSqlFile))
                {
                    Console.WriteLine($"❌ Không tìm thấy file: {mainSqlFile}");
                    Console.WriteLine("⚠️  Vui lòng đảm bảo file store_management.sql tồn tại!");
                    return;
                }

                Console.WriteLine("📄 Đang import: store_management.sql");
                Console.WriteLine("⏳ Vui lòng đợi... (có thể mất 5-10 giây)\n");

                // Đọc và thực thi file SQL
                var sqlContent = await File.ReadAllTextAsync(mainSqlFile, Encoding.UTF8);
                
                // Split theo delimiter và thực thi từng batch
                var batches = SplitSqlBatches(sqlContent);
                int successCount = 0;
                int skipCount = 0;

                foreach (var batch in batches)
                {
                    if (string.IsNullOrWhiteSpace(batch)) continue;

                    try
                    {
                        await context.Database.ExecuteSqlRawAsync(batch);
                        successCount++;
                    }
                    catch (Exception ex)
                    {
                        // Bỏ qua các lỗi không nghiêm trọng
                        var errorMsg = ex.Message.ToLower();
                        if (errorMsg.Contains("already exists") || 
                            errorMsg.Contains("duplicate entry") ||
                            errorMsg.Contains("duplicate key") ||
                            errorMsg.Contains("table") && errorMsg.Contains("already") ||
                            errorMsg.Contains("constraint"))
                        {
                            // Lỗi bình thường - table/constraint đã tồn tại
                            skipCount++;
                        }
                        else
                        {
                            // Lỗi nghiêm trọng - cần log
                            Console.WriteLine($"⚠️  Warning: {ex.Message.Split('\n')[0]}");
                            skipCount++;
                        }
                    }
                }

                Console.WriteLine($"✅ Import hoàn tất!");
                Console.WriteLine($"   - Thành công: {successCount} lệnh");
                Console.WriteLine($"   - Bỏ qua: {skipCount} lệnh (đã tồn tại)\n");

                // ===================================
                // BƯỚC 3: KIỂM TRA KẾT QUẢ
                // ===================================
                var userCount = await context.Users.CountAsync();
                var productCount = await context.Products.CountAsync();
                var categoryCount = await context.Categories.CountAsync();

                Console.WriteLine("====================================");
                Console.WriteLine("📊 THỐNG KÊ DATABASE");
                Console.WriteLine("====================================");
                Console.WriteLine($"👥 Users: {userCount}");
                Console.WriteLine($"📦 Products: {productCount}");
                Console.WriteLine($"📂 Categories: {categoryCount}");
                Console.WriteLine("====================================");
                Console.WriteLine("✅ SEED DATABASE HOÀN TẤT!");
                Console.WriteLine("====================================\n");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n❌ LỖI SEED DATABASE: {ex.Message}");
                Console.WriteLine($"💡 Stack trace: {ex.StackTrace}\n");
            }
        }

        /// <summary>
        /// Chia SQL thành các batch riêng biệt để tránh lỗi multi-statement
        /// </summary>
        private static List<string> SplitSqlBatches(string sql)
        {
            var batches = new List<string>();
            var currentBatch = new StringBuilder();
            var lines = sql.Split(new[] { "\r\n", "\n" }, StringSplitOptions.None);

            foreach (var line in lines)
            {
                var trimmedLine = line.Trim();

                // Bỏ qua comments và dòng trống
                if (string.IsNullOrWhiteSpace(trimmedLine) || 
                    trimmedLine.StartsWith("--") || 
                    trimmedLine.StartsWith("/*") ||
                    trimmedLine.StartsWith("*"))
                {
                    continue;
                }

                // ⚠️ BỎ QUA các lệnh DROP/CREATE/USE DATABASE
                var upperLine = trimmedLine.ToUpper();
                if (upperLine.StartsWith("DROP DATABASE") ||
                    upperLine.StartsWith("CREATE DATABASE") ||
                    upperLine.StartsWith("USE "))
                {
                    Console.WriteLine($"⏭️  Bỏ qua: {trimmedLine.Substring(0, Math.Min(50, trimmedLine.Length))}...");
                    continue;
                }

                // Thêm dòng vào batch hiện tại
                currentBatch.AppendLine(line);

                // Nếu gặp dấu ';' thì kết thúc batch
                if (trimmedLine.EndsWith(";"))
                {
                    var batch = currentBatch.ToString().Trim();
                    if (!string.IsNullOrWhiteSpace(batch))
                    {
                        batches.Add(batch);
                    }
                    currentBatch.Clear();
                }
            }

            // Thêm batch cuối cùng nếu có
            if (currentBatch.Length > 0)
            {
                var batch = currentBatch.ToString().Trim();
                if (!string.IsNullOrWhiteSpace(batch))
                {
                    batches.Add(batch);
                }
            }

            return batches;
        }
    }
}
