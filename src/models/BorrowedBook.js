const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const BorrowedBook = sequelize.define("borrowedBook", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  borrowDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  returnDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("borrowed", "returned", "overdue"),
    defaultValue: "borrowed",
  },
  recordedByLibrarian: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = BorrowedBook;
