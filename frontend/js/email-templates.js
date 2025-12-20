const EmailTemplates = [
    {
        name: '🚀 Welcome - Modern Gradient',
        content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:50px 40px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:32px;font-weight:700;">Welcome to the Family! 🎉</h1>
<p style="color:rgba(255,255,255,0.9);margin:15px 0 0;font-size:16px;">We're thrilled to have you, {{name}}</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 20px;">Hey {{name}},</p>
<p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 20px;">Welcome aboard! We're excited to have you join our community. Your journey to amazing things starts right here, right now.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;margin:30px 0;">
<tr><td style="padding:25px;">
<p style="color:#64748b;font-size:14px;margin:0 0 15px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">What's Next?</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0;">✨ Explore your dashboard<br>📚 Check out our guides<br>💬 Join our community</p>
</td></tr></table>
<table cellpadding="0" cellspacing="0" style="margin:30px auto;">
<tr><td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:8px;">
<a href="{{cta_link}}" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;">Get Started →</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#f8fafc;padding:30px 40px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="color:#9ca3af;font-size:13px;margin:0;">Made with ❤️ by {{company_name}}</p>
</td></tr></table>
</td></tr></table>
</body></html>`,
        createdAt: new Date().toISOString()
    },
    {
        name: '📰 Newsletter - Clean & Bold',
        content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:20px;overflow:hidden;">
<tr><td style="padding:40px 40px 30px;text-align:center;">
<p style="color:#818cf8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">Newsletter</p>
<h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">{{newsletter_title}}</h1>
<p style="color:#94a3b8;margin:15px 0 0;font-size:15px;">{{newsletter_date}}</p>
</td></tr>
<tr><td style="padding:0 40px 40px;">
<p style="color:#e2e8f0;font-size:16px;line-height:1.7;margin:0 0 25px;">Hi {{name}},</p>
<p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 30px;">{{intro_text}}</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#334155;border-radius:12px;margin:0 0 25px;">
<tr><td style="padding:25px;">
<p style="color:#818cf8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Featured</p>
<h3 style="color:#ffffff;margin:0 0 10px;font-size:18px;">{{feature_title}}</h3>
<p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0;">{{feature_description}}</p>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#334155;border-radius:12px;margin:0 0 25px;">
<tr><td style="padding:25px;">
<p style="color:#34d399;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Tip of the Week</p>
<p style="color:#e2e8f0;font-size:15px;line-height:1.6;margin:0;">{{tip_content}}</p>
</td></tr></table>
<table cellpadding="0" cellspacing="0" style="margin:30px auto;">
<tr><td style="background:#818cf8;border-radius:8px;">
<a href="{{read_more_link}}" style="display:inline-block;padding:14px 35px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;">Read Full Newsletter</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#0f172a;padding:30px 40px;text-align:center;">
<p style="color:#64748b;font-size:13px;margin:0;">© {{company_name}} • <a href="{{unsubscribe_link}}" style="color:#64748b;">Unsubscribe</a></p>
</td></tr></table>
</td></tr></table>
</body></html>`,
        createdAt: new Date().toISOString()
    }
];


EmailTemplates.push({
    name: '🎉 Event Invitation - Elegant',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#faf5ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 25px 50px rgba(139,92,246,0.15);">
<tr><td style="background:linear-gradient(135deg,#8b5cf6 0%,#d946ef 100%);padding:60px 40px;text-align:center;">
<p style="color:rgba(255,255,255,0.8);font-size:14px;text-transform:uppercase;letter-spacing:3px;margin:0 0 15px;">You're Invited</p>
<h1 style="color:#ffffff;margin:0;font-size:36px;font-weight:700;">{{event_name}}</h1>
</td></tr>
<tr><td style="padding:50px 40px;">
<p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 30px;">Dear {{name}},</p>
<p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 35px;">We would be honored to have you join us for an unforgettable experience. Mark your calendar and get ready for something special!</p>
<table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #e9d5ff;border-radius:16px;margin:0 0 35px;">
<tr><td style="padding:30px;text-align:center;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td width="33%" style="text-align:center;padding:10px;">
<p style="color:#8b5cf6;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Date</p>
<p style="color:#1f2937;font-size:16px;font-weight:600;margin:0;">{{event_date}}</p>
</td>
<td width="33%" style="text-align:center;padding:10px;border-left:1px solid #e9d5ff;border-right:1px solid #e9d5ff;">
<p style="color:#8b5cf6;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Time</p>
<p style="color:#1f2937;font-size:16px;font-weight:600;margin:0;">{{event_time}}</p>
</td>
<td width="33%" style="text-align:center;padding:10px;">
<p style="color:#8b5cf6;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Venue</p>
<p style="color:#1f2937;font-size:16px;font-weight:600;margin:0;">{{event_venue}}</p>
</td>
</tr></table>
</td></tr></table>
<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr><td style="background:linear-gradient(135deg,#8b5cf6 0%,#d946ef 100%);border-radius:50px;">
<a href="{{rsvp_link}}" style="display:inline-block;padding:18px 50px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;">RSVP Now ✨</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#faf5ff;padding:25px 40px;text-align:center;">
<p style="color:#9ca3af;font-size:13px;margin:0;">Questions? Reply to this email or contact us at {{contact_email}}</p>
</td></tr></table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});

EmailTemplates.push({
    name: '🛍️ Promo - Flash Sale',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fef2f2;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(239,68,68,0.15);">
<tr><td style="background:#ef4444;padding:20px 40px;text-align:center;">
<p style="color:#ffffff;font-size:14px;font-weight:600;margin:0;">⚡ LIMITED TIME OFFER ⚡</p>
</td></tr>
<tr><td style="background:linear-gradient(180deg,#ef4444 0%,#dc2626 100%);padding:50px 40px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:72px;font-weight:800;line-height:1;">{{discount}}%</h1>
<p style="color:#fecaca;font-size:24px;font-weight:600;margin:10px 0 0;">OFF EVERYTHING</p>
</td></tr>
<tr><td style="padding:40px;text-align:center;">
<p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 25px;">Hey {{name}}! 👋</p>
<p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 30px;">This is your chance to grab amazing deals. Our biggest sale of the season is here, but it won't last long!</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:12px;margin:0 0 30px;">
<tr><td style="padding:25px;text-align:center;">
<p style="color:#ef4444;font-size:14px;font-weight:600;margin:0 0 10px;">USE CODE</p>
<p style="color:#1f2937;font-size:32px;font-weight:800;margin:0;letter-spacing:4px;">{{promo_code}}</p>
<p style="color:#9ca3af;font-size:13px;margin:15px 0 0;">Valid until {{expiry_date}}</p>
</td></tr></table>
<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr><td style="background:#ef4444;border-radius:8px;">
<a href="{{shop_link}}" style="display:inline-block;padding:18px 50px;color:#ffffff;text-decoration:none;font-weight:700;font-size:18px;">SHOP NOW 🛒</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#1f2937;padding:25px 40px;text-align:center;">
<p style="color:#9ca3af;font-size:12px;margin:0;">Free shipping on orders over $50 • Easy returns • 24/7 support</p>
</td></tr></table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});


EmailTemplates.push({
    name: '🙏 Thank You - Heartfelt',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ecfdf5;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(16,185,129,0.12);">
<tr><td style="padding:60px 40px;text-align:center;">
<div style="width:80px;height:80px;background:linear-gradient(135deg,#10b981 0%,#059669 100%);border-radius:50%;margin:0 auto 25px;line-height:80px;">
<span style="font-size:40px;">💚</span>
</div>
<h1 style="color:#065f46;margin:0 0 15px;font-size:32px;font-weight:700;">Thank You, {{name}}!</h1>
<p style="color:#6b7280;font-size:16px;line-height:1.7;margin:0 0 30px;max-width:400px;margin-left:auto;margin-right:auto;">Your support means the world to us. We're incredibly grateful to have you as part of our journey.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%);border-radius:16px;margin:0 0 30px;">
<tr><td style="padding:30px;text-align:center;">
<p style="color:#059669;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Your Impact</p>
<p style="color:#065f46;font-size:18px;line-height:1.6;margin:0;">{{impact_message}}</p>
</td></tr></table>
<p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 30px;">{{personal_message}}</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr><td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);border-radius:50px;">
<a href="{{cta_link}}" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;">{{cta_text}}</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#065f46;padding:30px 40px;text-align:center;">
<p style="color:#a7f3d0;font-size:14px;margin:0;">With gratitude,<br><strong style="color:#ffffff;">The {{company_name}} Team</strong></p>
</td></tr></table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});

EmailTemplates.push({
    name: '⏰ Reminder - Urgent',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fffbeb;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(245,158,11,0.15);border-top:5px solid #f59e0b;">
<tr><td style="padding:50px 40px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td width="60" valign="top">
<div style="width:50px;height:50px;background:#fef3c7;border-radius:12px;text-align:center;line-height:50px;font-size:28px;">⏰</div>
</td><td valign="top" style="padding-left:15px;">
<h1 style="color:#92400e;margin:0 0 5px;font-size:24px;font-weight:700;">Friendly Reminder</h1>
<p style="color:#d97706;font-size:14px;margin:0;font-weight:500;">Action Required</p>
</td></tr></table>
<p style="color:#374151;font-size:16px;line-height:1.7;margin:30px 0 20px;">Hi {{name}},</p>
<p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 25px;">Just a quick heads up about <strong style="color:#92400e;">{{reminder_subject}}</strong>. We don't want you to miss out!</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border-left:4px solid #f59e0b;margin:0 0 30px;">
<tr><td style="padding:20px 25px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td width="50%">
<p style="color:#92400e;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;">Due Date</p>
<p style="color:#1f2937;font-size:18px;font-weight:700;margin:0;">{{due_date}}</p>
</td><td width="50%">
<p style="color:#92400e;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;">Time Left</p>
<p style="color:#dc2626;font-size:18px;font-weight:700;margin:0;">{{time_remaining}}</p>
</td></tr></table>
</td></tr></table>
<p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 30px;">{{additional_details}}</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr><td style="background:#f59e0b;border-radius:8px;">
<a href="{{action_link}}" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;">Take Action Now →</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#fef3c7;padding:20px 40px;text-align:center;">
<p style="color:#92400e;font-size:13px;margin:0;">Need help? Contact us at {{support_email}}</p>
</td></tr></table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});


EmailTemplates.push({
    name: '⭐ Feedback - Star Rating',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(14,165,233,0.12);">
<tr><td style="background:linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%);padding:50px 40px;text-align:center;">
<p style="font-size:48px;margin:0 0 15px;">💭</p>
<h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">We'd Love Your Feedback!</h1>
</td></tr>
<tr><td style="padding:50px 40px;text-align:center;">
<p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 15px;">Hi {{name}},</p>
<p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 35px;">Your opinion matters to us! How was your experience with {{service_name}}?</p>
<p style="color:#0284c7;font-size:14px;font-weight:600;margin:0 0 20px;">TAP A STAR TO RATE</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto 35px;">
<tr>
<td style="padding:0 8px;"><a href="{{rating_1_link}}" style="text-decoration:none;font-size:40px;">⭐</a></td>
<td style="padding:0 8px;"><a href="{{rating_2_link}}" style="text-decoration:none;font-size:40px;">⭐</a></td>
<td style="padding:0 8px;"><a href="{{rating_3_link}}" style="text-decoration:none;font-size:40px;">⭐</a></td>
<td style="padding:0 8px;"><a href="{{rating_4_link}}" style="text-decoration:none;font-size:40px;">⭐</a></td>
<td style="padding:0 8px;"><a href="{{rating_5_link}}" style="text-decoration:none;font-size:40px;">⭐</a></td>
</tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border-radius:12px;margin:0 0 30px;">
<tr><td style="padding:25px;">
<p style="color:#0369a1;font-size:14px;margin:0 0 10px;font-weight:600;">Want to tell us more?</p>
<p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0;">Your detailed feedback helps us improve and serve you better.</p>
</td></tr></table>
<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr><td style="background:linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%);border-radius:50px;">
<a href="{{detailed_feedback_link}}" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;">Write a Review ✍️</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#0c4a6e;padding:25px 40px;text-align:center;">
<p style="color:#7dd3fc;font-size:13px;margin:0;">Thank you for helping us improve! — {{company_name}}</p>
</td></tr></table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});

EmailTemplates.push({
    name: '🎁 Product Launch - Premium',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#18181b;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#18181b;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#27272a;border-radius:20px;overflow:hidden;border:1px solid #3f3f46;">
<tr><td style="padding:50px 40px;text-align:center;background:linear-gradient(180deg,#27272a 0%,#18181b 100%);">
<p style="color:#a1a1aa;font-size:13px;text-transform:uppercase;letter-spacing:3px;margin:0 0 20px;">Introducing</p>
<h1 style="color:#ffffff;margin:0;font-size:42px;font-weight:800;background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">{{product_name}}</h1>
<p style="color:#71717a;font-size:18px;margin:15px 0 0;">{{product_tagline}}</p>
</td></tr>
<tr><td style="padding:0 40px 40px;">
<p style="color:#e4e4e7;font-size:16px;line-height:1.7;margin:30px 0;">Hey {{name}},</p>
<p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0 0 30px;">{{product_description}}</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 30px;">
<tr>
<td width="33%" style="padding:15px;text-align:center;background:#3f3f46;border-radius:12px 0 0 12px;">
<p style="color:#fbbf24;font-size:24px;font-weight:700;margin:0;">{{feature_1_stat}}</p>
<p style="color:#a1a1aa;font-size:12px;margin:5px 0 0;">{{feature_1_label}}</p>
</td>
<td width="33%" style="padding:15px;text-align:center;background:#3f3f46;border-left:1px solid #52525b;border-right:1px solid #52525b;">
<p style="color:#fbbf24;font-size:24px;font-weight:700;margin:0;">{{feature_2_stat}}</p>
<p style="color:#a1a1aa;font-size:12px;margin:5px 0 0;">{{feature_2_label}}</p>
</td>
<td width="33%" style="padding:15px;text-align:center;background:#3f3f46;border-radius:0 12px 12px 0;">
<p style="color:#fbbf24;font-size:24px;font-weight:700;margin:0;">{{feature_3_stat}}</p>
<p style="color:#a1a1aa;font-size:12px;margin:5px 0 0;">{{feature_3_label}}</p>
</td>
</tr></table>
<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr><td style="background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%);border-radius:8px;">
<a href="{{cta_link}}" style="display:inline-block;padding:18px 50px;color:#18181b;text-decoration:none;font-weight:700;font-size:16px;">Get Early Access →</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#18181b;padding:25px 40px;text-align:center;border-top:1px solid #3f3f46;">
<p style="color:#52525b;font-size:12px;margin:0;">{{company_name}} • Premium Quality Since {{year}}</p>
</td></tr></table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});


EmailTemplates.push({
    name: '📋 Meeting Follow-up - Professional',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr><td style="background:#1e40af;padding:35px 40px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td>
<h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:600;">Meeting Summary</h1>
<p style="color:#93c5fd;font-size:14px;margin:8px 0 0;">{{meeting_date}} • {{meeting_time}}</p>
</td><td width="60" valign="top" style="text-align:right;">
<div style="width:50px;height:50px;background:rgba(255,255,255,0.15);border-radius:10px;text-align:center;line-height:50px;font-size:24px;">📋</div>
</td></tr></table>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 20px;">Hi {{name}},</p>
<p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 30px;">Thank you for your time today. Here's a quick recap of what we discussed:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 25px;">
<tr><td style="background:#eff6ff;border-radius:12px;padding:25px;border-left:4px solid #1e40af;">
<p style="color:#1e40af;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 15px;">Key Discussion Points</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:8px 0;border-bottom:1px solid #dbeafe;">
<p style="color:#374151;font-size:14px;margin:0;">✓ {{point_1}}</p>
</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #dbeafe;">
<p style="color:#374151;font-size:14px;margin:0;">✓ {{point_2}}</p>
</td></tr>
<tr><td style="padding:8px 0;">
<p style="color:#374151;font-size:14px;margin:0;">✓ {{point_3}}</p>
</td></tr></table>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 30px;">
<tr><td style="background:#fef3c7;border-radius:12px;padding:25px;border-left:4px solid #f59e0b;">
<p style="color:#92400e;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 15px;">Action Items</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:8px 0;">
<p style="color:#374151;font-size:14px;margin:0;">→ {{action_1}} <span style="color:#9ca3af;font-size:12px;">({{action_1_owner}})</span></p>
</td></tr>
<tr><td style="padding:8px 0;">
<p style="color:#374151;font-size:14px;margin:0;">→ {{action_2}} <span style="color:#9ca3af;font-size:12px;">({{action_2_owner}})</span></p>
</td></tr></table>
</td></tr></table>
<p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 30px;">{{closing_message}}</p>
<table cellpadding="0" cellspacing="0">
<tr><td style="background:#1e40af;border-radius:8px;">
<a href="{{calendar_link}}" style="display:inline-block;padding:14px 30px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">Schedule Follow-up</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#f8fafc;padding:25px 40px;border-top:1px solid #e5e7eb;">
<p style="color:#6b7280;font-size:14px;margin:0;">Best regards,<br><strong style="color:#374151;">{{sender_name}}</strong><br><span style="color:#9ca3af;font-size:13px;">{{sender_title}} • {{company_name}}</span></p>
</td></tr></table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});

EmailTemplates.push({
    name: '✉️ Simple - Minimal Clean',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:60px 20px;">
<tr><td align="center">
<table width="550" cellpadding="0" cellspacing="0">
<tr><td style="border-bottom:2px solid #1f2937;padding-bottom:30px;margin-bottom:30px;">
<p style="color:#1f2937;font-size:13px;text-transform:uppercase;letter-spacing:2px;margin:0;">{{company_name}}</p>
</td></tr>
<tr><td style="padding-top:40px;">
<p style="color:#374151;font-size:18px;line-height:1.8;margin:0 0 25px;">Dear {{name}},</p>
<p style="color:#4b5563;font-size:17px;line-height:1.9;margin:0 0 25px;">{{paragraph_1}}</p>
<p style="color:#4b5563;font-size:17px;line-height:1.9;margin:0 0 25px;">{{paragraph_2}}</p>
<p style="color:#4b5563;font-size:17px;line-height:1.9;margin:0 0 40px;">{{paragraph_3}}</p>
<p style="color:#374151;font-size:17px;line-height:1.8;margin:0;">Warm regards,</p>
<p style="color:#1f2937;font-size:18px;font-weight:600;margin:10px 0 0;">{{sender_name}}</p>
<p style="color:#6b7280;font-size:15px;margin:5px 0 0;">{{sender_title}}</p>
</td></tr>
<tr><td style="border-top:1px solid #e5e7eb;padding-top:30px;margin-top:50px;">
<p style="color:#9ca3af;font-size:13px;margin:0;text-align:center;">{{company_address}}</p>
</td></tr></table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});


EmailTemplates.push({
    name: '🎓 Course/Webinar - Educational',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fdf4ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf4ff;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 25px 50px rgba(168,85,247,0.15);">
<tr><td style="background:linear-gradient(135deg,#a855f7 0%,#7c3aed 100%);padding:50px 40px;text-align:center;">
<p style="color:rgba(255,255,255,0.8);font-size:13px;text-transform:uppercase;letter-spacing:2px;margin:0 0 15px;">Free Webinar</p>
<h1 style="color:#ffffff;margin:0;font-size:30px;font-weight:700;line-height:1.3;">{{webinar_title}}</h1>
<p style="color:#e9d5ff;font-size:16px;margin:20px 0 0;">{{webinar_subtitle}}</p>
</td></tr>
<tr><td style="padding:45px 40px;">
<p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 25px;">Hi {{name}},</p>
<p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 30px;">{{intro_text}}</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;border-radius:16px;margin:0 0 30px;">
<tr><td style="padding:30px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td width="50%" style="padding:10px 0;">
<p style="color:#7c3aed;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;">📅 Date</p>
<p style="color:#1f2937;font-size:16px;font-weight:600;margin:0;">{{event_date}}</p>
</td><td width="50%" style="padding:10px 0;">
<p style="color:#7c3aed;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;">⏰ Time</p>
<p style="color:#1f2937;font-size:16px;font-weight:600;margin:0;">{{event_time}}</p>
</td></tr>
<tr><td colspan="2" style="padding:10px 0;">
<p style="color:#7c3aed;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;">👨‍🏫 Hosted By</p>
<p style="color:#1f2937;font-size:16px;font-weight:600;margin:0;">{{host_name}}, {{host_title}}</p>
</td></tr></table>
</td></tr></table>
<p style="color:#7c3aed;font-size:14px;font-weight:600;margin:0 0 15px;">What You'll Learn:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 30px;">
<tr><td style="padding:8px 0;padding-left:20px;color:#4b5563;font-size:15px;">✓ {{learning_point_1}}</td></tr>
<tr><td style="padding:8px 0;padding-left:20px;color:#4b5563;font-size:15px;">✓ {{learning_point_2}}</td></tr>
<tr><td style="padding:8px 0;padding-left:20px;color:#4b5563;font-size:15px;">✓ {{learning_point_3}}</td></tr>
</table>
<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr><td style="background:linear-gradient(135deg,#a855f7 0%,#7c3aed 100%);border-radius:50px;">
<a href="{{register_link}}" style="display:inline-block;padding:18px 50px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;">Reserve My Spot 🎯</a>
</td></tr></table>
<p style="color:#9ca3af;font-size:13px;text-align:center;margin:25px 0 0;">Limited spots available • {{spots_remaining}} seats left</p>
</td></tr>
<tr><td style="background:#7c3aed;padding:25px 40px;text-align:center;">
<p style="color:#e9d5ff;font-size:13px;margin:0;">Can't make it? <a href="{{recording_link}}" style="color:#ffffff;text-decoration:underline;">Get the recording</a></p>
</td></tr></table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailTemplates;
}