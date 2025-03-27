const { BorrowedBook, Book, User, sequelize } = require("../models");
const { Op } = require("sequelize");

// Borrow a book (Member only)
exports.borrowBook = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { bookId, dueDate } = req.body;
    const userId = req.user.id;

    // Check if book exists
    const book = await Book.findByPk(bookId, { transaction });
    if (!book) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check if book is available
    if (book.availableQuantity <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Book is not available for borrowing",
      });
    }

    // Check if user already has an active borrow for this book
    const existingBorrow = await BorrowedBook.findOne({
      where: {
        userId,
        bookId,
        status: "borrowed",
      },
      transaction,
    });

    if (existingBorrow) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "You already have an active borrow for this book",
      });
    }

    // Create borrow record
    const borrowedBook = await BorrowedBook.create(
      {
        bookId,
        userId,
        dueDate,
        status: "borrowed",
      },
      { transaction }
    );

    // Update book available quantity
    book.availableQuantity -= 1;
    await book.save({ transaction });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Book borrowed successfully",
      data: borrowedBook,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Failed to borrow book",
      error: error.message,
    });
  }
};

// Return a book (Member only)
exports.returnBook = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { borrowId } = req.body;
    const userId = req.user.id;

    // Check if borrow record exists
    const borrowedBook = await BorrowedBook.findOne({
      where: {
        id: borrowId,
        userId,
        status: "borrowed",
      },
      transaction,
    });

    if (!borrowedBook) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Borrow record not found or already returned",
      });
    }

    // Get the book
    const book = await Book.findByPk(borrowedBook.bookId, { transaction });
    if (!book) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Update borrow record
    borrowedBook.status = "returned";
    borrowedBook.returnDate = new Date();
    await borrowedBook.save({ transaction });

    // Update book available quantity
    book.availableQuantity += 1;
    await book.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Book returned successfully",
      data: borrowedBook,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Failed to return book",
      error: error.message,
    });
  }
};

// Record borrowing/returning by librarian
exports.recordBorrowReturn = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { bookId, userId, action, dueDate, borrowId } = req.body;
    const librarianId = req.user.id;

    // Check if user exists
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Handle borrowing action
    if (action === "borrow") {
      // Check if book exists
      const book = await Book.findByPk(bookId, { transaction });
      if (!book) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      // Check if book is available
      if (book.availableQuantity <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Book is not available for borrowing",
        });
      }

      // Check if user already has an active borrow for this book
      const existingBorrow = await BorrowedBook.findOne({
        where: {
          userId,
          bookId,
          status: "borrowed",
        },
        transaction,
      });

      if (existingBorrow) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "User already has an active borrow for this book",
        });
      }

      // Create borrow record
      const borrowedBook = await BorrowedBook.create(
        {
          bookId,
          userId,
          librarianId,
          dueDate,
          status: "borrowed",
          recordedByLibrarian: true,
        },
        { transaction }
      );

      // Update book available quantity
      book.availableQuantity -= 1;
      await book.save({ transaction });

      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "Book borrowing recorded successfully",
        data: borrowedBook,
      });
    }
    // Handle returning action
    else if (action === "return") {
      // Check if borrow record exists
      const borrowedBook = await BorrowedBook.findOne({
        where: {
          id: borrowId,
          userId,
          status: "borrowed",
        },
        transaction,
      });

      if (!borrowedBook) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Borrow record not found or already returned",
        });
      }

      // Get the book
      const book = await Book.findByPk(borrowedBook.bookId, { transaction });
      if (!book) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      // Update borrow record
      borrowedBook.status = "returned";
      borrowedBook.returnDate = new Date();
      borrowedBook.librarianId = librarianId;
      borrowedBook.recordedByLibrarian = true;
      await borrowedBook.save({ transaction });

      // Update book available quantity
      book.availableQuantity += 1;
      await book.save({ transaction });

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Book return recorded successfully",
        data: borrowedBook,
      });
    } else {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be either "borrow" or "return"',
      });
    }
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Failed to record book borrowing/returning",
      error: error.message,
    });
  }
};

// Get all borrowed books
exports.getAllBorrows = async (req, res) => {
  try {
    const borrows = await BorrowedBook.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: Book,
          attributes: ["id", "title", "author", "isbn"],
        },
        {
          model: User,
          as: "librarian",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: borrows.length,
      data: borrows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve borrowed books",
      error: error.message,
    });
  }
};

// Get borrowed books by user ID
exports.getUserBorrows = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If not admin or librarian, only allow users to see their own borrows
    if (
      req.user.role !== "admin" &&
      req.user.role !== "librarian" &&
      req.user.id !== parseInt(userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view other users' borrows",
      });
    }

    const borrows = await BorrowedBook.findAll({
      where: { userId },
      include: [
        {
          model: Book,
          attributes: ["id", "title", "author", "isbn"],
        },
        {
          model: User,
          as: "librarian",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: borrows.length,
      data: borrows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve borrowed books",
      error: error.message,
    });
  }
};
