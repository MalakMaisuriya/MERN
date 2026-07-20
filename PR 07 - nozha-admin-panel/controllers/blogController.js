const fs = require("fs");
const path = require("path");
const Blog = require("../models/Blog");

// Dashboard - shows stats + recent blogs
exports.dashboard = async (req, res) => {
  const totalBlogs = await Blog.countDocuments();
  const myBlogs = await Blog.countDocuments({ author: req.user._id });
  const recentBlogs = await Blog.find().sort({ createdAt: -1 }).limit(5).populate("author", "name");

  res.render("dashboard", {
    title: "Dashboard",
    totalBlogs,
    myBlogs,
    recentBlogs,
  });
};

// List all blogs
exports.listBlogs = async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 }).populate("author", "name");
  res.render("blogs/index", {
    title: "Blogs",
    blogs,
    successMessage: req.session.successMessage || null,
  });
  req.session.successMessage = null;
};

exports.getCreateForm = (req, res) => {
  res.render("blogs/form", {
    title: "Add Blog",
    blog: null,
    errorMessage: null,
  });
};

exports.createBlog = async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.render("blogs/form", {
      title: "Add Blog",
      blog: req.body,
      errorMessage: "Both Title and Content are required.",
    });
  }

  const image = req.file ? "/uploads/" + req.file.filename : "";

  await Blog.create({
    title,
    content,
    image,
    author: req.user._id,
  });

  req.session.successMessage = "Blog successfully created.";
  res.redirect("/blogs");
};

exports.getEditForm = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.redirect("/blogs");
  res.render("blogs/form", {
    title: "Edit Blog",
    blog,
    errorMessage: null,
  });
};

exports.updateBlog = async (req, res) => {
  const { title, content } = req.body;
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.redirect("/blogs");

  if (!title || !content) {
    return res.render("blogs/form", {
      title: "Edit Blog",
      blog: { ...blog.toObject(), title, content },
      errorMessage: "Both Title and Content are required.",
    });
  }

  blog.title = title;
  blog.content = content;

  if (req.file) {
    // remove old image if present
    if (blog.image) {
      const oldPath = path.join(__dirname, "..", "public", blog.image);
      fs.unlink(oldPath, () => {});
    }
    blog.image = "/uploads/" + req.file.filename;
  }

  await blog.save();
  req.session.successMessage = "Blog successfully updated.";
  res.redirect("/blogs");
};

exports.deleteBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (blog) {
    if (blog.image) {
      const imgPath = path.join(__dirname, "..", "public", blog.image);
      fs.unlink(imgPath, () => {});
    }
    await blog.deleteOne();
  }
  req.session.successMessage = "Blog deleted successfully.";
  res.redirect("/blogs");
};
