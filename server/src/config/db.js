/**
 * DATABASE CONFIGURATION
 * Note: Currently using MongoDB Atlas. 
 * If you deploy to Supabase or Neon in the future, you MUST switch from Mongoose (MongoDB)
 * to Prisma or raw SQL (PostgreSQL), as Supabase only supports PostgreSQL.
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected:', conn.connection.host);
  } catch (err) {
    console.error('❌ DB Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
