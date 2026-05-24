const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  const db = await open({
    filename: path.join(__dirname, 'pet_adoption.db'),
    driver: sqlite3.Database
  });

  // Insert sample pets
  const samplePets = [
    {
      name: 'Max',
      category_id: 1,
      breed: 'Golden Retriever',
      age: 2,
      age_unit: 'years',
      description: 'Friendly and energetic dog who loves playing fetch and going for walks.',
      image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
      shelter_id: 1,
      adoption_status: 'available'
    },
    {
      name: 'Luna',
      category_id: 2,
      breed: 'Persian',
      age: 1,
      age_unit: 'years',
      description: 'Gentle and calm cat who enjoys lounging in sunny spots.',
      image_url: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400',
      shelter_id: 1,
      adoption_status: 'available'
    },
    {
      name: 'Charlie',
      category_id: 1,
      breed: 'Beagle',
      age: 3,
      age_unit: 'years',
      description: 'Curious and playful beagle who loves to explore.',
      image_url: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400',
      shelter_id: 1,
      adoption_status: 'available'
    },
    {
      name: 'Bella',
      category_id: 2,
      breed: 'Siamese',
      age: 6,
      age_unit: 'months',
      description: 'Affectionate kitten who loves cuddles and playtime.',
      image_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
      shelter_id: 1,
      adoption_status: 'available'
    }
  ];

  for (const pet of samplePets) {
    await db.run(
      `INSERT INTO pets (name, category_id, breed, age, age_unit, description, image_url, shelter_id, adoption_status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pet.name, pet.category_id, pet.breed, pet.age, pet.age_unit, pet.description, pet.image_url, pet.shelter_id, pet.adoption_status, 2]
    );
  }

  console.log('Sample data seeded successfully');
  await db.close();
}

// Only run if called directly
if (require.main === module) {
  seedDatabase().catch(console.error);
}

module.exports = seedDatabase;