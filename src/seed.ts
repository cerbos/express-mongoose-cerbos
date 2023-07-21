import mongoose from "mongoose";
import { IUser, IContact, User, Contact } from "./models";

export const users: IUser[] = [
  {
    _id: new mongoose.Types.ObjectId("64b9196ccca2cace44cbfe9a"),
    name: "Alice",
    username: "alice",
    email: "alice@cerbos.demo",
    role: "admin",
    department: "IT",
  },
  {
    _id: new mongoose.Types.ObjectId("64b91951af68d30da68454d4"),
    name: "John",
    username: "john",
    email: "john@cerbos.demo",
    role: "user",
    department: "Sales",
  },
  {
    _id: new mongoose.Types.ObjectId("64b919725c076433d87051f3"),
    name: "Sarah",
    username: "sarah",
    email: "sarah@cerbos.demo",
    role: "user",
    department: "Sales",
  },
  {
    _id: new mongoose.Types.ObjectId("64b9197665877e48ecc1da21"),
    name: "Geri",
    username: "geri",
    email: "geri@cerbos.demo",
    role: "user",
    department: "Marketing",
  },
];

export const contacts: IContact[] = [
  {
    _id: new mongoose.Types.ObjectId("64b91a27af1d18f54c5cde2b"),
    firstName: "Nick",
    lastName: "Smyth",
    marketingOptIn: true,
    active: true,
    owner: users[1]._id,
  },
  {
    _id: new mongoose.Types.ObjectId("64b91a2c51101541e320f892"),
    firstName: "Simon",
    lastName: "Jaff",
    marketingOptIn: true,
    active: false,
    owner: users[1]._id,
  },

  {
    _id: new mongoose.Types.ObjectId("64b91a3341475fff928ff83c"),
    firstName: "Mary",
    lastName: "Jane",
    active: true,
    marketingOptIn: false,
    owner: users[2]._id,
  },
  {
    _id: new mongoose.Types.ObjectId("64b91a37a8d29a4728afd661"),
    firstName: "Christina",
    lastName: "Baker",
    marketingOptIn: true,
    active: false,
    owner: users[2]._id,
  },
  {
    _id: new mongoose.Types.ObjectId("64b91a3f8824a9649a0671fe"),
    firstName: "Aleks",
    lastName: "Kozlov",
    marketingOptIn: true,
    active: true,
    owner: users[2]._id,
  },
];

export async function seedData() {
  await User.collection.deleteMany({}).then(() => {
    User.collection.insertMany(users);
  });
  await Contact.collection.deleteMany({}).then(() => {
    Contact.collection.insertMany(contacts);
  });
}
