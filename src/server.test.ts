import request from "supertest";
import { app } from "./server.js";
import mongoose from "mongoose";
import { seedData } from "./seed.js";
import { IContact } from "./models.js";

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");
});

beforeEach(async () => {
  await seedData();
});

afterAll(async () => {
  await mongoose.disconnect();
});

function extractId(c: IContact) {
  return c._id.toString();
}

describe("GET /contacts", function () {
  it("alice", async function () {
    const response = await request(app)
      .get("/contacts")
      .auth("alice", "supersecret")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response.body.contacts.map(extractId)).toEqual([
      "64b91a27af1d18f54c5cde2b",
      "64b91a2c51101541e320f892",
      "64b91a3341475fff928ff83c",
      "64b91a37a8d29a4728afd661",
      "64b91a3f8824a9649a0671fe",
    ]);
  });

  it("john", async function () {
    const response = await request(app)
      .get("/contacts")
      .auth("john", "password1234")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response.body.contacts.map(extractId)).toEqual([
      "64b91a27af1d18f54c5cde2b",
      "64b91a2c51101541e320f892",
      "64b91a3341475fff928ff83c",
      "64b91a3f8824a9649a0671fe",
    ]);
  });
});
