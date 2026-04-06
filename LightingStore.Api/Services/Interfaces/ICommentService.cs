using LightingStore.Api.DTOs.Comment;
namespace LightingStore.Api.Services.Interfaces;


public interface ICommentService
{
    Task<List<CommentListDto>> GetProductCommentsAsync(int productId);
    Task AddCommentAsync(int productId, int userId, CreateCommentDto dto);
    Task DeleteCommentAsync(int commentId, int userId);
    Task AdminDeleteCommentAsync(int commentId);

}
