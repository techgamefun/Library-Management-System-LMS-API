const { Book } = require("../models");

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();

    return res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve books",
      error: error.message,
    });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve book",
      error: error.message,
    });
  }
};

// Create a new book (Admin only)
exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, quantity, publishedYear, description } =
      req.body;

    // Check if ISBN already exists
    const existingBook = await Book.findOne({ where: { isbn } });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: "A book with this ISBN already exists",
      });
    }

    // Create new book
    const book = await Book.create({
      title,
      author,
      isbn,
      quantity: quantity || 1,
      availableQuantity: quantity || 1, // Initially all books are available
      publishedYear,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create book",
      error: error.message,
    });
  }
};

// Update book (Admin only)
exports.updateBook = async (req, res) => {
  try {
    const { title, author, isbn, quantity, publishedYear, description } =
      req.body;

    // Find book by ID
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check if ISBN exists (if trying to update ISBN)
    if (isbn && isbn !== book.isbn) {
      const existingBook = await Book.findOne({ where: { isbn } });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: "A book with this ISBN already exists",
        });
      }
    }

    // Calculate available quantity adjustment if total quantity changes
    let availableQuantity = book.availableQuantity;
    if (quantity !== undefined && quantity !== book.quantity) {
      const borrowedQuantity = book.quantity - book.availableQuantity;
      availableQuantity = Math.max(0, quantity - borrowedQuantity);
    }

    // Update book fields
    await book.update({
      title: title || book.title,
      author: author || book.author,
      isbn: isbn || book.isbn,
      quantity: quantity !== undefined ? quantity : book.quantity,
      availableQuantity: availableQuantity,
      publishedYear: publishedYear || book.publishedYear,
      description: description !== undefined ? description : book.description,
    });

    return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update book",
      error: error.message,
    });
  }
};

// Delete book (Admin only)
exports.deleteBook = async (req, res) => {
  try {
    // Find book by ID
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check if book has been borrowed
    if (book.quantity !== book.availableQuantity) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete book as it has been borrowed",
      });
    }

    // Delete book
    await book.destroy();

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete book",
      error: error.message,
    });
  }
};
