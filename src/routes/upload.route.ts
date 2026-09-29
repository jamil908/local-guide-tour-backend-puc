import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const streamUpload = () =>
      new Promise<{ url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "listings" },
          (error, result) => {
            if (result) resolve({ url: result.secure_url });
            else reject(error);
          }
        );
        stream.end(req.file!.buffer);
      });

    const result = await streamUpload();
    res.json({ url: result.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
