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

  //query
  app.get("/perfume", async function (req, res) {
    let criteria = {};
    //search by perfume name(ok)
    if (req.query.name) {
      criteria["name"] = {
        $regex: req.query.name,
        $options: "i",
      };
    }
    //search by type(ok)
    if (req.query.type) {
      criteria["type"] = {
        $eq: req.query.type,
      };
    }

    //search by halal(ok).in fe can render true / false
    if (req.query.halal) {
      criteria["halal"] = {
        $eq: req.query.halal,
      };
    }

    //search via scent(ok)
    if (req.query.scent) {
      criteria["scent"] = {
        $regex: req.query.scent,
        $options: "i",
      };
    }

    //search by email (ok)
    if (req.query.createdBy) {
      criteria["createdBy.userEmail"] = {
        $eq: req.query.createdBy,
      };
    }

    let perfume = await db.collection("perfume").find(criteria).toArray();

    console.log(criteria);
    // console.log(perfume);
    res.json(perfume);
  });
  //create / add new perfume
  app.post("/add-perfume", async function (req, res) {
    let topNote = req.body.ingredient.topNote;
    let middleNote = req.body.ingredient.middleNote;
    let baseNote = req.body.ingredient.baseNote;
    let {
      name,
      description,
      type,
      yearLaunch,
      price,
      color,
      picUrl,
      occasion,
      scent,
      halal,
      createdBy,
      volume,
      rating,
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
        ingredient: {
          topNote: topNote,
          middleNote: middleNote,
          baseNote: baseNote,
        },
        scent: scent,
        halal: halal,
        volume: volume,
        createdBy: createdBy,
        rating: rating,
        brand: brand,
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

  // update particular document via id
  app.put("/update-perfume/:id", async (req, res) => {
    let createdBy = {};
    let volume = [];
    let ingredient = [];

    let {
      name,
      description,
      type,
      yearLaunch,
      price,
      color,
      picUrl,
      occasion,
      scent,
      halal,
      brand,
      rating,
    } = req.body;

    try {
      const db = MongoUtil.getDB();
      const result = await db.collection("perfume").updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
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
            createdBy: createdBy,
            brand: brand,
            rating: rating,
          },
        }
      );
      res.status(200);
      res.json({
        message: "DB updated",
      });
      res.send(result);
    } catch (e) {
      res.status(500);
      res.send({
        error: "Internal server error . Please contact administrator",
      });
    }
  });

  //delete particular document via id
  app.delete("/delete-perfume/:id", async (req, res) => {
    await db.collection("perfume").deleteOne({ _id: ObjectId(req.params.id) });
    res.status(200);
    res.json({
      message: "Document has been deleted",
    });
  });

  // adding review to the main collection document
  app.put("/add-review/:id", async (req, res) => {
    let reviewId = new ObjectId();

    let { reviewText, reviewUsername, reviewEmail } = req.body;

    try {
      await db.collection("perfume").updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $push: {
            reviewBy: {
              reviewId,
              reviewText,
              reviewUsername,
              reviewEmail,
            },
          },
        }
      );
      res.status(200);
      res.json({
        message: "Comment Updated",
      });
    } catch (e) {
      res.status(500);
      res.send({
        error: "Internal server error. Please contact administrator",
      });
    }
  });

  // to get review via email and review id

  //unwind = deconstruct array field .
  //match = filter the doc and pass only docs that matched the specific condition
  //project = if the value is 0 , it will be excluded from showing , while $ will overwrite the current field with the input data
  app.get("/get-review", async (req, res) => {
    let reviewId = req.query.reviewId;
    let reviewEmail = req.query.reviewEmail;

    if (req.query.reviewId) {
      reviewId = req.query.reviewId;
    }
    // console.log(reviewId);

    if (req.query.reviewEmail) {
      reviewEmail = req.query.reviewEmail;
    }
    // console.log(reviewEmail);
    try {
      let result = await db
        .collection("perfume")
        .aggregate([
          {
            $unwind: "$reviewBy",
          },
          {
            $match: {
              "reviewBy.reviewId": ObjectId(reviewId),
              "reviewBy.reviewEmail": reviewEmail,
            },
          },
          {
            $project: {
              reviewId: "$reviewBy.reviewId",
              reviewEmail: "$reviewBy.reviewEmail",
              _id: 0,
            },
          },
        ])
        .toArray();
      res.status(200);
      res.json(result);
    } catch (e) {
      res.status(500);
      res.json({
        message: "Internal server error , please contact administrator",
      });
      console.log(e);
    }
  });

  //to update / delete the  review from the main collection via id
  //$pull = remove from an existing array that matched the value or specified condition
  app.put("/delete-review", async (req, res) => {
    let reviewId = "";

    if (req.body.reviewId) {
      reviewId = req.body.reviewId;
    }

    try {
      await db.collection("perfume").updateOne(
        {
          "reviewBy.reviewId": ObjectId(reviewId),
        },
        {
          $pull: {
            reviewBy: {
              reviewId: ObjectId(reviewId),
            },
          },
        }
      );
      res.status(200);
      res.json({
        Message: "Review has been deleted",
      });
    } catch (e) {
      res.status(500);
      res.json({
        Message: "Internal server error , please contact administrator",
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

  // // to get the data of the user collection
  // app.get("/add-user", async function (req, res) {
  //   const result = await db.collection("user").find({}).toArray();
  //   res.status(200);
  //   res.json(result);
  //   console.log(result);
  // });
  // //create user
  // app.post("/add-user", async function (req, res) {
  //   let brand = [];
  //   let review = [];
  //   let perfume = [];

  //   let { name, gender, password, email } = req.body;

  //   try {
  //     const db = MongoUtil.getDB();
  //     const result = await db.collection("user").insertOne({
  //       name: name,
  //       gender: gender,
  //       password: password,
  //       email: email,
  //       review: review,
  //       brand: brand,
  //       perfume: perfume,
  //     });
  //     res.status(200);
  //     res.send(result);
  //     console.log("successfully added to database");
  //   } catch (e) {
  //     res.status(500);
  //     res.send({
  //       error: "internal server error . Please contact adminstrator",
  //     });
  //     console.log(e);
  //   }
  // });
}

main();

const port = process.env.PORT || 8888;

app.listen(port, function () {
  console.log("Server has started");
  console.log(port);
});
