// backend/src/modules/upload/upload.routes.ts
import { Router } from 'express';
import * as UploadController from './upload.controller';
import { uploadSingle, uploadMultiple } from '../../config/multer';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Upload single image
router.post(
  '/single',
  authenticate,
  uploadSingle,
  UploadController.uploadSingleImage
);

// Upload multiple images
router.post(
  '/multiple',
  authenticate,
  uploadMultiple,
  UploadController.uploadMultipleImages
);

export default router;