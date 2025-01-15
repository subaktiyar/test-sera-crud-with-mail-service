require("dotenv").config();
process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const User = require("../models/user.model");
const mongoose = require("mongoose");

chai.use(chaiHttp);
chai.should();

describe("User API", function () {
  this.beforeAll(async function () {
    await User.deleteMany({});
  });

  this.afterAll(async function () {
    await mongoose.connection.close();
  });

  describe("POST /api/users", () => {
    it("should create a new user", function (done) {
      chai
        .request(app)
        .post("/api/users")
        .send({ name: "John Doe", email: "john@example.com", age: 10 })
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have.property("name").eql("John Doe");
          res.body.should.have.property("email").eql("john@example.com");
          res.body.should.have.property("age").eql(10);
          done();
        });
    });
  });

  describe("GET /api/users", () => {
    it("should get all users", (done) => {
      chai
        .request(app)
        .get("/api/users")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("data").which.is.a("array");
          res.body.data.length.should.be.above(0);
          res.body.should.have.property("page").a("number");
          res.body.should.have.property("limit").a("number");
          res.body.should.have.property("total").a("number");
          done();
        });
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update an existing user", function (done) {
      const user = new User({ name: "Jane Doe", email: "jane@example.com", age: 10 });

      user.save().then(() => {
        chai
          .request(app)
          .put(`/api/users/${user._id}`)
          .send({ name: "Jane Smith", email: "jane.smith@example.com" })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property("name").eql("Jane Smith");
            done();
          });
      });
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete a user", (done) => {
      const user = new User({ name: "John Doe", email: "john.doe@example.com", age: 10 });
      user.save().then(() => {
        chai
          .request(app)
          .delete(`/api/users/${user._id}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property("message").eql("User deleted");
            done();
          });
      });
    });
  });
});
