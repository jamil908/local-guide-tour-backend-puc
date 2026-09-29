import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary, uploadMultipleToCloudinary } from './upload.service';

export const uploadSingleImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded',
      });
    }

    const imageUrl = await uploadToCloudinary(req.file);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully!',
      data: { url: imageUrl },
    });
  } catch (error: any) {
    console.error('🔥 Controller Exception Log:', error);
    next(error);
  }
};

export const uploadMultipleImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files uploaded',
      });
    }

    const imageUrls = await uploadMultipleToCloudinary(req.files);

    return res.status(200).json({
      success: true,
      message: 'Images uploaded successfully!',
      data: { urls: imageUrls },
    });
  } catch (error: any) {
    next(error);
  }
};