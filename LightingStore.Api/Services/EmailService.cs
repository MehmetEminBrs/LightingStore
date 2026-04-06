using System.Net;
using System.Net.Mail;

namespace LightingStore.Api.Services;

public class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        var smtp = new SmtpClient(_config["Email:Smtp"], int.Parse(_config["Email:Port"]!))
        {
            Credentials = new NetworkCredential(
                _config["Email:Username"],
                _config["Email:Password"]
            ),
            EnableSsl = true
        };

        var mail = new MailMessage(
            _config["Email:From"],
            to,
            subject,
            body
        );

        mail.IsBodyHtml = true;

        await smtp.SendMailAsync(mail);
    }
}
