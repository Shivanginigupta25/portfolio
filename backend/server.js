require("dotenv").config();

const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();

// ================= ENV =================
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// ================= FILE UPLOAD =================
const upload = multer({ dest: path.join(__dirname, "uploads") });

// ================= DATA (TEMP STORAGE) =================
let projects = [];
let skills = [];
let visitors = 0;

// ================= ROUTES =================

// VISITOR COUNT
app.get("/visit", (req, res) => {
    visitors++;
    res.json({ visitors });
});

// LOGIN (✅ FIXED using env)
app.post("/login", (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// ================= PROJECTS =================

// ADD PROJECT
app.post("/add-project", upload.single("file"), (req, res) => {
    const { title, desc } = req.body;

    if (!title || !desc) {
        return res.json({ success: false, message: "Missing data" });
    }

    const file = req.file ? req.file.filename : null;

    projects.push({ title, desc, file });

    res.json({ success: true });
});

// GET PROJECTS
app.get("/projects", (req, res) => {
    res.json(projects);
});

// DELETE PROJECT
app.post("/delete-project", (req, res) => {
    const { index } = req.body;

    if (index >= 0 && index < projects.length) {
        projects.splice(index, 1);
    }

    res.json({ success: true });
});

// ================= SKILLS =================

// ADD SKILL
app.post("/add-skill", (req, res) => {
    const { skill } = req.body;

    if (skill) {
        skills.push(skill);
    }

    res.json({ success: true });
});

// GET SKILLS
app.get("/skills", (req, res) => {
    res.json(skills);
});

// DELETE SKILL
app.post("/delete-skill", (req, res) => {
    const { index } = req.body;

    if (index >= 0 && index < skills.length) {
        skills.splice(index, 1);
    }

    res.json({ success: true });
});

// ================= CONTACT =================
app.post("/contact", async (req, res) => {

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.json({ success: false });
    }

    try {

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }
        });

        let mailOptions = {
            from: email,
            to: EMAIL_USER,
            subject: `New Portfolio Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        };

        await transporter.sendMail(mailOptions);

        console.log("Email sent");
        res.json({ success: true });
``
    } catch (error) {
        console.log(error);
        res.json({ success: false });
    }
});

// ================= DEFAULT ROUTE =================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// ================= SERVER =================
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} 🚀`);
});