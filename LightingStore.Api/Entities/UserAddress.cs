namespace LightingStore.Api.Entities;

public class UserAddress
{
    public int AddressId { get; set; }

    public int UserId { get; set; }

    public string AddressTitle { get; set; }
    public string FullName { get; set; }
    public string Phone { get; set; }

    public string City { get; set; }
    public string District { get; set; }
    public string Neighborhood { get; set; }

    public string AddressLine { get; set; }
    public string PostalCode { get; set; }

    public bool IsDefault { get; set; }

    public DateTime CreatedAt { get; set; }

    public User User { get; set; }
}
