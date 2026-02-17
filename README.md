# AI-Powered Assistant with Tool Calling

A chat-based AI assistant built with Next.js that can call real-world tools to fetch live weather data, Formula 1 race schedules, and stock prices. Built with modern web technologies and a clean, modular architecture.

## Features

- **OAuth Authentication** — Sign in with Google or GitHub via NextAuth.js v5
- **AI Chat Interface** — Real-time streaming responses powered by Vercel AI SDK
- **Tool Calling** — The AI assistant can invoke 3 real-world tools:
  - **Weather** — Fetches live weather data from OpenWeatherMap API
  - **F1 Races** — Gets upcoming Formula 1 race information from Ergast API
  - **Stock Prices** — Retrieves real-time stock data from Alpha Vantage API
- **Chat History Persistence** — Conversations are stored in a PostgreSQL database
- **Protected Routes** — Only authenticated users can access the chat interface
- **SSR + CSR Mix** — Server-side rendering for auth checks and data fetching, client-side rendering for interactive chat

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Framework      | Next.js 15 (App Router, TypeScript) |
| UI Components  | shadcn/ui + Tailwind CSS            |
| Authentication | NextAuth.js v5 (Google + GitHub)    |
| AI Integration | Vercel AI SDK (`streamText` + tools)|
| LLM Provider   | Google Gemini 2.5 Flash (free tier)  |
| Database       | Neon PostgreSQL                     |
| ORM            | Drizzle ORM                         |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (SSR)
│   ├── page.tsx                # Landing page (SSR)
│   ├── login/page.tsx          # Login page (SSR + CSR)
│   ├── chat/
│   │   ├── page.tsx            # Chat page (SSR shell)
│   │   └── chat-page-client.tsx # Chat page (CSR interactive)
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth API routes
│       └── chat/route.ts       # AI streaming endpoint
├── components/
│   ├── chat/                   # Chat UI components
│   ├── tools/                  # Tool result cards (Weather, F1, Stock)
│   ├── auth/                   # Auth components
│   └── ui/                     # shadcn/ui base components
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── db.ts                   # Drizzle + Neon connection
│   ├── tools.ts                # AI tool definitions
│   └── utils.ts                # Utility functions
├── db/
│   └── schema.ts               # Drizzle schema definitions
└── actions/
    └── chat.ts                 # Server actions for chat persistence
```

## Setup Instructions

### Prerequisites

- Node.js 20+ and npm
- A [Neon](https://neon.tech) database account
- OAuth credentials for [Google](https://console.cloud.google.com/apis/credentials) and [GitHub](https://github.com/settings/developers)
- A [Google Gemini](https://aistudio.google.com/apikey) API key (free)
- An [OpenWeatherMap](https://openweathermap.org/api) API key
- An [Alpha Vantage](https://www.alphavantage.co/support/#api-key) API key

### 1. Clone and Install

```bash
git clone https://github.com/Pritam-Git01/ai-assistant.git
cd ai-assistant
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Database
DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require

# NextAuth
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_URL=http://localhost:3000

# Google OAuth
AUTH_GOOGLE_ID=<your-google-client-id>
AUTH_GOOGLE_SECRET=<your-google-client-secret>

# GitHub OAuth
AUTH_GITHUB_ID=<your-github-client-id>
AUTH_GITHUB_SECRET=<your-github-client-secret>

# Google Gemini (free)
GOOGLE_GENERATIVE_AI_API_KEY=<your-gemini-api-key>

# Tool APIs
OPENWEATHERMAP_API_KEY=<your-openweathermap-api-key>
ALPHA_VANTAGE_API_KEY=<your-alpha-vantage-api-key>
```

### 3. Set Up the Database

Push the schema to your Neon database:

```bash
npm run db:push
```

Or generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Set Up OAuth Callbacks

For Google OAuth, add this authorized redirect URI:
```
http://localhost:3000/api/auth/callback/google
```

For GitHub OAuth, set the authorization callback URL:
```
http://localhost:3000/api/auth/callback/github
```

## Architecture Decisions

### SSR + CSR Mix

- **Server-Side Rendered**: Landing page, login page shell, auth checks, initial chat history fetch
- **Client-Side Rendered**: Interactive chat interface, real-time AI streaming, tool result rendering, chat sidebar interactions

### Server Actions

Used for all database operations (creating chats, saving messages, loading chat history, deleting chats) to keep data fetching close to the server.

### Tool Calling

The AI assistant uses Vercel AI SDK's `streamText` with `tools` parameter. When the model determines a tool should be called based on the user's message, it generates a tool call that executes server-side and returns structured data rendered in custom UI cards.



## License

MIT
