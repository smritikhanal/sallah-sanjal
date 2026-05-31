# Database Seeding Guide

This guide explains how to seed the Sallah Sanjal database with demo data.

## Available Seeding Scripts

### 1. Basic Seed Script (seed.js)
Seeds minimal demo data:
- 1 Admin user
- 1 Demo client
- 1 Verified worker
- 3 Unverified workers
- Basic bookings and messages

**Run:**
```bash
npm run seed
```

### 2. Comprehensive Seed Script (seed-comprehensive.js) ⭐ RECOMMENDED
Seeds complete demo data matching the UI dashboards:
- 1 Admin user
- 4 Clients
- 4 Workers (with different services and verification statuses)
- 4 Bookings (various statuses: pending, confirmed, completed)
- 2 Reviews with ratings
- 3 Conversations with messages
- Payments data
- Service assignments

**Run:**
```bash
npm run seed:comprehensive
```

## What Gets Seeded

### Users
```
Admin:
  Email: admin@example.com
  Password: admin123

Clients:
  demo@example.com
  rani@example.com
  ravi@example.com
  maya@example.com
  Password: password (all clients)

Workers:
  raj@example.com (Plumbing, Verified)
  anil@example.com (Carpentry, Verified)
  sunita@example.com (Electrical, Unverified)
  priya@example.com (Cleaning, Verified)
  Password: password (all workers)
```

### Related Data
- **Service Categories**: 10 pre-defined services (Plumbing, Carpentry, Electrical, etc.)
- **Worker Profiles**: Complete profiles with bio, experience, ratings
- **Bookings**: Multiple bookings with different statuses
- **Reviews**: Ratings and feedback from completed bookings
- **Conversations**: Chat histories between clients and workers
- **Messages**: Sample messages in conversations
- **Payments**: Payment records for bookings

## Database Schema

The seeding scripts use the schema defined in `database/schema.sql` which includes:

### Tables
1. `users` - All platform users (admin, client, worker)
2. `worker_profiles` - Extended profile data for workers
3. `service_categories` - Available services
4. `worker_services` - Many-to-many: worker expertise
5. `bookings` - Service booking records
6. `reviews` - Ratings and feedback
7. `conversations` - Chat channels
8. `messages` - Individual messages
9. `payments` - Payment transactions

### Relationships
```
users (1) ---→ (many) worker_profiles
users (1) ---→ (many) bookings (as client)
worker_profiles (1) ---→ (many) bookings (as worker)
service_categories (1) ---→ (many) worker_services
worker_profiles (1) ---→ (many) worker_services
bookings (1) ---→ (1) reviews
bookings (1) ---→ (many) payments
users (1) ---→ (many) conversations (as client/worker)
conversations (1) ---→ (many) messages
```

## Prerequisites

1. MySQL server running and accessible
2. Environment variables configured in `.env`:
   ```
   DB_HOST=localhost
   DB_USER=admin
   DB_PASSWORD=password
   DB_NAME=sallah_sanjal
   DB_PORT=3306
   ```

3. Node.js and npm installed
4. Dependencies installed: `npm install`

## Running the Seeding

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
# Copy and configure .env file
cp .env.example .env
# Edit .env with your database credentials
```

### Step 3: Run Seeding
```bash
# For comprehensive demo data (recommended)
npm run seed:comprehensive

# Or for basic seed data
npm run seed
```

### Step 4: Verify
The script will display:
- ✅ Confirmation messages for each item seeded
- 📊 Summary of seeded data
- 📝 Complete list of demo credentials

## Features of Comprehensive Seed

✅ Multiple users for realistic testing
✅ Different worker verification statuses  
✅ Bookings with various statuses (pending, confirmed, completed)
✅ Reviews and ratings for completed bookings
✅ Message conversations between users
✅ Payment records for bookings
✅ Service assignments to workers
✅ Related data with proper relationships
✅ Idempotent (safe to run multiple times)

## Customizing Seeding Data

To modify seeding data, edit the data arrays in `seed-comprehensive.js`:

### Add More Clients
Edit the `clientsData` array and add new entries.

### Add More Workers
Edit the `workersData` array with new worker information.

### Add More Bookings
Edit the `bookingsData` array with new booking records.

### Add More Reviews
Edit the `reviewsData` array and update the booking index references.

## Troubleshooting

### "Database connection failed"
- Check MySQL is running
- Verify credentials in `.env`
- Check DB_HOST is correct

### "Schema loading failed"
- Ensure `database/schema.sql` exists
- Check file path is correct relative to script location
- Verify SQL syntax is valid

### "Email already exists"
- The scripts are idempotent - existing records won't be duplicated
- To completely reset, drop the database and run seed again

### Reset Database Completely
```bash
# Connect to MySQL and run:
DROP DATABASE sallah_sanjal;
# Then run the seed script
npm run seed:comprehensive
```

## Integration with Applications

### Frontend
- Login with any demo account
- All data from database will be displayed
- Create real bookings/messages as needed

### Admin Panel
- Login as: admin@example.com / admin123
- View all users, bookings, reviews
- Manage workers and clients

### Mobile/API
- All seeded data is accessible via REST API
- Authentication required for most endpoints
- Use the provided credentials

## Next Steps

1. ✅ Run seeding: `npm run seed:comprehensive`
2. 🚀 Start backend: `npm start`
3. 🚀 Start frontend: `npm run dev` (in frontend/)
4. 🌐 Open http://localhost:5173
5. 📝 Login with demo credentials

## Support

For issues or questions:
- Check MySQL error logs
- Review schema in `database/schema.sql`
- Verify environment variables in `.env`
- Check Node.js console output for detailed errors
