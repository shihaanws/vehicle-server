const Connection = require("../dbconfig");
const { DataTypes } = require("sequelize");

const dbConnection = Connection.connect;

const users = dbConnection.define(
  "users",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports.signupUser = async function (username, email, password) {
  users.sync();
  const [results, metadata] = await Connection.connect.query(
    `SELECT username from users WHERE username='${username}'`
  );
  console.log(results);
  if (results[0]?.username) {
    console.log("User already exists in database");
    return false;
  } else {
    await users.create({ username, email, password }).then((data) => {
      console.log(data.toJSON());
    });
    return true;
  }
};

module.exports.loginCheck = async (username, password) => {
  const [results, metaData] = await Connection.connect.query(
    // CHECKS  USERNAME PASSWORD PAIR
    `SELECT * FROM users WHERE username='${username}' AND password='${password}'`
  );
  if (results[0]?.username) {
    return {
      login: true,
      email: results[0].email,
      username: results[0].username,
    };
  }
  return { login: false };
};

module.exports.userExistsCheck = async (username) => {
  const [results, metaData] = await Connection.connect.query(
    // CHECKS  USERNAME
    `SELECT * FROM users WHERE username='${username}'`
  );
  if (results[0]?.username) {
    return {
      login: true,
      userID: results[0].id,
      // email: results[0].email,
      // username: results[0].username,
    };
  }
  return { login: false };
};

module.exports.idCheck = async (id) => {
  const [results, metaData] = await Connection.connect.query(
    // CHECKS  ID
    `SELECT * FROM users WHERE id=${id}`
  );
  if (results[0]?.id) {
    return {
      id: true,
      username: results[0].username,

    };
  }
  return { id: false };
};

module.exports.resetPassword = async (password,id) => {
  const [results, metaData] = await Connection.connect.query(
    // RESET PASS
    `UPDATE users SET password="${password}" WHERE id=${id}`
  );
  
  console.log(results)
  return  results 
};

// dbConnection.drop().then(()=>{
//     dbConnection.sync();
// })
// dbConnection.sync();
