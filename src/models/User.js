const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "librarian", "member"),
      defaultValue: "member",
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Instance method to check password validity
User.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate a random password based on user data
User.generatePassword = (name, email, phone) => {
  const nameBase = name.substring(0, 3);
  const emailBase = email.split("@")[0].substring(0, 3);
  const phoneBase = phone
    ? phone.substring(phone.length - 3)
    : Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");

  // Randomize the combination
  const components = [nameBase, emailBase, phoneBase];
  const shuffled = components.sort(() => 0.5 - Math.random());

  // Add a special character and number
  const specialChars = "!@#$%^&*()_+";
  const randomSpecial = specialChars.charAt(
    Math.floor(Math.random() * specialChars.length)
  );
  const randomNum = Math.floor(Math.random() * 100);

  return `${shuffled.join("")}${randomSpecial}${randomNum}`;
};

module.exports = User;
