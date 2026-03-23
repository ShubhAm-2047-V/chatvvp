const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { withMiddleware } = require('../../lib/withMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

const runMulter = (req, res) =>
  new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err) => (err ? reject(err) : resolve()));
  });

const generatePassword = (name, rollNo) => {
  if (!name || !rollNo) return 'Welcome123';
  const firstName = name.split(' ')[0];
  const rollStr = String(rollNo);
  return `${rollStr[0]}${firstName}${rollStr[rollStr.length - 1]}`;
};

const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    await runMulter(req, res);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  if (!req.file) return res.status(400).json({ message: 'Please upload an Excel file' });

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    if (rawData.length === 0) return res.status(400).json({ message: 'Excel file is empty' });

    let createdCount = 0, skippedCount = 0;
    const samplePasswords = [], errors = [];

    for (let i = 0; i < rawData.length; i++) {
      try {
        const row = rawData[i];
        const n = {};
        Object.keys(row).forEach((k) => { n[k.toLowerCase().trim()] = row[k]; });
        const { name, email, branch, year, rollno } = n;

        const missing = ['name','email','branch','year','rollno'].filter((f) => !n[f]);
        if (missing.length > 0) { errors.push(`Row ${i+2}: Missing ${missing.join(', ')}`); skippedCount++; continue; }

        if (await User.findOne({ email: String(email).trim().toLowerCase() })) { skippedCount++; continue; }

        const plainPassword = generatePassword(String(name).trim(), String(rollno).trim());
        const hashedPassword = await bcrypt.hash(plainPassword, await bcrypt.genSalt(10));

        await User.create({
          name: String(name).trim(), email: String(email).trim().toLowerCase(),
          password: hashedPassword, role: 'student',
          branch: String(branch).trim(), year: Number(year),
          rollNo: String(rollno).trim(), createdBy: req.user._id,
        });
        createdCount++;
        if (samplePasswords.length < 5) samplePasswords.push({ email, password: plainPassword });
      } catch (rowErr) { errors.push(`Row ${i+2}: ${rowErr.message}`); skippedCount++; }
    }

    return res.status(201).json({ message: 'Processing complete', created: createdCount, skipped: skippedCount, samplePasswords, errors: errors.slice(0, 10) });
  } catch (error) {
    return res.status(500).json({ message: 'Fatal error: ' + error.message });
  }
};

const wrapped = withMiddleware(handler, 'admin');
wrapped.config = { api: { bodyParser: false } };
module.exports = wrapped;
