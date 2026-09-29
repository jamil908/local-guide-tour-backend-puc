// backend/src/app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();
const allowedOrigins = [
  "https://local-guide-frontend-orcin.vercel.app",
  "https://sandbox.sslcommerz.com", // Add this for Sandbox
  "https://securepay.sslcommerz.com", // Add this for Live

      'http://localhost:3000',
];
import paymentRoutes from './modules/payment/payment.routes';

// localy kaz kore 
// app.use(cors({
//   origin: function (origin, callback) {
//     // 1. Allow requests with no origin (like Postman or mobile apps)
//     // 2. Allow the literal string 'null' (standard for gateway redirects)
//     if (!origin || origin === 'null') {
//       return callback(null, true);
//     }

//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       // It's better to log which origin failed for debugging
//       console.error(`Blocked by CORS: ${origin}`);
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// }));


app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/api/auth', userRoutes);

import userRoutes from './modules/user/user.routes';
import listingRoutes from './modules/listing/listing.routes';
import bookingRoutes from './modules/booking/booking.routes';
import reviewRoutes from './modules/review/review.routes';
import uploadRoutes from './modules/upload/upload.route';

app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes); // ← NEW ROUTE ADDED

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});
app.get("/", (req: Request, res: Response) => {
  res.send("Local guide  API is running 🚀");
});
// Test upload endpoint
app.get('/api/upload/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Upload endpoint is working',
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Not configured'
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
