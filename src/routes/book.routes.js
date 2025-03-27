const express = require("express");
const bookController = require("../controllers/book.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { bookSchema, updateBookSchema } = require("../utils/validation");

const router = express.Router();

// Public routes for viewing books
router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookById);

// Protected routes for book management (Admin only)
router.use(authenticate);

// Admin only routes
router.post(
  "/",
  authorize("admin"),
  validate(bookSchema),
  bookController.createBook
);
router.put(
  "/:id",
  authorize("admin"),
  validate(updateBookSchema),
  bookController.updateBook
);
router.delete("/:id", authorize("admin"), bookController.deleteBook);

module.exports = router;
