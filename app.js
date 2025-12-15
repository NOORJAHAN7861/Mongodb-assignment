// Import required modules
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();


// Initialize Express app
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGOURI || "mongodb://127.0.0.1:27017/postsDB")
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Create Schema
const postSchema = mongoose.Schema({
  title: String,
  content: String
});

// Create Model
const Post = mongoose.model('Post', postSchema);



// i) GET route: Display all posts
app.get('/getPosts', async (req, res) => {
  try {
    const posts = await Post.find(); // find() retrieves all documents
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ii) POST route: Add a new post
app.post('/addPosts', async (req, res) => {
  try {
    const { title, content,data } = req.body;
    if(data){
      if(!Array.isArray(data)){
        return res.status(400).json({ error: 'Data should be an array of posts' });
      }
      for(const postData of data){
        const { title, content } = postData;
        if(!title || !content){
           continue
        }
        const newPost = new Post({ title, content });
        await newPost.save();
      } 
      return res.json({ message: 'Multiple posts added successfully!' }); 
    }
    if(!title || !content){
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const newPost = new Post({ title, content });
    await newPost.save(); // save() adds document to DB
    res.json({ message: 'Post added successfully!', post: newPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// iii) DELETE route: Delete a post by ID
app.delete('/delPosts/:id', async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully!', post: deletedPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// iv) PATCH route: Update a post by ID
app.patch('/post/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body, // fields to update
      { new: true } // return updated document
    );
    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post updated successfully!', post: updatedPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});