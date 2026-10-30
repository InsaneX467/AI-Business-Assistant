import mongoose from 'mongoose';

export const LEAD_STATUS_ENUM = ['New', 'Contacted', 'Qualified', 'Converted', 'Not Interested'];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    requirement: {
      type: String,
      required: [true, 'Requirement/Interest is required'],
      trim: true,
      maxlength: [1000, 'Requirement cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: {
        values: LEAD_STATUS_ENUM,
        message: '{VALUE} is not a valid lead status'
      },
      default: 'New'
    }
  },
  {
    timestamps: true
  }
);

export const Lead = mongoose.model('Lead', leadSchema);
