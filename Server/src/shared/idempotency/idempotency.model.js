import mongoose from 'mongoose'

const idempotencyRecordSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    requestMethod: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    requestPath: {
      type: String,
      required: true,
      trim: true,
    },
    requestHash: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      required: true,
      index: true,
    },
    uncertain: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    responseStatus: {
      type: Number,
      default: null,
    },
    responseBody: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour default retention
      index: { expires: 0 },
    },
  },
  {
    collection: 'idempotency_records',
    timestamps: false,
    versionKey: false,
  }
)

// Enforce unique idempotency key scoped by organization, HTTP method and endpoint path.
// This prevents cross-endpoint key collisions while preserving organization isolation.
idempotencyRecordSchema.index(
  { organizationId: 1, requestMethod: 1, requestPath: 1, key: 1 },
  { unique: true }
)

export const IdempotencyRecord =
  mongoose.models.IdempotencyRecord ||
  mongoose.model('IdempotencyRecord', idempotencyRecordSchema)
