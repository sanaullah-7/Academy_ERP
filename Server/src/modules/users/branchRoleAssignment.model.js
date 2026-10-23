import mongoose from 'mongoose'
import { ROLES } from '../../constants/roles.js'
import { ASSIGNMENT_STATUSES } from '../../constants/statuses.js'

const branchRoleAssignmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    organizationId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    branchId: {
      type: String,
      required: true,
      trim: true,
      index: true,
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
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'userBranchRoles',
  }
)

branchRoleAssignmentSchema.index({ userId: 1, branchId: 1 }, { unique: true })

export const BranchRoleAssignment =
  mongoose.models.BranchRoleAssignment ||
  mongoose.model('BranchRoleAssignment', branchRoleAssignmentSchema)
