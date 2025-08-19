# My City Hall API

A modern Node.js API for city hall service management built with Fastify, TypeScript, Prisma, Zod, and Swagger.

## Features

- 🚀 **Fastify** - High-performance web framework
- 🔷 **TypeScript** - Type-safe development
- 🗄️ **Prisma** - Modern database ORM
- ✅ **Zod** - Schema validation
- 📚 **Swagger** - API documentation
- 🔐 **Multi-tenant** - Support for multiple cities
- 🎫 **Ticket System** - Service request management
- 👥 **RBAC** - Role-based access control
- 📊 **Audit Logs** - Complete activity tracking

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL (via Neon)
- **ORM**: Prisma
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd api-minha-prefeitura
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the .env file and update with your database URL
cp .env.example .env
```

4. Update the `.env` file with your database connection:
```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
NODE_ENV=development
PORT=3000
```

5. Generate Prisma client:
```bash
npm run db:generate
```

6. Run database migrations:
```bash
npm run db:migrate
```

## Development

Start the development server:
```bash
npm run dev
```

The API will be available at:
- **API**: http://localhost:3000
- **Documentation**: http://localhost:3000/documentation
- **Health Check**: http://localhost:3000/health

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (soft delete)
- `POST /api/users/:id/pii` - Create user PII data
- `POST /api/users/login` - User login

### Tenants
- `GET /api/tenants` - Get all tenants
- `GET /api/tenants/:id` - Get tenant by ID
- `POST /api/tenants` - Create new tenant
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant (soft delete)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category (soft delete)

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service (soft delete)

### Tickets
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get ticket by ID with history
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket (soft delete)

## Database Schema

The application uses a multi-tenant architecture with the following main entities:

- **Tenant** - Represents a city/municipality
- **User** - System users (citizens, employees, admins)
- **Category** - Service categories (e.g., Maintenance, Lighting)
- **Service** - Available services within categories
- **Ticket** - Service requests from citizens
- **Department** - City departments
- **Payment** - Payment processing
- **AuditLog** - Activity tracking

## Authentication & Authorization

The API supports role-based access control with the following roles:
- **SUPERADMIN** - System administrator
- **ADMIN** - City hall administrator
- **MANAGER** - Department manager
- **AGENT** - Service agent/employee
- **CITIZEN** - Regular citizen

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.
