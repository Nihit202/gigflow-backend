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

app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

if (config.nodeEnv !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message: string) => logger.info(message.trim()) },
    })
  );
}

app.get('/health', (_req: import('express').Request, res: import('express').Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config.nodeEnv });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/leads', leadRoutes);

app.post('/api/seed', async (_req: import('express').Request, res: import('express').Response) => {
  try {
    const { User } = await import('./models/User');
    const { Lead } = await import('./models/Lead');

    await User.deleteMany({});
    await Lead.deleteMany({});

    const admin = await User.create({ name: 'Arjun Mehta', email: 'admin@gigflow.dev', password: 'Admin@1234', role: 'admin', isActive: true });
    const sales1 = await User.create({ name: 'Priya Sharma', email: 'priya@gigflow.dev', password: 'Sales@1234', role: 'sales', isActive: true });
    const sales2 = await User.create({ name: 'Rohan Das', email: 'rohan@gigflow.dev', password: 'Sales@1234', role: 'sales', isActive: true });

    await Lead.insertMany([
      { name: 'Aarav Patel', email: 'aarav@techcorp.in', status: 'New', source: 'Website', notes: 'Interested in enterprise plan', createdBy: admin._id },
      { name: 'Sneha Kapoor', email: 'sneha@design.com', status: 'New', source: 'Instagram', notes: 'Wants a demo call', createdBy: sales1._id },
      { name: 'Vikram Nair', email: 'vikram@startup.io', status: 'New', source: 'Referral', notes: 'Looking for CRM', createdBy: sales2._id },
      { name: 'Rahul Verma', email: 'rahul@fintech.in', status: 'Contacted', source: 'Website', notes: 'Sent pricing deck', createdBy: sales1._id },
      { name: 'Ananya Iyer', email: 'ananya@consulting.com', status: 'Contacted', source: 'Referral', notes: 'Evaluating tools', createdBy: sales2._id },
      { name: 'Aditya Bansal', email: 'aditya@bansaltech.com', status: 'Qualified', source: 'Referral', notes: 'Budget confirmed', createdBy: admin._id },
      { name: 'Kavya Reddy', email: 'kavya@health.in', status: 'Qualified', source: 'Website', notes: 'Contract under review', createdBy: sales1._id },
      { name: 'Ritu Agarwal', email: 'ritu@textiles.com', status: 'Lost', source: 'Instagram', notes: 'Went with competitor', createdBy: sales2._id },
      { name: 'Shiv Kumar', email: 'shiv@oldschool.com', status: 'Lost', source: 'Referral', notes: 'Sticking with Excel', createdBy: admin._id },
    ]);

    res.json({ success: true, message: 'Seeded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

app.use(notFound);
app.use(errorHandler);

export default app;