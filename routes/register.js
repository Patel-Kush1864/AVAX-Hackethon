const express = require("express");
const router = express.Router();
const db = require("../config/db"); // your DB connection
const bcrypt = require("bcryptjs");
const ccsj = require("countrycitystatejson");

// GET Registration page
router.get("/", (req, res) => {
    const countries = ccsj.getCountries();
    res.render("register", { error_msg: req.flash("error_msg"), success_msg: req.flash("success_msg"), countries });
});

// POST Registration form
router.post("/", async (req, res) => {
    try {
        var first_name = req.body.first_name;
        var middle_name = req.body.middle_name;
        var last_name = req.body.last_name;
        var gender = req.body.gender;
        var nationality = req.body.nationality;
        var state = req.body.state;
        var city = req.body.city;
        var pincode = req.body.pincode;
        var phone_no = req.body.phone_no;
        var email = req.body.email;
        var password = req.body.password;
        var created_by = 1; // static

        var role_id = 3; // static
        var web3id = 1234567890; // static

        // Hash password
        var hashedPassword = await bcrypt.hash(password, 10);

        // Simple insert query
        var str = "INSERT INTO user VALUES (NULL, '" + role_id + "', '" + first_name + "', '" + (middle_name || '') + "', '" + last_name + "', '" + gender + "', '" + nationality + "', '" + state + "', '" + city + "', '" + pincode + "', '" + phone_no + "', '" + email + "', '" + hashedPassword + "', '" + web3id + "', '" + created_by + "', '" + created_by + "', NOW(), NOW())";

        console.log("SQL QUERY:", str);

        db.query(str, function(err, result) {
            if (err) {
                console.error("SQL ERROR:", err.sqlMessage || err);
                req.flash("error_msg", "Database error! Check console.");
                return res.redirect("/Registration");
            }

            console.log("Inserted ID:", result.insertId);
            req.flash("success_msg", "Account created successfully!");
            res.redirect("/Login");
        });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        req.flash("error_msg", "Server error! Try again.");
        res.redirect("/Registration");
    }
});

module.exports = router;
