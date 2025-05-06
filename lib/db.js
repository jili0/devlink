import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('⚠️ MONGODB_URI environment variable is not defined');
  throw new Error('Please define the MONGODB_URI environment variable');
}

console.log('📦 MongoDB URI found in environment variables');

let cached = global.mongoose;

if (!cached) {
  console.log('🔄 Initializing mongoose cache');
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  console.log('📡 dbConnect called');
  
  if (cached.conn) {
    console.log('✅ Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔌 Creating new MongoDB connection promise');
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch(error => {
        console.error('❌ MongoDB connection error:', error);
        throw error;
      });
  } else {
    console.log('⏳ Using existing MongoDB connection promise');
  }
  
  try {
    console.log('⏳ Awaiting MongoDB connection');
    cached.conn = await cached.promise;
    console.log('✅ MongoDB connection established');
    return cached.conn;
  } catch (error) {
    console.error('❌ Error while awaiting MongoDB connection:', error);
    throw error;
  }
}

export default dbConnect;