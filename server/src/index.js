const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const connectDB = require('./config/db');
const { initSocket, getIO } = require('./socket/socket');
const Reminder = require('./models/Reminder.model');
const User = require('./models/User.model');
const { sendReminderEmail } = require('./services/email.service');

connectDB();

const app = express();
const server = http.createServer(app);
initSocket(server);

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://jobtrackerweb-zeta.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests for all routes
app.options('*', cors());

app.use(express.json());

// Attach io to every request so controllers can emit events
app.use((req, res, next) => {
  req.io = getIO();
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/jobs', require('./routes/job.routes'));
app.use('/api/reminders', require('./routes/reminder.routes'));

// Admin jobs route
app.use('/api/admin', require('./routes/job.routes'));

// Health check
app.get('/', (req, res) => res.json({ message: 'JobTrackr API is running 🚀' }));

// Daily cron: check and send reminder emails at 8am
cron.schedule('0 8 * * *', async () => {
  console.log(' Running reminder cron job...');
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  const reminders = await Reminder.find({
    reminderDate: { $gte: todayStart, $lte: todayEnd },
    sent: false,
  })
    .populate('user', 'email name')
    .populate('job', 'company role');

  for (const reminder of reminders) {
    try {
      await sendReminderEmail({
        to: reminder.user.email,
        jobTitle: reminder.job.role,
        company: reminder.job.company,
        message: reminder.message,
        reminderDate: reminder.reminderDate,
      });
      reminder.sent = true;
      await reminder.save();
      console.log(`Reminder sent to ${reminder.user.email}`);
    } catch (err) {
      console.error(` Failed to send reminder:`, err.message);
    }
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));