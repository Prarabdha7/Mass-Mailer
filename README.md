# 📧 Mass Mailer

> Bulk email campaigns made simple. Upload CSV, pick a template, hit send.

![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-green?logo=flask)
![License](https://img.shields.io/badge/License-MIT-yellow)

** TILL 12 JAN THERE ARE MAILING CREDENTIALS in cred.txt TO TEST IT OUT**

## 🎯 Problem Statement

Sending personalized emails at scale is painful. Existing tools are either too expensive, too complex, or lack proper validation and tracking. Small businesses and developers need a simple, self-hosted solution.

## 💡 Our Solution

Mass Mailer is a full-stack email campaign platform that lets you:
- **Upload** a CSV of recipientsany CSV column
- **Send** in batches with rate limis or ilcre, and stom HTML
- **Track** delivery status me}real-time

## ✨ res

| Feature | Description |
|----emplate S----------|
| 📋 CSV Import | Drag & drop recipient lists with auto-valiking f |
| 🎨 Template Engine | Variable substitution with live preview |
| ✅ Email Validacking**: Rmat check + MX record verification |
| 📊 Real-time Tracking | Watch your campaign progress live |
| 🛡️ Reputation Management | Bounce tracking & suppression lists |
| 🔐 Secure Auth | Token-based admin authentication |
| ⚡ Rate Limiting | Configurable batch sizes and delays |

## 🛠️ Tech Stack

**Backend:** Python, Flask, Click CLI, dnspython  
**Frontend:** Vanilla JS, HTML5, CSS3  
**Testing:** pytest, Vitest, Hypothesis (property-based)

## 🚀 Quick Start

```bash
# Clone & setup
git clone <repo-url>
cd mass-mailer

# Backend
cd backend && pip install -r requirements.txt && cd ..

# Configure
cp .env.example .env
# Edit .env with your SMTP credentials

# Run
python cli.py server
```

Open `http://localhost:5000` → Login with your admin token → Start sending!

## 📁 Project Structure

```
mass-mailt Structure
ckend/           # k API + services
```app/
│   │   ├── routes/    # API endpoints
│   │   └── services/  # SMTP, validation, templates
│   └── tests/
├── frontend/          # Web dashboard
│   ├── dashboard.html
│   └── js/
├── config/            # YAML configs
├── cli.py             # CLI tools
└── test-data/         # Sample CSVs
```

## 🔧 Configuration

```env
# .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_ACCESS_TOKEN=your-secret-token
```

## 📡 API Highlights

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/validate-emails` | POST | Validate email list |
| `/api/send-campaign` | POST | Launch campaign |
| `/api/campaign-status/:id` | GET | Track progress |
| `/api/delivery-report/:id` | GET | Get detailed report |

## 🎮 CLI Commands

```bash
python cli.py test-smtp          # Test SMTP connection
python cli.py send --to x@y.com  # Send single email
python cli.py campaign --recipients data.csv  # Bulk send
python cli.py validate email@test.com  # Validate emails
```

## 📸 Demo

1. **Login** → Enter admin token
2. **Create Campaign** → Name it, set subject
3. **Pick Template** → Choose or customize
4. **Upload CSV** → Drag & drop recipients
5. **Launch** → Watch real-time progress
6. **Report** → Download delivery results

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  Flask API   │────▶│ SMTP Server  │
│  Dashboard   │     │   + Auth     │     │  (Gmail/etc) │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        ┌──────────┐ ┌──────────┐ ┌──────────────┐
        │ Validator│ │ Template │ │  Reputation  │
        │  (MX)    │ │  Engine  │ │   Manager    │
        └──────────┘ └──────────┘ └──────────────┘
```

## 🧪 Testing

```bash
cd backend && pytest           # Backend tests
cd frontend && npm test        # Frontend tests
```

## 🔮 Future Scope

- [ ] Scheduled campaigns
- [ ] A/B testing for templates
- [ ] Analytics dashboard with open/click tracking
- [ ] Webhook integrations
- [ ] Multi-user support with roles

## 👥 Team

Built with ☕ and 💻 during the hackathon.

## 📄 License

MIT
