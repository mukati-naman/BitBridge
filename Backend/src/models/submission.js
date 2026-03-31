const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem"
  },
  code: String,

  language: {
    type: String,
    enum: ["cpp", "java", "javascript"],
    required: true
  },

  language_id: {
    type: Number,
    required: true
  },

  status: String,
  testcasespassed: Number,
  testCasestotal: Number,
  runtime: Number,
  memory: Number,
  errorMessage: String

}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);