const assert = require("assert");
const app = require("../../src/app");

describe("students service", () => {
  let thisService;
  let studentCreated;

  beforeEach(async () => {
    thisService = await app.service("students");
  });

  it("registered the service", () => {
    assert.ok(thisService, "Registered the service (students)");
  });

  describe("#create", () => {
    const options = {"fullname":"new value","image":"new value"};

    beforeEach(async () => {
      studentCreated = await thisService.create(options);
    });

    it("should create a new student", () => {
      assert.strictEqual(studentCreated.fullname, options.fullname);
assert.strictEqual(studentCreated.image, options.image);
    });
  });

  describe("#get", () => {
    it("should retrieve a student by ID", async () => {
      const retrieved = await thisService.get(studentCreated._id);
      assert.strictEqual(retrieved._id, studentCreated._id);
    });
  });

  describe("#update", () => {
    let studentUpdated;
    const options = {"fullname":"updated value","image":"updated value"};

    beforeEach(async () => {
      studentUpdated = await thisService.update(studentCreated._id, options);
    });

    it("should update an existing student ", async () => {
      assert.strictEqual(studentUpdated.fullname, options.fullname);
assert.strictEqual(studentUpdated.image, options.image);
    });
  });

  describe("#delete", () => {
  let studentDeleted;
    beforeEach(async () => {
      studentDeleted = await thisService.remove(studentCreated._id);
    });

    it("should delete a student", async () => {
      assert.strictEqual(studentDeleted._id, studentCreated._id);
    });
  });
});