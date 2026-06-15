// Database seeder — creates demo users, profiles, bookings, and messages
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true,
};

const DB_NAME = process.env.DB_NAME || 'sallah_sanjal';

async function seed() {
  let connection;
  try {
    console.log('🔗 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);

    // Create database if it doesn't exist
    console.log(`📦 Creating database "${DB_NAME}" if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    await connection.query(`USE ${DB_NAME}`);
    console.log('✅ Database ready');

    // Read and execute schema
    console.log('📝 Loading database schema...');
    const schemaPath = path.join(__dirname, '../../..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists')) {
          console.warn('⚠️ Warning:', error.message);
        }
      }
    }
    console.log('✅ Schema loaded');

    // Hash passwords
    const hashedPassword = await bcrypt.hash('password', 10);
    const hashedWorkerPassword = await bcrypt.hash('password', 10);

    console.log('👤 Seeding demo users...');

    // Hash admin password
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    // Check if admin already exists
    const [existingAdmin] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@example.com']
    );

    let adminId;
    if (existingAdmin.length === 0) {
      const [adminResult] = await connection.query(
        'INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['admin@example.com', hashedAdminPassword, 'Admin', 'User', '+977 9800000000', 'admin', true]
      );
      adminId = adminResult.insertId;
      console.log('✅ Admin user created (admin@example.com)');
    } else {
      adminId = existingAdmin[0].id;
      console.log('ℹ️  Admin user already exists');
    }

    // Check if demo client already exists
    const [existingClient] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['demo@example.com']
    );

    let clientId;
    if (existingClient.length === 0) {
      const [clientResult] = await connection.query(
        'INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['demo@example.com', hashedPassword, 'Demo', 'Client', '+977 9841234567', 'client', true]
      );
      clientId = clientResult.insertId;
      console.log('✅ Demo client created (demo@example.com)');
    } else {
      clientId = existingClient[0].id;
      console.log('ℹ️  Demo client already exists');
    }

    // Check if demo verified worker already exists
    const [existingWorker] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['worker@example.com']
    );

    let workerId;
    if (existingWorker.length === 0) {
      const [workerResult] = await connection.query(
        'INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['worker@example.com', hashedWorkerPassword, 'Raj', 'Sharma', '+977 9843456789', 'worker', true]
      );
      workerId = workerResult.insertId;
      console.log('✅ Verified worker created (worker@example.com)');
    } else {
      workerId = existingWorker[0].id;
      console.log('ℹ️  Verified worker already exists');
    }

    // Create verified worker profile
    console.log('💼 Creating worker profiles...');
    const [existingProfile] = await connection.query(
      'SELECT id FROM worker_profiles WHERE user_id = ?',
      [workerId]
    );

    let workerProfileId;
    if (existingProfile.length === 0) {
      const [profileResult] = await connection.query(
        `INSERT INTO worker_profiles 
        (user_id, bio, location, hourly_rate, is_verified, verification_date, experience_years, total_bookings, average_rating) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          workerId,
          'Experienced plumber with 8+ years of professional expertise. Reliable, trustworthy, and committed to quality work.',
          'Kathmandu',
          500,
          true,
          new Date(),
          8,
          125,
          4.8
        ]
      );
      workerProfileId = profileResult.insertId;
      console.log('✅ Verified worker profile created');
    } else {
      workerProfileId = existingProfile[0].id;
      console.log('ℹ️  Verified worker profile already exists');
    }

    // Create unverified workers
    const unverifiedWorkers = [
      { name: 'Anil', email: 'anil.worker@example.com', category: 'Electrician', location: 'Bhaktapur', rate: 400 },
      { name: 'Sunita', email: 'sunita.worker@example.com', category: 'Cleaning', location: 'Lalitpur', rate: 300 },
      { name: 'Kumar', email: 'kumar.worker@example.com', category: 'Carpentry', location: 'Kathmandu', rate: 550 },
    ];

    for (const unverifiedWorker of unverifiedWorkers) {
      const [existingUnverified] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [unverifiedWorker.email]
      );

      if (existingUnverified.length === 0) {
        const [workerResult] = await connection.query(
          'INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [unverifiedWorker.email, hashedWorkerPassword, unverifiedWorker.name, 'Test', `+977 984${Math.floor(Math.random() * 9000000 + 1000000)}`, 'worker', true]
        );
        const newWorkerId = workerResult.insertId;

        // Create unverified profile
        await connection.query(
          `INSERT INTO worker_profiles 
          (user_id, bio, location, hourly_rate, is_verified, experience_years, total_bookings, average_rating) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newWorkerId,
            `Professional ${unverifiedWorker.category} service provider. Ready to serve you.`,
            unverifiedWorker.location,
            unverifiedWorker.rate,
            false,
            Math.floor(Math.random() * 10 + 1),
            Math.floor(Math.random() * 50),
            Math.random() * 5
          ]
        );
        console.log(`✅ Unverified worker created (${unverifiedWorker.email})`);
      }
    }
    console.log('✅ All worker profiles created');

    // Add services to worker (Plumbing category)
    console.log('🔧 Adding services to worker...');
    const [services] = await connection.query(
      'SELECT id FROM service_categories WHERE name = ?',
      ['Plumbing']
    );

    if (services.length > 0) {
      const [existingService] = await connection.query(
        'SELECT id FROM worker_services WHERE worker_id = ? AND service_id = ?',
        [workerProfileId, services[0].id]
      );

      if (existingService.length === 0) {
        await connection.query(
          'INSERT INTO worker_services (worker_id, service_id, service_description) VALUES (?, ?, ?)',
          [workerProfileId, services[0].id, 'Full range of plumbing services including repairs, installations, and maintenance']
        );
        console.log('✅ Services added to worker');
      } else {
        console.log('ℹ️  Services already assigned');
      }
    }

    // Create sample booking
    console.log('📅 Creating sample booking...');
    const [existingBooking] = await connection.query(
      'SELECT id FROM bookings WHERE client_id = ? AND worker_id = ? LIMIT 1',
      [clientId, workerProfileId]
    );

    if (existingBooking.length === 0) {
      const [bookingResult] = await connection.query(
        `INSERT INTO bookings 
        (client_id, worker_id, service_id, booking_date, duration_hours, status, estimated_cost, location, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientId,
          workerProfileId,
          services[0]?.id || 1,
          new Date('2026-04-10'),
          2,
          'completed',
          3000,
          'Kathmandu',
          'Fixed leaking tap in kitchen'
        ]
      );
      console.log('✅ Sample booking created');
    } else {
      console.log('ℹ️  Sample booking already exists');
    }

    // Create conversation
    console.log('💬 Creating conversation...');
    const [existingConversation] = await connection.query(
      'SELECT id FROM conversations WHERE client_id = ? AND worker_id = ?',
      [clientId, workerId]
    );

    let conversationId;
    if (existingConversation.length === 0) {
      const [conversationResult] = await connection.query(
        'INSERT INTO conversations (client_id, worker_id) VALUES (?, ?)',
        [clientId, workerId]
      );
      conversationId = conversationResult.insertId;
      console.log('✅ Conversation created');
    } else {
      conversationId = existingConversation[0].id;
      console.log('ℹ️  Conversation already exists');
    }

    // Add sample messages
    console.log('✉️  Adding sample messages...');
    const [existingMessages] = await connection.query(
      'SELECT id FROM messages WHERE conversation_id = ?',
      [conversationId]
    );

    if (existingMessages.length === 0) {
      const messages = [
        { sender_id: clientId, message: 'Hi Raj, can you help with my plumbing issue?' },
        { sender_id: workerId, message: 'Of course! I can come tomorrow morning. What\'s the issue?' },
        { sender_id: clientId, message: 'Great! There\'s a leaking tap in the kitchen.' },
        { sender_id: workerId, message: 'I can fix that easily. See you tomorrow at 10 AM!' },
      ];

      for (const msg of messages) {
        await connection.query(
          'INSERT INTO messages (conversation_id, sender_id, message, is_read) VALUES (?, ?, ?, ?)',
          [conversationId, msg.sender_id, msg.message, msg.sender_id === clientId ? false : true]
        );
      }
      console.log('✅ Sample messages added');
    } else {
      console.log('ℹ️  Messages already exist');
    }

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📝 Demo Credentials:');
    console.log('   Admin:');
    console.log('   └─ Email: admin@example.com');
    console.log('   └─ Password: admin123');
    console.log('');
    console.log('   Client:');
    console.log('   └─ Email: demo@example.com');
    console.log('   └─ Password: password');
    console.log('');
    console.log('   Verified Worker:');
    console.log('   └─ Email: worker@example.com');
    console.log('   └─ Password: password');
    console.log('');
    console.log('   Unverified Workers:');
    console.log('   └─ anil.worker@example.com (Electrician)');
    console.log('   └─ sunita.worker@example.com (Cleaning)');
    console.log('   └─ kumar.worker@example.com (Carpentry)');
    console.log('   └─ Password: password (all)');
    console.log('');
    console.log('🚀 Run: npm start (in backend/)');
    console.log('🌐 Frontend: http://localhost:5173');
    console.log('');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seed();
