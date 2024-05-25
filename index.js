import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import User from "./models/User.model.js";
import mongoose from "mongoose";

config({
  path: ".env.local",
});

const app = express();

// eslint-disable-next-line no-undef
const port = process.env.port || 3000;

// eslint-disable-next-line no-undef
mongoose.connect(process.env.DB_URI);

app.use(cors());
app.use(express.json());

// eslint-disable-next-line no-undef
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;
// eslint-disable-next-line no-undef
const REFRESH_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET;
// eslint-disable-next-line no-undef
const tokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;
// eslint-disable-next-line no-undef
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;

const generateToken = (user) => {
  const data = { _id: user._id, email: user.email };
  return jwt.sign(data, SECRET_KEY, {
    expiresIn: tokenExpiry,
  });
};

const generateRefreshToken = (user) => {
  const data = { _id: user._id, email: user.email };
  return jwt.sign(data, REFRESH_SECRET_KEY, {
    expiresIn: refreshTokenExpiry,
  });
};

app.post("/jwt", async (req, res) => {
  const { email } = req.body;

  const user = await User.find({ email });
  if (!user[0]) {
    return res.status(401).send("Invalid credentials");
  }

  const accessToken = generateToken(user[0]);
  const refreshToken = generateRefreshToken(user[0]);

  res.json({ accessToken, refreshToken });
});

app.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).send("Refresh token is required");
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    const user = await User.find({ email: decoded.email });

    if (!user[0]) {
      return res.status(401).send("Invalid refresh token");
    }

    const newToken = generateToken(user[0]);
    const newRefreshToken = generateRefreshToken(user[0]);

    res.json({ accessToken: newToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(401).send("Invalid refresh token");
  }
});

const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "forbidden access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  // eslint-disable-next-line no-undef
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    console.log(decoded)
    next();
  });
};

app.get("/users", verifyToken, async (req, res) => {
  try {
    return res.send(await User.find(req.query));
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.get("/", async (req, res) => {
  return res.send("Recipe Vault server is Running");
});

app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    return res.status(201).send(result);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(201)
        .send(await User.findOne({ email: req.body.email }));
    }
    return res.status(err.code).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Recipe Vault server is listening on port ${port}`);
});
