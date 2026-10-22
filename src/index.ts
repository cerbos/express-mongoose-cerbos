import mongoose from "mongoose";
import { app } from "./server.js";
import { seedData } from "./seed.js";

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");
  await seedData();
  app.listen(3000, () => {
    console.log(`🚀 Server ready at: http://localhost:3000`);
  });
}

main();
