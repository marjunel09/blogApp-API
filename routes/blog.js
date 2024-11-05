const express = require("express");
const blogController = require("../controllers/blog");
const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

// Route to add a new blog post
router.post("/addBlog", verify, blogController.addBlog);

// Route to get all blog posts by the user
router.get("/getAllBlogs", verify, blogController.getAllBlogs);

router.get("/getMyBlogs", verify, blogController.getMyBlogs);

// Route to get a specific blog post by ID
router.get("/getBlog/:id", verify, blogController.getBlogById);

// Route to update a specific blog post by ID
router.patch("/updateBlog/:id", verify, blogController.updateBlog);

// Route to delete a specific blog post by ID
router.delete("/deleteBlog/:id", verify, blogController.deleteBlog);

router.delete("/deleteBlogAdmin/:id", verify, blogController.deleteBlogAdmin);

// Route to add a comment to a blog post
router.post("/addComment/:blogId", verify, blogController.addBlogComment);

// Route to get comments for a specific blog post
router.get("/getComments/:blogId", verify, blogController.getBlogComments);

// Route to delete a specific comment by blog post ID and comment ID

router.delete("/deleteComment/:blogId/:commentId",verify, verifyAdmin, blogController.deleteComment);

module.exports = router;
