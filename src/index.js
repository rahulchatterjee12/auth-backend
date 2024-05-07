require("dotenv").config();
const app = require("express")();
const PORT = process.env.PORT || 8080;
const dbConnection = require("../src/dbConfig/dbConfig");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

app.use(bodyParser.json());
app.use(cookieParser());

// Handle CORS Error
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api", routes);

dbConnection.then(() => {
  console.log("----Database is connected----");
  app.emit("ready");
});

app.listen(PORT, () => {
  console.log("Server is running on port:", PORT);
});
