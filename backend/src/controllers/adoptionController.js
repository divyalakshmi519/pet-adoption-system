const { getDB } = require('../config/database');

const applyForAdoption = async (req, res) => {
  try {
    const { pet_id, review_notes } = req.body;
    const db = getDB();

    if (!pet_id) {
      return res.status(400).json({ message: 'Pet ID is required' });
    }

    // Check if pet exists and is available
    const pet = await db.get('SELECT * FROM pets WHERE id = ?', pet_id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    if (pet.adoption_status === 'adopted') {
      return res.status(400).json({ message: 'Pet is already adopted' });
    }

    // Check if user already has a pending application for this pet
    const existingApplication = await db.get(
      'SELECT id FROM adoption_applications WHERE pet_id = ? AND user_id = ? AND status IN ("pending", "approved")',
      [pet_id, req.user.id]
    );
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You already have an active application for this pet' });
    }

    // Create adoption application
    const result = await db.run(
      `INSERT INTO adoption_applications (pet_id, user_id, review_notes, status)
       VALUES (?, ?, ?, 'pending')`,
      [pet_id, req.user.id, review_notes || '']
    );

    // Update pet status to pending
    await db.run('UPDATE pets SET adoption_status = "pending" WHERE id = ?', pet_id);

    res.status(201).json({ 
      message: 'Adoption application submitted successfully',
      application_id: result.lastID
    });
  } catch (error) {
    console.error('Apply for adoption error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateAdoptionStatus = async (req, res) => {
  try {
    const { status, review_notes } = req.body;
    const db = getDB();

    if (!status || !['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    // Get application details
    const application = await db.get(
      'SELECT * FROM adoption_applications WHERE id = ?',
      req.params.id
    );
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if trying to approve an already adopted pet
    if (status === 'approved') {
      const pet = await db.get('SELECT * FROM pets WHERE id = ?', application.pet_id);
      if (pet.adoption_status === 'adopted') {
        return res.status(400).json({ message: 'This pet has already been adopted' });
      }
      
      // Update pet status to adopted
      await db.run('UPDATE pets SET adoption_status = "adopted" WHERE id = ?', application.pet_id);
    } else if (status === 'rejected' && application.status === 'approved') {
      // If rejecting an approved application, make pet available again
      await db.run('UPDATE pets SET adoption_status = "available" WHERE id = ?', application.pet_id);
    } else if (status === 'rejected') {
      // Make pet available again
      await db.run('UPDATE pets SET adoption_status = "available" WHERE id = ?', application.pet_id);
    }

    // Update application status
    await db.run(
      `UPDATE adoption_applications 
       SET status = ?, review_notes = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, review_notes || application.review_notes, req.user.id, req.params.id]
    );

    // Add to approvals table if approved
    if (status === 'approved') {
      await db.run(
        `INSERT INTO approvals (application_id, approved_by, comments)
         VALUES (?, ?, ?)`,
        [req.params.id, req.user.id, review_notes || '']
      );
    }

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Update adoption status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserApplications = async (req, res) => {
  try {
    const db = getDB();
    const userId = req.params.userId || req.user.id;
    
    const applications = await db.all(
      `SELECT a.*, p.name as pet_name, p.breed, p.image_url,
              pc.name as pet_category, u.name as reviewer_name
       FROM adoption_applications a
       JOIN pets p ON a.pet_id = p.id
       JOIN pet_categories pc ON p.category_id = pc.id
       LEFT JOIN users u ON a.reviewed_by = u.id
       WHERE a.user_id = ?
       ORDER BY a.application_date DESC`,
      userId
    );

    res.json(applications || []);
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const db = getDB();
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT a.*, p.name as pet_name, p.breed, p.image_url,
             u.name as applicant_name, u.email as applicant_email,
             pc.name as pet_category
      FROM adoption_applications a
      JOIN pets p ON a.pet_id = p.id
      JOIN users u ON a.user_id = u.id
      JOIN pet_categories pc ON p.category_id = pc.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.application_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const applications = await db.all(query, params);
    
    const countQuery = `SELECT COUNT(*) as total FROM adoption_applications a WHERE 1=1 ${status ? 'AND a.status = ?' : ''}`;
    const countParams = status ? [status] : [];
    const countResult = await db.get(countQuery, countParams);

    res.json({
      applications: applications || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult?.total || 0,
        totalPages: Math.ceil((countResult?.total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  applyForAdoption, 
  updateAdoptionStatus, 
  getUserApplications,
  getAllApplications 
};