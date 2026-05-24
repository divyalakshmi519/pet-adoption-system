const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    const db = await open({
      filename: path.join(__dirname, 'pet_adoption.db'),
      driver: sqlite3.Database
    });

    console.log('Creating tables...');

    // Create tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('adopter', 'shelter_staff', 'admin')) DEFAULT 'adopter',
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shelters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pet_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER,
        breed TEXT,
        age INTEGER,
        age_unit TEXT CHECK(age_unit IN ('months', 'years')),
        description TEXT,
        image_url TEXT,
        adoption_status TEXT CHECK(adoption_status IN ('available', 'pending', 'adopted')) DEFAULT 'available',
        shelter_id INTEGER,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES pet_categories(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS adoption_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pet_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
        application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        review_notes TEXT,
        reviewed_by INTEGER,
        reviewed_at DATETIME,
        FOREIGN KEY (pet_id) REFERENCES pets(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (reviewed_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS adoption_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        document_name TEXT NOT NULL,
        document_url TEXT NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES adoption_applications(id)
      );

      CREATE TABLE IF NOT EXISTS approvals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        approved_by INTEGER NOT NULL,
        approval_level INTEGER DEFAULT 1,
        approved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        comments TEXT,
        FOREIGN KEY (application_id) REFERENCES adoption_applications(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS medical_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pet_id INTEGER NOT NULL,
        record_type TEXT NOT NULL,
        description TEXT,
        date DATE,
        veterinarian TEXT,
        documents TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pet_id) REFERENCES pets(id)
      );
    `);

    console.log('Tables created');

    // Insert categories
    console.log('Inserting pet categories...');
    const categories = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish', 'Other'];
    for (const category of categories) {
      await db.run('INSERT OR IGNORE INTO pet_categories (name) VALUES (?)', category);
    }

    // Insert shelter
    console.log('Inserting shelter...');
    await db.run(`
      INSERT OR IGNORE INTO shelters (id, name, address, phone, email) 
      VALUES (1, 'Main Animal Shelter', '123 Pet Street, Animal City', '+1234567890', 'shelter@petadoption.com')
    `);

    // Insert users with hashed passwords
    console.log('Inserting users...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    await db.run(`INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (1, 'Admin User', 'admin@petadoption.com', ?, 'admin')`, adminPassword);
    await db.run(`INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (2, 'Staff User', 'staff@petadoption.com', ?, 'shelter_staff')`, staffPassword);
    await db.run(`INSERT OR IGNORE INTO users (id, name, email, password, role, phone, address) VALUES (3, 'John Doe', 'user@example.com', ?, 'adopter', '+1234567890', '123 Main St, City')`, userPassword);

    // Insert sample pets
    console.log('Inserting sample pets...');
    const samplePets = [
      {
        name: 'Max',
        category_id: 1,
        breed: 'Golden Retriever',
        age: 2,
        age_unit: 'years',
        description: 'Max is a friendly and energetic Golden Retriever who loves playing fetch and going for long walks. He is great with children and other dogs. Max is house-trained and knows basic commands.',
        image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
        shelter_id: 1,
        created_by: 2,
        adoption_status: 'available'
      },
      {
        name: 'Luna',
        category_id: 2,
        breed: 'Persian Cat',
        age: 1,
        age_unit: 'years',
        description: 'Luna is a gentle and affectionate Persian cat who enjoys lounging in sunny spots and getting belly rubs. She is litter-trained and good with calm children.',
        image_url: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400',
        shelter_id: 1,
        created_by: 2,
        adoption_status: 'available'
      },
      {
        name: 'Charlie',
        category_id: 1,
        breed: 'Beagle',
        age: 3,
        age_unit: 'years',
        description: 'Charlie is a curious and playful Beagle who loves to explore. He has a gentle temperament and gets along well with everyone. Charlie is looking for an active family.',
        image_url: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400',
        shelter_id: 1,
        created_by: 2,
        adoption_status: 'available'
      },
      {
        name: 'Bella',
        category_id: 2,
        breed: 'Siamese',
        age: 6,
        age_unit: 'months',
        description: 'Bella is an affectionate kitten who loves cuddles and playtime. She is very social and would do well in a home with other pets.',
        image_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
        shelter_id: 1,
        created_by: 2,
        adoption_status: 'available'
      },
      {
        name: 'Rocky',
        category_id: 1,
        breed: 'German Shepherd',
        age: 4,
        age_unit: 'years',
        description: 'Rocky is a loyal and protective German Shepherd. He is well-trained and would make an excellent guard dog and family companion.',
        image_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400',
        shelter_id: 1,
        created_by: 2,
        adoption_status: 'available'
      },
      {
        name: 'Coco',
        category_id: 3,
        breed: 'Cockatiel',
        age: 2,
        age_unit: 'years',
        description: 'Coco is a talkative and friendly bird who loves to whistle and mimic sounds. She needs a spacious cage and daily interaction.',
        image_url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400',
        shelter_id: 1,
        created_by: 2,
        adoption_status: 'available'
      }
    ];

    for (const pet of samplePets) {
      await db.run(
        `INSERT INTO pets (name, category_id, breed, age, age_unit, description, image_url, shelter_id, created_by, adoption_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [pet.name, pet.category_id, pet.breed, pet.age, pet.age_unit, pet.description, pet.image_url, pet.shelter_id, pet.created_by, pet.adoption_status]
      );
    }

    console.log('Database initialized successfully!');
    console.log(`Added ${samplePets.length} sample pets`);
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@petadoption.com / admin123');
    console.log('Staff: staff@petadoption.com / staff123');
    console.log('User: user@example.com / user123');

    await db.close();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();