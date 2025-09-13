// app.js
const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "secret", 
    resave: false, 
    saveUninitialized: true,
  })
);
app.use(flash());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Set views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ===== Global Variables for flash messages =====
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// ===== Routes =====

// Home
app.get("/", (req, res) => {
  res.render("home", { msg: "Web3ID Demo Project Running! & This is Home page" });
});

// Login Page
app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.render("login");
});

// Register Page
app.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.render("register");
});

// Dashboard (Protected)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    req.flash("error_msg", "Please login to view dashboard");
    return res.redirect("/login");
  }
  res.render("dashboard", { user: req.session.user });
});

// Handle Login POST
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Dummy authentication (replace with DB logic)
  if (email === "test@web3.com" && password === "password") {
    req.session.user = { email };
    req.flash("success_msg", "Login successful!");
    return res.redirect("/dashboard");
  }

  req.flash("error_msg", "Invalid credentials. Try again!");
  res.redirect("/login");
});

// Handle Registration POST
app.post("/register", (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Basic validation
  if (!email || !password || !confirmPassword) {
    req.flash("error_msg", "Please fill in all fields");
    return res.redirect("/register");
  }
  if (password !== confirmPassword) {
    req.flash("error_msg", "Passwords do not match");
    return res.redirect("/register");
  }

  // Save user to database here (dummy for now)
  console.log("New user registered:", { email, password });

  req.flash("success_msg", "Registration successful! Please login");
  res.redirect("/login");
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).send("<h1>404 - Page not found</h1><p><a href='/'>Go Home</a></p>");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
