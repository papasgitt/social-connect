//
// --- CONSTANTS ---
// This section defines values that are used throughout the application but do not change.
// Using constants makes the code easier to read and maintain. If we need to change a key or a password,
// we only have to do it in one place.
//

// Defines the keys used to store data in the browser's local storage.
// This prevents typos when accessing storage, as we use these constants instead of raw strings.
const STORAGE_KEYS = {
    USERS: 'social_users',      // Key for storing the list of users.
    POSTS: 'social_posts',      // Key for storing the list of posts.
    CURRENT_USER: 'social_current_user' // Key for storing the currently logged-in user.
};

// Sets the administrator's login credentials.
// In a real application, this would be securely managed on a server, not stored in the code.
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

//
// --- DOM ELEMENTS ---
// This section creates an object to hold references to all the HTML elements we need to interact with.
// "DOM" stands for Document Object Model, which is the structure of the HTML page.
// We get each element once and store it here, which is more efficient than searching for it every time we need it.
//
const DOMElements = {
    // Sections of the app
    loginSection: document.getElementById('loginSection'),
    signupSection: document.getElementById('signupSection'),
    mainApp: document.getElementById('mainApp'),
    adminDashboard: document.getElementById('adminDashboard'),

    // Input fields for login and signup
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    newUsernameInput: document.getElementById('newUsername'),
    newPasswordInput: document.getElementById('newPassword'),
    emailInput: document.getElementById('email'),

    // Elements for showing error messages
    loginError: document.getElementById('loginError'),
    signupError: document.getElementById('signupError'),

    // Elements for the main app view
    userWelcome: document.getElementById('userWelcome'),
    postContent: document.getElementById('postContent'),
    postImageUpload: document.getElementById('postImageUpload'),
    imagePreview: document.getElementById('imagePreview'),
    postsFeed: document.getElementById('postsFeed'),

    // Elements for the admin dashboard
    totalUsers: document.getElementById('totalUsers'),
    totalPosts: document.getElementById('totalPosts'),
    todayPosts: document.getElementById('todayPosts'),
    usersList: document.getElementById('usersList'),
    adminPostsList: document.getElementById('adminPostsList'),

    // Elements for the popup modal to edit posts
    editModal: document.getElementById('editModal'),
    editPostContent: document.getElementById('editPostContent'),

    // HTML templates for creating dynamic content
    postTemplate: document.getElementById('post-template'),
    adminUserTemplate: document.getElementById('admin-user-template'),
    adminPostTemplate: document.getElementById('admin-post-template')
};

//
// --- STATE MANAGEMENT ---
// "State" refers to the data that our application needs to keep track of at any given moment.
// This includes the list of users, posts, and who is currently logged in.
//
// Application State
let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [ADMIN_CREDENTIALS];
let posts = (JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || []).map(post => ({
    ...post,
    likedBy: post.likedBy || [],    // If a post from storage doesn't have likedBy, create an empty array.
    dislikedBy: post.dislikedBy || [] // If a post from storage doesn't have dislikedBy, create an empty array.
}));
let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null; // The user who is currently logged in.
let currentEditId = null; // Stores the ID of the post being edited.

//
// --- DATA PERSISTENCE ---
// This section contains functions for saving and retrieving data from the browser's local storage.
// This allows the data (like users and posts) to persist even after the browser tab is closed.
//
// Generic function to save any piece of data to local storage.
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));
// Specific functions for saving users and posts. They use the generic saveData function.
const saveUsers = () => saveData(STORAGE_KEYS.USERS, users);
const savePosts = () => saveData(STORAGE_KEYS.POSTS, posts);

// Saves the currently logged-in user's information to both the state and local storage.
function saveCurrentUser(user) {
    currentUser = user;
    saveData(STORAGE_KEYS.CURRENT_USER, user);
}

//
// --- UI RENDERING ---
// This section is responsible for what the user sees on the screen.
// It contains the main function that decides which view of the application to show.
//
// This is the main function for controlling the UI. It checks the login status
// and shows the appropriate screen: login page, main app, or admin dashboard.
function updateUI() {
    if (currentUser) {
        if (currentUser.username === ADMIN_CREDENTIALS.username) {
            showAdminDashboard();
        } else {
            showMainApp();
        }
    } else {
        showLogin();
    }
}

//
// --- AUTHENTICATION ---
// This section handles everything related to user accounts: signing up, logging in, and logging out.
//
// Shows the signup form and hides the login form.
function showSignup() {
    hideAllSections();
    DOMElements.signupSection.style.display = 'flex';
}

// Shows the login form and hides the signup form.
function showLogin() {
    hideAllSections();
    DOMElements.loginSection.style.display = 'flex';
}

// Handles the creation of a new user account.
function signup() {
    const username = DOMElements.newUsernameInput.value.trim(); // .trim() removes whitespace
    const password = DOMElements.newPasswordInput.value.trim();
    const email = DOMElements.emailInput.value.trim();

    // Basic validation to ensure fields are not empty.
    if (!username || !password || !email) {
        DOMElements.signupError.textContent = 'All fields are required';
        return; // Stop the function
    }

    // Check if the username already exists in our `users` array.
    if (users.some(user => user.username === username)) {
        DOMElements.signupError.textContent = 'Username already exists';
        return;
    }

    // If everything is okay, create a new user object and add it to the `users` array.
    users.push({ username, password, email, createdAt: new Date().toISOString() });
    saveUsers(); // Save the updated users array to local storage.
    showLogin(); // Show the login screen so the new user can log in.
}

// Handles the user login process.
function login() {
    const username = DOMElements.usernameInput.value;
    const password = DOMElements.passwordInput.value;
    // Find a user in the `users` array that matches the entered username and password.
    const user = users.find(u => u.username === username && u.password === password);

    // If no matching user is found, show an error.
    if (!user) {
        DOMElements.loginError.textContent = 'Invalid username or password';
        return;
    }

    // If a user is found, save them as the current user and update the UI.
    saveCurrentUser(user);
    DOMElements.loginError.textContent = ''; // Clear any previous error messages.
    updateUI(); // Refresh the screen to show the main app or admin dashboard.
}

// Handles the user logout process.
function logout() {
    saveCurrentUser(null); // Set the current user to null.
    DOMElements.usernameInput.value = ''; // Clear the input fields.
    DOMElements.passwordInput.value = '';
    updateUI(); // Refresh the screen to show the login page.
}

//
// --- VIEW MANAGEMENT ---
// This section contains functions that control which major parts of the application are visible.
// They are like switching between different pages.
//
// A helper function to hide all major sections of the app before showing a new one.
function hideAllSections() {
    Object.values(DOMElements).forEach(el => {
        // Check if the element is one of the main sections we want to hide.
        if (el.classList.contains('login-section') || el.classList.contains('signup-section') || el.classList.contains('main-app') || el.classList.contains('admin-dashboard')) {
            el.style.display = 'none';
        }
    });
}

// Shows the main application view for regular users.
function showMainApp() {
    hideAllSections(); // First, hide everything else.
    DOMElements.mainApp.style.display = 'block'; // Make the main app section visible.
    DOMElements.userWelcome.textContent = `Welcome, ${currentUser.username}`; // Greet the user.
    renderPosts(); // Display all the posts.
}

// Shows the admin dashboard for the admin user.
function showAdminDashboard() {
    hideAllSections(); // First, hide everything else.
    DOMElements.adminDashboard.style.display = 'block'; // Make the dashboard visible.
    updateAdminStats(); // Update the statistics (total users, posts, etc.).
    renderAdminTables(); // Display the user and post management tables.
}

//
// --- POST MANAGEMENT ---
// This section includes all functions related to creating, displaying, and interacting with posts.
//
// Shows a preview of the image that the user has selected to upload.
function previewImage(event) {
    DOMElements.imagePreview.innerHTML = ''; // Clear any previous preview.
    const file = event.target.files[0]; // Get the selected file.
    if (file) {
        const reader = new FileReader(); // FileReader is a built-in tool to read files.
        // When the reader finishes loading the file...
        reader.onload = e => {
            const img = document.createElement('img'); // Create a new image element.
            img.src = e.target.result; // Set the image source to the file's data.
            DOMElements.imagePreview.appendChild(img); // Add the image to the preview area.
        };
        reader.readAsDataURL(file); // Start reading the file as a Data URL.
    }
}

// --- REAL-TIME SOCKET.IO CONNECTION ---
// Connect to the backend server for real-time features
const socket = io('https://social-connect-f4rm.onrender.com')

// --- REAL-TIME POSTS ---
// Listen for all previous posts when connecting
socket.on('initPosts', (allPosts) => {
    posts = allPosts;
    renderPosts();
});
// Listen for new posts from other users
socket.on('newPost', (post) => {
    posts.unshift(post);
    renderPosts();
});
// Listen for post updates (like/dislike/edit)
socket.on('updatePost', (updatedPost) => {
    const index = posts.findIndex(p => p.id === updatedPost.id);
    if (index > -1) {
        posts[index] = updatedPost;
        renderPosts();
    }
});
// Listen for post deletions
socket.on('deletePost', (postId) => {
    posts = posts.filter(post => post.id !== postId);
    renderPosts();
});

// Override createPost to use Socket.IO for real-time posts
function createPost() {
    const content = DOMElements.postContent.value.trim();
    const imageFile = DOMElements.postImageUpload.files[0];
    if (!content && !imageFile) {
        alert('Please enter some content or upload an image');
        return;
    }
    const processPost = (imageUrl) => {
        const post = {
            id: Date.now(),
            content,
            author: currentUser.username,
            createdAt: new Date().toISOString(),
            likes: 0,
            dislikes: 0,
            likedBy: [],
            dislikedBy: [],
            imageUrl
        };
        socket.emit('newPost', post); // Send to server for real-time broadcast
        DOMElements.postContent.value = '';
        DOMElements.postImageUpload.value = '';
        DOMElements.imagePreview.innerHTML = '';
    };
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = e => processPost(e.target.result);
        reader.readAsDataURL(imageFile);
    } else {
        processPost(null);
    }
}

// Renders all posts to the posts feed.
function renderPosts() {
    DOMElements.postsFeed.innerHTML = ''; // Clear the existing feed first.
    posts.forEach(post => {
        // For each post, create a copy of the post template from index.html.
        const postElement = DOMElements.postTemplate.content.cloneNode(true);

        // Fill in the template with the post's data.
        postElement.querySelector('.post-author').textContent = escapeHtml(post.author);
        postElement.querySelector('.post-time').textContent = formatDate(post.createdAt);
        postElement.querySelector('.post-content').textContent = escapeHtml(post.content);

        // Handle the post image.
        const imageContainer = postElement.querySelector('.post-image');
        if (post.imageUrl) {
            const img = document.createElement('img');
            img.src = post.imageUrl;
            img.alt = 'Post Image';
            imageContainer.appendChild(img);
        } else {
            imageContainer.remove(); // If there's no image, remove the container.
        }

        // Set up the like button.
        const likeBtn = postElement.querySelector('.like-btn');
        likeBtn.onclick = () => toggleInteraction(post.id, 'like');
        if (post.likedBy.includes(currentUser.username)) {
            likeBtn.classList.add('liked'); // Add 'liked' class for special styling.
        }
        postElement.querySelector('.like-count').textContent = post.likes;

        // Set up the dislike button.
        const dislikeBtn = postElement.querySelector('.dislike-btn');
        dislikeBtn.onclick = () => toggleInteraction(post.id, 'dislike');
        if (post.dislikedBy.includes(currentUser.username)) {
            dislikeBtn.classList.add('disliked'); // Add 'disliked' class for special styling.
        }
        postElement.querySelector('.dislike-count').textContent = post.dislikes;

        // Show or hide the Edit/Delete buttons.
        const postActions = postElement.querySelector('.post-actions');
        if (currentUser.username === post.author || currentUser.username === ADMIN_CREDENTIALS.username) {
            postElement.querySelector('.edit-btn').onclick = () => openEditModal(post.id);
            postElement.querySelector('.delete-btn').onclick = () => deletePost(post.id);
        } else {
            postActions.remove(); // If the user is not the author or admin, remove the buttons.
        }

        // Add the completed post element to the page.
        DOMElements.postsFeed.appendChild(postElement);
    });
}

// Opens the modal (popup) for editing a post.
function openEditModal(id) {
    const post = posts.find(p => p.id === id); // Find the post to edit.
    if (!post) return;
    currentEditId = id; // Store the ID of the post we are editing.
    DOMElements.editPostContent.value = post.content; // Fill the textarea with the post's content.
    DOMElements.editModal.style.display = 'block'; // Show the modal.
}

// Updates a post after it has been edited (real-time)
function updatePost() {
    const content = DOMElements.editPostContent.value.trim();
    if (!content) {
        alert('Please enter some content');
        return;
    }
    socket.emit('editPost', { postId: currentEditId, content });
    closeModal();
}

// Deletes a post (real-time)
function deletePost(id) {
    if (confirm('Are you sure you want to delete this post?')) {
        socket.emit('deletePost', id);
        closeModal();
    }
}

// This function handles both liking and disliking a post in real-time
function toggleInteraction(id, type) {
    if (!currentUser) return;
    socket.emit('likePost', { postId: id, user: currentUser.username, type });
}

//
// --- ADMIN FEATURES ---
// This section contains functions available only to the admin user.
//
// Updates the statistics on the admin dashboard.
function updateAdminStats() {
    DOMElements.totalUsers.textContent = users.length;
    DOMElements.totalPosts.textContent = posts.length;
    const today = new Date().toDateString();
    DOMElements.todayPosts.textContent = posts.filter(post => new Date(post.createdAt).toDateString() === today).length;
}

// Renders the user and post tables on the admin dashboard.
function renderAdminTables() {
    DOMElements.usersList.innerHTML = '';
    users.forEach(user => {
        if (user.username === ADMIN_CREDENTIALS.username) return; // Don't show the admin in the user list.
        
        const userElement = DOMElements.adminUserTemplate.content.cloneNode(true);
        userElement.querySelector('.admin-user-username').textContent = escapeHtml(user.username);
        userElement.querySelector('.admin-user-email').textContent = user.email;
        userElement.querySelector('.admin-user-joined').textContent = `Joined: ${formatDate(user.createdAt)}`;
        
        userElement.querySelector('.delete-user-btn').onclick = () => deleteUser(user.username);

        DOMElements.usersList.appendChild(userElement);
    });

    DOMElements.adminPostsList.innerHTML = '';
    posts.forEach(post => {
        const postElement = DOMElements.adminPostTemplate.content.cloneNode(true);
        postElement.querySelector('.admin-post-author').textContent = escapeHtml(post.author);
        postElement.querySelector('.admin-post-content').textContent = `${escapeHtml(post.content.substring(0, 100))}${post.content.length > 100 ? '...' : ''}`;
        postElement.querySelector('.admin-post-time').textContent = formatDate(post.createdAt);

        postElement.querySelector('.edit-btn').onclick = () => openEditModal(post.id);
        postElement.querySelector('.delete-btn').onclick = () => deletePost(post.id);

        DOMElements.adminPostsList.appendChild(postElement);
    });
}

// Deletes a user and all of their posts.
function deleteUser(username) {
    if (confirm(`Are you sure you want to delete user "${username}" and all their posts?`)) {
        users = users.filter(user => user.username !== username);
        posts = posts.filter(post => post.author !== username);
        saveUsers();
        savePosts();
        updateUI(); // Refresh the admin dashboard.
    }
}

//
// --- UTILITY FUNCTIONS ---
// This section contains small, reusable helper functions that perform common tasks.
//
// Closes the edit post modal.
function closeModal() {
    DOMElements.editModal.style.display = 'none';
    currentEditId = null;
}

// Formats a date string into a more readable format (e.g., "Sep 20, 2023, 02:30 PM").
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Escapes HTML content to prevent security issues like Cross-Site Scripting (XSS).
// It replaces special characters like `<` and `>` with their safe equivalents.
function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

//
// --- EVENT LISTENERS & GLOBAL SCOPE ---
// This section sets up event listeners that respond to user actions and
// exposes necessary functions to the global scope so they can be called from the HTML.
//
// Closes the modal if the user clicks outside of its content area.
window.onclick = event => {
    if (event.target === DOMElements.editModal) {
        closeModal();
    }
};

// When the page is fully loaded, call updateUI() to initialize the view.
document.addEventListener('DOMContentLoaded', updateUI);

// The functions below are assigned to the `window` object. This makes them "global",
// which is necessary so they can be called from the `onclick` attributes in the HTML file.
window.login = login;
window.signup = signup;
window.logout = logout;
window.createPost = createPost;
window.previewImage = previewImage;
window.toggleInteraction = toggleInteraction;
window.openEditModal = openEditModal;
window.updatePost = updatePost;
window.deletePost = deletePost;
window.deleteUser = deleteUser;
window.closeModal = closeModal;
window.showLogin = showLogin;
window.showSignup = showSignup; 