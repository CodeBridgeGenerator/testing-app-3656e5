
const students = require("./students/students.service.js");
// ~cb-add-require-service-name~

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
    
  app.configure(students);
    // ~cb-add-configure-service-name~
};
