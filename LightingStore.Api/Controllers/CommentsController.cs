using LightingStore.Api.DTOs.Comment;
using LightingStore.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/products/{productId}/comments")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _service;

    public CommentsController(ICommentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetComments(int productId)
    {
        var comments = await _service.GetProductCommentsAsync(productId);
        return Ok(comments);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> AddComment(int productId, CreateCommentDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _service.AddCommentAsync(productId, userId, dto);
        return Ok("Yorum eklendi");
    }

    [Authorize]
    [HttpDelete("{commentId}")]
    public async Task<IActionResult> Delete(int commentId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _service.DeleteCommentAsync(commentId, userId);
        return Ok("Yorum silindi");
    }

    [Authorize(Roles = "Admin")]
[HttpDelete("admin/{commentId}")]
public async Task<IActionResult> AdminDelete(int commentId)
{
    await _service.AdminDeleteCommentAsync(commentId);
    return Ok("Admin yorumu sildi");
}
}
