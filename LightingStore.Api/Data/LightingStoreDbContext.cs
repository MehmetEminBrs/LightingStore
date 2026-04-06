using Microsoft.EntityFrameworkCore;
using LightingStore.Api.Entities;

namespace LightingStore.Api.Data
{
    public class LightingStoreDbContext : DbContext
    {
        public LightingStoreDbContext(DbContextOptions<LightingStoreDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductStock> ProductStocks { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Favorite> Favorites { get; set; }


        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        

        public DbSet<StockHistory> StockHistories { get; set; }
        public DbSet<OrderStatusHistory> OrderStatusHistories { get; set; }

        public DbSet<UserAddress> UserAddresses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            

            modelBuilder.Entity<Category>()
                .HasKey(x => x.CategoryId);

            modelBuilder.Entity<Product>()
                .HasKey(x => x.ProductId);


        modelBuilder.Entity<Favorite>()
            .HasKey(x => x.FavoriteId);

        modelBuilder.Entity<Favorite>()
            .HasOne(x => x.User)
            .WithMany(u => u.Favorites)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Favorite>()
            .HasOne(x => x.Product)
            .WithMany(p => p.Favorites)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Favorite>()
            .HasIndex(x => new { x.UserId, x.ProductId })
            .IsUnique();

            modelBuilder.Entity<Product>()
            .HasOne(p => p.ProductStock)
            .WithOne(s => s.Product)
            .HasForeignKey<ProductStock>(s => s.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductStock>()
            .HasKey(x => x.StockId);


            modelBuilder.Entity<Comment>()
            .HasKey(x => x.CommentId);

            modelBuilder.Entity<Comment>()
                .HasOne(x => x.Product)
                .WithMany(p => p.Comments)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne(x => x.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);



            
            modelBuilder.Entity<ProductImage>()
                .HasKey(x => x.ImageId);

            modelBuilder.Entity<ProductImage>()
                .HasOne(x => x.Product)
                .WithMany(p => p.ProductImages)
                .HasForeignKey(x => x.ProductId);

            modelBuilder.Entity<UserAddress>()
                .HasKey(x => x.AddressId);

            modelBuilder.Entity<UserAddress>()
                .HasOne(x => x.User)
                .WithMany(u => u.UserAddresses)
                .HasForeignKey(x => x.UserId);

            modelBuilder.Entity<Role>().HasData(
                new Role { RoleId = 1, RoleName = "Admin" },
                new Role { RoleId = 2, RoleName = "Customer" }
            );
        }
    }
}
