const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const ccsj = require("countrycitystatejson"); // ✅ lib

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
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

// API endpoints (for AJAX)
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

// Routes
app.get("/", (req, res) => {
  res.render("home", { msg: "Web3ID Demo Project Running! & This is Home page" });
});

app.get("/register", (req, res) => {
  res.render("register", { error_msg: req.flash("error_msg"), countries });
});

app.post("/register", (req, res) => {
  // TODO: Save user into DB
  req.flash("success_msg", "Account created successfully!");
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { error_msg: req.flash("error_msg") });
});

app.post("/login", (req, res) => {
  // TODO: Add authentication
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
