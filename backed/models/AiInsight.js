import mongoose from 'mongoose';

const aiInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['weekly', 'suggestion', 'recovery', 'chat', 'morning'],
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed, // Can be a string (reports) or an array/object (suggestions)
      required: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed, // Flexible field for habitId, the question asked, etc.
    },
  },
  { timestamps: true }
);

export default mongoose.model('AiInsight', aiInsightSchema);