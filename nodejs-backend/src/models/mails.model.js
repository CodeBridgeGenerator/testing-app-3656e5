module.exports = function (app) {
  const modelName = "mails";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      sentDateTime: { type: Date },
      sentStatus: { type: Boolean },
      mailType: {
        type: String,
        required: false,
        unique: false,
        lowercase: false,
        uppercase: false,
        minLength: 2,
        maxLength: 150,
        index: true,
        trim: true,
      },
      toHistory: { type: Schema.Types.Mixed },

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
