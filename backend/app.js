import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

// ROUTES
import authRouter from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import hostRoutes from './routes/hotel.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import serviceRoutes from './routes/service.routes.js';    
import experienceRoutes from './routes/experience.routes.js'; 
import reviewRoutes from './routes/review.routes.js';
import subscriptionRoutes from "./routes/subscription.routes.js";
import superAdminRoutes from "./routes/superadmin.routes.js";




connectDB();

const app = express();
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//   console.log("👣 Request path hit:", req.method, req.originalUrl);
//   next();
// });



// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// const _dirname = path.resolve();


app.use('/api/auth', authRouter);
app.use('/api/user', userRoutes);
app.use('/api/host', hostRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/super-admin", superAdminRoutes);


// try {
//   app.use('/api/auth', authRouter);
//   app.use('/api/user', userRoutes);
//   app.use('/api/host', hostRoutes);
//   app.use('/api/services', serviceRoutes);
//   app.use('/api/experiences', experienceRoutes);
//   app.use('/api/payment', paymentRoutes);
//   app.use('/api/bookings', bookingRoutes);
//   app.use('/api/reviews', reviewRoutes);
//   app.use("/api/subscription", subscriptionRoutes);
//   app.use("/api/super-admin", superAdminRoutes);
// } catch (err) {
//   console.error("❌ Route Load Error:", err.message);
// }


//🚀 Serve frontend (React) from dist
// app.use(express.static(path.join(__dirname, './dist')));


// app.get('*', (req, res, next) => {
//   if (req.originalUrl.startsWith('/api/')) return next();
//   console.log("⛔ Caught frontend route:", req.originalUrl);
//   res.sendFile(path.join(__dirname, './dist/index.html'));
// });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

app.all('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on PORT ${PORT}`);
});
