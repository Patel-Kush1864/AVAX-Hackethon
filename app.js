const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const ccsj = require("countrycitystatejson"); // ✅ lib
const db = require("./config/db"); // Make sure your DB connection is here

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(flash());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Get countries list
const countries = ccsj.getCountries();

// -------------------
// API endpoints (AJAX)
// -------------------
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
// Routes
// -------------------
app.get("/", (req, res) => {
  res.render("home", { msg: "Web3ID Demo Project Running! & This is Home page" });
});

app.get("/register", (req, res) => {
  res.render("register", { error_msg: req.flash("error_msg"), success_msg: req.flash("success_msg"), countries });
});

// -------------------
// Registration POST route
// -------------------
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
      password
    } = req.body;

    const created_by = 1;
    const updated_by = 1;
    const role_id = 3;
    const web3id = 1234567890;

    console.log("Form Data:", req.body);

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ SQL Insert Query
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
      hashedPassword,
      web3id,
      created_by,
      updated_by
    ];

    // ✅ Using Promise style
    const [result] = await db.query(sql, values);

    console.log("✅ User inserted with ID:", result.insertId);
    req.flash("success_msg", "Account created successfully! Please login.");
    res.redirect("/login");

  } catch (error) {
    console.error("❌ SERVER ERROR:", error);
    req.flash("error_msg", "Server error! Try again.");
    res.redirect("/register");
  }
});


// -------------------
// Login Routes
// -------------------
app.get("/login", (req, res) => {
  res.render("login", { error_msg: req.flash("error_msg"), success_msg: req.flash("success_msg") });
});

app.post("/login", (req, res) => {
  // TODO: Add authentication
  res.redirect("/");
});

app.get("/login-web3id", (req, res) => {
  res.render("login-web3id", { error_msg: req.flash("error_msg"), success_msg: req.flash("success_msg") });
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
// Start server
// -------------------
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
