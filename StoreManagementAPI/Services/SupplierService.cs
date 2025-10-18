using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;
using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;

namespace StoreManagementAPI.Services
{
    public interface ISupplierService
    {
        Task<IEnumerable<Supplier>> SearchSupplier(string searchItem);

    }

    public class SupplierService : ISupplierService
    {
        private readonly IRepository<Supplier> _supplierRepository;
        public readonly StoreDbContext _context;
        public SupplierService(StoreDbContext context, IRepository<Supplier> supplierRepository)
        {
            _context = context;
            _supplierRepository = supplierRepository;
        }


        public async Task<IEnumerable<Supplier>> SearchSupplier(string searchItem)
        {
            if (string.IsNullOrWhiteSpace(searchItem))
            {
                return await _supplierRepository.GetAllAsync();
            }

            searchItem = searchItem.ToLower().Trim();

            var suppliers = await _context.Suppliers
                .Where(s =>
                    s.Name.ToLower().Contains(searchItem) ||
                    (s.Phone != null && s.Phone.Contains(searchItem)) ||
                    (s.Address != null && s.Address.ToLower().Contains(searchItem)))
                .ToListAsync();
            return suppliers;
        }
    }
}