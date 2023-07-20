import request from "supertest";
import { app } from "./server";
import mongoose from "mongoose";
import { contacts, seedData } from "./seed";
import { IContact } from "./models";

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
  it("responds with json", async function () {
    const response = await request(app)
      .get("/contacts")
      .auth("alice", "supersecret")
      .set("Accept", "application/json");
    expect(response.status).toEqual(200);
    expect(response.body.contacts.map(extractId)).toEqual(
      contacts.map(extractId)
    );
  });
});
