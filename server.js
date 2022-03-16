"use strict";
const Hapi = require("@hapi/hapi");
const path = require("path");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const Connection = require("./dbconfig");
const Users = require("./models/users");
const Jwt = require("@hapi/jwt");
const jwt = require("jsonwebtoken");

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

  //   server.auth.default("my_jwt_stategy")

  // server.auth.strategy('my_jwt_stategy', 'jwt', {
  //     keys: 'some_shared_secret',
  //     verify: {
  //       aud: 'urn:audience:test',
  //       iss: 'urn:issuer:test',
  //       sub: false,
  //       nbf: true,
  //       exp: true,
  //       maxAgeSec: 14400,
  //       timeSkewSec: 15
  //     },
  //     validate: (artifacts, request, h) => {
  //       return {
  //         isValid: true,
  //         credentials: { user: artifacts.decoded.payload.user }
  //       };
  //     }
  //   });

  server.views({
    engines: {
      hbs: require("handlebars"),
    },
    path: path.join(__dirname, "views"),
    // layout: "default"
  });

  server.route([
    {
      method: "GET",
      path: "/",
      handler: (request, h) => {
        return h.file("./welcome.html");
      },
      // options:{
      //     auth:{
      //         mode:"try"
      //     }
      // }
    },
    // {
    //     method: 'GET',
    //     path: '/secret',
    //     config: {
    //     handler(request, h) {
    //         return 'secret';
    //     },
    //     auth: {
    //         strategy: 'my_jwt_stategy',
    //     }
    //     }
    // },
    {
      method: "GET",
      path: "/location",
      handler: (request, h) => {
        return request.location;
      },
    },

    {
      method: "GET",
      path: "/getAllUsers",
      handler: async (request, h) => {
        const users = await Users.getAllUsers();
        console.log(users);
        return users;
      },
    },

    {
      method: "GET",
      path: "/delete/{id}",
      handler: async (request, h) => {
        const users1 = await Users.deleteUser(request.params.id);

        // const users = await Users.getAllUsers();

        // const users = await Users.filteredUsers(request.payload.id);
        console.log(users1);
        return { users1 };
      },
    },

    // handler: async (request, h) => {
    //     const dbConnection = await Connection.connect;
    //     return h.view("loginsuccess",{dbConnection})
    // }

    {
      method: "POST",
      path: "/login",
      handler: (request, h) => {
        Users.createUser(request.payload.username, request.payload.password,request.payload.id);
        const username = request.payload.username;
        const id = request.payload.id;
        return  username;
      },

      // const token = jwt.sign(
      //   {
      //     aud: "urn:audience:test",
      //     iss: "urn:issuer:test",
      //     sub: false,
      //     maxAgeSec: 14400,
      //     timeSkewSec: 15,
      //   },
      //   "some_shared_secret"
      // );
      // return { token1: token, username: request.payload.username };

      // }
      // return token;
    },
  ]);

  server.route({
    method: "GET",
    path: "/users/{use}",
    handler: (request, h) => {
      if (request.params.use) {
        return `<h1>hi da ${request.params.use}</h1>`;
      } else {
        return "<h1>Hello Stranger</h1>";
      }
    },
  });

  await server.start();
  console.log(`server started on : ${server.info.uri}`);
};
process.on("unhandledRejection", (err) => {
  console.log(err);
  // Exit with failure
  process.exit(1);
});
init();

// function getAllUsers() {
//     return new Promise((resolve, reject) => {
//         connection.query('SELECT * FROM users', [], function (err, results) {
//             if (err) {
//                 return reject(error)
//             }

//             // console.log(results);

//             return resolve(results);
//         })
//     })
// }
