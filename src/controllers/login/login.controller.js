const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const login = async (req, res) => {
  const username = req.body.username;
  const nonPassword = req.body.password; // password input

  let result = {
    errorCode : 1,
    error : ''
  }

  let user = await User.findOne({ username: username }); // check username is exist

  // if username exist
  if (user) {
    const password = user.password; // password real
    const checkPassword = await bcrypt.compare(nonPassword, password); // check password

    if (checkPassword) {
      // if password correct
      //keys
      const privateTokenKey = fs.readFileSync(
        path.resolve(__dirname, "./keys/privateToken.key")
      );
      const privateRefreshKey = fs.readFileSync(
        path.resolve(__dirname, "./keys/privateRefresh.key")
      );
      //token
      const token = jwt.sign(
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
        },
        privateTokenKey,
        { algorithm: "RS256", expiresIn: process.env.EXPIRESIN_TOKEN }
      );

      const refreshToken = jwt.sign(
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
        },
        privateRefreshKey,
        { algorithm: "RS256", expiresIn: process.env.EXPIRESIN_REFRESHTOKEN }
      );
      
      result.errorCode = 0;
      result.token = token;
      result.name = user.name;
      result.email = user.email;
      result.username = user.username;
      result.avt = user.avt;
      result.id = user._id;

      // save refreshToken to user's db
      await User.updateOne(
        { username: user.username },
        { refreshToken: refreshToken }
      );
    } else {
      result.error = "Tên người dùng hoặc mật khẩu không đúng";
    }
  } else {
    result.error = "Tên người dùng hoặc mật khẩu không đúng";
  }

  res.json(result);
};

module.exports.login = login;
