// -------------------
// Imports
// -------------------
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const ccsj = require("countrycitystatejson");

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------
// Database Connection (Promise Pool)
// -------------------
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "web3id",
});

// -------------------
// Middleware
// -------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Session
app.use(
  session({
    secret: "supersecretkey", // change in production
    resave: false,
    saveUninitialized: false,
  })
);

// Flash Messages
app.use(flash());

// Global Flash Variables
app.use((req, res, next) => {
  res.locals.error_msg = req.flash("error_msg");
  res.locals.success_msg = req.flash("success_msg");
  res.locals.user = req.session.user || null;
  next();
});

// -------------------
// Middleware to Protect Routes
// -------------------
function ensureAuthenticated(req, res, next) {
  if (req.session.user) return next();
  req.flash("error_msg", "Please login to continue");
  res.redirect("/login");
}

// -------------------
// AJAX APIs (Country/State/City)
// -------------------
const countries = ccsj.getCountries();

app.get("/api/states/:country", (req, res) => {
  const { country } = req.params;
  const states = ccsj.getStatesByShort(country) || [];
  res.json(states);
});

app.get("/api/cities/:country/:state", (req, res) => {
  const { country, state } = req.params;
  const cities = ccsj.getCities(country, state) || [];
  res.json(cities);
});

// -------------------
// Home Route
// -------------------
app.get("/", (req, res) => {
  res.render("home", { msg: "Web3ID Demo Project Running! & This is Home page" });
});

// -------------------
// Registration Routes
// -------------------
app.get("/register", (req, res) => {
  res.render("register", {
    error_msg: req.flash("error_msg"),
    success_msg: req.flash("success_msg"),
    countries,
  });
});

app.post("/register", async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      gender,
      nationality,
      state,
      city,
      pincode,
      phone_no,
      email,
      password,
    } = req.body;

    if (!first_name || !last_name || !email || !password) {
      req.flash("error_msg", "Please fill all required fields.");
      return res.redirect("/register");
    }

    const role_id = 3;
    const created_by = 1;
    const updated_by = 1;
    const web3id = 1234567890; // 12-digit Web3ID

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Insert User
    const sql = `
      INSERT INTO user 
      (role_id, first_name, middle_name, last_name, gender, nationality, state, city, pincode, phone_no, email, password, web3id, created_by, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      role_id,
      first_name,
      middle_name || "",
      last_name,
      gender,
      nationality,
      state,
      city,
      pincode,
      phone_no,
      email,
      password,
      web3id,
      created_by,
      updated_by,
    ];

    const [result] = await db.query(sql, values);

    console.log("✅ User inserted with ID:", result.id);

    req.flash("success_msg", "Account created successfully! Please login.");
    // res.redirect("/login");
    // Redirect to /web3id with user id in query string
    res.redirect(`/web3id`);

  } catch (error) {
    console.error("❌ Registration Error:", error);
    req.flash("error_msg", "Server error! Try again.");
    res.redirect("/register");
  }
});

app.get("/web3id", async (req, res) => {

    // Render web3id.ejs with user data
    res.render("web3id", { 
      success_msg: req.flash("success_msg") 
    });

 
});


// -------------------
// Login Routes
// -------------------
app.get("/login", (req, res) => {
  res.render("login");
});

// Web3ID login page
app.get("/login-web3id", (req, res) => {
  res.render("login-web3id", {
    error_msg: req.flash("error_msg"),
    success_msg: req.flash("success_msg"),
  });
  console.log("🔹 Rendered Web3ID login page");
});

// Web3ID login POST
app.post("/login/web3id", async (req, res) => {
  try {
    const { web3id } = req.body;
    console.log("🔹 Web3ID login attempt:", web3id);

    if (!web3id) {
      req.flash("error_msg", "Web3ID is required!");
      return res.redirect("/login-web3id");
    }

    const [rows] = await db.query(
      "SELECT * FROM user WHERE web3id = ?",
      [web3id]
    );

    if (rows.length === 0) {
      req.flash("error_msg", "Invalid Web3ID");
      return res.redirect("/login-web3id");
    }

    const user = rows[0];
    req.session.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      role_id: user.role_id,
    };

    res.send(`
      <html>
        <head>
          <title>Welcome</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-900 via-indigo-900 to-black text-white">
          <div class="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 text-center shadow-2xl">
            <h1 class="text-3xl font-bold mb-4">🎉 Welcome back, ${user.first_name}!</h1>
            <p class="mb-6">You have successfully logged in.</p>
            <a href="/logout" class="px-6 py-3 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition">Logout</a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error("❌ Web3ID login error:", error);
    req.flash("error_msg", "Server error, try again later!");
    res.redirect("/login-web3id");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔹 Login attempt with:");
    console.log("Email:", email);
    console.log("Password:", password);

    // Fetch user by email AND password (plain text)
    const query = "SELECT * FROM user WHERE email = ? AND password = ?";
    const [rows] = await db.query(query, [email, password]);
    console.log("🔹 Database query executed:", query);

    if (rows.length === 0) {
      console.log("❌ Invalid email or password");
      return res.send("Invalid email or password");
    }

    const user = rows[0];
    console.log("✅ Login successful for:", user.first_name);

    // Render welcome message
    res.send(`
      <html>
        <head>
          <title>Welcome</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-900 via-indigo-900 to-black text-white">
          <div class="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 text-center shadow-2xl">
            <h1 class="text-3xl font-bold mb-4">🎉 Welcome back, ${user.first_name}!</h1>
            <p class="mb-6">You have successfully logged in.</p>
            <a href="/logout" class="px-6 py-3 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition">Logout</a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.send("Server error");
  }
});

// -------------------
// Dashboard (Protected)
// -------------------
app.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.session.user });
});

// -------------------
// Logout
// -------------------
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// -------------------
// Server Start
// -------------------
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
