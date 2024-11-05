const mongoose = require("mongoose");

// Define the comment schema
const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "Comment text is required"],
    },
    user: {
        type: String,
        required: [true, "User is required"],
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Define the blog schema
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    content: {
        type: String,
        required: [true, "Content is required"],
    },
    author: {
        type: String,
        required: false,
    },
    creationDate: {
        type: Date,
        default: Date.now,
    },
    comments: [commentSchema], // Include the comments field
});

// Export the blog model
module.exports = mongoose.model("Blog", blogSchema);
