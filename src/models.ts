import mongoose, { Schema, model } from "mongoose";

// Define models
export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  username: string;
  role: "admin" | "user";
  department: "IT" | "Sales" | "Marketing";
}

export interface IContact {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  marketingOptIn: boolean;
  active: boolean;
  owner: mongoose.Types.ObjectId;
}

declare global {
  namespace Express {
    interface Request {
      user: IUser;
      auth: {
        user: string;
      };
    }
  }
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
});
const contactSchema = new Schema<IContact>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  marketingOptIn: { type: Boolean, required: true },
  active: { type: Boolean, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

// 3. Create a Model.
export const User = model<IUser>("User", userSchema, undefined, {
  overwriteModels: true,
});
export const Contact = model<IContact>("Contact", contactSchema, undefined, {
  overwriteModels: true,
});
