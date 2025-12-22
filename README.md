<div align="center">

# Mass Mailer

### Bulk Email Campaigns Made Simple

*Upload CSV → Pick Template → Hit Send → Track Results*

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" width="100%">

</div>

## The Problem

Sending personalized emails at scale is **painful**:
- Enterprise tools cost a fortune
- Open-source alternatives are overly complex  
- No proper validation = bounced emails = ruined reputation
- Tracking delivery? Good luck.

## Our Solution

A **self-hosted**, **full-stack** email campaign platform that just works.

## How It Works

```mermaid
flowchart LR
    A[Upload CSV] --> B[Validate Emails]
    B --> C{All Valid?}
    C -->|Yes| D[Select Template]
    C -->|No| E[Review Invalid]
    E --> A
    D --> F[Personalize Variables]
    F --> G[Launch Campaign]
    G --> H[Track Progress]
    H --> I[Download Report]
```

## Features

<table>
<tr>
<td width="50%">

### Smart CSV Import
- Drag & drop recipient lists
- Auto-validates email format
- MX record verification
- Handles thousands of emails

</td>
<td width="50%">

### Template Engine
- Pre-built professional templates
- Custom HTML support
- Variable substitution: `{{name}}`, `{{email}}`
- Live preview before sending

</td>
</tr>
<tr>
<td width="50%">

### Real-time Tracking
- Watch campaign progress live
- Detailed delivery reports
- Export results to CSV
- Per-recipient status

</td>
<td width="50%">

### Reputation Management
- Bounce tracking
- Automatic suppression lists
- Rate limiting built-in
- Configurable batch delays

</td>
</tr>
</table>

## Tech Stack

<div align="center">

| Layer | Technologies |
|:-----:|:-------------|
| **Backend** | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white) |
| **Frontend** | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) |
| **Testing** | ![pytest](https://img.shields.io/badge/pytest-0A9EDC?style=flat-square&logo=pytest&logoColor=white) ![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white) |

</div>

## Quick Start

```bash
# 1. Clone
git clone <repo-url> && cd mass-mailer

# 2. Install
cd backend && pip install -r requirements.txt && cd ..

# 3. Configure
cp .env.example .env
# Edit .env with your SMTP credentials

# 4. Launch
cd backend && python app.py
```

<div align="center">

**Open** `http://localhost:5000` **→ Login → Start Sending!**

</div>

## Configuration

```env
# .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_ACCESS_TOKEN=your-secret-token
```

## Architecture

```mermaid
flowchart TB
    subgraph Frontend
        A[Web Dashboard]
    end
    
    subgraph Backend["Flask REST API"]
        B[Auth Routes]
        C[Campaign Routes]
        D[Validate Routes]
        E[Report Routes]
    end
    
    subgraph Services
        F[Email Validator]
        G[Template Engine]
        H[Reputation Manager]
        I[SMTP Client]
    end
    
    subgraph External
        J[(SMTP Server)]
    end
    
    A --> B & C & D & E
    C --> F & G & H
    D --> F
    E --> H
    G --> I
    I --> J
```

## Email Sending Flow

```mermaid
sequenceDiagram
    participant U as User
    participant D as Dashboard
    participant API as Flask API
    participant V as Validator
    participant T as Template Engine
    participant S as SMTP Client
    participant M as Mail Server

    U->>D: Upload CSV + Select Template
    D->>API: POST /api/send-campaign
    API->>V: Validate emails
    V-->>API: Validation results
    
    loop For each batch
        API->>T: Render template with variables
        T-->>API: Personalized HTML
        API->>S: Send batch
        S->>M: SMTP delivery
        M-->>S: Delivery status
        S-->>API: Batch results
    end
    
    API-->>D: Campaign complete
    D-->>U: Show delivery report
```

## Project Structure

```
mass-mailer/
├── backend/
│   ├── app/
│   │   ├── routes/        # API endpoints
│   │   └── services/      # SMTP, validation, templates
│   └── tests/             # pytest suite
├── frontend/
│   ├── dashboard.html     # Main UI
│   ├── login.html         # Auth page
│   └── js/                # Frontend logic
├── config/                # YAML configurations
└── test-data/             # Sample CSVs
```

## API Reference

| Endpoint | Method | Description |
|:---------|:------:|:------------|
| `/api/health` | `GET` | Health check |
| `/api/validate-emails` | `POST` | Validate email list |
| `/api/configure-smtp` | `POST` | Update SMTP settings |
| `/api/send-campaign` | `POST` | Launch campaign |
| `/api/campaign-status/:id` | `GET` | Track progress |
| `/api/delivery-report/:id` | `GET` | Get detailed report |

## Roadmap

- [ ] Scheduled campaigns
- [ ] A/B testing for templates
- [ ] Open/click tracking analytics
- [ ] Webhook integrations
- [ ] Multi-user with role-based access

## Testing

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

---

<div align="center">

### Built at the Hackathon

**Star this repo if you found it useful!**

</div>
