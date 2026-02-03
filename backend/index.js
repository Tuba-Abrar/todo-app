const express = require("express");
const { collectionName, connection } = require("./dbconfig");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();

/* ---------- MIDDLEWARES ---------- */
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());


/* ---------- AUTH ROUTES ---------- */

// LOGIN
app.post("/login", async (req, resp) => {
  const userData = req.body;

  if (!userData.email || !userData.password) {
    return resp.send({
      success: false,
      msg: "email or password missing",
    });
  }

  const db = await connection();
  const collection = db.collection("users");

  const result = await collection.findOne({
    email: userData.email,
    password: userData.password,
  });

  if (!result) {
    return resp.send({
      success: false,
      msg: "user not found",
    });
  }

  jwt.sign(result, "Google", { expiresIn: "5d" }, (error, token) => {
    resp
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
      })
      .send({
        success: true,
        msg: "login done",
        token,
      });
  });
});

// SIGNUP
app.post("/signup", async (req, resp) => {
  const userData = req.body;

  if (!userData.email || !userData.password) {
    return resp.send({
      success: false,
      msg: "email or password missing",
    });
  }

  const db = await connection();
  const collection = db.collection("users");

  await collection.insertOne(userData);

  jwt.sign(userData, "Google", { expiresIn: "5d" }, (error, token) => {
    resp
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
      })
      .send({
        success: true,
        msg: "signup done",
        token,
      });
  });
});

/* ---------- TODO ROUTES ---------- */

// ADD TASK
app.post("/add-task", verifyJWTToken, async (req, resp) => {
  const db = await connection();
  const collection = db.collection(collectionName);

  const result = await collection.insertOne(req.body);

  resp.send({
    success: true,
    message: "task added",
    result,
  });
});

// GET ALL TASKS
app.get("/tasks", verifyJWTToken, async (req, resp) => {
  const db = await connection();
  const collection = db.collection(collectionName);

  const result = await collection.find().toArray();

  resp.send({
    success: true,
    message: "tasks fetched",
    result,
  });
});

// GET SINGLE TASK
app.get("/task/:id", verifyJWTToken, async (req, resp) => {
  const db = await connection();
  const collection = db.collection(collectionName);

  const result = await collection.findOne({
    _id: new ObjectId(req.params.id),
  });

  resp.send({
    success: true,
    result,
  });
});

// UPDATE TASK
app.put("/update-task", verifyJWTToken, async (req, resp) => {
  const db = await connection();
  const collection = db.collection(collectionName);

  const { _id, ...fields } = req.body;

  const result = await collection.updateOne(
    { _id: new ObjectId(_id) },
    { $set: fields }
  );

  resp.send({
    success: true,
    message: "task updated",
    result,
  });
});

// DELETE SINGLE TASK
app.delete("/delete/:id", verifyJWTToken, async (req, resp) => {
  const db = await connection();
  const collection = db.collection(collectionName);

  const result = await collection.deleteOne({
    _id: new ObjectId(req.params.id),
  });

  resp.send({
    success: true,
    message: "task deleted",
    result,
  });
});

// DELETE MULTIPLE
app.delete("/delete-multiple", verifyJWTToken, async (req, resp) => {
  const db = await connection();
  const collection = db.collection(collectionName);

  const deleteIds = req.body.map((id) => new ObjectId(id));

  const result = await collection.deleteMany({
    _id: { $in: deleteIds },
  });

  resp.send({
    success: true,
    message: "multiple tasks deleted",
    result,
  });
});

/* ---------- JWT MIDDLEWARE ---------- */
function verifyJWTToken(req, resp, next) {
  const token = req.cookies.token;

  if (!token) {
    return resp.send({
      success: false,
      msg: "no token found",
    });
  }

  jwt.verify(token, "Google", (error, decoded) => {
    if (error) {
      return resp.send({
        success: false,
        msg: "invalid token",
      });
    }
    next();
  });
}

/* ---------- SERVER ---------- */
app.listen(3200, () => {
  console.log("Server running on port 3200");
});
