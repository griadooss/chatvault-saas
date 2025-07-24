# ChatVault - Chat Management and Archival System

A modern SaaS application for storing, categorizing, and searching through chat histories. Built with React, Node.js, and PostgreSQL.

## Features

- **Chat Upload**: Upload chat files in multiple formats (MD, TXT, HTML)
- **Categorization**: Organize chats with categories, subcategories, projects, and phases
- **Search & Filter**: Advanced search and filtering capabilities
- **Export**: Export chats in original or HTML format
- **Multi-tenant**: User isolation and data security
- **Modern UI**: Built with React, Tailwind CSS, and Headless UI

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 14** for routing and SSR
- **Tailwind CSS** for styling
- **Headless UI** for accessible components
- **React Hook Form** for form handling
- **NextAuth.js** for authentication

### Backend
- **Node.js** with TypeScript
- **Express.js** for API routes
- **Prisma ORM** for database management
- **PostgreSQL** for data storage
- **Multer** for file uploads
- **JWT** for authentication

### Deployment
- **Railway** for backend hosting
- **Vercel** for frontend hosting
- **PostgreSQL** on Railway

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Railway account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ChatVault
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend (.env)
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-jwt-secret"
   PORT=3001
   
   # Frontend (.env.local)
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:8080"
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

### Deployment

1. **Deploy backend to Railway**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

2. **Deploy frontend to Vercel**
   ```bash
   cd frontend
   vercel --prod
   ```

## Database Schema

The application uses a multi-tenant architecture with the following main entities:

- **Users**: Authentication and user management
- **Chats**: Main chat records with metadata
- **Sources**: Chat platforms (WhatsApp, Telegram, etc.)
- **Categories**: Main chat categories
- **Subcategories**: Detailed categorization
- **Projects**: Project-based organization
- **Phases**: Project phases
- **FileFormats**: Supported file types

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Chats
- `GET /api/chats` - List chats (with filtering)
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get chat details
- `PUT /api/chats/:id` - Update chat
- `DELETE /api/chats/:id` - Delete chat
- `POST /api/chats/:id/export` - Export chat

### Management
- `GET /api/sources` - List sources
- `GET /api/categories` - List categories
- `GET /api/subcategories` - List subcategories
- `GET /api/projects` - List projects
- `GET /api/phases` - List phases

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub.
# Force Vercel redeploy
# Force Vercel to rebuild from latest commit
