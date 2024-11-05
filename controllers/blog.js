const Blog = require("../models/Blog");
const User = require('../models/User');
const { errorHandler } = require('../auth');

module.exports.addBlog = (req, res) => {
    let newBlog = new Blog({
        title: req.body.title,
        content: req.body.content,
        author: req.user.username, // Automatically set author to authenticated user's username
    });

    return Blog.findOne({ title: req.body.title })
        .then(existingBlog => {
            if (existingBlog) {
                return res.status(409).send({ message: 'Blog already exists' });
            } else {
                return newBlog.save()
                    .then(result => res.status(201).send({
                        success: true,
                        message: 'Blog added successfully',
                        result
                    }))
                    .catch(err => errorHandler(err, req, res));
            }
        })
        .catch(err => errorHandler(err, req, res));
};



module.exports.getAllBlogs = (req, res) => {
    return Blog.find({}).then(result => {
        if (result.length > 0) {
            return res.status(200).send(result);
        } else {
            return res.status(404).send({ message: 'No blogs found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.getMyBlogs = (req, res) => {
    const username = req.user.username; // Get the username of the authenticated user

    // Find blogs where the author matches the authenticated user's username
    return Blog.find({ author: username })
        .then(result => {
            if (result.length > 0) {
                return res.status(200).send(result);
            } else {
                return res.status(404).send({ message: 'No blogs found for this user' });
            }
        })
        .catch(error => errorHandler(error, req, res));
};


module.exports.updateBlog = (req, res, next) => {
    const { title, content } = req.body; 
    const username = req.user.username;

    Blog.findById(req.params.id)
        .then(blog => {
            if (!blog) {
                return res.status(404).send({ message: 'Blog not found' });
            }

            if (blog.author !== username) {
                return res.status(403).send({ message: 'You are not authorized to update this blog' });
            }

            blog.title = title;
            blog.content = content;

            return blog.save();
        })
        .then(updatedBlog => {
            return res.status(200).send({ success: true, message: 'Blog updated successfully', blog: updatedBlog });
        })
        .catch(error => {
            console.error(error);
            return next(error); // Pass the error to the error handler
        });
};

module.exports.deleteBlog = (req, res, next) => {
    const username = req.user.username;

    Blog.findById(req.params.id)
        .then(blog => {
            if (!blog) {
                return res.status(404).send({ message: 'Blog not found' });
            }

            if (blog.author !== username) {
                return res.status(403).send({ message: 'You are not authorized to delete this blog' });
            }

            return Blog.findByIdAndDelete(req.params.id);
        })
        .then(() => {
            return res.status(200).send({ success: true, message: 'Blog deleted successfully' });
        })
        .catch(error => {
            console.error(error);
            return next(error); // Pass the error to the error handler
        });
};

module.exports.deleteBlogAdmin = (req, res) => {
    return Blog.findByIdAndDelete(req.params.id)
        .then(blog => {
            if (blog) {
                res.status(200).send({ success: true, message: 'Blog deleted successfully' });
            } else {
                res.status(404).send({ message: 'Blog not found' });
            }
        })
        .catch(error => errorHandler(error, req, res));
};

module.exports.getBlogById = (req, res) => {
    return Blog.findById(req.params.id).then(blog => {
        if (blog) {
            return res.status(200).send(blog);
        } else {
            return res.status(404).send({ message: 'Blog post not found' });
        }
    })
    .catch(error => errorHandler(error, req, res)); 
};

module.exports.addBlogComment = async (req, res) => {
    const { text } = req.body;
    const userEmail = req.user.email; // Get the user's email

    if (!text) {
        return res.status(400).send({ message: 'Comment text is required' });
    }

    try {
        // Find the user by their email to get the username
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const comment = {
            text,
            user: user.username, // Use the username here
        };

        const blog = await Blog.findByIdAndUpdate(
            req.params.blogId,
            { $push: { comments: comment } },
            { new: true }
        );

        if (!blog) {
            return res.status(404).send({ message: 'Blog post not found' });
        }

        return res.status(201).send({
            message: 'Comment added successfully',
            blog,
        });
    } catch (error) {
        return errorHandler(error, req, res);
    }
};

module.exports.getBlogComments = (req, res) => {
    return Blog.findById(req.params.blogId).then(blog => {
        if (blog) {
            return res.status(200).send(blog.comments);
        } else {
            return res.status(404).send({ message: 'Blog post not found' });
        }
    })
    .catch(error => errorHandler(error, req, res)); 
};

module.exports.deleteComment = (req, res) => {
    const { blogId, commentId } = req.params;

    return Blog.findByIdAndUpdate(
        blogId,
        { $pull: { comments: { _id: commentId } } },
        { new: true }
    )
    .then(blog => {
        if (!blog) {
            return res.status(404).send({ message: 'Blog post not found' });
        }
        return res.status(200).send({
            message: 'Comment deleted successfully',
            blog
        });
    })
    .catch(error => errorHandler(error, req, res));
};