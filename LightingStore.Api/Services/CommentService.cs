using LightingStore.Api.Data;
using LightingStore.Api.DTOs.Comment;
using LightingStore.Api.Entities;
using LightingStore.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LightingStore.Api.Services;

public class CommentService : ICommentService
{
    private readonly LightingStoreDbContext _context;

    public CommentService(LightingStoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<CommentListDto>> GetProductCommentsAsync(int productId)
    {
        return await _context.Comments
            .Where(x => x.ProductId == productId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new CommentListDto
            {
               CommentId = x.CommentId,
               UserId = x.UserId,
               UserName = x.User.FullName,
               Content = x.Content,
               Rating = x.Rating,
               CreatedAt = x.CreatedAt
            })
            .ToListAsync();
    }

    public async Task AddCommentAsync(int productId, int userId, CreateCommentDto dto)
    {
        var comment = new Comment
        {
            ProductId = productId,
            UserId = userId,
            Content = dto.Content,
            Rating = dto.Rating
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteCommentAsync(int commentId, int userId)
    {
        var comment = await _context.Comments.FirstOrDefaultAsync(x => x.CommentId == commentId);

        if (comment == null)
            throw new Exception("Yorum bulunamadı");

        if (comment.UserId != userId)
            throw new Exception("Bu yorumu silemezsin");

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
    }

    public async Task AdminDeleteCommentAsync(int commentId)
{
    var comment = await _context.Comments
        .FirstOrDefaultAsync(x => x.CommentId == commentId);

    if (comment == null)
        throw new Exception("Yorum bulunamadı");

    _context.Comments.Remove(comment);
    await _context.SaveChangesAsync();
}
}
