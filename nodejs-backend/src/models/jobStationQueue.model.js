module.exports = function (app) {
  const modelName = "job_station_queue";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      incomingMachineTicketId: {
        type: Schema.Types.ObjectId,
        ref: "incoming_machine_tickets",
      },
      selectedJobStations: {
        type: String,
        minLength: 2,
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
      priority: { type: Number, min: 0, max: 10000000 },

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
