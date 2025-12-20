const EmailTemplates = [
    {
        name: '👋 Welcome - Stunning Gradient',
        content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;">
<tr><td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 35%,#f093fb 70%,#f5576c 100%);padding:80px 40px 100px;text-align:center;position:relative;">
<div style="position:relative;z-index:1;">
<div style="width:80px;height:80px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 24px;backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;">
<span style="font-size:40px;">👋</span>
</div>
<h1 style="color:#ffffff;font-size:42px;font-weight:800;margin:0 0 16px;letter-spacing:-1px;text-shadow:0 2px 20px rgba(0,0,0,0.2);">Welcome, {{name}}!</h1>
<p style="color:rgba(255,255,255,0.9);font-size:18px;line-height:1.6;margin:0;max-width:400px;margin-left:auto;margin-right:auto;">We are thrilled to have you join our community. Your journey to amazing things starts now.</p>
</div>
</td></tr>
<tr><td style="background:#1a1a1a;padding:0 40px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#252525;border-radius:20px;margin-top:-50px;position:relative;z-index:2;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
<tr><td style="padding:40px;">
<p style="color:#888888;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin:0 0 20px;">What happens next</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:16px 0;border-bottom:1px solid #333333;">
<table width="100%"><tr>
<td width="48" valign="top"><div style="width:40px;height:40px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:10px;text-align:center;line-height:40px;font-size:18px;">1</div></td>
<td style="padding-left:16px;"><p style="color:#ffffff;font-size:15px;font-weight:600;margin:0 0 4px;">Explore your dashboard</p><p style="color:#888888;font-size:14px;margin:0;">Get familiar with all the features</p></td>
</tr></table>
</td></tr>
<tr><td style="padding:16px 0;border-bottom:1px solid #333333;">
<table width="100%"><tr>
<td width="48" valign="top"><div style="width:40px;height:40px;background:linear-gradient(135deg,#764ba2,#f093fb);border-radius:10px;text-align:center;line-height:40px;font-size:18px;">2</div></td>
<td style="padding-left:16px;"><p style="color:#ffffff;font-size:15px;font-weight:600;margin:0 0 4px;">Complete your profile</p><p style="color:#888888;font-size:14px;margin:0;">Help us personalize your experience</p></td>
</tr></table>
</td></tr>
<tr><td style="padding:16px 0;">
<table width="100%"><tr>
<td width="48" valign="top"><div style="width:40px;height:40px;background:linear-gradient(135deg,#f093fb,#f5576c);border-radius:10px;text-align:center;line-height:40px;font-size:18px;">3</div></td>
<td style="padding-left:16px;"><p style="color:#ffffff;font-size:15px;font-weight:600;margin:0 0 4px;">Start creating</p><p style="color:#888888;font-size:14px;margin:0;">Build something amazing today</p></td>
</tr></table>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
<tr><td style="background:#1a1a1a;padding:40px;text-align:center;">
<table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;"><tr>
<td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%);border-radius:50px;box-shadow:0 8px 30px rgba(102,126,234,0.4);">
<a href="{{cta_link}}" style="display:inline-block;padding:18px 48px;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;">Get Started →</a>
</td>
</tr></table>
<p style="color:#666666;font-size:14px;line-height:1.6;margin:0 0 24px;">Need help getting started? Our support team is here for you 24/7.</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
<td style="padding:0 12px;"><a href="{{help_link}}" style="color:#667eea;text-decoration:none;font-size:14px;">Help Center</a></td>
<td style="color:#333333;">•</td>
<td style="padding:0 12px;"><a href="{{docs_link}}" style="color:#667eea;text-decoration:none;font-size:14px;">Documentation</a></td>
<td style="color:#333333;">•</td>
<td style="padding:0 12px;"><a href="{{community_link}}" style="color:#667eea;text-decoration:none;font-size:14px;">Community</a></td>
</tr></table>
</td></tr>
<tr><td style="background:#0f0f0f;padding:32px 40px;text-align:center;">
<p style="color:#444444;font-size:12px;margin:0 0 8px;">{{company_name}} • {{company_address}}</p>
<p style="color:#444444;font-size:12px;margin:0;"><a href="{{unsubscribe_link}}" style="color:#444444;">Unsubscribe</a> • <a href="{{privacy_link}}" style="color:#444444;">Privacy Policy</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
        createdAt: new Date().toISOString()
    },
    {
        name: '✨ Stripe Style - Receipt',
        content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f9fc;padding:45px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
<tr><td style="padding:40px 48px 32px;">
<table width="100%"><tr>
<td><div style="width:40px;height:40px;background:linear-gradient(135deg,#635bff,#a259ff);border-radius:8px;"></div></td>
<td align="right" style="color:#8898aa;font-size:13px;">Receipt from {{company_name}}</td>
</tr></table>
</td></tr>
<tr><td style="padding:0 48px;">
<p style="color:#8898aa;font-size:14px;margin:0 0 8px;">Amount paid</p>
<p style="color:#1a1f36;font-size:36px;font-weight:600;margin:0 0 24px;">${{amount}}</p>
<p style="color:#8898aa;font-size:14px;margin:0 0 4px;">Date paid</p>
<p style="color:#1a1f36;font-size:15px;margin:0 0 24px;">{{payment_date}}</p>
<p style="color:#8898aa;font-size:14px;margin:0 0 4px;">Payment method</p>
<p style="color:#1a1f36;font-size:15px;margin:0;">{{payment_method}}</p>
</td></tr>
<tr><td style="padding:32px 48px;">
<table width="100%" style="border-top:1px solid #e6ebf1;border-bottom:1px solid #e6ebf1;">
<tr><td style="padding:16px 0;color:#1a1f36;font-size:14px;">{{item_name}}</td><td align="right" style="padding:16px 0;color:#1a1f36;font-size:14px;">${{item_price}}</td></tr>
</table>
<table width="100%"><tr><td style="padding:16px 0;color:#1a1f36;font-size:14px;font-weight:600;">Total</td><td align="right" style="padding:16px 0;color:#1a1f36;font-size:14px;font-weight:600;">${{amount}}</td></tr></table>
</td></tr>
<tr><td style="padding:0 48px 40px;">
<p style="color:#8898aa;font-size:13px;line-height:1.6;margin:0;">If you have any questions, contact us at <a href="mailto:{{support_email}}" style="color:#635bff;text-decoration:none;">{{support_email}}</a></p>
</td></tr>
</table>
<p style="color:#8898aa;font-size:12px;margin:24px 0 0;text-align:center;">{{company_name}} • {{company_address}}</p>
</td></tr></table>
</body></html>`,
        createdAt: new Date().toISOString()
    },
    {
        name: '🔮 Linear Style - Update',
        content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0b;padding:60px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:40px;">
<table width="100%"><tr>
<td><div style="width:32px;height:32px;background:linear-gradient(135deg,#5e6ad2,#8b5cf6);border-radius:6px;"></div></td>
<td align="right"><span style="color:#5e6ad2;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:1px;">Product Update</span></td>
</tr></table>
</td></tr>
<tr><td style="background:linear-gradient(180deg,#18181b 0%,#0a0a0b 100%);border:1px solid #27272a;border-radius:16px;padding:48px;">
<h1 style="color:#fafafa;font-size:28px;font-weight:600;margin:0 0 16px;letter-spacing:-0.5px;">{{headline}}</h1>
<p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0 0 32px;">Hi {{name}}, {{intro_text}}</p>
<div style="background:#27272a;border-radius:12px;padding:24px;margin:0 0 32px;">
<p style="color:#5e6ad2;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">What's New</p>
<p style="color:#e4e4e7;font-size:15px;line-height:1.6;margin:0;">{{feature_description}}</p>
</div>
<table cellpadding="0" cellspacing="0"><tr>
<td style="background:linear-gradient(135deg,#5e6ad2,#8b5cf6);border-radius:8px;">
<a href="{{cta_link}}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:500;font-size:14px;">{{cta_text}}</a>
</td>
<td style="padding-left:12px;">
<a href="{{secondary_link}}" style="display:inline-block;padding:14px 28px;color:#a1a1aa;text-decoration:none;font-weight:500;font-size:14px;border:1px solid #3f3f46;border-radius:8px;">Learn more →</a>
</td>
</tr></table>
</td></tr>
<tr><td style="padding-top:32px;text-align:center;">
<p style="color:#52525b;font-size:12px;margin:0;">{{company_name}} • <a href="{{unsubscribe_link}}" style="color:#52525b;">Unsubscribe</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
        createdAt: new Date().toISOString()
    }
];


EmailTemplates.push({
    name: '🍎 Apple Style - Minimal',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:60px 20px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding-bottom:48px;">
<div style="width:56px;height:56px;background:#000000;border-radius:12px;display:inline-block;"></div>
</td></tr>
<tr><td align="center">
<h1 style="color:#1d1d1f;font-size:40px;font-weight:600;margin:0 0 20px;letter-spacing:-1px;line-height:1.1;">{{headline}}</h1>
<p style="color:#86868b;font-size:19px;line-height:1.5;margin:0 0 40px;max-width:460px;">{{subheadline}}</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto 48px;">
<tr><td style="background:#0071e3;border-radius:980px;">
<a href="{{cta_link}}" style="display:inline-block;padding:16px 32px;color:#ffffff;text-decoration:none;font-weight:400;font-size:17px;">{{cta_text}}</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#f5f5f7;border-radius:20px;padding:40px;text-align:center;">
<p style="color:#1d1d1f;font-size:24px;font-weight:600;margin:0 0 12px;">{{feature_title}}</p>
<p style="color:#86868b;font-size:15px;line-height:1.6;margin:0;">{{feature_description}}</p>
</td></tr>
<tr><td style="padding-top:48px;text-align:center;">
<p style="color:#86868b;font-size:12px;line-height:1.6;margin:0;">{{company_name}}<br>{{company_address}}</p>
<p style="color:#86868b;font-size:12px;margin:16px 0 0;"><a href="{{unsubscribe_link}}" style="color:#0066cc;text-decoration:none;">Unsubscribe</a> • <a href="{{privacy_link}}" style="color:#0066cc;text-decoration:none;">Privacy Policy</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});

EmailTemplates.push({
    name: '📝 Notion Style - Invite',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:48px 20px;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:32px;">
<span style="font-size:32px;">📄</span>
</td></tr>
<tr><td>
<p style="color:#37352f;font-size:14px;line-height:1.7;margin:0 0 24px;">Hi {{name}},</p>
<p style="color:#37352f;font-size:14px;line-height:1.7;margin:0 0 24px;"><strong>{{inviter_name}}</strong> invited you to collaborate on <strong>{{workspace_name}}</strong> in {{company_name}}.</p>
<table width="100%" style="background:#f7f6f3;border-radius:8px;margin:0 0 24px;">
<tr><td style="padding:20px;">
<table width="100%"><tr>
<td width="40" valign="top"><span style="font-size:24px;">{{page_icon}}</span></td>
<td style="padding-left:12px;">
<p style="color:#37352f;font-size:14px;font-weight:600;margin:0 0 4px;">{{page_title}}</p>
<p style="color:#9b9a97;font-size:13px;margin:0;">{{page_description}}</p>
</td>
</tr></table>
</td></tr></table>
<table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
<tr><td style="background:#000000;border-radius:4px;">
<a href="{{cta_link}}" style="display:inline-block;padding:10px 16px;color:#ffffff;text-decoration:none;font-weight:500;font-size:14px;">Accept invite</a>
</td></tr></table>
<p style="color:#9b9a97;font-size:13px;line-height:1.6;margin:0;">Or copy and paste this link: <a href="{{cta_link}}" style="color:#37352f;word-break:break-all;">{{cta_link}}</a></p>
</td></tr>
<tr><td style="padding-top:48px;border-top:1px solid #e9e9e7;margin-top:48px;">
<p style="color:#9b9a97;font-size:12px;margin:0;">Sent by {{company_name}} • <a href="{{unsubscribe_link}}" style="color:#9b9a97;">Unsubscribe</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});

EmailTemplates.push({
    name: '▲ Vercel Style - Deploy',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:48px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:32px;">
<svg width="24" height="24" viewBox="0 0 76 65" fill="#fff"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/></svg>
</td></tr>
<tr><td style="background:#111111;border:1px solid #333333;border-radius:8px;padding:32px;">
<table width="100%" style="margin-bottom:24px;"><tr>
<td width="12" style="padding-right:12px;"><div style="width:12px;height:12px;background:#50e3c2;border-radius:50%;"></div></td>
<td><p style="color:#888888;font-size:13px;margin:0;">Deployment successful</p></td>
</tr></table>
<h2 style="color:#ffffff;font-size:20px;font-weight:600;margin:0 0 8px;">{{project_name}}</h2>
<p style="color:#888888;font-size:14px;margin:0 0 24px;">{{deployment_message}}</p>
<table width="100%" style="background:#0a0a0a;border-radius:6px;margin-bottom:24px;">
<tr><td style="padding:16px;">
<table width="100%">
<tr><td style="padding:4px 0;"><span style="color:#666666;font-size:12px;">Branch</span></td><td align="right" style="padding:4px 0;"><span style="color:#ffffff;font-size:12px;font-family:monospace;">{{branch}}</span></td></tr>
<tr><td style="padding:4px 0;"><span style="color:#666666;font-size:12px;">Commit</span></td><td align="right" style="padding:4px 0;"><span style="color:#ffffff;font-size:12px;font-family:monospace;">{{commit_hash}}</span></td></tr>
<tr><td style="padding:4px 0;"><span style="color:#666666;font-size:12px;">Duration</span></td><td align="right" style="padding:4px 0;"><span style="color:#ffffff;font-size:12px;">{{duration}}</span></td></tr>
</table>
</td></tr></table>
<table cellpadding="0" cellspacing="0"><tr>
<td style="background:#ffffff;border-radius:6px;">
<a href="{{preview_link}}" style="display:inline-block;padding:12px 20px;color:#000000;text-decoration:none;font-weight:500;font-size:14px;">Visit Preview</a>
</td>
<td style="padding-left:8px;">
<a href="{{dashboard_link}}" style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-weight:500;font-size:14px;border:1px solid #333333;border-radius:6px;">View Dashboard</a>
</td>
</tr></table>
</td></tr>
<tr><td style="padding-top:24px;text-align:center;">
<p style="color:#666666;font-size:12px;margin:0;">{{company_name}} • <a href="{{settings_link}}" style="color:#666666;">Notification Settings</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});


EmailTemplates.push({
    name: '🎨 Figma Style - Comment',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#ff7262,#a259ff,#1abcfe);height:4px;"></td></tr>
<tr><td style="padding:32px;">
<table width="100%" style="margin-bottom:24px;"><tr>
<td width="40"><div style="width:40px;height:40px;background:linear-gradient(135deg,#ff7262,#a259ff);border-radius:50%;"></div></td>
<td style="padding-left:12px;">
<p style="color:#333333;font-size:14px;font-weight:600;margin:0;">{{commenter_name}}</p>
<p style="color:#999999;font-size:12px;margin:4px 0 0;">commented on {{file_name}}</p>
</td>
</tr></table>
<div style="background:#f5f5f5;border-radius:8px;padding:16px;margin-bottom:24px;">
<p style="color:#333333;font-size:14px;line-height:1.6;margin:0;">"{{comment_text}}"</p>
</div>
<table cellpadding="0" cellspacing="0"><tr>
<td style="background:#18a0fb;border-radius:6px;">
<a href="{{reply_link}}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:500;font-size:14px;">Reply to comment</a>
</td>
<td style="padding-left:12px;">
<a href="{{view_link}}" style="color:#18a0fb;text-decoration:none;font-size:14px;">View in Figma →</a>
</td>
</tr></table>
</td></tr>
<tr><td style="background:#fafafa;padding:20px 32px;border-top:1px solid #eeeeee;">
<p style="color:#999999;font-size:12px;margin:0;">You're receiving this because you're watching this file. <a href="{{unsubscribe_link}}" style="color:#999999;">Unsubscribe</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});

EmailTemplates.push({
    name: '🚀 Superhuman Style - Digest',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#1a1a2e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a2e;padding:48px 20px;">
<tr><td align="center">
<table width="540" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:40px;text-align:center;">
<div style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);padding:12px 24px;border-radius:24px;">
<span style="color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.5px;">YOUR DAILY DIGEST</span>
</div>
</td></tr>
<tr><td style="background:linear-gradient(180deg,#252547 0%,#1a1a2e 100%);border:1px solid #3d3d5c;border-radius:16px;padding:40px;">
<p style="color:#a0a0b9;font-size:14px;margin:0 0 8px;">Good morning, {{name}}</p>
<h1 style="color:#ffffff;font-size:28px;font-weight:600;margin:0 0 32px;letter-spacing:-0.5px;">{{digest_title}}</h1>
<div style="border-left:3px solid #667eea;padding-left:20px;margin-bottom:24px;">
<p style="color:#ffffff;font-size:16px;font-weight:500;margin:0 0 8px;">{{highlight_title}}</p>
<p style="color:#a0a0b9;font-size:14px;line-height:1.6;margin:0;">{{highlight_description}}</p>
</div>
<div style="border-left:3px solid #764ba2;padding-left:20px;margin-bottom:24px;">
<p style="color:#ffffff;font-size:16px;font-weight:500;margin:0 0 8px;">{{highlight_2_title}}</p>
<p style="color:#a0a0b9;font-size:14px;line-height:1.6;margin:0;">{{highlight_2_description}}</p>
</div>
<table width="100%" style="background:#1a1a2e;border-radius:12px;padding:20px;margin-top:32px;">
<tr>
<td width="33%" style="text-align:center;padding:12px;">
<p style="color:#667eea;font-size:28px;font-weight:700;margin:0;">{{stat_1}}</p>
<p style="color:#a0a0b9;font-size:12px;margin:4px 0 0;">{{stat_1_label}}</p>
</td>
<td width="33%" style="text-align:center;padding:12px;border-left:1px solid #3d3d5c;border-right:1px solid #3d3d5c;">
<p style="color:#764ba2;font-size:28px;font-weight:700;margin:0;">{{stat_2}}</p>
<p style="color:#a0a0b9;font-size:12px;margin:4px 0 0;">{{stat_2_label}}</p>
</td>
<td width="33%" style="text-align:center;padding:12px;">
<p style="color:#a855f7;font-size:28px;font-weight:700;margin:0;">{{stat_3}}</p>
<p style="color:#a0a0b9;font-size:12px;margin:4px 0 0;">{{stat_3_label}}</p>
</td>
</tr></table>
</td></tr>
<tr><td style="padding-top:32px;text-align:center;">
<p style="color:#5c5c7a;font-size:12px;margin:0;">{{company_name}} • <a href="{{unsubscribe_link}}" style="color:#5c5c7a;">Manage preferences</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});

EmailTemplates.push({
    name: '💳 Revolut Style - Transaction',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:40px 20px;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#191c1f;padding:32px;text-align:center;">
<div style="width:64px;height:64px;background:linear-gradient(135deg,#00d4aa,#0075eb);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
<span style="font-size:28px;">✓</span>
</div>
<p style="color:#ffffff;font-size:14px;margin:0 0 8px;">Payment sent</p>
<p style="color:#ffffff;font-size:36px;font-weight:700;margin:0;">{{currency}}{{amount}}</p>
</td></tr>
<tr><td style="padding:32px;">
<table width="100%" style="margin-bottom:24px;">
<tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
<p style="color:#8b8b8b;font-size:12px;margin:0 0 4px;">To</p>
<p style="color:#191c1f;font-size:15px;font-weight:500;margin:0;">{{recipient_name}}</p>
</td></tr>
<tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
<p style="color:#8b8b8b;font-size:12px;margin:0 0 4px;">Date</p>
<p style="color:#191c1f;font-size:15px;margin:0;">{{transaction_date}}</p>
</td></tr>
<tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
<p style="color:#8b8b8b;font-size:12px;margin:0 0 4px;">Reference</p>
<p style="color:#191c1f;font-size:15px;font-family:monospace;margin:0;">{{reference}}</p>
</td></tr>
<tr><td style="padding:12px 0;">
<p style="color:#8b8b8b;font-size:12px;margin:0 0 4px;">Note</p>
<p style="color:#191c1f;font-size:15px;margin:0;">{{note}}</p>
</td></tr>
</table>
<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr><td style="background:#191c1f;border-radius:24px;">
<a href="{{receipt_link}}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-weight:500;font-size:14px;">View receipt</a>
</td></tr></table>
</td></tr>
<tr><td style="background:#f7f7f7;padding:20px 32px;text-align:center;">
<p style="color:#8b8b8b;font-size:12px;margin:0;">Questions? <a href="mailto:{{support_email}}" style="color:#0075eb;text-decoration:none;">Contact support</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});


EmailTemplates.push({
    name: '🎯 Slack Style - Notification',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4ede4;font-family:'Lato',-apple-system,BlinkMacSystemFont,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4ede4;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
<tr><td style="background:#4a154b;padding:24px 32px;">
<table width="100%"><tr>
<td><span style="color:#ffffff;font-size:20px;font-weight:700;">{{workspace_name}}</span></td>
<td align="right"><span style="color:#ffffff;font-size:13px;opacity:0.8;">{{notification_type}}</span></td>
</tr></table>
</td></tr>
<tr><td style="padding:32px;">
<table width="100%" style="margin-bottom:24px;"><tr>
<td width="48" valign="top">
<div style="width:48px;height:48px;background:#e8912d;border-radius:8px;text-align:center;line-height:48px;">
<span style="color:#ffffff;font-size:20px;font-weight:700;">{{sender_initial}}</span>
</div>
</td>
<td style="padding-left:16px;">
<p style="color:#1d1c1d;font-size:15px;margin:0 0 4px;"><strong>{{sender_name}}</strong> <span style="color:#616061;">{{action_text}}</span></p>
<p style="color:#616061;font-size:13px;margin:0;">{{channel_name}} • {{time_ago}}</p>
</td>
</tr></table>
<div style="background:#f8f8f8;border-left:4px solid #e8912d;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
<p style="color:#1d1c1d;font-size:15px;line-height:1.6;margin:0;">{{message_preview}}</p>
</div>
<table cellpadding="0" cellspacing="0"><tr>
<td style="background:#007a5a;border-radius:4px;">
<a href="{{reply_link}}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">Reply in Slack</a>
</td>
</tr></table>
</td></tr>
<tr><td style="background:#f8f8f8;padding:20px 32px;border-top:1px solid #e8e8e8;">
<table width="100%"><tr>
<td><p style="color:#696969;font-size:12px;margin:0;">Sent to {{email}}</p></td>
<td align="right"><a href="{{settings_link}}" style="color:#696969;font-size:12px;">Notification settings</a></td>
</tr></table>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});

EmailTemplates.push({
    name: '🌈 Gradient Hero - Marketing',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:0;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;">
<tr><td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%);padding:80px 40px;text-align:center;">
<h1 style="color:#ffffff;font-size:48px;font-weight:800;margin:0 0 20px;letter-spacing:-2px;line-height:1.1;">{{headline}}</h1>
<p style="color:rgba(255,255,255,0.9);font-size:20px;line-height:1.5;margin:0 0 40px;max-width:480px;margin-left:auto;margin-right:auto;">{{subheadline}}</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
<td style="background:#ffffff;border-radius:50px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
<a href="{{cta_link}}" style="display:inline-block;padding:18px 40px;color:#667eea;text-decoration:none;font-weight:700;font-size:16px;">{{cta_text}}</a>
</td>
</tr></table>
</td></tr>
<tr><td style="background:#0f0f0f;padding:60px 40px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td width="33%" style="padding:20px;text-align:center;">
<div style="width:64px;height:64px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:16px;margin:0 auto 16px;"></div>
<p style="color:#ffffff;font-size:16px;font-weight:600;margin:0 0 8px;">{{feature_1_title}}</p>
<p style="color:#888888;font-size:14px;line-height:1.5;margin:0;">{{feature_1_desc}}</p>
</td>
<td width="33%" style="padding:20px;text-align:center;">
<div style="width:64px;height:64px;background:linear-gradient(135deg,#764ba2,#f093fb);border-radius:16px;margin:0 auto 16px;"></div>
<p style="color:#ffffff;font-size:16px;font-weight:600;margin:0 0 8px;">{{feature_2_title}}</p>
<p style="color:#888888;font-size:14px;line-height:1.5;margin:0;">{{feature_2_desc}}</p>
</td>
<td width="33%" style="padding:20px;text-align:center;">
<div style="width:64px;height:64px;background:linear-gradient(135deg,#f093fb,#667eea);border-radius:16px;margin:0 auto 16px;"></div>
<p style="color:#ffffff;font-size:16px;font-weight:600;margin:0 0 8px;">{{feature_3_title}}</p>
<p style="color:#888888;font-size:14px;line-height:1.5;margin:0;">{{feature_3_desc}}</p>
</td>
</tr></table>
</td></tr>
<tr><td style="background:#0f0f0f;padding:40px;text-align:center;border-top:1px solid #222222;">
<p style="color:#666666;font-size:13px;margin:0;">{{company_name}} • <a href="{{unsubscribe_link}}" style="color:#666666;">Unsubscribe</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});

EmailTemplates.push({
    name: '🏷️ Minimal Sale - E-commerce',
    content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0">
<tr><td style="padding:40px 40px 20px;text-align:center;border-bottom:1px solid #000000;">
<p style="color:#000000;font-size:12px;letter-spacing:4px;text-transform:uppercase;margin:0;">{{company_name}}</p>
</td></tr>
<tr><td style="padding:80px 40px;text-align:center;">
<p style="color:#000000;font-size:14px;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px;">{{sale_label}}</p>
<h1 style="color:#000000;font-size:72px;font-weight:300;margin:0 0 20px;letter-spacing:-2px;">{{discount}}% OFF</h1>
<p style="color:#666666;font-size:16px;line-height:1.6;margin:0 0 40px;">{{sale_description}}</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
<td style="border:2px solid #000000;">
<a href="{{shop_link}}" style="display:inline-block;padding:16px 48px;color:#000000;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Shop Now</a>
</td>
</tr></table>
<p style="color:#999999;font-size:13px;margin:40px 0 0;">Use code <strong style="color:#000000;">{{promo_code}}</strong> at checkout</p>
</td></tr>
<tr><td style="padding:40px;text-align:center;border-top:1px solid #eeeeee;">
<table width="100%"><tr>
<td width="33%" style="text-align:center;padding:20px;">
<p style="color:#000000;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">Free Shipping</p>
<p style="color:#999999;font-size:12px;margin:0;">On orders $50+</p>
</td>
<td width="33%" style="text-align:center;padding:20px;border-left:1px solid #eeeeee;border-right:1px solid #eeeeee;">
<p style="color:#000000;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">Easy Returns</p>
<p style="color:#999999;font-size:12px;margin:0;">30-day policy</p>
</td>
<td width="33%" style="text-align:center;padding:20px;">
<p style="color:#000000;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">Support</p>
<p style="color:#999999;font-size:12px;margin:0;">24/7 available</p>
</td>
</tr></table>
</td></tr>
<tr><td style="padding:20px 40px 40px;text-align:center;">
<p style="color:#999999;font-size:11px;margin:0;"><a href="{{unsubscribe_link}}" style="color:#999999;">Unsubscribe</a> • <a href="{{privacy_link}}" style="color:#999999;">Privacy</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    createdAt: new Date().toISOString()
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailTemplates;
}