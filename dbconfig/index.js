const Sequelize = require("sequelize");

const sequelize = new Sequelize("hapi_server", "admin", "password", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
});

module.exports.connect = sequelize;
