import mongoose from 'mongoose'
import { BRANCH_STATUSES } from '../../constants/statuses.js'

const branchSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: null,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(BRANCH_STATUSES),
      default: BRANCH_STATUSES.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

branchSchema.index({ organizationId: 1, code: 1 }, { unique: true })

export const Branch = mongoose.models.Branch || mongoose.model('Branch', branchSchema)
