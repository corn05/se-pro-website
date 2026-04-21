import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Reading datasets...');
  
  const doctorsPath = path.join(process.cwd(), 'data', 'doctors.json');
  const neurologistsPath = path.join(process.cwd(), 'data', 'neurologists.json');
  
  let allDoctors: any[] = [];
  
  if (fs.existsSync(doctorsPath)) {
    const data = JSON.parse(fs.readFileSync(doctorsPath, 'utf8'));
    allDoctors = [...allDoctors, ...data];
    console.log(`Loaded ${data.length} doctors from doctors.json`);
  }
  
  if (fs.existsSync(neurologistsPath)) {
    const data = JSON.parse(fs.readFileSync(neurologistsPath, 'utf8'));
    allDoctors = [...allDoctors, ...data];
    console.log(`Loaded ${data.length} neurologists from neurologists.json`);
  }
  
  console.log(`Total records to insert: ${allDoctors.length}`);
  
  // Transform data for Prisma
  const usersToInsert = allDoctors.map((doc, i) => {
    return {
      id: doc.id || `doc-${Date.now()}-${i}`,
      email: doc.email || `doctor-${Date.now()}-${i}@example.com`,
      name: doc.name || 'Unknown Doctor',
      role: 'doctor',
      phone: doc.phone || null,
      specialization: doc.specialization || doc.qualifications || 'General Medicine',
      department: doc.department || 'General Medicine',
      licenseNumber: doc.licenseNumber || null,
      experience: typeof doc.experience === 'number' ? doc.experience : 0,
      consultationFee: typeof doc.consultationFee === 'number' ? doc.consultationFee : 0,
      address: doc.address || null,
    };
  });
  
  // Remove duplicates by ID and Email
  const uniqueUsersMap = new Map();
  const seenEmails = new Set();
  
  for (const user of usersToInsert) {
    if (!uniqueUsersMap.has(user.id) && !seenEmails.has(user.email)) {
      uniqueUsersMap.set(user.id, user);
      seenEmails.add(user.email);
    }
  }
  const uniqueUsers = Array.from(uniqueUsersMap.values());
  
  console.log(`Unique records to insert: ${uniqueUsers.length}`);
  
    // Fetch existing user IDs to avoid duplicates
  const existingUsers = await prisma.user.findMany({
    select: { id: true, email: true }
  });
  const existingIds = new Set(existingUsers.map(u => u.id));
  const existingEmails = new Set(existingUsers.map(u => u.email));

  const filteredUsers = uniqueUsers.filter(u => !existingIds.has(u.id) && !existingEmails.has(u.email));
  console.log(`Filtered out ${uniqueUsers.length - filteredUsers.length} existing records. Proceeding with ${filteredUsers.length} records.`);

  const chunkSize = 500;
  let inserted = 0;
  
  for (let i = 0; i < filteredUsers.length; i += chunkSize) {
    const chunk = filteredUsers.slice(i, i + chunkSize);
    
    await prisma.user.createMany({
      data: chunk,
    });
    
    inserted += chunk.length;
    console.log(`Inserted ${inserted}/${filteredUsers.length}`);
  }
  
  console.log('Seeding finished successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
