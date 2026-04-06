namespace LightingStore.Api.Dtos.Category
{
    public class CategoryListDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public bool IsActive { get; set; }
        public string? ImageUrl { get; set; }

    }
}
