const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

async function finalSetup() {
  const db = await open({
    filename: path.join(__dirname, 'pet_adoption.db'),
    driver: sqlite3.Database
  });

  // Clear existing data
  await db.exec(`
    DELETE FROM adoption_applications;
    DELETE FROM pets;
    DELETE FROM users;
    DELETE FROM pet_categories;
    DELETE FROM shelters;
  `);

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'adopter',
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
      age_unit TEXT,
      description TEXT,
      image_url TEXT,
      adoption_status TEXT DEFAULT 'available',
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
      status TEXT DEFAULT 'pending',
      application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      review_notes TEXT,
      reviewed_by INTEGER,
      reviewed_at DATETIME,
      FOREIGN KEY (pet_id) REFERENCES pets(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Insert categories
  const categories = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish', 'Other'];
  for (const category of categories) {
    await db.run('INSERT INTO pet_categories (name) VALUES (?)', category);
  }

  // Insert shelter
  await db.run(`INSERT INTO shelters (id, name, address, phone, email) VALUES (1, 'Main Animal Shelter', '123 Pet Street', '+1234567890', 'shelter@petadoption.com')`);

  // Insert users
  const adminHash = await bcrypt.hash('admin123', 10);
  const staffHash = await bcrypt.hash('staff123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  await db.run(`INSERT INTO users (id, name, email, password, role) VALUES (1, 'Admin User', 'admin@petadoption.com', ?, 'admin')`, adminHash);
  await db.run(`INSERT INTO users (id, name, email, password, role) VALUES (2, 'Staff User', 'staff@petadoption.com', ?, 'shelter_staff')`, staffHash);
  await db.run(`INSERT INTO users (id, name, email, password, role) VALUES (3, 'John Doe', 'user@example.com', ?, 'adopter')`, userHash);

  // Insert pets
  const pets = [
    ['Max', 1, 'Golden Retriever', 2, 'years', 'Friendly and energetic dog', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'],
    ['Luna', 2, 'Persian Cat', 1, 'years', 'Gentle and calm cat', 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400'],
    ['Charlie', 1, 'Beagle', 3, 'years', 'Curious and playful beagle', 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400'],
    ['Bella', 2, 'Siamese', 6, 'months', 'Affectionate kitten', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400'],
    ['Rocky', 1, 'German Shepherd', 4, 'years', 'Loyal and protective', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400'],
    ['Coco', 3, 'Cockatiel', 2, 'years', 'Talkative bird', 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400']
  ];

  for (const pet of pets) {
    await db.run(`INSERT INTO pets (name, category_id, breed, age, age_unit, description, image_url, shelter_id, created_by, adoption_status) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 2, 'available')`, pet);
  }

  console.log('✅ Database setup complete!');
  console.log('\n📊 Login Credentials:');
  console.log('Admin: admin@petadoption.com / admin123');
  console.log('Staff: staff@petadoption.com / staff123');
  console.log('User: user@example.com / user123');
  console.log(`\n📝 Added ${pets.length} pets for adoption`);

  await db.close();
}

finalSetup();