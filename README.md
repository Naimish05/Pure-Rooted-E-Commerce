<div align="center">

  <img src="public/assets/Logo.webp" alt="Pure Rooted Logo" width="160" style="border-radius: 16px; margin-bottom: 16px;" />

  # 🌿 Pure Rooted

  **A Modern, Full-Stack Natural Wellness & Self-Care E-Commerce Platform**

  *Nourish your mind, body, and ritual with ethically sourced, botanical lifestyle essentials.*

  <br />

  [![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Neon Postgres](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Overview

**Pure Rooted** is an artisanal, full-featured e-commerce storefront dedicated to natural wellness, essential oils, mindful rituals, and organic herbal goods. Built with a modern, high-performance stack using **React 19**, **Vite**, **Tailwind CSS v4**, and **Neon Serverless Postgres via PostgREST Data API & Auth**, Pure Rooted delivers a fluid, responsive, and aesthetically calming shopping experience.

---

## ✨ Features

### 🛍️ Customer Experience
- **Curated Storefront & Catalog**: Explore products by curated categories (*Essential Oils*, *Skincare*, *Herbal Teas*, *Rituals & Tools*) with rich product details, badges, stock availability, and ratings.
- **Interactive Shopping Cart**: Quick-access slide-out drawer cart with real-time quantity adjustment, persistent state, and subtotal calculation.
- **Seamless Checkout**: Address management, live cart breakdown, and streamlined order placement with immediate confirmation.
- **User Authentication & Profiles**: Secure sign-up, sign-in, and session handling powered by Neon Auth, with dedicated order history tracking on the user profile page.
- **Fluid & Accessible Design**: Crafted with calming, earthy tones, micro-interactions, responsive navigation, and smooth mobile drawers.

### 🛡️ Administration & Operations (`/admin`)
- **Interactive Dashboard**: Real-time sales statistics, revenue tracking, pending order indicators, and quick action shortcuts.
- **Product Management**: Create, edit, search, filter, and delete catalog items with image URL linking, category assignment, and stock toggles.
- **Category Control**: Create and manage product categories with automated slug generation.
- **Order Lifecycle Management**: View, filter, and transition order statuses (`pending` ➔ `processing` ➔ `shipped` ➔ `delivered` ➔ `cancelled`).
- **Role-Based Access Control**: Protected dashboard view verifying admin privileges before granting operational access.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) | Modern UI library with functional components & hooks |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | Ultra-fast HMR and production bundle optimization |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first CSS styling engine |
| **Database** | [Neon Serverless Postgres](https://neon.tech/) | Cloud-native, scalable serverless PostgreSQL database |
| **Data Layer** | Neon Data API / PostgREST | Instant RESTful database interactions via `@supabase/supabase-js` |
| **Authentication** | Neon Auth / Better Auth | Cookie- and token-backed authentication with JWT session rotation |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent icons for UI elements |
| **Routing** | [React Router v7](https://reactrouter.com/) | Declarative client-side routing and protected routes |

---

## 📁 Project Structure

```text
pure-rooted/
├── public/
│   ├── assets/              # Logos, banners, and default product webp images
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── api/
│   │   └── neon.js          # Neon Data API & PostgREST client singleton
│   ├── components/
│   │   ├── CartDrawer.jsx   # Slide-out shopping cart drawer
│   │   ├── Footer.jsx       # Global footer & newsletter signup
│   │   ├── Navbar.jsx       # Header navigation, search, and user state
│   │   └── ProductCard.jsx  # Card preview for product grid
│   ├── context/
│   │   ├── AuthContext.jsx  # Authentication state, login/signup, profile data
│   │   └── CartContext.jsx  # Cart state management with localStorage persistence
│   ├── pages/
│   │   ├── About.jsx        # Brand story, ethos, and sustainable mission
│   │   ├── Admin.jsx        # Comprehensive Admin management portal
│   │   ├── Checkout.jsx     # Shipping address & order submission
│   │   ├── Home.jsx         # Hero section, curated categories, featured picks
│   │   ├── Login.jsx        # Sign-in page
│   │   ├── ProductDetail.jsx# Full product details, usage directions & specs
│   │   ├── Profile.jsx      # User profile details and order history
│   │   ├── Shop.jsx         # Filterable catalog with search & category pills
│   │   └── Signup.jsx       # Registration page
│   ├── App.jsx              # Main application router and providers
│   ├── index.css            # Tailwind CSS imports and theme configuration
│   └── main.jsx             # React DOM root entry point
├── neon_database_setup.sql  # SQL schema definition & seed data script
├── .env.example             # Template for required environment variables
├── package.json             # Dependencies and scripts
└── vite.config.js           # Vite build configuration
```

---

## 🚀 Getting Started

Follow these instructions to get a local copy running on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A free [Neon](https://neon.tech/) PostgreSQL account

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/pure-rooted.git
   cd pure-rooted
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```
   Fill in your Neon connection endpoints:
   ```env
   VITE_NEON_DATA_API_URL="https://<project-id>.apirest.<region>.aws.neon.tech/<database>/rest/v1"
   VITE_NEON_AUTH_URL="https://<project-id>.neonauth.<region>.aws.neon.tech/<database>/auth"
   VITE_NEON_STORAGE_URL="https://<storage-bucket-id>.storage.<region>.aws.neon.tech"
   ```

4. **Initialize Database Schema & Sample Data:**
   - Go to your [Neon Console](https://console.neon.tech/).
   - Open your project and navigate to the **SQL Editor**.
   - Copy the entire contents of [`neon_database_setup.sql`](neon_database_setup.sql) and execute the script.
   - This script creates all required tables (`profiles`, `categories`, `products`, `orders`, `order_items`) and populates initial botanical catalog items.

5. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database Architecture

The application connects to a PostgreSQL database via Neon's REST / Data API with the following structure:

- **`profiles`**: Stores registered user profiles, account metadata, and role assignments (`user` vs `admin`).
- **`categories`**: Defines product taxonomy (`Essential Oils`, `Skincare`, `Herbal Teas`, `Rituals & Tools`).
- **`products`**: Product catalog items with title, description, category relationship, pricing, badges, and stock availability.
- **`orders`**: Customer checkout records with contact details, shipping address, total order amount, and status (`pending`, `shipped`, etc.).
- **`order_items`**: Line items linked to each order with snapshot price at time of purchase.

---

## 📜 Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite local development server with Hot Module Replacement |
| `npm run build` | Bundles and optimizes the app for production in `dist/` |
| `npm run preview` | Locally preview the production build output |
| `npm run lint` | Runs ESLint to check for code issues and lint warnings |

---

## 🔒 Admin Access Setup

To promote a registered user to administrator status:
1. Register an account through `/signup`.
2. In the Neon Console SQL Editor, execute:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```
3. Navigate to `/admin` to access the management portal.

---

## 🤝 Contributing

Contributions are welcome! If you would like to improve Pure Rooted:
1. Fork the Project (`git checkout -b feature/AmazingFeature`)
2. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the Branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
