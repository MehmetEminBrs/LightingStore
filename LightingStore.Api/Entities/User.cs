namespace LightingStore.Api.Entities;

public class User
{
    public int UserId { get; set; }

    public string FullName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }

    public string PasswordHash { get; set; }

    public int RoleId { get; set; }
    public Role Role { get; set; }

    public ICollection<Order> Orders { get; set; }
    public ICollection<Cart> Carts { get; set; }

    public ICollection<UserAddress> UserAddresses { get; set; }
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Favorite> Favorites { get; set; }


    public bool EmailConfirmed { get; set; } = false;
    public string? EmailVerifyToken { get; set; }
    public DateTime? EmailVerifyExpire { get; set; }

    public string? ResetPasswordToken { get; set; }
    public DateTime? ResetPasswordExpire { get; set; }

    public User()
    {
        Orders = new List<Order>();
        Carts = new List<Cart>();
        UserAddresses = new List<UserAddress>();
    }
}
