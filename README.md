# Library Management System API

A RESTful API for a Library Management System built with Node.js, Express, and MySQL (using Sequelize ORM).

## Features

- Role-based access control (Admin, Librarian, Member)
- User authentication with JWT
- Book management
- Borrowing operations
- User management

## Requirements

- Node.js (v14+)
- MySQL

## Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/lms-api.git
cd lms-api
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

```bash
# Create a .env file and adjust the values as needed
cp .env.example .env
```

4. Create the database

```sql
CREATE DATABASE lms_db;
```

5. Run the application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Users (Admin only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/approve` - Approve user registration

### Books

- `GET /api/books` - Get all books (Public)
- `GET /api/books/:id` - Get book by ID (Public)
- `POST /api/books` - Create a new book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Borrowing

- `GET /api/borrows/me` - Get current user's borrows (Any authenticated user)
- `GET /api/borrows` - Get all borrows (Admin and Librarian)
- `GET /api/borrows/user/:userId` - Get user's borrows (Admin and Librarian)
- `POST /api/borrows/borrow` - Borrow a book (Member)
- `POST /api/borrows/return` - Return a book (Member)
- `POST /api/borrows/record` - Record borrowing/returning (Librarian)

## Role Permissions

### Admin

- Manage users (create, update, delete, approve)
- Manage books (create, update, delete)
- View all borrowed books
- Access all features of the system

### Librarian

- View books
- Record borrowing/returning operations
- View all borrowed books

### Member

- View books
- Borrow/return books
- View own borrowing history

## Data Models

### User

- id (PK)
- name
- email (unique)
- password (hashed)
- phone (optional)
- role (enum: admin, librarian, member)
- isApproved (boolean)

### Book

- id (PK)
- title
- author
- isbn (unique)
- quantity
- availableQuantity
- publishedYear (optional)
- description (optional)

### BorrowedBook

- id (PK)
- bookId (FK)
- userId (FK)
- librarianId (FK, optional)
- borrowDate
- dueDate
- returnDate (optional)
- status (enum: borrowed, returned, overdue)
- recordedByLibrarian (boolean)

## License

MIT
