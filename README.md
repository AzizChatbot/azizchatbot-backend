# AzizChatbot Backend 🔧

The core backend API service for AzizChatbot - handling authentication, user management, chat sessions, and communication between the frontend and AI services.  Built with Express.js and TypeScript.

## ✨ Features

- **Authentication**: Secure user authentication powered by Better Auth
- **Database Management**: PostgreSQL with Prisma ORM
- **Email Service**: Nodemailer integration for user notifications
- **CAPTCHA Protection**: Cloudflare Turnstile integration
- **Rate Limiting**: Configurable message limits per user using Redis
- **Docker Support**: Fully containerized for easy deployment

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Rate limiting**: Redis
- **Authentication**: Better Auth
- **Validation**: Zod
- **HTTP Client**: Axios
- **Email**: Nodemailer
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18 or higher
- pnpm
- PostgreSQL database
- Redis server
- AI service running [azizchatbot-ai](https://github. com/AzizChatbot/azizchatbot-ai)

## 🚀 Installation

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AzizChatbot/azizchatbot-backend.git
   cd azizchatbot-backend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file based on `.env. example`:
   ```env
   DATABASE_URL="postgresql://user:password@host/aziz"

   MAIL_HOST=""
   MAIL_USER=""
   MAIL_PASS=""
   MAIL_SENDER=""

   CLIENT_URL="http://localhost:3000"

   OPENAI_KEY=""

   UNI_CID=""
   UNI_SECRET=""

   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"

   AI_URL="http://localhost:5000"

   REDIS_URL=""
   MAX_MSGS=15

   CAPTCHA_SECRET_KEY=""
   ```

4. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   pnpm start
   ```

### Docker Setup

```bash
docker-compose up --build
```

## 📁 Project Structure

```
azizchatbot-backend/
├── src/
│   ├── index.ts          # Application entry point
│   ├── middleware/       # Express middleware
│   ├── routes/           # API route handlers
│   ├── schemas/          # Zod validation schemas
│   └── utils/            # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
├── package.json          # Dependencies and scripts
├── Dockerfile            # Docker configuration
├── docker-compose. yaml   # Docker Compose configuration
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start the server |
| `pnpm start:prod` | Generate Prisma client and start server |

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ for King Abdulaziz University</p>
