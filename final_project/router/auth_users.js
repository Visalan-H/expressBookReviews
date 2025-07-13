const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
        "username": "vizz",
        "password": "123456789"
    }
];

const jwtSecret = 'eb5222b11f96d3e3da4cc079cf65098bfd987fbbcedb65f617740aca91d40c7f'; // Secret key for JWT signing, should be kept secret in production

const isValid = (username) => { 
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}

regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    
    if (authenticatedUser(username, password)) {
        const token = jwt.sign({ username: username }, jwtSecret, { expiresIn: '1h' });
        res.status(200).json({ token });
    } else {
        res.status(401).json({ message: "Invalid username or password" });
    }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.username;

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    if (books[isbn]) {
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }
        books[isbn].reviews[username] = review;
        res.status(200).json({ message: "Review added/updated successfully" });
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;

    if (books[isbn] && books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        res.status(200).json({ message: "Review deleted successfully" });
    } else {
        res.status(404).json({ message: "Review not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
