namespace LightingStore.Api.Dtos.Category
{
    public class CategoryCreateDto
    {
        public string CategoryName { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public bool IsActive { get; set; }
        public IFormFile? Image { get; set; }

    }
}
