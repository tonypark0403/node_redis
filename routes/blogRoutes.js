const mongoose = require('mongoose');
const util = require('util');
const requireLogin = require('../middlewares/requireLogin');
const client = require('../middlewares/redis');


const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    client.get = util.promisify(client.get);
    const cachedBlogs = await client.get(req.user.id);

    if (cachedBlogs) {
      console.log("Serving from cache server - redis");
      return res.send(JSON.parse(cachedBlogs));
    }

    const blogs = await Blog.find({ _user: req.user.id });
    console.log("Serving from mongo db");
    res.send(blogs);
    client.set(req.user.id, JSON.stringify(blogs));
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
