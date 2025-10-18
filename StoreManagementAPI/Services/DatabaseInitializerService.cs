using MySql.Data.MySqlClient;
using System;
using System.IO;
using System.Threading.Tasks;

namespace StoreManagementAPI.Services
{
    public class DatabaseInitializerService
    {
        private readonly string _connectionString;

        public DatabaseInitializerService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<bool> InitializeDatabaseAsync()
        {
            try
            {
                // Kiểm tra database đã tồn tại chưa
                var dbExists = await CheckDatabaseExistsAsync();

                if (!dbExists)
                {
                    Console.WriteLine("🔄 Database chưa tồn tại, đang khởi tạo...");
                    await RunInitialSetupAsync();
                    Console.WriteLine("✅ Database đã được khởi tạo thành công!");
                    return true;
                }
                else
                {
                    Console.WriteLine("✅ Database đã tồn tại, bỏ qua khởi tạo.");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi khi khởi tạo database: {ex.Message}");
                throw;
            }
        }

        private async Task<bool> CheckDatabaseExistsAsync()
        {
            try
            {
                // Connection string tới server (không chỉ định database cụ thể)
                var builder = new MySqlConnectionStringBuilder(_connectionString);
                var dbName = builder.Database;
                builder.Database = null; // Kết nối tới server, không phải database cụ thể

                using (var connection = new MySqlConnection(builder.ToString()))
                {
                    await connection.OpenAsync();

                    var query = $"SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{dbName}'";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        var result = await command.ExecuteScalarAsync();
                        return result != null;
                    }
                }
            }
            catch
            {
                return false;
            }
        }

        private async Task RunInitialSetupAsync()
        {
            // Đọc file SQL
            var sqlFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "InitialSetup.sql");

            if (!File.Exists(sqlFilePath))
            {
                throw new FileNotFoundException($"Không tìm thấy file SQL: {sqlFilePath}");
            }

            var sqlScript = await File.ReadAllTextAsync(sqlFilePath);

            // Connection tới server (không chỉ định database)
            var builder = new MySqlConnectionStringBuilder(_connectionString);
            builder.Database = null;

            using (var connection = new MySqlConnection(builder.ToString()))
            {
                await connection.OpenAsync();

                // Tách script thành các statements riêng lẻ
                var statements = SplitSqlStatements(sqlScript);

                foreach (var statement in statements)
                {
                    if (string.IsNullOrWhiteSpace(statement))
                        continue;

                    try
                    {
                        using (var command = new MySqlCommand(statement, connection))
                        {
                            command.CommandTimeout = 300; // 5 phút timeout
                            await command.ExecuteNonQueryAsync();
                        }
                    }
                    catch (Exception ex)
                    {
                        // Log lỗi nhưng tiếp tục (một số statement có thể fail như SELECT hiển thị)
                        if (!statement.Trim().StartsWith("SELECT", StringComparison.OrdinalIgnoreCase))
                        {
                            Console.WriteLine($"⚠️ Warning executing statement: {ex.Message}");
                        }
                    }
                }
            }
        }

        private string[] SplitSqlStatements(string sqlScript)
        {
            // Tách script theo dấu chấm phẩy, nhưng bỏ qua comment
            var lines = sqlScript.Split('\n');
            var statements = new System.Collections.Generic.List<string>();
            var currentStatement = new System.Text.StringBuilder();

            foreach (var line in lines)
            {
                var trimmedLine = line.Trim();

                // Bỏ qua comment
                if (trimmedLine.StartsWith("--") || trimmedLine.StartsWith("#"))
                    continue;

                currentStatement.AppendLine(line);

                // Nếu line kết thúc bằng ; thì đó là end of statement
                if (trimmedLine.EndsWith(";"))
                {
                    statements.Add(currentStatement.ToString());
                    currentStatement.Clear();
                }
            }

            // Thêm statement cuối cùng nếu có
            if (currentStatement.Length > 0)
            {
                statements.Add(currentStatement.ToString());
            }

            return statements.ToArray();
        }
    }
}
