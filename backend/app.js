import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import authRouter from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import hostRoutes from './routes/hotel.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import serviceRoutes from './routes/service.routes.js';     // ✅ NEW
import experienceRoutes from './routes/experience.routes.js'; // ✅ NEW
import reviewRoutes from './routes/review.routes.js';
import subscriptionRoutes from "./routes/subscription.routes.js";
import superAdminRoutes from "./routes/superadmin.routes.js";

connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// ROUTES
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

