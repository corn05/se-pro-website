const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2] || path.join(__dirname, '../data/final_doctor_dataset_2000.xlsx');
const outputFile = process.argv[3] || path.join(__dirname, '../data/doctors.json');

if (!fs.existsSync(inputFile)) {
  console.error(`Input file not found: ${inputFile}`);
  process.exit(1);
}

const workbook = XLSX.readFile(inputFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

const mappedDoctors = rawRows.map((row, index) => {
  const normalizedRow = Object.keys(row).reduce((acc, key) => {
    acc[key.toString().trim().toLowerCase()] = row[key];
    return acc;
  }, {});

  return {
    id: normalizedRow['id'] || normalizedRow['doctor id'] || `doctor-${Date.now()}-${index}`,
    email: normalizedRow['email'] || normalizedRow['e-mail'] || `doctor${index}@hospital.com`,
    name: normalizedRow['name'] || normalizedRow['doctor name'] || normalizedRow['dr name'] || `Doctor ${index + 1}`,
    role: 'doctor',
    phone: normalizedRow['phone'] || normalizedRow['contact'] || normalizedRow['mobile'] || '',
    specialization: normalizedRow['specialization'] || normalizedRow['speciality'] || 'General Medicine',
    department: normalizedRow['department'] || normalizedRow['dept'] || normalizedRow['specialization'] || 'General Medicine',
    licenseNumber: normalizedRow['license number'] || normalizedRow['registration number'] || `IMPORT-${index + 1}`,
    experience: Number(normalizedRow['experience'] || normalizedRow['years'] || 5),
    consultationFee: Number(normalizedRow['consultation fee'] || normalizedRow['fee'] || 300),
    address: normalizedRow['address'] || normalizedRow['hospital'] || normalizedRow['hospital name'] || '',
    qualifications: normalizedRow['qualifications'] || normalizedRow['qualification'] || '',
    city: normalizedRow['city'] || normalizedRow['location'] || '',
  };
});

const outputPath = outputFile;
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(mappedDoctors, null, 2));
console.log(`\n✓ Successfully imported ${mappedDoctors.length} doctors`);
console.log(`✓ Data saved to: ${outputPath}`);
