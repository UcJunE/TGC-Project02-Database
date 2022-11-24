const express = require("express");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const moment = require("moment");

require("dotenv").config();
// to process our .env file

const MongoUtil = require("./MongoUtil");

const MONGO_URI = process.env.MONGO_URI;
// can only access the process.env.mongoURi after require doteenv from config

const app = express();

app.use(cors());
//enable cross site origin resource sharing

app.use(
  express.urlencoded({
    extended: false,
  })
);

//enable form processing

app.use(express.json());

// we communicate api with JSON format . and the response we get is in JSON format file.

//fetch over validation schema
// const validate = require("./Middleware/validation");
// const validationList = require("./Validation/validationList");

async function main() {
  await MongoUtil.connect(MONGO_URI, "perfumeDB");
  const db = MongoUtil.getDB();
  console.log("Database Connected");

  //this should be the landing page
  app.get("/", function (req, res) {
    res.send("Hello World");
  });

  app.get("/perfume", async function (req, res) {
    const db = MongoUtil.getDB();
    const result = await db.collection("perfume").find({}).toArray();
    res.status(200);
    res.json(result);
    console.log(result);
  });

  app.post("/add-perfume", async function (req, res) {
    //create / add new perfume

    let user = [];
    let review = [];

    let {
      name,
      description,
      type,
      yearLaunch,
      price,
      color,
      picUrl,
      occasion,
      ingredient,
      scent,
      halal,
      volume,
      brand,
    } = req.body;

    try {
      const db = MongoUtil.getDB();
      const result = await db.collection("perfume").insertOne({
        name: name,
        description: description,
        type: type,
        yearLaunch: yearLaunch,
        price: price,
        color: color,
        picUrl: picUrl,
        occasion: occasion,
        ingredient: ingredient,
        scent: scent,
        halal: halal,
        volume: volume,
        brand: brand,
        review: review,
        user: user,
      });
      res.status(200);
      res.send(result);
    } catch (e) {
      res.status(500);
      res.send({
        error: "Internal server error . Please contact administrator",
      });
      console.log(e);
    }
  });

  //to get the data of brand collection
  app.get("/add-brand", async function (req, res) {
    const result = await db.collection("brand").find({}).toArray();
    res.status(200);
    res.json(result);
    console.log(result);
  });

  //create new brand
  app.post("/add-brand", async function (req, res) {
    let { name, description, brandUrl } = req.body;
    try {
      const db = MongoUtil.getDB();
      const result = await db.collection("brand").insertOne({
        name: name,
        description: description,
        brandUrl: brandUrl,
      });
      res.status(200);
      res.send(result);
    } catch (e) {
      res.status(500);
      res.send({
        error: "Internal server error . Please contact administrator",
      });
      console.log(e);
    }
  });

  // to get the data of the user collection
  app.get("/add-user", async function (req, res) {
    const result = await db.collection("user").find({}).toArray();
    res.status(200);
    res.json(result);
    console.log(result);
  });
  //create user
  app.post("/add-user", async function (req, res) {
    let brand = [];
    let review = [];
    let perfume = [];

    let { name, gender, password, email } = req.body;

    try {
      const db = MongoUtil.getDB();
      const result = await db.collection("user").insertOne({
        name: name,
        gender: gender,
        password: password,
        email: email,
        review: review,
        brand: brand,
        perfume: perfume,
      });
      res.status(200);
      res.send(result);
      console.log("successfully added to database");
    } catch (e) {
      res.status(500);
      res.send({
        error: "internal server error . Please contact adminstrator",
      });
      console.log(e);
    }
  });

  // to get the data from review collection
  app.get("/add-review", async function (req, res) {
    const result = await db.collection("review").find({}).toArray();
    res.status(200);
    res.json(result);
    console.log(result);
  });
  //create / add review
  app.post("/add-review", async function (req, res) {
    let user = [];
    let brand = [];

    let date = moment(new Date()).format("DD MMM YYYY");
    let { name, email, description, rating } = req.body;

    try {
      const db = MongoUtil.getDB();
      const result = await db.collection("review").insertOne({
        name: name,
        email: email,
        description: description,
        rating: rating,
        date: date,
        user: user,
        brand: brand,
      });
      res.status(200);
      res.send(result);
    } catch (e) {
      res.status(500);
      res.send({
        error: "internal server error . Please contact adminstrator",
      });
      console.log(e);
    }
  });
}

main();

const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log("Server has started");
});
