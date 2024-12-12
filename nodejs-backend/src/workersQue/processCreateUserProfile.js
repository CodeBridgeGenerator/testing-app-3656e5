const { Queue, Worker } = require("bullmq");
const connection = require("../services/redis/config");
const jobQueue = new Queue("createUserProfile", { connection });

// Create and export the worker
const createUserProfile = (app) => {
  const superAdmin = "menakamohan1999@gmail.com";
  const worker = new Worker(
    "createUserProfile",
    async (job) => {
      const { data } = job;
      const _profile = {
        name: data.name,
        userId: data._id,
      };
      let userData = await app.service("userLogin").find({
        query: {
          loginEmail: data.email,
        },
      });

      if (userData.data.length === 0) {
        userData = await app.service("userInvites").find({
          query: {
            emailToInvite: data.email,
          },
        });
        if (userData.data.length === 0) {
          // no user found is improbable
          // todo create user in userLogin
          app.service("userLogin").create({
            loginEmail: data.email,
            code: 100000,
            access: data.accessToken,
            sendMailCounter: 1,
          });
        } else {
          // superAdmin
          if (superAdmin === data.email) {
            userRole = await app.service("roles").find({
              query: {
                name :"Super"
              },
            });
            _profile["role"] = userRole.data[0]._id;
            userPosition = await app.service("positions").find({
              query: {
                name :"Admin"
              },
            });
            _profile["position"] = userPosition.data[0]._id;
          } else if (userData.data[0].position) {
            // custom role and position
            _profile["role"] = userData.data[0].role;
            _profile["position"] = userData.data[0].position;
          } else {
            // admin
            userRole = await app.service("roles").find({
              query: {
                status: true,
              },
            });
            _profile["role"] = userRole[0]._id;
            userPosition = await app.service("positions").find({
              query: {
                status: true,
              },
            });
            _profile["position"] = userPosition[0]._id;
          }
        }
      } else {
        //external external
        userRole = await app.service("roles").find({
          query: {
            status: true,
          },
        });
        _profile["role"] = userRole[0]._id;
        userPosition = await app.service("positions").find({
          query: {
            status: true,
          },
        });
        _profile["position"] = userPosition[0]._id;

        // todo get user profile from user invites
      }

      app.service("profiles").create(_profile);
    },
    { connection },
  );

  // Event listeners for worker
  worker.on("completed", (job) => {
    console.debug(`Job createUserProfile ${job.id} completed successfully`);
    if (job.data) {
      const _mail = {
        name: "on_new_user_welcome_email",
        type: "firstimelogin",
        from: "admin@cloudbasha.com",
        recipients: [job.data.email],
        data: {
          name: job.data.name,
          projectLabel: process.env.PROJECT_LABEL ?? process.env.PROJECT_NAME,
        },
        status: true,
        subject: "First Time Login",
        templateId: "onWelcomeEmail",
      };
      app.service("mailQues").create(_mail);
    } else {
      console.debug(`Job error and ${job.data} data not found`);
    }
  });

  worker.on("failed", async (job, err) => {
    console.error(
      `Job createUserProfile ${job.id} failed with error ${err.message}`,
    );
    if (job.data) {
      const _mail = {
        name: "on_send_welcome_email",
        type: "userInvitationOnCreateOnLoginQues",
        from: "info@cloudbasha.com",
        recipients: ["menakamohan1999@gmail.com"],
        status: false,
        data: { ...job.data },
        subject: "login processing failed",
        templateId: "onError",
        errorMessage: err.message,
      };
      app.service("mailQues").create(_mail);
    } else {
      console.error(`Job error and ${job.data} data not found`);
    }
    if (err.message === "job stalled more than allowable limit") {
      await job.remove().catch((err) => {
        console.error(
          `jobId: ${job.id} ,  remove error : ${err.message} , ${err.stack}`,
        );
      });
    }
  });

  const userService = app.service("users");
  userService.hooks({
    after: {
      create: async (context) => {
        const { result } = context;
        await jobQueue.add("createUserProfile", result);
        return context;
      },
    },
  });
};

module.exports = { createUserProfile };
