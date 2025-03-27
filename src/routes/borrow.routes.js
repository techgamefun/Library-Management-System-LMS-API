const express = require("express");
const borrowController = require("../controllers/borrow.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { borrowBookSchema, returnBookSchema } = require("../utils/validation");

const router = express.Router();

// Protected routes for borrowing operations
router.use(authenticate);

// Member and admin can see their own borrows
router.get("/me", borrowController.getUserBorrows);

// Admin and librarian routes
router.get(
  "/",
  authorize("admin", "librarian"),
  borrowController.getAllBorrows
);
router.get(
  "/user/:userId",
  authorize("admin", "librarian"),
  borrowController.getUserBorrows
);
router.post(
  "/record",
  authorize("librarian", "admin"),
  borrowController.recordBorrowReturn
);

// Member only routes
router.post(
  "/borrow",
  authorize("member"),
  validate(borrowBookSchema),
  borrowController.borrowBook
);
router.post(
  "/return",
  authorize("member"),
  validate(returnBookSchema),
  borrowController.returnBook
);

module.exports = router;
