const jwt = require("jsonwebtoken");
const getDataFromToken = (request) => {
  try {
    const token = request.cookies["token"] || "";
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    return decodedToken;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = getDataFromToken;
