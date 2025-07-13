const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = {};

  for (let isbn in books) {
    if (books[isbn].author === author) {
      booksByAuthor[isbn] = books[isbn];
    }
  }

  if (Object.keys(booksByAuthor).length > 0) {
    res.status(200).json(booksByAuthor);
  } else {
    res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = {};

  for (let isbn in books) {
    if (books[isbn].title === title) {
      booksByTitle[isbn] = books[isbn];
    }
  }

  if (Object.keys(booksByTitle).length > 0) {
    res.status(200).json(booksByTitle);
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    res.status(200).json(book.reviews);
  } else if (book) {
    res.status(200).json({});
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Task 10: Get all books using async callback function
public_users.get('/async/books', function (req, res) {
  const getAllBooks = (callback) => {
    // Simulate async operation
    setTimeout(() => {
      callback(null, books);
    }, 100);
  };

  getAllBooks((err, result) => {
    if (err) {
      res.status(500).json({ message: "Error fetching books" });
    } else {
      res.status(200).json(result);
    }
  });
});

// Task 11: Search by ISBN using Promises
public_users.get('/promise/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject(new Error("Book not found"));
        }
      }, 100);
    });
  };

  getBookByISBN(isbn)
    .then(book => {
      res.status(200).json(book);
    })
    .catch(error => {
      res.status(404).json({ message: error.message });
    });
});

// Task 12: Search by Author using async/await
public_users.get('/async/author/:author', async function (req, res) {
  const author = req.params.author;

  const getBooksByAuthor = async (author) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const booksByAuthor = {};
        for (let isbn in books) {
          if (books[isbn].author === author) {
            booksByAuthor[isbn] = books[isbn];
          }
        }
        resolve(booksByAuthor);
      }, 100);
    });
  };

  try {
    const booksByAuthor = await getBooksByAuthor(author);
    if (Object.keys(booksByAuthor).length > 0) {
      res.status(200).json(booksByAuthor);
    } else {
      res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error searching for books" });
  }
});

// Task 13: Search by Title using async/await
public_users.get('/async/title/:title', async function (req, res) {
  const title = req.params.title;

  const getBooksByTitle = async (title) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const booksByTitle = {};
        for (let isbn in books) {
          if (books[isbn].title === title) {
            booksByTitle[isbn] = books[isbn];
          }
        }
        resolve(booksByTitle);
      }, 100);
    });
  };

  try {
    const booksByTitle = await getBooksByTitle(title);
    if (Object.keys(booksByTitle).length > 0) {
      res.status(200).json(booksByTitle);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error searching for books" });
  }
});

module.exports.general = public_users;
