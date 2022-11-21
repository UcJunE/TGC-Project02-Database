const express = require("express");
const cors = require("cors");

require("dotenv").config();
// to process our .env file

const MongoUtil = require("./MongoUtil");

const MONGO_URI = process.env.MONGO_URI;
// can only access the process.env.mongouri after require doteenv from config

const app = express();

app.use(express.json());

// we communicate api with JSON format . and the response we get is in JSON format file.

async function main() {
  await MongoUtil.connect(MONGO_URI, "perfume");

  console.log("Database Connected");

  app.get("/", function (req, res) {
    res.send("Hello World");
  });
}

main();

app.listen(3000, function () {
  console.log("Server has started");
});
