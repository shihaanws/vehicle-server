const Connection = require("./../dbconfig");
const { DataTypes } = require("sequelize");

const dbConnection = Connection.connect;

const Users = dbConnection.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey:true,
    },
    username: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports.createUser = function (username) {
  Users.create({  username }).then((data) => {
    console.log(data);
  });
};

module.exports.getAllUsers = async function () {
  const [results, metadata] = await Connection.connect.query(
    "SELECT * FROM users"
  );
  console.log(results);
  return results;
};

module.exports.deleteUser = async function (id) {
  const [results1, metadata] = await Connection.connect.query(
    `DELETE FROM users WHERE id=${id}`
  );
  console.log(results1);
  return results1;
};

// dbConnection.drop().then(()=>{
//     dbConnection.sync();
// })
// dbConnection.sync();
