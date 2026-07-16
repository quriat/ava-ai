def _send_email(to: str, subject: str, body: str):
    """Send HTML email via SMTP with professional AvaLimo template."""
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASS", "")
    smtp_from = os.environ.get("SMTP_FROM", smtp_user)
    if not smtp_user or not smtp_pass:
        log.warning("SMTP not configured -- email not sent to %s", to)
        return
    try:
        html = _email_template(body)
        msg = MIMEText(html, "html", "utf-8")
        msg["From"] = smtp_from
        msg["To"] = to
        msg["Subject"] = subject
        server = smtplib.SMTP(smtp_host, 587)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        log.info("Email sent to %s -- %s", to, subject[:40])
    except Exception as e:
        log.error("Email failed to %s: %s", to, e)


def _email_template(text_body: str) -> str:
    """Wrap plain text body in a professional HTML email template."""
    lines = text_body.strip().split("\n")
    rows = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if ":" in line and len(line) < 80:
            parts = line.split(":", 1)
            key = parts[0].strip()
            val = parts[1].strip()
            rows.append(
                '<tr>'
                '<td style="padding:7px 14px;color:#7a7a8a;font-size:13px;'
                'border-bottom:1px solid rgba(255,255,255,.06);white-space:nowrap;vertical-align:top;font-weight:500">'
                + key +
                '</td>'
                '<td style="padding:7px 14px;color:#f0ece4;font-size:14px;'
                'border-bottom:1px solid rgba(255,255,255,.06);width:100%">'
                + val +
                '</td>'
                '</tr>'
            )
        else:
            escaped = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            rows.append(
                '<tr><td colspan="2" style="padding:8px 14px;color:#f0ece4;'
                'font-size:14px;line-height:1.6">' + escaped + '</td></tr>'
            )
    body_rows = "".join(rows)
    return (
        '<!DOCTYPE html><html><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1"></head>'
        '<body style="margin:0;padding:0;background-color:#07070b;'
        'font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Inter,system-ui,sans-serif">'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"'
        ' style="background-color:#07070b;padding:30px 16px">'
        '<tr><td align="center">'
        '<table role="presentation" style="max-width:520px;width:100%;'
        'background:linear-gradient(145deg,#0e0e14 0%,rgba(12,12,18,.97) 100%);'
        'border-radius:16px;overflow:hidden;border:1px solid rgba(212,175,55,.22);'
        'box-shadow:0 24px 80px rgba(0,0,0,.7)">'
        # Header
        '<tr><td style="padding:32px 32px 20px;text-align:center;'
        'border-bottom:1px solid rgba(212,175,55,.15)">'
        '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">'
        '<tr>'
        '<td style="width:44px;height:44px;border-radius:12px;'
        'background:linear-gradient(135deg,#d4af37,#c4a030);text-align:center;'
        'vertical-align:middle;font-size:20px;font-weight:800;color:#0a0a0d;'
        'box-shadow:0 4px 16px rgba(212,175,55,.3)">A</td>'
        '<td style="padding-left:10px;text-align:left">'
        '<div style="color:#f0ece4;font-size:22px;font-weight:700;letter-spacing:-.3px">'
        '<span style="color:#d4af37">Ava</span>Limo</div>'
        '<div style="color:#7a7a8a;font-size:11px;letter-spacing:.5px;text-transform:uppercase;margin-top:1px">'
        'Houston Premium Transportation</div></td></tr></table></td></tr>'
        # Body
        '<tr><td style="padding:24px 32px">'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
        + body_rows +
        '</table></td></tr>'
        # Footer
        '<tr><td style="padding:20px 32px;text-align:center;'
        'border-top:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.15)">'
        '<div style="color:#7a7a8a;font-size:12px;line-height:1.6">'
        '<strong style="color:#f0ece4">AvaLimo</strong> &bull; (832) 567-8050<br>'
        '<span style="font-size:11px">Houston, TX &bull; '
        '<a href="https://avalimo.net" style="color:#d4af37;text-decoration:none">avalimo.net</a>'
        '</span></div></td></tr></table></td></tr></table></body></html>'
    )
