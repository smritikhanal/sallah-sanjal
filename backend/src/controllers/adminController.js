const pool = require('../config/database');

// Get admin analytics
const getAnalytics = async (req, res) => {
  try {
    // Get total workers count
    const [workers] = await pool.query(`
      SELECT COUNT(*) as total FROM worker_profiles
    `);

    // Get total unverified workers
    const [unverified] = await pool.query(`
      SELECT COUNT(*) as total FROM worker_profiles WHERE is_verified = FALSE
    `);

    // Get total customers (clients)
    const [customers] = await pool.query(`
      SELECT COUNT(*) as total FROM users WHERE role = 'client'
    `);

    // Get total bookings
    const [bookings] = await pool.query(`
      SELECT COUNT(*) as total FROM bookings
    `);

    // Get completed bookings revenue
    const [revenue] = await pool.query(`
      SELECT SUM(actual_cost) as total FROM bookings WHERE status = 'completed' AND actual_cost IS NOT NULL
    `);

    // Get pending bookings count
    const [pendingBookings] = await pool.query(`
      SELECT COUNT(*) as total FROM bookings WHERE status = 'pending'
    `);

    return res.status(200).json({
      success: true,
      data: {
        totalWorkers: workers[0].total,
        unverifiedWorkers: unverified[0].total,
        totalCustomers: customers[0].total,
        totalBookings: bookings[0].total,
        totalRevenue: revenue[0].total || 0,
        pendingBookings: pendingBookings[0].total
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all workers with their details
const getAllWorkers = async (req, res) => {
  try {
    const { status } = req.query; // 'verified' or 'unverified'

    let query = `
      SELECT 
        wp.id as workerId,
        u.id as userId,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        wp.bio,
        wp.location,
        wp.hourly_rate,
        wp.is_verified,
        wp.verification_date,
        wp.experience_years,
        wp.total_bookings,
        wp.average_rating,
        wp.created_at,
        u.profile_picture,
        GROUP_CONCAT(sc.name SEPARATOR ', ') as services
      FROM worker_profiles wp
      JOIN users u ON wp.user_id = u.id
      LEFT JOIN worker_services ws ON wp.id = ws.worker_id
      LEFT JOIN service_categories sc ON ws.service_id = sc.id
    `;

    if (status === 'verified') {
      query += ' WHERE wp.is_verified = TRUE';
    } else if (status === 'unverified') {
      query += ' WHERE wp.is_verified = FALSE';
    }

    query += ' GROUP BY wp.id ORDER BY wp.created_at DESC';

    const [workers] = await pool.query(query);

    return res.status(200).json({
      success: true,
      data: workers
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get single worker detail
const getWorkerDetail = async (req, res) => {
  try {
    const { workerId } = req.params;

    const [workers] = await pool.query(`
      SELECT 
        wp.id as workerId,
        u.id as userId,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        wp.bio,
        wp.location,
        wp.latitude,
        wp.longitude,
        wp.hourly_rate,
        wp.is_verified,
        wp.verification_date,
        wp.experience_years,
        wp.total_bookings,
        wp.average_rating,
        wp.created_at,
        u.profile_picture,
        GROUP_CONCAT(sc.name SEPARATOR ', ') as services
      FROM worker_profiles wp
      JOIN users u ON wp.user_id = u.id
      LEFT JOIN worker_services ws ON wp.id = ws.worker_id
      LEFT JOIN service_categories sc ON ws.service_id = sc.id
      WHERE wp.id = ?
      GROUP BY wp.id
    `, [workerId]);

    if (workers.length === 0) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Get recent bookings
    const [bookings] = await pool.query(`
      SELECT 
        b.id,
        b.booking_date,
        b.duration_hours,
        b.status,
        b.estimated_cost,
        b.actual_cost,
        u.first_name,
        u.last_name
      FROM bookings b
      JOIN users u ON b.client_id = u.id
      WHERE b.worker_id = ?
      ORDER BY b.created_at DESC
      LIMIT 5
    `, [workerId]);

    // Get recent reviews
    const [reviews] = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.first_name,
        u.last_name
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.worker_id = ?
      ORDER BY r.created_at DESC
      LIMIT 5
    `, [workerId]);

    return res.status(200).json({
      success: true,
      data: {
        worker: workers[0],
        bookings: bookings,
        reviews: reviews
      }
    });
  } catch (error) {
    console.error('Error fetching worker detail:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Verify a worker
const verifyWorker = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { approve } = req.body;

    if (approve) {
      // Verify the worker
      await pool.query(
        'UPDATE worker_profiles SET is_verified = TRUE, verification_date = NOW() WHERE id = ?',
        [workerId]
      );
      return res.status(200).json({ success: true, message: 'Worker verified successfully' });
    } else {
      // Reject worker (set is_verified to FALSE with a note if needed)
      await pool.query(
        'UPDATE worker_profiles SET is_verified = FALSE WHERE id = ?',
        [workerId]
      );
      return res.status(200).json({ success: true, message: 'Worker verification rejected' });
    }
  } catch (error) {
    console.error('Error verifying worker:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all clients
const getAllClients = async (req, res) => {
  try {
    const [clients] = await pool.query(`
      SELECT 
        u.id as clientId,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.created_at as joinDate,
        u.profile_picture,
        u.is_active as status,
        COUNT(DISTINCT b.id) as totalBookings
      FROM users u
      LEFT JOIN bookings b ON u.id = b.client_id
      WHERE u.role = 'client'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all issues/complaints
const getIssues = async (req, res) => {
  try {
    const [issues] = await pool.query(`
      SELECT 
        i.id,
        i.issue_type as issueType,
        u.first_name as reportedByFirstName,
        u.last_name as reportedByLastName,
        u.role as userType,
        i.description,
        i.created_at as reportedDate,
        i.status,
        i.resolution as resolution
      FROM issues i
      JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      data: issues
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update issue status
const updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, resolution } = req.body;

    await pool.query(
      'UPDATE issues SET status = ?, resolution = ? WHERE id = ?',
      [status, resolution || null, issueId]
    );

    return res.status(200).json({ success: true, message: 'Issue updated successfully' });
  } catch (error) {
    console.error('Error updating issue:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all testimonials
const getTestimonials = async (req, res) => {
  try {
    const [testimonials] = await pool.query(`
      SELECT 
        t.id,
        t.title,
        t.content,
        u.first_name as authorFirstName,
        u.last_name as authorLastName,
        t.rating,
        t.is_visible as visible,
        t.created_at
      FROM testimonials t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle testimonial visibility
const updateTestimonialVisibility = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    const { visible } = req.body;

    await pool.query(
      'UPDATE testimonials SET is_visible = ? WHERE id = ?',
      [visible ? 1 : 0, testimonialId]
    );

    return res.status(200).json({ success: true, message: 'Testimonial updated successfully' });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get analytics data with trends (for charts)
const getAnalyticsTrends = async (req, res) => {
  try {
    // Revenue trend by month
    const [revenueData] = await pool.query(`
      SELECT 
        DATE_FORMAT(booking_date, '%Y-%m') as month,
        SUM(actual_cost) as revenue
      FROM bookings
      WHERE status = 'completed' AND actual_cost IS NOT NULL
      GROUP BY DATE_FORMAT(booking_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    // Bookings by category
    const [categoryData] = await pool.query(`
      SELECT 
        sc.name as category,
        COUNT(b.id) as count
      FROM service_categories sc
      LEFT JOIN bookings b ON sc.id = b.service_id
      GROUP BY sc.id
      ORDER BY count DESC
    `);

    // User distribution
    const [userDistribution] = await pool.query(`
      SELECT 
        role,
        COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    // Monthly active users
    const [activeUsers] = await pool.query(`
      SELECT 
        DATE_FORMAT(booking_date, '%Y-%m') as month,
        COUNT(DISTINCT client_id) as activeClients,
        COUNT(DISTINCT worker_id) as activeWorkers
      FROM bookings
      GROUP BY DATE_FORMAT(booking_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    return res.status(200).json({
      success: true,
      data: {
        revenueData,
        categoryData,
        userDistribution,
        activeUsers
      }
    });
  } catch (error) {
    console.error('Error fetching analytics trends:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAnalytics,
  getAllWorkers,
  getWorkerDetail,
  verifyWorker,
  getAllClients,
  getIssues,
  updateIssueStatus,
  getTestimonials,
  updateTestimonialVisibility,
  getAnalyticsTrends
};
