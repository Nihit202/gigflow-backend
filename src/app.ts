import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import leadRoutes from './routes/lead.routes';

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts' },
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
if (config.nodeEnv !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message: string) => logger.info(message.trim()) },
    })
  );
}

// Health check
app.get('/health', (_req: import('express').Request, res: import('express').Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config.nodeEnv });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/leads', leadRoutes);
// Temporary seed route - remove after seeding
app.post('/api/seed', async (_req: import('express').Request, res: import('express').Response) => {
  try {
    const bcrypt = await import('bcryptjs');
    const { User } = await import('./models/User');
    const { Lead } = await import('./models/Lead');

    await User.deleteMany({});
    await Lead.deleteMany({});

    const users = await User.insertMany([
      { name: 'Arjun Mehta', email: 'admin@gigflow.dev', password: await bcrypt.hash('Admin@1234', 12), role: 'admin', isActive: true },
      { name: 'Priya Sharma', email: 'priya@gigflow.dev', password: await bcrypt.hash('Sales@1234', 12), role: 'sales', isActive: true },
      { name: 'Rohan Das', email: 'rohan@gigflow.dev', password: await bcrypt.hash('Sales@1234', 12), role: 'sales', isActive: true },
    ]);

    const admin = users[0];
    const sales = users.slice(1);

    const leadData = [
      { name: 'Aarav Patel', email: 'aarav@techcorp.in', status: 'New', source: 'Website', notes: 'Interested in enterprise plan', createdBy: admin._id },
      { name: 'Sneha Kapoor', email: 'sneha@design.com', status: 'New', source: 'Instagram', notes: 'Wants a demo call', createdBy: sales[0]._id },
      { name: 'Vikram Nair', email: 'vikram@startup.io', status: 'New', source: 'Referral', notes: 'Looking for CRM', createdBy: sales[1]._id },
      { name: 'Rahul Verma', email: 'rahul@fintech.in', status: 'Contacted', source: 'Website', notes: 'Sent pricing deck', createdBy: sales[0]._id },
      { name: 'Ananya Iyer', email: 'ananya@consulting.com', status: 'Contacted', source: 'Referral', notes: 'Evaluating tools', createdBy: sales[1]._id },
      { name: 'Aditya Bansal', email: 'aditya@bansaltech.com', status: 'Qualified', source: 'Referral', notes: 'Budget confirmed', createdBy: admin._id },
      { name: 'Kavya Reddy', email: 'kavya@health.in', status: 'Qualified', source: 'Website', notes: 'Contract under review', createdBy: sales[0]._id },
      { name: 'Ritu Agarwal', email: 'ritu@textiles.com', status: 'Lost', source: 'Instagram', notes: 'Went with competitor', createdBy: sales[1]._id },
      { name: 'Shiv Kumar', email: 'shiv@oldschool.com', status: 'Lost', source: 'Referral', notes: 'Sticking with Excel', createdBy: admin._id },
    ];

    await Lead.insertMany(leadData);

    res.json({ success: true, message: 'Seeded successfully', users: users.length, leads: leadData.length });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});
// 404 & Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
