# Saints Community Admin Dashboard (sc-admin)

A modern, comprehensive administrative dashboard for the Saints Community Church, handling Member Management, Analytics, Evangelism, Follow-up, and more. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React

## 🛠️ Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher)

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Heniisbaba/sc-admin.git
    cd sc-admin
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## ⚙️ Configuration

The application uses environment variables for configuration.

1.  **Create a `.env` file** in the root directory by copying the example:
    ```bash
    cp .env.example .env
    ```

2.  **Configure environment variables** in `.env`:
    ```env
    # The base URL for the backend API
    VITE_API_BASE_URL=http://localhost:4000/api

    # The port to run the frontend development server on
    PORT=3001
    ```

## 🏃‍♂️ Running the Application

### Development
Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3001` (or your configured PORT).

### Production Build
Build the application for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📁 Project Structure

- `src/` - Source code
    - `App.tsx` - Main application component & routing logic
    - `api.ts` - API configuration and service methods
    - `types.ts` - TypeScript interfaces and types
    - `constants.tsx` - Global constants and configuration
    - `mockData.ts` - Mock data for testing and placeholders
