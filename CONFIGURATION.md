# Configuration Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI Configuration (for AI course generation)
OPENAI_API_KEY="your-openai-api-key"
```

### Optional Variables

```env
# Google AI Configuration (alternative to OpenAI)
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# Development Configuration
DEBUG="*"

# Feature Flags
ENABLE_ANALYTICS="true"
ENABLE_FEEDBACK="true"
ENABLE_BETA_FEATURES="false"
```

## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local`

### 2. OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the API key to your `.env.local`

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Open Prisma Studio (optional)
npm run db:studio
```

### 4. Development Server

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Production Configuration

For production deployment, update these variables:

```env
# Production Database (PostgreSQL recommended)
DATABASE_URL="postgresql://username:password@localhost:5432/pathfinder"

# Production URL
NEXTAUTH_URL="https://yourdomain.com"

# Production Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-production-secret-key"
```

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use strong, unique secrets for production**
3. **Rotate API keys regularly**
4. **Use environment-specific configurations**
5. **Enable HTTPS in production**

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check `DATABASE_URL` format
2. **Authentication errors**: Verify Google OAuth credentials
3. **AI generation errors**: Check OpenAI API key and quota
4. **Build errors**: Ensure all dependencies are installed

### Debug Mode

Enable debug logging by adding to `.env.local`:

```env
DEBUG="*"
```

## Support

For additional help:
- Check the [README.md](README.md) for detailed setup instructions
- Open an issue on GitHub for bugs or feature requests