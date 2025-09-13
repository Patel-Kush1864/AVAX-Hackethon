// app.js
const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(flash());

// static files
app.use(express.static(path.join(__dirname, "public")));

// set views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// routes
app.get("/", (req, res) => {
  res.render("home", { msg: "Web3ID Demo Project Running! & This is Home page" });
});

// start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
