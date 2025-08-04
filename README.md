# Pathfinder - AI Course Generator

A modern, professional learning platform that generates personalized AI-powered courses tailored to your learning goals.

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Course Generation**: Create personalized courses with structured weekly modules
- **Interactive Learning**: Engage with quizzes, videos, and reading materials
- **Progress Tracking**: Monitor your learning journey with detailed analytics
- **Course Management**: Archive, restore, and manage your courses efficiently

### 🎨 Professional UI/UX
- **Modern Design System**: Built with Mantine UI and professional design tokens
- **Dark/Light Mode**: Seamless theme switching with optimized color schemes
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessibility**: WCAG compliant with proper focus states and screen reader support
- **Loading States**: Professional loading spinners and skeleton screens
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

### 🚀 Technical Excellence
- **TypeScript**: Full type safety throughout the application
- **Next.js 14**: Latest features with App Router and Server Components
- **tRPC**: End-to-end type-safe API calls
- **Prisma**: Type-safe database operations
- **NextAuth.js**: Secure authentication with Google OAuth
- **Professional Architecture**: Clean component structure and separation of concerns

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Mantine UI v7
- **Styling**: CSS Custom Properties, Tailwind CSS
- **Backend**: tRPC, Prisma
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js with Google OAuth
- **Deployment**: Vercel (recommended)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pathfinder.git
   cd pathfinder
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # OpenAI (for AI course generation)
   OPENAI_API_KEY="your-openai-api-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
pathfinder/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── _components/        # Shared components
│   │   ├── api/               # API routes
│   │   ├── course/            # Course pages
│   │   ├── dashboard/         # Dashboard pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── Layout.tsx         # Main layout component
│   │   ├── ContentRenderer.tsx # Course content renderer
│   │   ├── LoadingSpinner.tsx # Professional loading states
│   │   ├── ErrorBoundary.tsx  # Error handling
│   │   └── EmptyState.tsx     # Empty state components
│   ├── server/                # Server-side code
│   │   ├── api/              # tRPC API
│   │   ├── auth/             # Authentication
│   │   └── db.ts             # Database connection
│   ├── styles/               # Global styles
│   ├── trpc/                 # tRPC client setup
│   └── types/                # TypeScript types
├── prisma/                   # Database schema
├── public/                   # Static assets
└── package.json
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563eb) - Trust, professionalism
- **Success**: Green (#22c55e) - Achievement, progress
- **Warning**: Yellow (#f59e0b) - Attention, caution
- **Error**: Red (#ef4444) - Errors, destructive actions
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font**: Geist Sans (Google Fonts)
- **Scale**: Professional typography scale (xs to 5xl)
- **Line Heights**: Optimized for readability

### Spacing System
- **Consistent**: 4px base unit system
- **Responsive**: Adaptive spacing for different screen sizes
- **Professional**: Industry-standard spacing patterns

### Components
- **Consistent**: Unified component design patterns
- **Accessible**: WCAG 2.1 AA compliance
- **Responsive**: Mobile-first design approach
- **Interactive**: Smooth animations and transitions

## 🔧 Development

### Code Quality
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **TypeScript**: Type safety and IntelliSense
- **Professional Standards**: Industry best practices

### Testing
```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
OPENAI_API_KEY="your-openai-api-key"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mantine UI](https://mantine.dev/) for the excellent component library
- [Next.js](https://nextjs.org/) for the amazing React framework
- [tRPC](https://trpc.io/) for type-safe APIs
- [Prisma](https://www.prisma.io/) for the database toolkit
- [NextAuth.js](https://next-auth.js.org/) for authentication

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Join our community discussions

---

**Built with ❤️ and modern web technologies**
