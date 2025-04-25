module.exports = function (app) {
  const modelName = "external_tickets";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      machineId: { type: Schema.Types.ObjectId, ref: "machine_master" },
      checklistResponse: {
        type: [String],
        minLength: 2,
        maxLength: 1000,
        index: true,
        trim: true,
      },
      assignedSupervisor: {
        type: String,
        minLength: 2,
        maxLength: 1000,
        index: true,
        trim: true,
      },
      assignedTechnician: {
        type: String,
        maxLength: 1000,
        index: true,
        trim: true,
      },
      status: {
        type: String,
        minLength: 2,
        maxLength: 1000,
        index: true,
        trim: true,
      },
      startTime: { type: Date },
      endTime: { type: Date },

      createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
      updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
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
