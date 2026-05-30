# Sallah Sanjal 🛠️

A professional services marketplace platform connecting clients with skilled professionals (plumbers, carpenters, lawyers, therapists, etc.) in Nepal.

## Project Structure

```
sallah_sanjal/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── config/       # Database & JWT config
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth & error handlers
│   │   ├── routes/       # API endpoints
│   │   ├── utils/        # Helper functions
│   │   └── server.js     # Main server entry
│   ├── package.json
│   └── .env.example
├── frontend/             # React/Vite frontend
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API integration
│   │   ├── styles/       # Global CSS
│   │   ├── utils/        # Utilities & store
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # React entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── database/             # Database schema
│   └── schema.sql        # MySQL database script
└── README.md             # This file
```

## Tech Stack

- **Frontend:** React 18 + Vite, TailwindCSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Real-time Chat:** Socket.io
- **Auth:** JWT (access + refresh tokens)

## Features

### For Clients
- Search and filter professionals by category, location, and rating
- View detailed worker profiles with service offerings and reviews
- Book appointments and manage bookings
- Real-time chat with professionals
- Leave reviews and ratings

### For Workers
- Create professional profile with bio, services, and hourly rate
- Manage bookings and schedule
- Track earnings and client reviews
- Respond to booking inquiries
- Real-time chat with clients

### For Admins
- User management and verification
- Dispute resolution
- Platform analytics
- Worker verification workflow

## Database Schema

### Core Tables
- **users** - All platform users (admin, client, worker)
- **worker_profiles** - Extended worker information
- **service_categories** - Master list of available services
- **worker_services** - Many-to-many relationship between workers and services
- **bookings** - Appointment/service bookings
- **reviews** - Ratings and feedback from clients
- **conversations** - Chat channels between users
- **messages** - Individual messages in conversations
- **payments** - Payment transaction tracking

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

### Backend Setup

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup MySQL database:**
   ```bash
   # Login to MySQL
   mysql -u usname -p
   
   # Run the schema file
   source ../database/schema.sql
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MySQL credentials:
   # DB_USER=usname
   # DB_PASSWORD=password
   # DB_NAME=sallah_sanjal
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Frontend will connect to http://localhost:5000 by default
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Database Initialization

The `schema.sql` file includes:
- Complete table definitions with proper relationships
- Indexes for performance
- Sample service categories (Plumbing, Carpentry, Legal, Therapy, etc.)

To initialize:
```bash
mysql -u usname -p sallah_sanjal < database/schema.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token

### Workers
- `GET /api/workers/all` - Get all verified workers
- `GET /api/workers/:workerId` - Get worker profile details
- `POST /api/workers/profile` - Create/update worker profile (protected)
- `POST /api/workers/services` - Add service to worker profile (protected)

### Bookings
- `POST /api/bookings` - Create new booking (protected)
- `GET /api/bookings` - Get user's bookings (protected)
- `GET /api/bookings/:bookingId` - Get booking details (protected)
- `PUT /api/bookings/:bookingId` - Update booking status (protected)

### Reviews
- `POST /api/reviews` - Create review (protected)
- `GET /api/reviews/worker/:workerId` - Get worker reviews (public)
- `GET /api/reviews/user/reviews` - Get user's reviews (protected)

### Chat
- `POST /api/chat/conversation` - Get or create conversation (protected)
- `GET /api/chat/conversations` - Get user's conversations (protected)
- `GET /api/chat/:conversationId/messages` - Get messages (protected)
- `PUT /api/chat/messages/:messageId/read` - Mark message as read (protected)

## Socket.io Events

### Client → Server
- `user_join` - User connects to chat
- `send_message` - Send message in conversation
- `typing` - User is typing
- `stop_typing` - User stopped typing

### Server → Client
- `receive_message` - New message received
- `user_typing` - Other user is typing
- `user_stop_typing` - Other user stopped typing
- `message_sent` - Confirmation of sent message
- `error` - Socket error

## Authentication Flow

1. **Register/Login** → Get access + refresh tokens
2. **Store tokens** in localStorage
3. **API requests** include token in Authorization header: `Bearer <token>`
4. **Token expiry** → Use refresh token to get new access token
5. **Logout** → Clear tokens from localStorage

## Default Credentials (for Development)

**MySQL:**
- Username: `usname`
- Password: `password`
- Database: `sallah_sanjal`

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=usname
DB_PASSWORD=password
DB_NAME=sallah_sanjal
DB_PORT=3306
JWT_ACCESS_SECRET=your_secret_key
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Development Tips

1. **Hot Reload:** Both frontend and backend support hot reload during development
2. **Database Debugging:** Use MySQL Workbench or command line to inspect data
3. **API Testing:** Use Postman or Insomnia for API testing
4. **Socket Testing:** Use browser DevTools console to monitor Socket.io events

## Route Protection

- **Public routes:** Landing, Worker search, Register, Login
- **Protected routes:** Dashboards, Chat, Booking management, Reviews
- **Role-based access:** Admin dashboard, Worker-only actions

## Next Steps

1. Implement payment integration (Stripe, Khalti, etc.)
2. Add email notifications (nodemailer)
3. Implement admin verification workflow
4. Add image upload functionality
5. Implement search and filtering UI enhancements
6. Add analytics dashboard
7. Implement dispute resolution system

## Support

For issues or questions, please refer to the API documentation or contact the development team.

## License

MIT
