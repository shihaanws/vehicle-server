"use strict";
const Hapi = require("@hapi/hapi");
const path = require("path");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const Connection = require("./dbconfig");
const Vehicles = require("./models/vehicles");
const Users = require("./models/users");
const Jwt = require("@hapi/jwt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
var multer = require("multer");
var fs = require("fs");

const upload = multer({ dest: "images/" });

const JWT_SECRET = "somesupersecret";

const init = async () => {
  const server = Hapi.server({
    host: "localhost",
    routes: {
      cors: true,
    },
    port: 1234,
  });

  await server.register([
    {
      plugin: require("hapi-geo-locate"),
      options: {
        enableByDefault: true,
      },
    },
    {
      plugin: Inert,
    },
    {
      plugin: Vision,
    },
    {
      plugin: Jwt,
    },
  ]);

  const handleFileUpload = (file) => {
    return new Promise((resolve, reject) => {
      const filename = file.hapi.filename;
      const data = file._data;
      fs.writeFile("./upload/" + filename, data, (err) => {
        if (err) {
          reject(err);
        }
        resolve({ message: "Upload successfully!" });
      });
    });
  };

  server.route([
    {
      method: "GET",
      path: "/",
      handler: (request, h) => {
        return h.file("./try.png");
      },
      // options:{
      //     auth:{
      //         mode:"try"
      //     }
      // }
    },

    {
      method: "GET",
      path: "/location",
      handler: (request, h) => {
        return request.location;
      },
    },

    {
      method: "GET",
      path: "/getallvehicles",
      handler: async (request, h) => {
        const vehicles = await Vehicles.getAllVehicles();
        console.log(vehicles);
        return vehicles;
      },
    },

    {
      method: "PUT",
      path: "/editroute/{id}",
      handler: async (request, h) => {},
    },
    {
      method: "GET",
      path: "/delete/{id}",
      handler: async (request, h) => {
        const vehicles1 = await vehicles.deleteVehicle(request.params.id);
        console.log(vehicles1);
        return { vehicles1 };
      },
    },
    {
      method: "PUT",
      path: "/updatevehicle/vehicleId={vehicleId}",
      handler: async (request, h) => {
        const vehicleId = request.params.vehicleId;
        const vehicles1 = await Vehicles.updateVehicle(
          request.payload.vehiclename,
          request.payload.route,
          request.payload.date,
          vehicleId
        );
        return vehicles1;
      },
    },
    {
      path: "/upload",
      method: "POST",
      options: {
        payload: {
          output: "stream",
        },
      },
      handler: async (req, h) => {
        const { payload } = req;
        const response = handleFileUpload(payload.file);
        return response;
      },
    },

    {
      method: "POST",
      path: "/createvehicle/userId={userId}",

      handler: (request, h) => {
        const storage = multer.diskStorage({
          destination: (req, file, cb) => {
            cb(null, "images");
          },
          filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname));
          },
        });

        const upload = multer({
          storage: storage,
          limits: { fileSize: "1000000" },
          fileFilter: (req, file, cb) => {
            const fileTypes = /jpeg|jpg|png|gif/;
            const mimeType = fileTypes.test(file.mimetype);
            const extname = fileTypes.test(path.extname(file.originalname));

            if (mimeType && extname) {
              return cb(null, true);
            }
            cb("Give proper files formate to upload");
          },
        }).single("vehicleimage");

        const currentUser = request.params.userId;
        const vehiclename = request.payload.vehiclename;
        const route = request.payload.route;
        const date = request.payload.date;
        const vehicleimage = request.payload.path;
        // upload(vehicleimage)
        upload;
        Vehicles.createVehicle(
          currentUser,
          vehicleimage,
          vehiclename,
          route,
          date
        );
        return {
          vehicleimage: vehicleimage,
          vehiclename: vehiclename,
          route: route,
          date: date,
          message: "Vehicle added to the database",
        };
      },
    },
    {
      method: "POST",
      path: "/profile",
      config: {
        handler: (request, h) => {
          const payload = request.payload;

          console.log(payload);

          return "Received your data";
        },
        payload: {
          maxBytes: 209715200,
          output: "file",
          parse: true,
        },
      },
    },
    {
      method: "GET",
      path: "/{filename}",
      handler: {
        file: function (request) {
          return request.params.filename;
        },
      },
    },
    {
      method: "POST",
      path: "/submit",
      handler: (request, h) => {
        const data = request.payload;
        if (data) {
          return data;
          //     const name = data.file.hapi.filename;
          //     const path = __dirname + "/images/" + name;
          //     const file = fs.createWriteStream(path);

          //     file.on('error', (err) => console.error(err));

          //     data.file.pipe(file);

          //     data.file.on('end', (err) => {
          //         const ret = {
          //             filename: data.file.hapi.filename,
          //             headers: data.file.hapi.headers
          //         }
          //         return JSON.stringify(ret);
          //     })
          // }
          // return 'ok';
        }
      },
      // options: {
      //   payload: {
      //     output: "stream",
      //     parse: true,
      //     // allow: 'multipart/form-data'
      //   },
      // },
    },

    // {
    //   method: "GET",
    //   path: "/signup",
    //   handler: (req, res) => {
    //     return { usercreated: undefined };
    //   },
    // },
    {
      method: "POST",
      path: "/signup",
      handler: async (request, h) => {
        const username = request.payload.username;
        const email = request.payload.email;
        const password = request.payload.password;
        const userSignedUp = await Users.signupUser(username, email, password);
        if (userSignedUp == true) {
          return { signup: userSignedUp, message: "User created" };
        } else {
          return { signup: userSignedUp, message: "User already exists" };
        }
      },
    },
    
    {
      method: "POST",
      path: "/forgot-password",
      handler: async (req, res) => {
        const username = req.payload.username;
        const login = await Users.userExistsCheck(username);
        if (login.login == true) {
          // else {
          //   return "No registered username";
          // }
          const secret = JWT_SECRET;
          const payload = { username: username };
          const userId = login.userID;
          const token = jwt.sign(payload, secret, { expiresIn: "15m" });
          const link = `http://localhost:3000/forgot-password/${userId}/${token}`;
          console.log(link);
          return { linkExists: true,link:link  };
        } else {
          return "no user";
        }
      },
    },

    {
      method: "GET",
      path: "/forgot-password/{id}/{token}",
      handler: async (request, h) => {
        const id = request.params.id;
        const token = request.params.token;
        const idChecked = await Users.idCheck(id);
        if (idChecked.id == true) {
          const secret = JWT_SECRET;
          try {
            const payload = jwt.verify(token, secret);
            return { id };
          } catch (err) {
            console.log(err.message);
          }
        }

        return { idChecked };
      },
    },

    {
      method: "POST",
      path: "/reset-password/{id}/{token}",
      handler: async (request, h) => {
        const password1 = request.payload.password1;
        const password2 = request.payload.password2;
        const id = request.params.id;
        const token = request.params.token;
        const idChecked = await Users.idCheck(id);
        const secret = JWT_SECRET;

        if (idChecked.id == true || jwt.verify(token, secret)) {
          if (password1 == password2) {
            await Users.resetPassword(password1, id);
            return {reset:true};
            
            //reset the password
          }else{
            return {reset:false}
          }

          return { id };
        }

        return { idChecked };
      },
    },

    {
      method: "POST",
      path: "/login",
      handler: async (req, res) => {
        const username = req.payload.username;
        const password = req.payload.password;
        const login = await Users.loginCheck(username, password);
        if (login.login == true) {
          const token = jwt.sign(
            {
              aud: "urn:audience:test",
              iss: "urn:issuer:test",
              sub: false,
              maxAgeSec: 14400,
              timeSkewSec: 15,
            },
            "some_shared_secret"
          );
          return { token: token, login };
        } else {
          return { login };
        }
      },
    },

    // {
    //   method: "POST",
    //   path: "/login",
    //   handler: (request, h) => {
    //     Users.loginUser(request.payload.username, request.payload.password);
    //     // const token = jwt.sign(
    //     //   {
    //     //     aud: "urn:audience:test",
    //     //     iss: "urn:issuer:test",
    //     //     sub: false,
    //     //     maxAgeSec: 14400,
    //     //     timeSkewSec: 15,
    //     //   },
    //     //   "some_shared_secret"
    //     // );
    //     return { token1: token };
    //   },
    // },
  ]);

  await server.start();
  console.log(`server started on : ${server.info.uri}`);
};
process.on("unhandledRejection", (err) => {
  console.log(err);
  // Exit with failure
  process.exit(1);
});
init();

// function getAllvehicles() {
//     return new Promise((resolve, reject) => {
//         connection.query('SELECT * FROM vehicles', [], function (err, results) {
//             if (err) {
//                 return reject(error)
//             }

//             // console.log(results);

//             return resolve(results);
//         })
//     })
// }
