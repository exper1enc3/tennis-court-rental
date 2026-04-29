# Courtly: Tennis Court Booking System

Courtly is a comprehensive tennis court booking platform.It provides a complete solution for users to register, log in, and eventually book tennis court time slots. The system is built with a clear separation between a Python-powered backend and a React-powered frontend.

## 🛠️ Technology Stack

This project utilizes a modern and reliable stack of technologies, focusing on speed and simplicity:

**Backend Environment:**
* **FastAPI:** A modern, fast web framework for building APIs with Python. It handles all our web requests.
* **Uvicorn:** The server that actually runs the FastAPI application.
* **SQLAlchemy:** A database toolkit for Python that lets us interact with our database using Python objects instead of raw SQL queries.
* **Alembic:** A database migration tool. It helps us safely update our database structure (like adding new columns) over time.
* **SQLite:** A lightweight, file-based database used as the primary data store for the application

**Frontend Environment:**
* **React:** A popular JavaScript library for building user interfaces.
* **Vite:** A fast build tool and development server for modern web projects.

**Infrastructure:**
* **Docker Compose:** A tool used to run the entire application stack (frontend, backend, and routing) in isolated containers.
* **Nginx:** A web server used here as a "reverse proxy" to direct web traffic to either the React frontend or the FastAPI backend.

---

## 📂 Project Structure

The codebase is strictly organized so that specific tasks happen in specific folders. Here is the layout of the repository:

```text
.
├── alembic/                # Configuration and versions for database schema migrations
│   ├── env.py              
│   └── versions/           
├── app/                    # The main Python backend code
│   ├── api/                # The HTTP routing layer
│   │   └── routes.py       # Defines the web addresses (endpoints) for the API
│   ├── infrastructure/     # Database and data storage logic
│   │   ├── event_store.py  # Handles writing to the JSONL audit log
│   │   ├── models.py       # Defines the database tables using SQLAlchemy
│   │   ├── repository.py   # Contains the actual database queries
│   │   └── sqlite.py       # Manages the database connection and session
│   └── main.py             # The entry point that starts the FastAPI application
├── db/                     # Where the local data is stored
│   └── events.jsonl        # The append-only text file acting as our audit log
├── nginx/                  # Configuration for the traffic director
│   └── default.conf        # Rules for routing port 80 traffic to the frontend or API
├── web/                    # The React frontend application
│   ├── src/                # Where the React components and UI logic live
│   └── package.json        # Lists the JavaScript dependencies
├── .env                    # Environment variables (like database URLs)
├── alembic.ini             # Configuration file for the Alembic migration tool
├── docker-compose.yaml     # Instructions for Docker to build and run the project
├── README.md               # This documentation file
├── ARCHITECTURE.md         # Extended details on system design decisions
└── requirements.txt        # Lists the Python dependencies needed for the backend
```

---

## 🗄️ Database Schema

Courtly uses SQLite for operational data.The core database consists of five main tables to handle users and scheduling:

1. **`users`**: Stores user account details (ID, first name, last name, email, hashed password, role, active status, and creation date).
2. **`courts`**: Contains details about the physical tennis courts (name, surface type, address details, and active status).
3. **`court_hours`**: Defines the operational schedule for each court, tracking start and end times for specific weekdays.
4. **`bookings`**: Records the actual reservations, tracking the user, the court, the start/end times, and the status of the booking.
5. **`booking_slots`**: A specialized table that breaks the calendar down into 30-minute chunks. This ensures that no two users can book the exact same time slot on the same court, effectively preventing double-booking conflicts.

---

## 🔐 Security & Authentication

Protecting user data is a primary focus. The application handles authentication natively without relying on external providers.

### Password Storage
When a user creates an account, their password is not saved normally. Instead, the backend uses a cryptographic process called **PBKDF2-HMAC (SHA-256)** to hash the password. It also adds a unique "salt" (random data) to the password before hashing it 200,000 times. This makes the stored passwords highly resistant to unauthorized deciphering.

### Login Sessions (JWT)
When a user logs in, the server verifies their password and generates a **JSON Web Token (JWT)**. 
* This token is returned to the frontend and acts as a digital key.
* The frontend includes this token in future requests to prove the user is logged in.
* For security, these tokens are set to expire automatically after 24 hours.

---

## 📜 The Event Sourcing Log

Alongside the standard database, Courtly maintains a secondary, permanent record of important system events in a file called `db/events.jsonl`. 

This file is **append-only**. You cannot edit or delete lines in it. It serves as a reliable audit trail.

Currently, the system logs the following events:
* **`user_signed_up`**: Recorded when a new account is created. It captures the user's ID, email, role, and a timestamp.
* **`user_signed_in`**: Recorded every time a user successfully logs into the application.

---

## 🔌 API Endpoints Reference

The backend communicates with the frontend via HTTP requests. Currently, the following endpoints are available:

### `GET /health`
* **Purpose:** A diagnostic tool to check if the backend API is running and responding.
* **Response:** `{"status": "ok"}` 

### `POST /auth/signup`
* **Purpose:** Registers a new user in the system.
* **How it works:** It checks if the email exists. If not, it hashes the password, saves the user to the `users` table, writes a `user_signed_up` event to the log, and generates an access token.
* **Required Data:** `first_name`, `last_name`, `email`, `password`.
* **Returns:** A success message with the user's profile data and their new access token.

### `POST /auth/signin`
* **Purpose:** Authenticates an existing user.
* **How it works:** It verifies the provided email and password against the database. If correct, it writes a `user_signed_in` event to the log and generates a fresh access token.
* **Required Data:** `email`, `password`.
* **Returns:** The user's profile data and their active access token.

---

## 🚀 Running the Application

There are two primary ways to run Courtly. Use Docker for a simple, all-in-one startup, or run the components manually if you are actively editing code.

### Option 1: Docker Compose (The Easy Way)
This method spins up the frontend, backend, and Nginx reverse proxy automatically. 

1. Ensure Docker is installed and running on your machine.
2. Open your terminal in the project root folder.
3. Run the following command:
   ```bash
   docker compose up
   ```
4. **Access the App:** Open your web browser and go to `http://localhost`.

### Option 2: Local Development Setup (Manual)
If you are developing new features, running the pieces separately gives you better error messages and live-reloading capabilities.

**Step 1: Start the Backend**
1. Create a Python virtual environment to keep your packages isolated:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Install the necessary Python libraries:
   ```bash
   pip install -r requirements.txt
   ```
3. Prepare the SQLite database with the latest tables:
   ```bash
   alembic upgrade head
   ```
4. Start the FastAPI development server:
   ```bash
   python -m app.main
   ```
   *The API is now running at `http://localhost:5000/health`*.

**Step 2: Start the Frontend**
1. Open a second terminal window and navigate to the frontend folder:
   ```bash
   cd web
   ```
2. Install the required JavaScript packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev -- --host 0.0.0.0 --port 5173
   ```
   *The frontend UI is now running at `http://localhost:5173`*.

---

## ✍️ Development & Testing Guidelines

When contributing to this codebase, please adhere to these core principles to keep the project clean:

1.  **Keep API Routes Simple:** The code inside `app/api/routes.py` should only be responsible for receiving the request and returning the response. The actual heavy lifting (like checking passwords or saving data) should happen in the `handlers.py` and `repository.py` files.
2.  **Database Changes:** Never modify the database schema directly. If you add a new table or column to `models.py`, you must generate an Alembic migration script to apply those changes safely.
3.  **Automated Software Testing:** Because the business logic is cleanly separated from the API routes, you can easily write automated unit tests for your functions in `handlers.py`. We recommend creating a `tests/` folder and writing clear tests to ensure user registration and court booking logic works as expected before running the server. 
4.  **Append, Don't Edit:** Treat the `db/events.jsonl` file as a sacred history. Never write code that deletes or modifies lines in this file.
```