const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure required directories exist
const uploadDir = path.join(__dirname, 'uploads');
const downloadDir = path.join(__dirname, 'downloads');
const publicDir = path.join(__dirname, 'public');
[uploadDir, downloadDir, publicDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Static files
app.use('/uploads', express.static(uploadDir));
app.use(express.static(publicDir));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, unique + '-' + safeOriginal);
  }
});

function imageFileFilter(req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB per file, up to 10 files total
});

// Helpers
function removeUploaded(files) {
  if (!files) return;
  const fileList = [];
  if (files.profilePic) fileList.push(...files.profilePic);
  if (files.otherPics) fileList.push(...files.otherPics);
  fileList.forEach(f => {
    try { fs.unlinkSync(f.path); } catch (e) {}
  });
}

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (val === undefined || val === null) return [];
  return [val];
}

// Routes
app.get('/', (req, res) => {
  res.render('form', {
    data: { username: '', email: '', gender: '', hobbies: [] },
    errors: {},
    fileErrors: {},
  });
});

app.post(
  '/register',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'otherPics', maxCount: 5 },
  ]),
  [
    body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
    body('gender').notEmpty().withMessage('Gender is required').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('hobbies').custom((val, { req }) => {
      const arr = toArray(req.body.hobbies);
      if (!arr.length) throw new Error('Please select at least one hobby');
      return true;
    }),
  ],
  (req, res) => {
    const result = validationResult(req);

    const data = {
      username: req.body.username || '',
      email: req.body.email || '',
      gender: req.body.gender || '',
      hobbies: toArray(req.body.hobbies),
    };

    const mappedErrors = {};
    result.array().forEach(err => {
      mappedErrors[err.path] = err.msg;
    });

    // File validations
    const fileErrors = {};
    const profile = req.files && req.files.profilePic ? req.files.profilePic[0] : null;
    const others = req.files && req.files.otherPics ? req.files.otherPics : [];

    if (!profile) {
      fileErrors.profilePic = 'Profile picture is required and must be an image';
    }
    // Filter out any non-image files rejected by fileFilter (multer will set to undefined by returning false)
    // We already only accept image/*; if user attempts non-image, multer omits it, hence treat as missing

    // Optional: validate otherPics count and types
    if (others.some(f => !f)) {
      fileErrors.otherPics = 'All other pictures must be images';
    }

    if (!result.isEmpty() || Object.keys(fileErrors).length) {
      // On error, remove any uploaded files to avoid orphans
      removeUploaded(req.files);
      return res.status(400).render('form', { data, errors: mappedErrors, fileErrors });
    }

    // Success: prepare data and save a JSON summary for download
    const profileUrl = profile ? `/uploads/${path.basename(profile.path)}` : null;
    const otherUrls = (others || []).map(f => `/uploads/${path.basename(f.path)}`);

    const output = {
      username: data.username,
      email: data.email,
      gender: data.gender,
      hobbies: data.hobbies,
      profilePic: profileUrl,
      otherPics: otherUrls,
      submittedAt: new Date().toISOString(),
    };

    const fname = `registration-${Date.now()}.json`;
    const fpath = path.join(downloadDir, fname);
    fs.writeFileSync(fpath, JSON.stringify(output, null, 2), 'utf-8');

    return res.render('result', { data: output, downloadFile: fname });
  }
);

app.get('/download/:file', (req, res) => {
  const file = req.params.file;
  const filePath = path.join(downloadDir, file);
  if (!file || !filePath.startsWith(downloadDir)) {
    return res.status(400).send('Invalid file');
  }
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }
  return res.download(filePath);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
