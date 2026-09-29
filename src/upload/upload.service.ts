import cloudinary from '../../config/cloudinary';


import { Readable } from 'stream';

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<string> => {
  console.log('🔍 [STEP 1] Starting Stream Upload for file:', file.originalname);

  return new Promise((resolve, reject) => {
    // 1. Cloudinary upload stream তৈরি
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        timeout: 60000, // 60 seconds timeout limit
      },
      (error, result) => {
        if (error) {
          console.error('🔥 [STREAM ERROR]:', error);
          return reject(error);
        }
        console.log('✅ [SUCCESS] Uploaded URL:', result?.secure_url);
        resolve(result!.secure_url);
      }
    );

    // 2. Buffer কে Stream-এ রূপান্তর করে Pipe করা
    const stream = Readable.from(file.buffer);
    stream.pipe(uploadStream);
  });
};

export const uploadMultipleToCloudinary = async (
  files: Express.Multer.File[],
  folder: string = 'uploads'
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, folder));
  return await Promise.all(uploadPromises);
};
export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  // Extract public_id from the full Cloudinary URL
  // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123456/uploads/abc123.jpg
  // → public_id = "uploads/abc123"
  const parts = imageUrl.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) {
    console.error('Could not extract public_id from URL:', imageUrl);
    return;
  }
  // skip the version segment (v123456) if present
  const afterUpload = parts.slice(uploadIndex + 1);
  if (afterUpload[0]?.startsWith('v') && /^\d+$/.test(afterUpload[0].slice(1))) {
    afterUpload.shift();
  }
  const publicIdWithExt = afterUpload.join('/');
  const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ''); // strip extension

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};
