module.exports = function (app) {
  const modelName = "machine_master";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      ownership: {
        type: String,
        minLength: 2,
        maxLength: 1000,
        index: true,
        trim: true,
      },
      vendingMachineCode: {
        type: String,
        minLength: 2,
        maxLength: 1000,
        index: true,
        trim: true,
      },
      zone: {
        type: String,
        minLength: 2,
        maxLength: 1000,
        index: true,
        trim: true,
      },
      locationCode: { type: Schema.Types.ObjectId, ref: "location_master" },
      locationDesc: {
        type: String,
        minLength: 2,
        maxLength: 1000,
        index: true,
        trim: true,
      },
      modelNo: {
        type: String,
        minLength: 2,
        maxLength: 1000,
        index: true,
        trim: true,
      },
      serialNumber: { type: Number, min: 0, max: 27160010 },
      vendingMachineId: {
        type: Schema.Types.ObjectId,
        ref: "vending_machines",
      },
      purchaseDate: { type: Date },
      comissionDate: { type: Date },
      description: {
        type: String,
        minLength: 2,
        maxLength: 1000,
        index: true,
        trim: true,
      },

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
