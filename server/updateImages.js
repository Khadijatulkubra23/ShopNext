require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find({ image: /loremflickr/ });

  for (const p of products) {
    p.image = `https://picsum.photos/seed/${p._id}/640/640`;
    await p.save();
  }

  console.log(`Updated images for ${products.length} products`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
