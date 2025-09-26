# Meditha - Dormir Natural

A sleep improvement quiz and course platform built with Astro, Preact, Supabase, and Stripe. Features a multi-step quiz that generates personalized sleep improvement recommendations and integrates with Stripe for course purchases.

## 🏗️ Architecture

- **Frontend**: Astro 5.0 + Preact + TailwindCSS v4
- **Backend**: Astro API routes (server-side)
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Magic link system
- **Payments**: Stripe Checkout
- **Email**: Multi-provider support (Postmark, SendGrid, SES)
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ (recommended for Vercel compatibility)
- Supabase project
- Stripe account (test/live keys)
- Email provider (Postmark, SendGrid, or SES)

### 1. Clone and Install
```bash
git clone <repository-url>
cd meditha
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and configure:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ... # Public anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Service role key (server-only!)
SUPABASE_DB_SCHEMA=public

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application Configuration  
APP_ORIGIN=https://metodolux.com.br

# Email Configuration
EMAIL_PROVIDER=postmark
EMAIL_API_KEY=...
EMAIL_FROM="Dormir Natural <no-reply@metodolux.com.br>"

# Security
APP_SECRET=your-secret-key-here
```

### 3. Database Setup
Run the database migrations in your Supabase SQL Editor:

1. Execute `supabase/migrations/001_init.sql` - Creates all tables and indexes
2. Execute `supabase/migrations/002_policies.sql` - Sets up RLS policies

### 4. Stripe Webhook Setup
Configure your Stripe webhook endpoint to:
```
https://your-domain.com/api/stripe/webhook
```

Events to listen for:
- `checkout.session.completed`
- `payment_intent.succeeded` (optional)

### 5. Development
```bash
npm run dev
```

## 🧞 Commands

| Command           | Action                                           |
| :---------------- | :----------------------------------------------- |
| `npm install`     | Install dependencies                             |
| `npm run dev`     | Start dev server at `localhost:4321`            |
| `npm run build`   | Build production site to `./dist/`              |
| `npm run preview` | Preview build locally before deploying          |

## 📁 Project Structure

```text
/
├── public/                 # Static assets
├── src/
│   ├── assets/            # SVGs, images
│   ├── components/        # Reusable Astro/Preact components
│   │   ├── quiz/         # Quiz engine components
│   │   └── ui/           # UI components
│   ├── layouts/          # Page layouts
│   ├── lib/              # Utilities and business logic
│   │   ├── auth/         # Magic link authentication
│   │   ├── email/        # Email templates and sending
│   │   ├── storage/      # Database operations (Supabase)
│   │   ├── telemetry/    # Client-side analytics
│   │   └── types/        # TypeScript definitions
│   ├── pages/            # File-based routing
│   │   ├── api/          # API endpoints
│   │   │   ├── lead.ts           # Quiz submission
│   │   │   ├── checkout/         # Payment flow
│   │   │   ├── stripe/           # Webhook handling
│   │   │   └── access/           # Magic link resend
│   │   ├── auth/         # Authentication pages
│   │   └── durma/        # Course area
│   └── styles/           # Global CSS
├── supabase/
│   └── migrations/       # Database schema files
└── SUPABASE_INTEGRATION_REPORT.md  # Detailed setup guide
```

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all Supabase tables
- **Service role isolation** - admin operations server-side only
- **PII protection** - sensitive data never exposed to client
- **Token hashing** - magic links stored as SHA-256 hashes
- **Rate limiting** - email sending and API endpoints protected
- **GDPR compliance** - audit trails and data retention policies

## 📊 Database Schema

The application uses 10 tables with proper relationships:

- `quiz_sessions` - Quiz completions with consent tracking
- `checkout_intents` - Idempotent checkout tracking  
- `stripe_checkout` - Payment session mapping
- `webhook_events` - Event processing audit trail
- `payments` - Payment records and fulfillment
- `users_app` - User accounts
- `enrollments` - Course/product access
- `magic_links` - Authentication tokens
- `email_log` - Email delivery tracking
- `product_events` - Non-PII telemetry

## 🚀 Deployment

### Vercel Deployment

1. **Environment Variables**: Add all variables from `.env.local` to Vercel project settings
   - ⚠️ Mark `SUPABASE_SERVICE_ROLE_KEY` as **encrypted/server-only**

2. **Domain Setup**: Update `APP_ORIGIN` to your production domain

3. **Stripe Webhooks**: Update webhook endpoint to production URL

4. **Deploy**: 
   ```bash
   git push origin main
   ```

### Post-Deployment Checklist

- [ ] Test quiz completion → email delivery
- [ ] Verify Stripe webhook processing  
- [ ] Check magic link authentication
- [ ] Monitor Supabase logs for errors
- [ ] Confirm RLS policies are active

## 🔧 Development Notes

### Email Templates
Email templates are in Portuguese and use traditional HTML (not React Email). Templates are defined in `src/lib/email/templates.ts`.

### Client-Side Telemetry
Optional non-PII event tracking available through `src/lib/telemetry/client.ts`. All PII is automatically sanitized before sending to Supabase.

### A/B Testing
Quiz sessions support experiment tracking with `variant_key`, `experiment_key`, and related metadata fields.

## 📖 Documentation

- See [`SUPABASE_INTEGRATION_REPORT.md`](./SUPABASE_INTEGRATION_REPORT.md) for detailed architecture and deployment guide
- Check [`AGENTS.md`](./AGENTS.md) for agent-specific commands and preferences

## 📞 Support

For technical issues:
1. Check Supabase logs for database errors
2. Review `webhook_events` table for payment processing issues  
3. Check `email_log` table for delivery problems
4. Monitor Vercel function logs for API errors

---

Built with ❤️ for better sleep 🌙
