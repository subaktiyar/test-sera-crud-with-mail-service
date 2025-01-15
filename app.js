require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const connectDB = require("./configs/database");
const userRoutes = require("./routes/user.route");
const { connectRabbitMQ } = require("./configs/rabbitmq");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

connectDB();
connectRabbitMQ();

app.get("/", (req, res) => res.send("Hello World!"));
app.use("/api", userRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Invalid routes!" });
});

module.exports = app;
