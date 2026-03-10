import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    console.log('✅ File type allowed:', file.mimetype);
    return cb(null, true);
  } else {
    console.log('❌ File type not allowed:', file.mimetype);
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage: storage, // Use Cloudinary storage instead of disk storage
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

export const uploadMultiple = upload.array('images', 5);
export const uploadSingle = upload.single('image');