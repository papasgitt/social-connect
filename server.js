// --- BACKEND SERVER FOR REAL-TIME CHAT AND POSTS ---
// This server uses Express and Socket.IO to provide real-time communication for your app.
// It serves your static frontend files and handles real-time events for chat and posts.

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

let posts = [];

io.on('connection', (socket) => {
  // --- POST EVENTS ---
  // Send all posts to the new client
  socket.emit('initPosts', posts);
  // Listen for new posts
  socket.on('newPost', (post) => {
    posts.unshift(post); // Add to the top
    io.emit('newPost', post); // Broadcast to all clients
  });
  // Listen for like/dislike actions
  socket.on('likePost', ({ postId, user, type }) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const primary = type === 'like' ? 'likedBy' : 'dislikedBy';
    const secondary = type === 'like' ? 'dislikedBy' : 'likedBy';
    const primaryCount = type === 'like' ? 'likes' : 'dislikes';
    const secondaryCount = type === 'like' ? 'dislikes' : 'likes';
    const primaryIndex = post[primary].indexOf(user);
    const secondaryIndex = post[secondary].indexOf(user);
    if (primaryIndex > -1) {
      post[primary].splice(primaryIndex, 1);
      post[primaryCount]--;
    } else {
      post[primary].push(user);
      post[primaryCount]++;
      if (secondaryIndex > -1) {
        post[secondary].splice(secondaryIndex, 1);
        post[secondaryCount]--;
      }
    }
    io.emit('updatePost', post); // Broadcast updated post
  });
  // Listen for edit post actions
  socket.on('editPost', ({ postId, content }) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    post.content = content;
    post.updatedAt = new Date().toISOString();
    io.emit('updatePost', post); // Broadcast updated post
  });
  // Listen for delete post actions
  socket.on('deletePost', (postId) => {
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return;
    posts.splice(index, 1);
    io.emit('deletePost', postId); // Broadcast deleted post id
  });
});

// Serve your frontend files (index.html, app.js, etc.)
app.use(express.static('.'));

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 