module.exports = function (app) {
  const modelName = "error_logs";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      serviceName: {
        type: String,
        required: true
      },
      errorMessage: {
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      stack: {
        type: String
      },
      details: {
        type: String,
        required: true
      },
      error: { type: Schema.Types.Mixed },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    },
    {
      timestamps: true,
    },
  );

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
