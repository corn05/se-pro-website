const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const filePath = path.join(process.env.USERPROFILE || 'C:/Users/Sudha varshni', 'Downloads', 'final_doctor_dataset_2000.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total rows:', data.length);
if (data.length > 0) {
  console.log('Sample row:', data[0]);
  console.log('\nAll columns:', Object.keys(data[0]));
} else {
  console.log('No data found in the Excel file');
}

// Convert to doctor objects
const doctors = data.map((row, index) => {
  const name = row['Doctor_Name'] || 'Unknown Doctor';
  const hospital = row['Hospital_Name'] || '';
  const place = row['Place'] || '';
  const department = row['Department'] || 'General Medicine';
  const phone = row['Phone_Number'] || `+91-${Math.random().toString().slice(2, 12)}`;

  return {
    id: `doctor-${index + 1}`,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@hospital.com`,
    name: name,
    role: 'doctor',
    phone: phone,
    specialization: department,
    department: department,
    licenseNumber: `DOC-${index + 1}`,
    experience: 5,
    consultationFee: 300,
    address: hospital ? `${hospital}, ${place}` : place,
    qualifications: department,
    city: place
  };
});

// Save to JSON file
const outputPath = path.join(__dirname, '../data/doctors.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(doctors, null, 2));

console.log(`\n✓ Successfully imported ${doctors.length} doctors`);
console.log(`✓ Data saved to: ${outputPath}`);