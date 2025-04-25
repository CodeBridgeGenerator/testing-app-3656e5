module.exports = function (app) {
  const modelName = "job_station_queues";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;

  const schema = new Schema(
    {
      ticketId: { type: String },
      jobStations: { type: Array },
      jobStationId: { type: String },
      status: {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending",
      },
      priority: { type: Number, default: 0 },
      errorMessage: { type: String },
      startTime: { type: Date },
      endTime: { type: Date },

      // createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
      // updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
    },
    {
      timestamps: true,
    },
  );

  // Prevent model recompilation during hot-reloads
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};

// module.exports = function (app) {
//   const modelName = "job_station_queues";
//   const mongooseClient = app.get("mongooseClient");
//   const { Schema } = mongooseClient;
//   const schema = new Schema(
//     {
//       incomingMachineTicketId: {
//         type: Schema.Types.ObjectId,
//         ref: "incoming_machine_tickets",
//       },
//       selectedJobStations: {
//         type: Array
//       },
//       status: {
//         type: String,
//         enum: ["pending", "in-progress", "completed"],
//         default: "pending",
//       },
//       priority: { type: Number, min: 0, max: 10000000 },
//       errorMessage: { type: String },
//       startTime: { type: Date },
//       endTime: { type: Date },
//       createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
//       updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
//     },
//     {
//       timestamps: true,
//     },
//   );

//   if (mongooseClient.modelNames().includes(modelName)) {
//     mongooseClient.deleteModel(modelName);
//   }
//   return mongooseClient.model(modelName, schema);
// };
