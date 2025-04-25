module.exports = function (app) {
  const modelName = "employees";
  const mongooseClient = app.get("mongooseClient");
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      empNo: {
        type: String,
        // required: true,
        unique: false,
        lowercase: false,
        uppercase: false,
        index: false,
        trim: false,
      },
      name: {
        type: String,
        required: true,
        unique: false,
        lowercase: false,
        uppercase: false,
        index: false,
        trim: false,
      },
      userEmail: {
        type: String,
        // required: true,
        unique: false,
        lowercase: false,
        uppercase: false,
        index: false,
        trim: false,
      },
      company: { type: Schema.Types.ObjectId, ref: "companies" },
      position: { type: Schema.Types.ObjectId, ref: "positions" },
      grade: {
        type: String,
        required: true,
        unique: false,
        lowercase: false,
        uppercase: false,
        index: false,
        trim: false,
      },
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
