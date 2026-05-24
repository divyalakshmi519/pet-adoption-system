const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/database');

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;
    const db = getDB();

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Check if user exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.run(
      'INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || '', address || '', role || 'adopter']
    );

    // Generate token
    const token = jwt.sign(
      { id: result.lastID, email, role: role || 'adopter', name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.lastID, name, email, role: role || 'adopter' }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    console.log('Login attempt for:', email);

    // Get user from database
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found, verifying password...');

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful for:', email);

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const db = getDB();
    const user = await db.get(
      'SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = ?',
      req.user.id
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getCurrentUser };