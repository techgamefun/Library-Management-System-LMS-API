const sequelize = require("../config/db.config");
const User = require("./User");
const Book = require("./Book");
const BorrowedBook = require("./BorrowedBook");

// Define associations
User.hasMany(BorrowedBook, { foreignKey: "userId" });
BorrowedBook.belongsTo(User, { foreignKey: "userId" });

Book.hasMany(BorrowedBook, { foreignKey: "bookId" });
BorrowedBook.belongsTo(Book, { foreignKey: "bookId" });

// Associate librarian with recorded borrowings
User.hasMany(BorrowedBook, {
  foreignKey: "librarianId",
  as: "recordedBorrowings",
});
BorrowedBook.belongsTo(User, { foreignKey: "librarianId", as: "librarian" });

// Sync models with database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Failed to sync database:", error);
  }
};

module.exports = {
  sequelize,
  User,
  Book,
  BorrowedBook,
  syncDatabase,
};
