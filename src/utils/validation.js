const Joi = require("joi");

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow("", null),
  role: Joi.string().valid("admin", "librarian", "member").default("member"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string().allow("", null),
  role: Joi.string().valid("admin", "librarian", "member"),
  password: Joi.string(),
  isApproved: Joi.boolean(),
});

// Book validation schemas
const bookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  isbn: Joi.string().required(),
  quantity: Joi.number().integer().min(0).required(),
  availableQuantity: Joi.number().integer().min(0),
  publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()),
  description: Joi.string().allow("", null),
});

const updateBookSchema = Joi.object({
  title: Joi.string(),
  author: Joi.string(),
  isbn: Joi.string(),
  quantity: Joi.number().integer().min(0),
  availableQuantity: Joi.number().integer().min(0),
  publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()),
  description: Joi.string().allow("", null),
});

// Borrowed book validation schemas
const borrowBookSchema = Joi.object({
  bookId: Joi.number().integer().required(),
  userId: Joi.number().integer(),
  dueDate: Joi.date().min("now").required(),
  librarianId: Joi.number().integer(),
});

const returnBookSchema = Joi.object({
  borrowId: Joi.number().integer().required(),
  librarianId: Joi.number().integer(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
  bookSchema,
  updateBookSchema,
  borrowBookSchema,
  returnBookSchema,
};
