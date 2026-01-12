import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+file.originalname)
    }
  })

const upload = multer({ storage: storage });

export { upload };