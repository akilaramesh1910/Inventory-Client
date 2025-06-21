# Simple Inventory Management System

A minimal, single-role inventory management web application built for small businesses. This system provides core functionalities for product and stock management, a Point of Sale (POS) system, order tracking, and barcode generation.

## ✨ Features

This application is a Minimum Viable Product (MVP) packed with essential features:

*   **Authentication**: Secure admin login using email/password with JWT-based sessions.
*   **Product Management**:
    *   Add, edit, and delete products.
    *   View a comprehensive list of all products in either a grid or table layout.
    *   Search products by name, SKU, or category.
*   **Stock Management**:
    *   Add or subtract stock quantities manually.
    *   View current stock levels at a glance.
    *   Stock automatically decreases when an order is processed through the POS system.
*   **Stock Counting**:
    *   Perform manual stock recounts to ensure accuracy.
    *   Adjust inventory levels based on physical counts.
*   **Point of Sale (POS)**:
    *   A user-friendly interface to search and add products to a cart.
    *   Adjust item quantities in the cart.
    *   View an order summary and process checkouts.
*   **Order Management**:
    *   Create new orders manually.
    *   View a history of past orders with detailed information.
*   **Barcode Generation**:
    *   Automatically generate a Code 128 barcode for each product based on its SKU.
    *   Preview barcodes directly on the product list page.
    *   Print selected barcodes for labeling.

## 🛠️ Tech Stack

The project is built with a modern, robust technology stack:

*   **Frontend**: **React.js** (with **Next.js** framework)
*   **Backend**: **Node.js** with **Express.js**
*   **Database**: **MongoDB** (using **Mongoose** ODM)
*   **Authentication**: JSON Web Tokens (JWT)
*   **Barcode Generation**: `bwip-js` (backend)

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

*   Node.js - v23
*   npm install

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <repository_url>
    ```

2.  **Setup the Backend:**
    *   Navigate to the backend directory:
        ```sh
        cd folder_name
        ```
    *   Install dependencies:
        ```sh
        npm install
        ```
    *   Create a `.env` file in the `backend` root and add your configuration:
        ```env
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret_key
        PORT=8000
        ```
    *   Start the backend server:
        ```sh
        npm start
        ```
    The backend server will be running on `http://localhost:8000`.

3.  **Setup the Frontend:**
    *   In a new terminal, navigate to the client directory:
        ```sh
        cd folder_name
        ```
    *   Install dependencies:
        ```sh
        node version v23
        npm install
        ```
    *   Start the frontend development server:
        ```sh
        npm run dev
        ```
    The frontend application will be available at `http://localhost:3000`.

4.  **Access the Application:**
    *   Open your browser and go to `http://localhost:3000`.
    *   Use the demo credentials on the login page to get started:
    Example:
        *   **Email**: `abc@gmail.com`
        *   **Password**: `abc123`

