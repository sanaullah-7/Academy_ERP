import mongoose from 'mongoose'
import { ROLES } from '../../constants/roles.js'
import { USER_STATUSES, ASSIGNMENT_STATUSES } from '../../constants/statuses.js'

const assignmentSchema = new mongoose.Schema(
  {
    branchId: {
      type: String,
      required: true,
      trim: true,
    },
    roles: {
      type: [String],
      enum: Object.values(ROLES),
      required: true,
      validate: {
        validator: (roles) => Array.isArray(roles) && roles.length > 0,
        message: 'At least one role is required for an assignment.',
      },
    },
    status: {
      type: String,
      enum: Object.values(ASSIGNMENT_STATUSES),
      default: ASSIGNMENT_STATUSES.ACTIVE,
    },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUSES),
      default: USER_STATUSES.ACTIVE,
      index: true,
    },
    isProtected: {
      type: Boolean,
      default: false,
    },
    assignments: {
      type: [assignmentSchema],
      default: [],
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.passwordHash
        return ret
      },
    },
  }
)

export const User = mongoose.models.User || mongoose.model('User', userSchema)
