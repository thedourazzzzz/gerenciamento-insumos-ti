
Built by https://www.blackbox.ai

---

# Gerenciamento de Insumos de TI

## Project Overview
**gerenciamento-insumos-ti** is a Node.js based application designed for managing IT supplies. This system facilitates the organization, tracking, and authentication processes essential for efficient IT resource management.

## Installation
To set up this project locally, follow these steps:

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd gerenciamento-insumos-ti
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root of your project and define the required environment variables:
   ```plaintext
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=<your_jwt_secret>
   DB_HOST=<your_db_host>
   DB_USER=<your_db_user>
   DB_PASS=<your_db_password>
   DB_NAME=<your_db_name>
   ALLOWED_ORIGINS=<comma_separated_list_of_origins>
   ```

4. **Initialize the database (optional)**
   If you need to create or initialize the development database, you can run:
   ```bash
   npm run init-db
   ```

5. **Start the application**
   ```bash
   npm start        # For production
   npm run dev      # For development with hot reloading
   ```

## Usage
Once the application is running, you can interact with various endpoints to manage IT supplies. For a detailed API documentation, refer to the `/api` endpoint of the application.

## Features
- **User Authentication**: Secure login and registration using JWT.
- **Resource Management**: CRUD operations for managing IT supplies, users, and logs.
- **Rate Limiting**: Prevent abuse of the API endpoints.
- **Security Features**: Integrated middleware such as Helmet and CORS for enhanced security.
- **Logging**: Comprehensive logging of requests and errors.

## Dependencies
The project uses several key dependencies, as listed in `package.json`:

- **Express**: Web framework for Node.js.
- **Sequelize**: ORM for interacting with the database.
- **SQLite3**: Database engine.
- **jsonwebtoken**: For handling JWT tokens.
- **bcrypt**: For password hashing.
- **cors**: To enable CORS.
- **body-parser**: For parsing request bodies.
- **multer**: For handling multipart/form-data.
- **csv-parse**: For parsing CSV files.
- **express-rate-limit**: To limit repeated requests.
- **helmet**: To secure Express apps by setting various HTTP headers.
- **compression**: To Gzip/Deflate files to reduce the response size.

For development:
- **Nodemon**: For automatic reloading during development.
- **dotenv**: For loading environment variables from a `.env` file.

## Project Structure
```
gerenciamento-insumos-ti/
├── backend/
│   ├── config/             # Configuration files
│   ├── middlewares/        # Middleware functions
│   ├── models/             # Database models
│   └── routes/             # Define API routes
├── frontend/               # Frontend assets (HTML, CSS, JS)
├── logs/                   # Log files
├── server.js               # Main server file
├── .env                    # Environment variables
├── package.json            # Project metadata and dependencies
└── package-lock.json       # Lock file for dependency versions
```

## License
This project is licensed under the MIT License. See the LICENSE file for more information.

```

Replace `<repository_url>` with the actual URL of the repository when using the README.