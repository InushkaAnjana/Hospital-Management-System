const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const USER_ROLES = [
  'Administrator',
  'Doctor',
  'Nurse',
  'Receptionist',
  'Laboratory Staff',
  'Pharmacist',
  'Accountant',
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Hidden by default from queries
    },
    role: {
      type: String,
      required: [true, 'User role is required'],
      enum: {
        values: USER_ROLES,
        message: '{VALUE} is not a valid hospital role',
      },
      default: 'Receptionist',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Exclude password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = { User, USER_ROLES };
