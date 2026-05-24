const { getDB } = require('../config/database');

const addPet = async (req, res) => {
  try {
    const { name, category_id, breed, age, age_unit, description, image_url, shelter_id } = req.body;
    const db = getDB();

    if (!name || !category_id || !shelter_id) {
      return res.status(400).json({ message: 'Name, category, and shelter are required' });
    }

    const result = await db.run(
      `INSERT INTO pets (name, category_id, breed, age, age_unit, description, image_url, shelter_id, created_by, adoption_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
      [name, category_id, breed || '', age || 0, age_unit || 'years', description || '', image_url || '', shelter_id, req.user.id]
    );

    const newPet = await db.get('SELECT * FROM pets WHERE id = ?', result.lastID);
    res.status(201).json({ message: 'Pet added successfully', pet: newPet });
  } catch (error) {
    console.error('Add pet error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getPets = async (req, res) => {
  try {
    const db = getDB();
    const { page = 1, limit = 12, type, breed, min_age, max_age, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT p.*, pc.name as category_name, s.name as shelter_name,
             u.name as created_by_name
      FROM pets p
      LEFT JOIN pet_categories pc ON p.category_id = pc.id
      LEFT JOIN shelters s ON p.shelter_id = s.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (type && type !== '') {
      query += ' AND pc.name = ?';
      params.push(type);
    }
    if (breed && breed !== '') {
      query += ' AND p.breed LIKE ?';
      params.push(`%${breed}%`);
    }
    if (min_age && min_age !== '') {
      query += ' AND p.age >= ?';
      params.push(parseInt(min_age));
    }
    if (max_age && max_age !== '') {
      query += ' AND p.age <= ?';
      params.push(parseInt(max_age));
    }
    if (status && status !== '') {
      query += ' AND p.adoption_status = ?';
      params.push(status);
    }

    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const totalResult = await db.get(countQuery, params);
    const total = totalResult?.total || 0;

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const pets = await db.all(query, params);

    res.json({
      pets: pets || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getPetById = async (req, res) => {
  try {
    const db = getDB();
    const pet = await db.get(
      `SELECT p.*, pc.name as category_name, s.name as shelter_name,
              u.name as created_by_name
       FROM pets p
       LEFT JOIN pet_categories pc ON p.category_id = pc.id
       LEFT JOIN shelters s ON p.shelter_id = s.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = ?`,
      req.params.id
    );

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const medicalRecords = await db.all(
      'SELECT * FROM medical_records WHERE pet_id = ? ORDER BY date DESC',
      req.params.id
    );

    res.json({ ...pet, medical_records: medicalRecords || [] });
  } catch (error) {
    console.error('Get pet by id error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updatePetStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDB();

    if (!status || !['available', 'pending', 'adopted'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    await db.run('UPDATE pets SET adoption_status = ? WHERE id = ?', [status, req.params.id]);
    const updatedPet = await db.get('SELECT * FROM pets WHERE id = ?', req.params.id);
    
    res.json({ message: 'Pet status updated successfully', pet: updatedPet });
  } catch (error) {
    console.error('Update pet status error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updatePet = async (req, res) => {
  try {
    const { name, breed, description, age, age_unit } = req.body;
    const db = getDB();

    const result = await db.run(
      `UPDATE pets 
       SET name = ?, breed = ?, description = ?, age = ?, age_unit = ?
       WHERE id = ?`,
      [name, breed || '', description || '', age || 0, age_unit || 'years', req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const updatedPet = await db.get('SELECT * FROM pets WHERE id = ?', req.params.id);
    res.json({ message: 'Pet updated successfully', pet: updatedPet });
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { addPet, getPets, getPetById, updatePetStatus, updatePet };