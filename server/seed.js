require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");
const Product = require("./models/Product");

const categories = [
  { name: "Home Decor", description: "Pieces that make a space feel like yours." },
  { name: "Kitchen & Dining", description: "Everyday essentials for cooking and serving." },
  { name: "Fashion", description: "Timeless basics and easy everyday wear." },
  { name: "Beauty & Care", description: "Gentle, simple self-care favourites." },
  { name: "Stationery", description: "Notebooks, pens and desk companions." },
  { name: "Tech Accessories", description: "Smart add-ons for your devices." },
];

const products = [
  { name: "Ceramic Table Vase", category: "Home Decor", price: 34, stock: 18, featured: true, keyword: "vase", description: "A hand-finished ceramic vase with a soft matte glaze. Sits beautifully on a shelf, table or windowsill with fresh or dried flowers." },
  { name: "Woven Storage Basket", category: "Home Decor", price: 28, stock: 25, featured: false, keyword: "basket", description: "Tightly woven natural basket for blankets, laundry or toys. Sturdy handles and a clean, neutral look." },
  { name: "Linen Cushion Cover", category: "Home Decor", price: 19, stock: 40, featured: false, keyword: "cushion", description: "Soft, breathable linen cover with a hidden zip. Easy to wash and gets better with every wash." },
  { name: "Scented Soy Candle", category: "Home Decor", price: 22, stock: 30, featured: true, keyword: "candle", description: "Hand-poured soy wax candle with a warm cedar and vanilla scent. Burns clean for around 40 hours." },

  { name: "Stoneware Dinner Set", category: "Kitchen & Dining", price: 79, stock: 12, featured: true, keyword: "dinnerware", description: "Twelve-piece stoneware set including plates and bowls. Dishwasher and microwave safe, with a speckled cream finish." },
  { name: "Acacia Wood Cutting Board", category: "Kitchen & Dining", price: 32, stock: 20, featured: false, keyword: "cuttingboard", description: "Durable acacia board with a juice groove, gentle on knives and finished with food-safe oil." },
  { name: "Glass Teapot with Infuser", category: "Kitchen & Dining", price: 26, stock: 15, featured: false, keyword: "teapot", description: "Heat-resistant borosilicate glass teapot with a removable infuser, ideal for loose-leaf tea." },
  { name: "Cast Iron Skillet", category: "Kitchen & Dining", price: 45, stock: 10, featured: false, keyword: "skillet", description: "Pre-seasoned 10-inch cast iron skillet with even heat and a lifetime of use ahead of it." },

  { name: "Classic Cotton Tee", category: "Fashion", price: 24, stock: 60, featured: false, keyword: "tshirt", description: "Midweight 100% cotton tee with a relaxed fit and a soft, structured feel." },
  { name: "Canvas Tote Bag", category: "Fashion", price: 18, stock: 50, featured: true, keyword: "totebag", description: "Roomy heavy-duty canvas tote with an inner pocket, perfect for work, groceries or the beach." },
  { name: "Knitted Wool Scarf", category: "Fashion", price: 29, stock: 22, featured: false, keyword: "scarf", description: "Warm, lightweight knitted scarf in a neutral tone that goes with everything." },
  { name: "Leather Card Wallet", category: "Fashion", price: 36, stock: 28, featured: false, keyword: "wallet", description: "Slim full-grain leather wallet with four card slots and a central cash pocket." },

  { name: "Shea Butter Hand Cream", category: "Beauty & Care", price: 12, stock: 70, featured: false, keyword: "handcream", description: "Rich but quick-absorbing hand cream with shea butter and a light, fresh scent." },
  { name: "Rose Face Mist", category: "Beauty & Care", price: 16, stock: 35, featured: false, keyword: "facemist", description: "Refreshing rose water mist to hydrate and set your skin at any time of day." },
  { name: "Bamboo Bath Set", category: "Beauty & Care", price: 27, stock: 18, featured: true, keyword: "bath", description: "Bamboo brush, soap dish and tray for a clean, spa-like bathroom." },
  { name: "Natural Bar Soap Trio", category: "Beauty & Care", price: 14, stock: 45, featured: false, keyword: "soap", description: "Three gentle, plant-based bars in lavender, oat and citrus. Made in small batches." },

  { name: "Hardcover Dotted Notebook", category: "Stationery", price: 15, stock: 55, featured: true, keyword: "notebook", description: "A5 notebook with 192 dotted pages of thick, ink-friendly paper and a ribbon marker." },
  { name: "Brass Fountain Pen", category: "Stationery", price: 38, stock: 14, featured: false, keyword: "fountainpen", description: "Smooth-writing fountain pen with a brushed brass body and a fine nib." },
  { name: "Desk Organizer Set", category: "Stationery", price: 31, stock: 24, featured: false, keyword: "deskorganizer", description: "Three-piece wooden desk organizer for pens, notes and small essentials." },
  { name: "Weekly Planner Pad", category: "Stationery", price: 11, stock: 65, featured: false, keyword: "planner", description: "Undated tear-off weekly planner with a to-do list and notes section." },

  { name: "Wireless Charging Pad", category: "Tech Accessories", price: 29, stock: 32, featured: false, keyword: "charger", description: "Fast 15W wireless charger with a non-slip surface and a slim, minimal design." },
  { name: "Laptop Sleeve 14\"", category: "Tech Accessories", price: 25, stock: 38, featured: false, keyword: "laptop", description: "Padded felt sleeve with a soft lining that protects your laptop from bumps and scratches." },
  { name: "Cable Organizer Kit", category: "Tech Accessories", price: 13, stock: 80, featured: false, keyword: "cables", description: "Reusable silicone cable ties and clips to keep your desk and bag tidy." },
  { name: "Bluetooth Speaker Mini", category: "Tech Accessories", price: 42, stock: 16, featured: true, keyword: "speaker", description: "Pocket-sized speaker with rich sound, 10-hour battery and splash resistance." },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  if (process.argv.includes("--reset")) {
    await Product.deleteMany({});
    console.log("Existing products removed");
  }

  const categoryIds = {};
  for (const c of categories) {
    const doc = await Category.findOneAndUpdate({ name: c.name }, c, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    categoryIds[c.name] = doc._id;
  }

  let added = 0;
  for (const [i, p] of products.entries()) {
    const { category, keyword, ...rest } = p;
    if (await Product.findOne({ name: p.name })) continue;
    await Product.create({
      ...rest,
      category: categoryIds[category],
      image: `https://loremflickr.com/640/640/${keyword}?lock=${i + 1}`,
    });
    added++;
  }

  console.log(`Done: ${categories.length} categories ready, ${added} products added`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
