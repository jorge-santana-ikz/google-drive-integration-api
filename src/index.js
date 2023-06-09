require("dotenv").config();
const express = require("express");
const routes = require("./routes");

const app = express();

app.use("/", routes);

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
