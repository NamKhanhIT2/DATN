# Tammi

A Video Streaming Website built with Next.js, Drizzle ORM, and modern UI libraries, featuring advanced video processing, real-time transcription, and a responsive design.

## Key Features

*  Advanced video player with quality controls
*  Real-time video processing with Mux
*  Automatic video transcription
*  Smart thumbnail generation
*  AI-powered title and description generation
*  Creator Studio with metrics
*  Custom playlist management
*  Responsive design across devices
*  Multiple content feeds (Home, Trending, Subscribed)
*  Interactive comment system (with nested replies)
*  Like and subscription system (for videos and comments)

---

## Prerequisites

* Node.js 18+ or Bun 1.0+
* PostgreSQL or NeonDB account
* Mux account for video processing
* OpenAI API key for AI features
* Upstash account for Redis and Workflows
* Clerk account for authentication

---

## Getting Started

### Installation

#### Using Bun 
```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
```

###  Environment Variables
Update the .env file with your configuration:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
CLERK_SIGNING_SECRET=your_clerk_webhook_signing_secret
DATABASE_URL=your_neon_postgres_connection_string
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
MUX_WEBHOOK_SECRET=your_mux_webhook_secret
UPLOADTHING_TOKEN=your_uploadthing_token
QSTASH_TOKEN=your_qstash_token
UPSTASH_WORKFLOW_URL=your_upstash_workflow_url
QSTASH_CURRENT_SIGNING_KEY=your_qstash_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_qstash_next_signing_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=your_app_url
GROQ_API_KEY=your_groq_api_key
PIXABAY_API_KEY=your_pixabay_api_key
```
### Database Setup
```bash
# Using Bun
bun run src/scripts/seed-categories.ts
```

### Development
```bash
# Using Bun
bun run dev:all
```
Open http://localhost:3000 with your browser to see the result.

## Available Scripts
---
* dev - Start development server

* uild - Build for production

* start - Start production server

* lint - Run ESLint

* dev:all - Start dev server and webhook tunnel (for local Stripe/webhooks)