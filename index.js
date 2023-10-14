require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./model/user");
const Admin = require("./model/admin");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

mongoose.connect(process.env.URL);

app.use(express.json());
app.use(cors());

function authenticate(req, res, next) {
  if (req.headers.author) {
    let decode = jwt.verify(req.headers.author, process.env.key);
    req.abe = decode.id;
    next();
  } else {
    res.json({ message: "is unauhtorized" });
  }
}

app.get("/get", authenticate, async (req, res) => {
  try {
    const data = await User.find({ create: req.abe });
    res.status(201).json(data);
  } catch (error) {
    res.json({ message: "coul't get" });
  }
});

app.get("/get/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const data = await User.findById({ _id: id });
    res.status(201).json(data);
  } catch (error) {
    res.json({ message: "coul't get one" });
  }
});

app.post("/pos", authenticate, async (req, res) => {
  const { name, post } = req.body;

  try {
    const data = await User.create({ name, post, create: req.abe });
    res.status(201).json(data);
  } catch (error) {
    res.json({ message: "coul't post" });
  }
});

app.put("/put/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, post } = req.body;

  try {
    const data = await User.findByIdAndUpdate({ _id: id }, { name, post });
    res.status(201).json(data);
  } catch (error) {
    res.json({ message: "coul't upadate" });
  }
});

app.delete("/del/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const data = await User.findByIdAndDelete({ _id: id });
    res.status(201).json(data);
  } catch (error) {
    res.json({ message: "coul't delete" });
  }
});

///////////////////////////////////Admin///////////////////////////////////////

app.get("/reg", async (req, res) => {
  try {
    const data = await Admin.find();
    res.status(201).json(data);
  } catch (error) {
    console.log(error);
  }
});

app.post("/reg", async (req, res) => {
  const { name, email, pass } = req.body;
  try {
    const salt = bcryptjs.genSaltSync(1);
    const hash = bcryptjs.hashSync(pass, salt);
    const data = await Admin.create({ name, email, pass: hash });
    res.status(201).json(data);
  } catch (error) {
    console.log(error);
  }
});

app.post("/log", async (req, res) => {
  const { email, pass } = req.body;

  try {
    const user = await Admin.findOne({ email });
    if (user) {
      let compare = bcryptjs.compareSync(pass, user.pass);
      if (compare) {
        var sign = jwt.sign(
          { id: user._id, email: user.email },
          process.env.key
        );
        res.json({ token: sign });
      } else {
        res.json({ message: "password nto match" });
      }
    } else {
      res.json({ message: "no user exist" });
    }
  } catch (error) {
    console.log(error);
  }
});

//////////////////////////////////user//////////////////////////////////

app.listen(process.env.PORT, () => {
  console.log("seerver connected");
});
