const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors

const app = express();
require('dotenv').config(); // Load environment variables from .env file

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI);


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => console.log("Now connected to MongoDB Atlas"));

const blogRoutes = require("./routes/blog");
const userRoutes = require("./routes/user");

const corsOptions = {
	origin: [
    'http://localhost:8000', 
    'http://localhost:3000',
    'https://blog-app-client-nine.vercel.app'
  ],
	credentials: true,
	optionsSuccessStatus: 200, 
}

app.use(cors(corsOptions));

app.use("/blogs", blogRoutes);
app.use("/users", userRoutes);

if (require.main === module) {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`API is now online on port ${process.env.PORT || 4000}`);
    });
}

module.exports = { app, mongoose };
