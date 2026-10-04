import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_business_assistant';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // 5 sec timeout
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB Error] Failed to connect to MongoDB at ${uri}`);
    console.error(`[MongoDB Error Message] ${error.message}`);
    console.warn(`[MongoDB Warning] Application will run with limited database functionality until MongoDB is available.`);
    return false;
  }
};
