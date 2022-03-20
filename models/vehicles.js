const Connection = require("../dbconfig");
const { DataTypes } = require("sequelize");

const dbConnection = Connection.connect;

const vehicles = dbConnection.define(
  "vehicles",
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    vehicleimage: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    vehiclename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    route: {
      type: DataTypes.STRING,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports.createVehicle = async function (
  currentUser,
  vehicleimage,
  vehiclename,
  route,
  date
) {
  const [results, metadata] = await Connection.connect.query(
    `INSERT INTO vehicles (userId,vehicleimage,vehiclename,route,date )
    VALUES ((SELECT id FROM users WHERE username ='${currentUser}'),'${vehicleimage}','${vehiclename}', '${route}','${date}')`
  );
  // vehicles.create({ vehiclename, route, date }).then((data) => {
  console.log(results);
  return results;
  // });
};

module.exports.updateVehicle = async function (vehiclename, route, date, id) {
  const [results1, metadata] = await Connection.connect.query(
    `UPDATE vehicles SET vehiclename="${vehiclename}",route="${route}", date="${date}"  WHERE id=${id}`
  );
  console.log(results1);
  return results1;
};

module.exports.deleteVehicle = async function (id) {
  const [results1, metadata] = await Connection.connect.query(
    `DELETE FROM vehicles WHERE id=${id}`
  );
  console.log(results1);
  return results1;
};

module.exports.getAllVehicles = async function () {
  const [results, metadata] = await Connection.connect.query(
    "SELECT * FROM vehicles"
  );
  console.log(results);
  return results;
};


// dbConnection.drop().then(()=>{
//     dbConnection.sync();
// })
// dbConnection.sync();
