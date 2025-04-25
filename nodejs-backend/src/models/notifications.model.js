module.exports = function (app) {
  const modelName = "notifications";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      toUser: { type: String, required: true},
      content: {
        type: String,
        required: true
      },
      path: {
        type: String
      },
      method: {
        type: String
      },
      data : { type : Schema.Types.Mixed },
      recordId: {
        type: String
      },
      read: { type: Boolean },
      sent: { type: Date },

      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: false,
      },
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: false,
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
