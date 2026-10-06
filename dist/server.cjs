var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_node_crypto2 = require("node:crypto");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_node_net = require("node:net");
var import_vite = require("vite");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_mongoose = __toESM(require("mongoose"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_node_crypto = require("node:crypto");
var adminSchema = new import_mongoose.default.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
var userSchema = new import_mongoose.default.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user"], default: "user" },
  createdAt: { type: Date, default: Date.now }
});
var productSchema = new import_mongoose.default.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  images: [{ type: String }],
  colors: [{ type: String }],
  sizes: [{ type: String }],
  stock: { type: Number, default: 0 },
  material: { type: String, default: "Premium Chiffon / Nidha" },
  categoryId: { type: String },
  featured: { type: Boolean, default: false },
  sale: { type: Boolean, default: false },
  status: { type: String, default: "in_stock" },
  popularity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
var orderSchema = new import_mongoose.default.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String },
  area: { type: String, required: true },
  note: { type: String },
  products: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      color: String,
      size: String,
      image: String
    }
  ],
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: "Cash on Delivery" },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
var categorySchema = new import_mongoose.default.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
var MongoAdmin = import_mongoose.default.models.Admin || import_mongoose.default.model("Admin", adminSchema);
var MongoUser = import_mongoose.default.models.User || import_mongoose.default.model("User", userSchema);
var MongoProduct = import_mongoose.default.models.Product || import_mongoose.default.model("Product", productSchema);
var MongoOrder = import_mongoose.default.models.Order || import_mongoose.default.model("Order", orderSchema);
var MongoCategory = import_mongoose.default.models.Category || import_mongoose.default.model("Category", categorySchema);
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DATA_FILE = import_path.default.join(DATA_DIR, "db.json");
var isMongoConnected = false;
function ensureDataFile() {
  if (!import_fs.default.existsSync(DATA_DIR)) {
    import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (import_fs.default.existsSync(DATA_FILE)) {
    try {
      const content = import_fs.default.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return {
        admins: Array.isArray(parsed.admins) ? parsed.admins : [],
        users: Array.isArray(parsed.users) ? parsed.users : [],
        products: Array.isArray(parsed.products) ? parsed.products : [],
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : []
      };
    } catch {
    }
  }
  const initialData = {
    admins: [],
    users: [],
    products: [],
    categories: [],
    orders: []
  };
  import_fs.default.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf-8");
  return initialData;
}
function saveStore(store) {
  try {
    import_fs.default.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving local database store:", err);
    throw new Error("Could not save the local database store.", { cause: err });
  }
}
function categorySlug(name) {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}
var INITIAL_PRODUCTS = [
  {
    name: "Kiam Natural Tri-Ply Cookware Set",
    description: "A versatile stainless-steel cookware collection with tri-ply construction, glass lids, and pieces for everyday cooking.",
    price: 6850,
    images: [
      "/uploads/cookware-01-tri-ply-set.jpg",
      "/uploads/cookware-09-natural-tri-ply.jpg",
      "/uploads/cookware-26-stainless-tri-ply-catalog.jpg"
    ],
    colors: ["Stainless Steel"],
    sizes: ["Cookware Set"],
    stock: 18,
    material: "Tri-ply stainless steel",
    featured: true,
    sale: false,
    status: "in_stock",
    popularity: 98
  },
  {
    name: "Kiam Red Ceramic Cookware Collection",
    description: "A striking red ceramic cookware set with matching lids and pans, designed to bring practical everyday pieces together in one collection.",
    price: 6990,
    images: [
      "/uploads/cookware-02-red-ceramic-set.jpg",
      "/uploads/cookware-03-red-family-pack.jpg",
      "/uploads/cookware-04-red-ceramic-cookware.jpg",
      "/uploads/cookware-05-red-ceramic-set.jpg",
      "/uploads/cookware-06-red-ceramic-catalog.jpg",
      "/uploads/cookware-07-red-pan-set.jpg"
    ],
    colors: ["Red"],
    sizes: ["Cookware Set"],
    stock: 16,
    material: "Ceramic-coated cookware",
    featured: true,
    sale: false,
    status: "in_stock",
    popularity: 96
  },
  {
    name: "Kiam Dia Cast Non-Stick Cookware Set",
    description: "A non-stick cookware collection with frypans and lidded pots in practical sizes for home cooking.",
    price: 5490,
    images: [
      "/uploads/cookware-08-dia-cast-nonstick.jpg",
      "/uploads/cookware-10-black-nonstick-catalog.jpg",
      "/uploads/cookware-11-black-nonstick-sets.jpg",
      "/uploads/cookware-12-classic-nonstick.jpg",
      "/uploads/cookware-13-copper-ceramic-catalog.jpg",
      "/uploads/cookware-14-nonstick-set-catalog.jpg",
      "/uploads/cookware-15-black-nonstick-pans.jpg"
    ],
    colors: ["Black", "Copper"],
    sizes: ["Cookware Set"],
    stock: 20,
    material: "Non-stick coated cookware",
    featured: true,
    sale: false,
    status: "in_stock",
    popularity: 94
  },
  {
    name: "Kiam Stainless Steel Belly Casserole",
    description: "A stainless-steel belly casserole with a fitted lid and side handles, suitable for serving and everyday cooking.",
    price: 2450,
    images: [
      "/uploads/cookware-29-stainless-belly-pot.jpg"
    ],
    colors: ["Stainless Steel"],
    sizes: ["Standard"],
    stock: 24,
    material: "Stainless steel",
    featured: true,
    sale: false,
    status: "in_stock",
    popularity: 86
  },
  {
    name: "Kiam Stainless Steel Pressure Cooker",
    description: "A durable pressure cooker collection for faster everyday meal preparation. Select the capacity that suits your kitchen.",
    price: 3550,
    images: [
      "/uploads/cookware-16-pressure-cooker.jpg",
      "/uploads/cookware-17-pressure-cooker-range.jpg",
      "/uploads/cookware-18-pressure-cooker-premium.jpg",
      "/uploads/cookware-19-pressure-cooker-catalog.jpg",
      "/uploads/cookware-28-pressure-cooker-listing.jpg",
      "/uploads/cookware-32-pressure-cooker-product.jpg",
      "/uploads/cookware-33-pressure-cooker-set.jpg"
    ],
    colors: ["Stainless Steel"],
    sizes: ["3.5 L", "5.5 L"],
    stock: 20,
    material: "Stainless steel",
    featured: true,
    sale: false,
    status: "in_stock",
    popularity: 92
  },
  {
    name: "Kiam Rice Cooker",
    description: "An everyday electric rice cooker with a covered cooking pot, available in multiple capacities.",
    price: 3250,
    images: [
      "/uploads/cookware-20-rice-cookers.jpg",
      "/uploads/cookware-21-rice-cookers-range.jpg"
    ],
    colors: ["Red", "Green", "Silver"],
    sizes: ["2.8 L"],
    stock: 14,
    material: "Metal body with inner cooking pot",
    featured: true,
    sale: false,
    status: "in_stock",
    popularity: 84
  },
  {
    name: "Kiam 3-in-1 Mixer Grinder",
    description: "A multi-purpose mixer grinder supplied with multiple jars for blending, grinding, and everyday kitchen preparation.",
    price: 4250,
    images: [
      "/uploads/cookware-22-mixer-grinder.jpg",
      "/uploads/cookware-23-mixer-grinder-range.jpg",
      "/uploads/cookware-24-turbo-mixer.jpg",
      "/uploads/cookware-25-mixer-grinder-premium.jpg",
      "/uploads/cookware-27-mixer-base.jpg",
      "/uploads/cookware-30-blender.jpg",
      "/uploads/cookware-31-blender-premium.jpg"
    ],
    colors: ["White", "Black", "Red"],
    sizes: ["3 Jar"],
    stock: 15,
    material: "Appliance-grade motor with stainless-steel jars",
    featured: true,
    sale: false,
    status: "in_stock",
    popularity: 90
  }
];
async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.trim().length === 0) {
    isMongoConnected = false;
    await seedLocalStore();
    console.log("Using local JSON database because MONGODB_URI is not configured.");
    return;
  }
  try {
    console.log("Attempting connection to MongoDB via MONGODB_URI...");
    await import_mongoose.default.connect(mongoUri, { serverSelectionTimeoutMS: 4e3 });
    isMongoConnected = true;
    console.log("\u2705 Connected to MongoDB successfully.");
    if (process.env.RESET_CATALOG_AND_ORDERS === "true") {
      await clearMongoCatalogAndOrders();
    } else {
      await migrateLocalDataToMongo();
    }
    await seedMongoDb();
  } catch (err) {
    isMongoConnected = false;
    await seedLocalStore();
    console.warn(`MongoDB connection failed; using local JSON database instead. ${String(err)}`);
  }
}
async function migrateLocalDataToMongo() {
  const store = ensureDataFile();
  let migrated = 0;
  for (const category of store.categories || []) {
    const exists = await MongoCategory.findById(category._id);
    if (!exists) {
      await MongoCategory.create(category);
      migrated += 1;
    }
  }
  for (const admin of store.admins) {
    const exists = await MongoAdmin.findOne({ email: admin.email.toLowerCase() });
    if (!exists) {
      await MongoAdmin.create({
        name: admin.name,
        phone: admin.phone,
        email: admin.email.toLowerCase(),
        password: admin.password,
        createdAt: admin.createdAt
      });
      migrated += 1;
    } else if (exists.password !== admin.password) {
      await MongoAdmin.updateOne(
        { email: admin.email.toLowerCase() },
        {
          $set: {
            name: admin.name,
            phone: admin.phone,
            password: admin.password
          }
        }
      );
      migrated += 1;
    }
  }
  for (const user of store.users) {
    const exists = await MongoUser.findOne({ email: user.email.toLowerCase() });
    if (!exists) {
      await MongoUser.create({
        name: user.name,
        phone: user.phone,
        email: user.email.toLowerCase(),
        password: user.password,
        role: user.role,
        createdAt: user.createdAt
      });
      migrated += 1;
    }
  }
  for (const order of store.orders) {
    const exists = await MongoOrder.findOne({ orderId: order.orderId });
    if (!exists) {
      await MongoOrder.create({
        orderId: order.orderId,
        customerName: order.customerName,
        phone: order.phone,
        email: order.email,
        address: order.address,
        city: order.city,
        district: order.district,
        area: order.area,
        note: order.note,
        products: order.products,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        total: order.total,
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      });
      migrated += 1;
    }
  }
  if (migrated > 0) {
    console.log(`\u2705 Migrated ${migrated} local record(s) to MongoDB.`);
  }
}
async function seedLocalStore() {
  const store = ensureDataFile();
  if (process.env.RESET_CATALOG_AND_ORDERS === "true") {
    store.products = [];
    store.categories = [];
    store.orders = [];
  }
  if (store.products.length === 0 && process.env.RESET_CATALOG_AND_ORDERS !== "true") {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    store.products = INITIAL_PRODUCTS.map((product, index) => ({
      ...product,
      _id: `prod_seed_${index + 1}`,
      createdAt: now,
      updatedAt: now
    }));
    store.categories = [
      { _id: "category_cookware", name: "Cookware Sets", slug: "cookware-sets", createdAt: now, updatedAt: now },
      { _id: "category_pots", name: "Pots & Casseroles", slug: "pots-casseroles", createdAt: now, updatedAt: now },
      { _id: "category_pressure", name: "Pressure Cookers", slug: "pressure-cookers", createdAt: now, updatedAt: now },
      { _id: "category_rice", name: "Rice Cookers", slug: "rice-cookers", createdAt: now, updatedAt: now },
      { _id: "category_blenders", name: "Blenders & Mixers", slug: "blenders-mixers", createdAt: now, updatedAt: now }
    ];
    store.products[0].categoryId = "category_cookware";
    store.products[1].categoryId = "category_cookware";
    store.products[2].categoryId = "category_cookware";
    store.products[3].categoryId = "category_pots";
    store.products[4].categoryId = "category_pressure";
    store.products[5].categoryId = "category_rice";
    store.products[6].categoryId = "category_blenders";
  }
  const adminEmail = process.env.ADMIN_EMAIL || "kepten290@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "455014As";
  const existingAdmin = store.admins.find((a) => a.email.toLowerCase() === adminEmail.toLowerCase());
  if (!existingAdmin) {
    const hashedPassword = await import_bcryptjs.default.hash(adminPassword, 10);
    store.admins.push({
      _id: "admin_1",
      name: "Arabian Saaj Administrator",
      email: adminEmail,
      password: hashedPassword,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  saveStore(store);
}
async function seedMongoDb() {
  try {
    await cleanupDemoMongoData();
    const adminEmail = process.env.ADMIN_EMAIL || "kepten290@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "455014As";
    const adminExists = await MongoAdmin.findOne({ email: adminEmail });
    if (!adminExists) {
      const hashedPassword = await import_bcryptjs.default.hash(adminPassword, 10);
      await MongoAdmin.create({
        name: "Arabian Saaj Administrator",
        email: adminEmail,
        password: hashedPassword
      });
      console.log("Seeded Mongo Admin user.");
    }
  } catch (err) {
    console.error("Error during Mongo seeding:", err);
  }
}
async function clearMongoCatalogAndOrders() {
  const products = await MongoProduct.deleteMany({});
  const categories = await MongoCategory.deleteMany({});
  const orders = await MongoOrder.deleteMany({});
  const users = await MongoUser.deleteMany({});
  console.log(`\u{1F9F9} Reset MongoDB catalog, categories, orders, and users: ${products.deletedCount || 0} product(s), ${categories.deletedCount || 0} categor(y/ies), ${orders.deletedCount || 0} order(s), ${users.deletedCount || 0} user(s) removed.`);
}
async function cleanupDemoMongoData() {
  const removedOrders = await MongoOrder.deleteMany({
    orderId: { $in: ["AS-2026-1082", "AS-2026-1083"] }
  });
  const removedUsers = await MongoUser.deleteMany({
    email: {
      $in: ["tasnim.sultana@example.com", "fatima.n@example.com"],
      $regex: /^(tasnim\.sultana|fatima\.n)@example\.com$/i
    }
  });
  const removedTestUsers = await MongoUser.deleteMany({
    email: { $regex: /^signup-check-.*@example\.com$/i }
  });
  const removed = (removedOrders.deletedCount || 0) + (removedUsers.deletedCount || 0) + (removedTestUsers.deletedCount || 0);
  if (removed > 0) {
    console.log(`\u{1F9F9} Removed ${removed} demo MongoDB record(s).`);
  }
}
var Database = {
  // CATEGORIES
  async getCategories() {
    if (isMongoConnected) {
      const categories = await MongoCategory.find({}).sort({ name: 1 }).exec();
      return categories.map((category) => ({ ...category.toObject(), _id: category._id.toString() }));
    }
    return ensureDataFile().categories.sort((a, b) => a.name.localeCompare(b.name));
  },
  async createCategory(name) {
    const normalizedName = name.trim();
    const slug = categorySlug(normalizedName);
    const duplicate = (await this.getCategories()).some(
      (category2) => category2.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase()
    );
    if (duplicate) throw new Error("A category with this name already exists.");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const category = {
      _id: `category_${(0, import_node_crypto.randomUUID)()}`,
      name: normalizedName,
      slug,
      createdAt: now,
      updatedAt: now
    };
    if (isMongoConnected) {
      const created = await MongoCategory.create(category);
      return { ...created.toObject(), _id: created._id.toString() };
    }
    const store = ensureDataFile();
    store.categories.push(category);
    saveStore(store);
    return category;
  },
  async updateCategory(id, name) {
    const normalizedName = name.trim();
    const duplicate = (await this.getCategories()).some(
      (category2) => category2._id !== id && category2.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase()
    );
    if (duplicate) throw new Error("A category with this name already exists.");
    const update = { name: normalizedName, slug: categorySlug(normalizedName), updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    if (isMongoConnected) {
      const category2 = await MongoCategory.findByIdAndUpdate(id, update, { new: true });
      return category2 ? { ...category2.toObject(), _id: category2._id.toString() } : null;
    }
    const store = ensureDataFile();
    const category = store.categories.find((item) => item._id === id);
    if (!category) return null;
    Object.assign(category, update);
    saveStore(store);
    return category;
  },
  async deleteCategory(id) {
    if (isMongoConnected) {
      const category = await MongoCategory.findByIdAndDelete(id);
      if (!category) return false;
      await MongoProduct.updateMany({ categoryId: id }, { $unset: { categoryId: 1 } });
      return true;
    }
    const store = ensureDataFile();
    const initialLength = store.categories.length;
    store.categories = store.categories.filter((category) => category._id !== id);
    if (store.categories.length === initialLength) return false;
    store.products.forEach((product) => {
      if (product.categoryId === id) delete product.categoryId;
    });
    saveStore(store);
    return true;
  },
  // PRODUCTS
  async getProducts(filter = {}) {
    if (isMongoConnected) {
      const query = {};
      if (filter.featured) query.featured = true;
      if (filter.sale) query.sale = true;
      if (filter.search) {
        query.$or = [
          { name: { $regex: filter.search, $options: "i" } },
          { description: { $regex: filter.search, $options: "i" } },
          { material: { $regex: filter.search, $options: "i" } }
        ];
      }
      let q = MongoProduct.find(query);
      if (filter.sort === "price_asc") q = q.sort({ price: 1 });
      else if (filter.sort === "price_desc") q = q.sort({ price: -1 });
      else if (filter.sort === "popular") q = q.sort({ popularity: -1 });
      else q = q.sort({ createdAt: -1 });
      const prods = await q.exec();
      return prods.map((p) => ({ ...p.toObject(), _id: p._id.toString() }));
    }
    const store = ensureDataFile();
    let result = [...store.products];
    if (filter.featured) {
      result = result.filter((p) => p.featured);
    }
    if (filter.sale) {
      result = result.filter((p) => p.sale);
    }
    if (filter.search && filter.search.trim()) {
      const s = filter.search.toLowerCase().trim();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.material && p.material.toLowerCase().includes(s)
      );
    }
    if (filter.sort === "price_asc") {
      result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (filter.sort === "price_desc") {
      result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (filter.sort === "popular") {
      result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  },
  async getProductById(id) {
    if (isMongoConnected) {
      try {
        const p = await MongoProduct.findById(id);
        return p ? { ...p.toObject(), _id: p._id.toString() } : null;
      } catch {
        return null;
      }
    }
    const store = ensureDataFile();
    return store.products.find((p) => p._id === id || p.id === id) || null;
  },
  async createProduct(productData) {
    if (isMongoConnected) {
      const created = await MongoProduct.create(productData);
      return { ...created.toObject(), _id: created._id.toString() };
    }
    const store = ensureDataFile();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newProduct = {
      _id: `prod_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
      name: productData.name || "Untitled Product",
      description: productData.description || "",
      price: Number(productData.price) || 0,
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : void 0,
      images: Array.isArray(productData.images) && productData.images.length > 0 ? productData.images : ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80"],
      colors: Array.isArray(productData.colors) && productData.colors.length > 0 ? productData.colors : ["Classic Noir"],
      sizes: Array.isArray(productData.sizes) && productData.sizes.length > 0 ? productData.sizes : ["Standard"],
      stock: productData.stock !== void 0 ? Number(productData.stock) : 10,
      material: productData.material || "Premium Silk & Chiffon",
      categoryId: productData.categoryId,
      featured: Boolean(productData.featured),
      sale: Boolean(productData.sale),
      status: productData.status || "in_stock",
      popularity: productData.popularity || 50,
      createdAt: now,
      updatedAt: now
    };
    store.products.unshift(newProduct);
    saveStore(store);
    return newProduct;
  },
  async updateProduct(id, updateData) {
    if (isMongoConnected) {
      try {
        const updated2 = await MongoProduct.findByIdAndUpdate(
          id,
          { ...updateData, updatedAt: /* @__PURE__ */ new Date() },
          { new: true }
        );
        return updated2 ? { ...updated2.toObject(), _id: updated2._id.toString() } : null;
      } catch {
        return null;
      }
    }
    const store = ensureDataFile();
    const index = store.products.findIndex((p) => p._id === id || p.id === id);
    if (index === -1) return null;
    const existing = store.products[index];
    const updated = {
      ...existing,
      ...updateData,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.products[index] = updated;
    saveStore(store);
    return updated;
  },
  async deleteProduct(id) {
    if (isMongoConnected) {
      try {
        const res = await MongoProduct.findByIdAndDelete(id);
        return !!res;
      } catch {
        return false;
      }
    }
    const store = ensureDataFile();
    const initialLen = store.products.length;
    store.products = store.products.filter((p) => p._id !== id && p.id !== id);
    saveStore(store);
    return store.products.length < initialLen;
  },
  // ORDERS
  async getOrders(filter = {}) {
    if (isMongoConnected) {
      const query = {};
      if (filter.status && filter.status !== "all") {
        query.status = filter.status;
      }
      if (filter.search) {
        query.$or = [
          { orderId: { $regex: filter.search, $options: "i" } },
          { customerName: { $regex: filter.search, $options: "i" } },
          { phone: { $regex: filter.search, $options: "i" } },
          { email: { $regex: filter.search, $options: "i" } }
        ];
      }
      const ords = await MongoOrder.find(query).sort({ createdAt: -1 }).exec();
      return ords.map((o) => ({ ...o.toObject(), _id: o._id.toString() }));
    }
    const store = ensureDataFile();
    let result = [...store.orders];
    if (filter.status && filter.status !== "all") {
      result = result.filter((o) => o.status === filter.status);
    }
    if (filter.search && filter.search.trim()) {
      const s = filter.search.toLowerCase().trim();
      result = result.filter(
        (o) => o.orderId.toLowerCase().includes(s) || o.customerName.toLowerCase().includes(s) || o.phone.toLowerCase().includes(s) || Boolean(o.email?.toLowerCase().includes(s))
      );
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  },
  async getOrderById(idOrOrderId) {
    if (isMongoConnected) {
      try {
        let o = await MongoOrder.findOne({ $or: [{ _id: idOrOrderId }, { orderId: idOrOrderId }] });
        return o ? { ...o.toObject(), _id: o._id.toString() } : null;
      } catch {
        return null;
      }
    }
    const store = ensureDataFile();
    return store.orders.find((o) => o._id === idOrOrderId || o.orderId === idOrOrderId) || null;
  },
  async createOrder(orderInput) {
    const randomSuffix = Math.floor(1e3 + Math.random() * 9e3);
    const orderId = `AS-2026-${randomSuffix}`;
    const subtotal = orderInput.products.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = orderInput.deliveryCharge ?? 70;
    const total = subtotal + deliveryCharge;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    for (const item of orderInput.products) {
      try {
        const prod = await this.getProductById(item.productId);
        if (prod && prod.stock >= item.quantity) {
          await this.updateProduct(prod._id, {
            stock: Math.max(0, prod.stock - item.quantity),
            popularity: (prod.popularity || 0) + item.quantity * 2
          });
        }
      } catch (err) {
        console.error("Failed to update product stock:", err);
      }
    }
    if (isMongoConnected) {
      const created = await MongoOrder.create({
        orderId,
        customerName: orderInput.customerName,
        phone: orderInput.phone,
        email: orderInput.email || "",
        address: orderInput.address,
        city: orderInput.city,
        district: orderInput.district || "",
        area: orderInput.area,
        note: orderInput.note || "",
        products: orderInput.products,
        subtotal,
        deliveryCharge,
        total,
        paymentMethod: orderInput.paymentMethod || "Cash on Delivery",
        status: "Pending"
      });
      return { ...created.toObject(), _id: created._id.toString() };
    }
    const store = ensureDataFile();
    const newOrder = {
      _id: `ord_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
      orderId,
      customerName: orderInput.customerName,
      phone: orderInput.phone,
      email: orderInput.email,
      address: orderInput.address,
      city: orderInput.city,
      district: orderInput.district,
      area: orderInput.area,
      note: orderInput.note,
      products: orderInput.products,
      subtotal,
      deliveryCharge,
      total,
      paymentMethod: orderInput.paymentMethod || "Cash on Delivery",
      status: "Pending",
      createdAt: now,
      updatedAt: now
    };
    store.orders.unshift(newOrder);
    saveStore(store);
    return newOrder;
  },
  async updateOrderStatus(idOrOrderId, status) {
    if (isMongoConnected) {
      try {
        const updated = await MongoOrder.findOneAndUpdate(
          { $or: [{ _id: idOrOrderId }, { orderId: idOrOrderId }] },
          { status, updatedAt: /* @__PURE__ */ new Date() },
          { new: true }
        );
        return updated ? { ...updated.toObject(), _id: updated._id.toString() } : null;
      } catch {
        return null;
      }
    }
    const store = ensureDataFile();
    const index = store.orders.findIndex((o) => o._id === idOrOrderId || o.orderId === idOrOrderId);
    if (index === -1) return null;
    store.orders[index].status = status;
    store.orders[index].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveStore(store);
    return store.orders[index];
  },
  async deleteOrder(idOrOrderId) {
    if (isMongoConnected) {
      try {
        const res = await MongoOrder.findOneAndDelete({
          $or: [{ _id: idOrOrderId }, { orderId: idOrOrderId }]
        });
        return !!res;
      } catch {
        return false;
      }
    }
    const store = ensureDataFile();
    const initialLen = store.orders.length;
    store.orders = store.orders.filter((o) => o._id !== idOrOrderId && o.orderId !== idOrOrderId);
    saveStore(store);
    return store.orders.length < initialLen;
  },
  // STATS
  async getStats() {
    const products = await this.getProducts();
    const orders = await this.getOrders();
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "Pending").length;
    const completedOrders = orders.filter((o) => o.status === "Delivered").length;
    const totalSales = orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalSales
    };
  },
  // AUTH
  async createAdmin(adminData) {
    const email = adminData.email.trim().toLowerCase();
    const name = adminData.name.trim();
    const phone = adminData.phone?.trim();
    if (isMongoConnected) {
      try {
        const existing2 = await MongoAdmin.findOne({ email });
        if (existing2) {
          return null;
        }
        const created = await MongoAdmin.create({
          name,
          phone,
          email,
          password: adminData.password
        });
        return { ...created.toObject(), _id: created._id.toString() };
      } catch {
        return null;
      }
    }
    const store = ensureDataFile();
    const existing = store.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return null;
    }
    const newAdmin = {
      _id: `admin_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
      name,
      phone,
      email,
      password: adminData.password,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.admins.push(newAdmin);
    saveStore(store);
    return newAdmin;
  },
  async createUser(userData) {
    const email = userData.email.trim().toLowerCase();
    const name = userData.name.trim();
    const phone = userData.phone?.trim();
    if (isMongoConnected) {
      try {
        const existing2 = await MongoUser.findOne({ email });
        if (existing2) {
          return null;
        }
        const created = await MongoUser.create({
          name,
          phone,
          email,
          password: userData.password,
          role: "user"
        });
        return { ...created.toObject(), _id: created._id.toString() };
      } catch {
        return null;
      }
    }
    const store = ensureDataFile();
    const existing = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return null;
    }
    const newUser = {
      _id: `user_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
      name,
      phone,
      email,
      password: userData.password,
      role: "user",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.users.push(newUser);
    saveStore(store);
    return newUser;
  },
  async findAdminByEmail(email) {
    if (isMongoConnected) {
      try {
        const adm = await MongoAdmin.findOne({ email: email.toLowerCase() });
        return adm ? { ...adm.toObject(), _id: adm._id.toString() } : null;
      } catch {
        return null;
      }
    }
    const store = ensureDataFile();
    return store.admins.find((a) => a.email.toLowerCase() === email.toLowerCase()) || null;
  },
  async findUserByEmail(email) {
    if (isMongoConnected) {
      try {
        const user = await MongoUser.findOne({ email: email.toLowerCase() });
        return user ? { ...user.toObject(), _id: user._id.toString() } : null;
      } catch {
        return null;
      }
    }
    const store = ensureDataFile();
    return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }
};

// server/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "arabian_saaj_luxury_secret_jwt_key_2026";
function generateToken(payload) {
  return import_jsonwebtoken.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Admin authentication token required" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    req.adminUser = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired admin token" });
  }
}
function userAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "User authentication required" });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(authHeader.split(" ")[1], JWT_SECRET);
    if (decoded?.role !== "user") return res.status(403).json({ error: "User access required" });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired user token" });
  }
}
async function signupHandler(req, res) {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ error: "Name, phone, email, and password are required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = String(name).trim();
    const normalizedPhone = String(phone).trim();
    if (normalizedName.length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters long" });
    }
    if (normalizedPhone.length < 7) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    if (normalizedEmail.length < 5 || !normalizedEmail.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }
    const existingUser = await Database.findUserByEmail(normalizedEmail);
    const existingAdmin = await Database.findAdminByEmail(normalizedEmail);
    if (existingUser || existingAdmin) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    const hashedPassword = await import_bcryptjs2.default.hash(String(password), 10);
    const user = await Database.createUser({
      name: normalizedName,
      phone: normalizedPhone,
      email: normalizedEmail,
      password: hashedPassword
    });
    if (!user) {
      return res.status(409).json({ error: "This user account already exists" });
    }
    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone || normalizedPhone,
        role: user.role || "user"
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error during signup" });
  }
}
async function loginHandler(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const account = await Database.findAdminByEmail(normalizedEmail);
    if (!account) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isMatch = await import_bcryptjs2.default.compare(String(password), account.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = generateToken({
      id: account._id,
      email: account.email,
      name: account.name
    });
    return res.json({
      success: true,
      token,
      user: {
        id: account._id,
        email: account.email,
        name: account.name
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
}
async function userLoginHandler(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const user = await Database.findUserByEmail(String(email).trim().toLowerCase());
    if (!user || !await import_bcryptjs2.default.compare(String(password), user.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const profile = { id: user._id, email: user.email, name: user.name, phone: user.phone, role: "user" };
    return res.json({ success: true, token: generateToken(profile), user: profile });
  } catch (err) {
    console.error("User login error:", err);
    return res.status(500).json({ error: "Internal server error during user login" });
  }
}
function userMeHandler(req, res) {
  return res.json({ user: req.user });
}
async function meHandler(req, res) {
  if (!req.adminUser) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return res.json({
    user: req.adminUser
  });
}

// server.ts
import_dotenv.default.config({ path: import_path2.default.join(process.cwd(), ".env.local") });
import_dotenv.default.config();
async function findAvailablePort(startPort) {
  let port = startPort;
  while (port < startPort + 20) {
    const available = await new Promise((resolve) => {
      const probe = (0, import_node_net.createServer)();
      probe.once("error", () => resolve(false));
      probe.listen(port, "0.0.0.0", () => {
        probe.close(() => resolve(true));
      });
    });
    if (available) return port;
    port += 1;
  }
  throw new Error(`No available port found between ${startPort} and ${port - 1}`);
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = await findAvailablePort(Number(process.env.PORT) || 3e3);
  app.use((0, import_cors.default)());
  app.use(import_express.default.json({ limit: "15mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "15mb" }));
  const uploadsDir = import_path2.default.join(process.cwd(), "public", "uploads");
  if (!import_fs2.default.existsSync(uploadsDir)) {
    import_fs2.default.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", import_express.default.static(uploadsDir));
  await initDatabase();
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "Arabian Saaj API",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.post("/api/auth/signup", signupHandler);
  app.post("/api/auth/login", loginHandler);
  app.post("/api/auth/user-login", userLoginHandler);
  app.get("/api/auth/user-me", userAuthMiddleware, userMeHandler);
  app.post("/api/auth/logout", (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
  });
  app.get("/api/auth/me", authMiddleware, meHandler);
  app.post("/api/admin/upload-image", authMiddleware, (req, res) => {
    try {
      const imageData = typeof req.body?.image === "string" ? req.body.image : "";
      const match = imageData.match(/^data:(image\/(?:jpeg|png|webp|gif|avif));base64,([\s\S]+)$/);
      if (!match) {
        return res.status(400).json({ error: "Please upload a valid JPEG, PNG, WebP, GIF, or AVIF image." });
      }
      const imageBuffer = Buffer.from(match[2], "base64");
      if (!imageBuffer.length || imageBuffer.length > 10 * 1024 * 1024) {
        return res.status(413).json({ error: "Image must be smaller than 10 MB." });
      }
      const extensionByMime = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/avif": "avif"
      };
      const fileName = `${(0, import_node_crypto2.randomUUID)()}.${extensionByMime[match[1]]}`;
      import_fs2.default.writeFileSync(import_path2.default.join(uploadsDir, fileName), imageBuffer);
      res.status(201).json({ success: true, url: `/uploads/${fileName}` });
    } catch (err) {
      console.error("Image upload failed:", err);
      res.status(500).json({ error: "Failed to save uploaded image." });
    }
  });
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await Database.getCategories();
      res.json({ success: true, categories });
    } catch (err) {
      console.error("Error fetching categories:", err);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  app.post("/api/categories", authMiddleware, async (req, res) => {
    try {
      const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
      if (!name || name.length > 60) {
        return res.status(400).json({ error: "Category name must be between 1 and 60 characters." });
      }
      const category = await Database.createCategory(name);
      res.status(201).json({ success: true, category });
    } catch (err) {
      if (err instanceof Error && err.message.includes("already exists")) {
        return res.status(409).json({ error: err.message });
      }
      console.error("Error creating category:", err);
      res.status(500).json({ error: "Failed to create category" });
    }
  });
  app.put("/api/categories/:id", authMiddleware, async (req, res) => {
    try {
      const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
      if (!name || name.length > 60) {
        return res.status(400).json({ error: "Category name must be between 1 and 60 characters." });
      }
      const category = await Database.updateCategory(req.params.id, name);
      if (!category) return res.status(404).json({ error: "Category not found." });
      res.json({ success: true, category });
    } catch (err) {
      if (err instanceof Error && err.message.includes("already exists")) {
        return res.status(409).json({ error: err.message });
      }
      console.error("Error updating category:", err);
      res.status(500).json({ error: "Failed to update category" });
    }
  });
  app.delete("/api/categories/:id", authMiddleware, async (req, res) => {
    try {
      const deleted = await Database.deleteCategory(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Category not found." });
      res.json({ success: true, message: "Category deleted successfully." });
    } catch (err) {
      console.error("Error deleting category:", err);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });
  app.get("/api/products", async (req, res) => {
    try {
      const { search, sort, featured, sale } = req.query;
      const products = await Database.getProducts({
        search: search ? String(search) : void 0,
        sort: sort ? String(sort) : void 0,
        featured: featured === "true",
        sale: sale === "true"
      });
      res.json({ success: true, count: products.length, products });
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await Database.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true, product });
    } catch (err) {
      console.error("Error fetching product:", err);
      res.status(500).json({ error: "Failed to fetch product details" });
    }
  });
  app.post("/api/products", authMiddleware, async (req, res) => {
    try {
      const { name, description, price, discountPrice, images, colors, sizes, stock, material, categoryId, featured, sale } = req.body;
      if (!name || !price) {
        return res.status(400).json({ error: "Product name and price are required" });
      }
      if (categoryId && !(await Database.getCategories()).some((category) => category._id === categoryId)) {
        return res.status(400).json({ error: "Selected category does not exist." });
      }
      const newProduct = await Database.createProduct({
        name,
        description: description || "",
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : void 0,
        images: Array.isArray(images) && images.length > 0 ? images : [],
        colors: Array.isArray(colors) ? colors : ["Classic Noir"],
        sizes: Array.isArray(sizes) ? sizes : ["Standard"],
        stock: stock !== void 0 ? Number(stock) : 15,
        material: material || "Premium Crepe & Silk",
        categoryId: typeof categoryId === "string" && categoryId ? categoryId : void 0,
        featured: Boolean(featured),
        sale: Boolean(sale),
        status: Number(stock) > 0 ? "in_stock" : "out_of_stock"
      });
      res.status(201).json({ success: true, product: newProduct });
    } catch (err) {
      console.error("Error creating product:", err);
      res.status(500).json({ error: "Failed to create product" });
    }
  });
  app.put("/api/products/:id", authMiddleware, async (req, res) => {
    try {
      if (req.body?.categoryId && !(await Database.getCategories()).some((category) => category._id === req.body.categoryId)) {
        return res.status(400).json({ error: "Selected category does not exist." });
      }
      const updated = await Database.updateProduct(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Product not found for update" });
      }
      res.json({ success: true, product: updated });
    } catch (err) {
      console.error("Error updating product:", err);
      res.status(500).json({ error: "Failed to update product" });
    }
  });
  app.delete("/api/products/:id", authMiddleware, async (req, res) => {
    try {
      const deleted = await Database.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found or already deleted" });
      }
      res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
      console.error("Error deleting product:", err);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  app.post("/api/orders", async (req, res) => {
    try {
      const {
        customerName,
        phone,
        email,
        address,
        city,
        district,
        area,
        note,
        products,
        deliveryCharge,
        paymentMethod
      } = req.body;
      if (!customerName || !phone || !address || !city) {
        return res.status(400).json({ error: "Customer name, phone, address, and city are required" });
      }
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: "Order must contain at least one product" });
      }
      const order = await Database.createOrder({
        customerName,
        phone,
        email,
        address,
        city,
        district,
        area: area || city,
        note,
        products,
        deliveryCharge: Number(deliveryCharge) || 70,
        paymentMethod: paymentMethod || "Cash on Delivery"
      });
      res.status(201).json({ success: true, order });
    } catch (err) {
      console.error("Error placing order:", err);
      res.status(500).json({ error: "Failed to place order" });
    }
  });
  app.get("/api/orders", authMiddleware, async (req, res) => {
    try {
      const { status, search } = req.query;
      const orders = await Database.getOrders({
        status: status ? String(status) : void 0,
        search: search ? String(search) : void 0
      });
      res.json({ success: true, count: orders.length, orders });
    } catch (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await Database.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json({ success: true, order });
    } catch (err) {
      console.error("Error fetching order:", err);
      res.status(500).json({ error: "Failed to fetch order details" });
    }
  });
  app.get("/api/my-orders", userAuthMiddleware, async (req, res) => {
    try {
      const orders = await Database.getOrders({ search: req.user?.email });
      const userOrders = orders.filter((order) => order.email?.toLowerCase() === req.user?.email.toLowerCase());
      res.json({ success: true, count: userOrders.length, orders: userOrders });
    } catch (err) {
      console.error("Error fetching user orders:", err);
      res.status(500).json({ error: "Failed to fetch your orders" });
    }
  });
  app.put("/api/orders/:id", authMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const validStatuses = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid order status" });
      }
      const updated = await Database.updateOrderStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json({ success: true, order: updated });
    } catch (err) {
      console.error("Error updating order:", err);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });
  app.delete("/api/orders/:id", authMiddleware, async (req, res) => {
    try {
      const deleted = await Database.deleteOrder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json({ success: true, message: "Order deleted successfully" });
    } catch (err) {
      console.error("Error deleting order:", err);
      res.status(500).json({ error: "Failed to delete order" });
    }
  });
  app.get("/api/admin/stats", authMiddleware, async (req, res) => {
    try {
      const stats = await Database.getStats();
      res.json({ success: true, stats });
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      res.status(500).json({ error: "Failed to calculate stats" });
    }
  });
  app.post("/api/upload", authMiddleware, async (req, res) => {
    try {
      const { imageBase64, filename } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "No image data provided" });
      }
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer;
      let extension = "jpg";
      if (matches && matches.length === 3) {
        const mime = matches[1];
        if (mime.includes("png")) extension = "png";
        else if (mime.includes("webp")) extension = "webp";
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(imageBase64, "base64");
      }
      const cleanName = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, "") : "product";
      const newFilename = `${cleanName}-${Date.now()}.${extension}`;
      const filePath = import_path2.default.join(uploadsDir, newFilename);
      import_fs2.default.writeFileSync(filePath, buffer);
      const fileUrl = `/uploads/${newFilename}`;
      res.json({
        success: true,
        url: fileUrl,
        message: "Image uploaded successfully"
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, phone, email, message } = req.body;
      if (!name || !message) {
        return res.status(400).json({ error: "Name and message are required" });
      }
      console.log("Customer inquiry received:", { name, phone, email, message });
      res.json({
        success: true,
        message: "Thank you for contacting Arabian Saaj. Our concierge will get back to you promptly."
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to process contact inquiry" });
    }
  });
  app.use("/api", (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true, hmr: { port: PORT + 1e4 } },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u2728 Arabian Saaj server running on http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start Arabian Saaj server:", err);
  process.exitCode = 1;
});
//# sourceMappingURL=server.cjs.map
