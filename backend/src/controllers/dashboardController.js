const { getDB } = require('../config/database');

const getAdminAnalytics = async (req, res) => {
  try {
    const db = getDB();
    
    // Total statistics
    const totalPets = await db.get('SELECT COUNT(*) as total FROM pets');
    const totalAdopted = await db.get('SELECT COUNT(*) as total FROM pets WHERE adoption_status = "adopted"');
    const totalAvailable = await db.get('SELECT COUNT(*) as total FROM pets WHERE adoption_status = "available"');
    const totalApplications = await db.get('SELECT COUNT(*) as total FROM adoption_applications');
    const totalUsers = await db.get('SELECT COUNT(*) as total FROM users WHERE role = "adopter"');
    
    // Adoption by pet type
    const adoptionByType = await db.all(`
      SELECT pc.name as category, COUNT(a.id) as count
      FROM adoption_applications a
      JOIN pets p ON a.pet_id = p.id
      JOIN pet_categories pc ON p.category_id = pc.id
      WHERE a.status = 'approved'
      GROUP BY pc.name
    `);
    
    // Monthly adoption trends
    const monthlyTrends = await db.all(`
      SELECT strftime('%Y-%m', application_date) as month, COUNT(*) as count
      FROM adoption_applications
      WHERE status = 'approved'
      GROUP BY strftime('%Y-%m', application_date)
      ORDER BY month DESC
      LIMIT 6
    `);
    
    // Pending applications with details
    const pendingApplications = await db.all(`
      SELECT a.id, a.application_date, a.review_notes, p.name as pet_name, u.name as applicant_name
      FROM adoption_applications a
      JOIN pets p ON a.pet_id = p.id
      JOIN users u ON a.user_id = u.id
      WHERE a.status = 'pending'
      ORDER BY a.application_date ASC
      LIMIT 5
    `);
    
    // Recent adoptions
    const recentAdoptions = await db.all(`
      SELECT a.id, a.reviewed_at, p.name as pet_name, u.name as adopter_name
      FROM adoption_applications a
      JOIN pets p ON a.pet_id = p.id
      JOIN users u ON a.user_id = u.id
      WHERE a.status = 'approved'
      ORDER BY a.reviewed_at DESC
      LIMIT 5
    `);
    
    res.json({
      total_pets: totalPets.total || 0,
      total_adopted: totalAdopted.total || 0,
      total_available: totalAvailable.total || 0,
      total_applications: totalApplications.total || 0,
      total_users: totalUsers.total || 0,
      adoption_by_type: adoptionByType || [],
      monthly_trends: monthlyTrends || [],
      pending_applications: pendingApplications || [],
      recent_adoptions: recentAdoptions || []
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getShelterAnalytics = async (req, res) => {
  try {
    const db = getDB();
    const shelterId = req.user.shelter_id || 1;
    
    const shelterPets = await db.all('SELECT * FROM pets WHERE shelter_id = ?', shelterId);
    const shelterApplications = await db.all(`
      SELECT a.*, p.name as pet_name, u.name as applicant_name, u.email as applicant_email
      FROM adoption_applications a
      JOIN pets p ON a.pet_id = p.id
      JOIN users u ON a.user_id = u.id
      WHERE p.shelter_id = ?
      ORDER BY a.application_date DESC
    `, shelterId);
    
    const stats = {
      total_pets: shelterPets.length,
      available_pets: shelterPets.filter(p => p.adoption_status === 'available').length,
      adopted_pets: shelterPets.filter(p => p.adoption_status === 'adopted').length,
      pending_applications: shelterApplications.filter(a => a.status === 'pending').length,
      total_applications: shelterApplications.length
    };
    
    res.json({
      pets: shelterPets,
      applications: shelterApplications,
      stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAdminAnalytics, getShelterAnalytics };