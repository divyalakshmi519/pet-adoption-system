const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

let db;

const initializeDatabase = async () => {
  try {
    const dbPath = path.join(__dirname, '../../../database/pet_adoption.db');
    console.log(`Connecting to database at: ${dbPath}`);
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Test the connection
    const test = await db.get('SELECT 1 as test');
    console.log('Database connection successful');

    // Check if tables exist
    const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('users', 'pets', 'pet_categories')
    `);
    
    console.log(`Found tables: ${tables.map(t => t.name).join(', ')}`);

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
};

module.exports = { initializeDatabase, getDB };