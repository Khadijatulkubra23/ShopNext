# ShopNest

ShopNest is a full-stack e-commerce and business management app. Customers can browse products, build a cart, check out and track their orders. Admins get a dashboard with stats and charts, plus pages to manage products, categories, orders and users.

Built for **Devixo Solutions, Task 04**.

## Live demo

| | Link |
|---|---|
| Website | https://shop-next-imzu.vercel.app |
| API | https://shop-next-psi-bay.vercel.app/ |
| Source code | https://github.com/Khadijatulkubra23/ShopNext |

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `test@shopnest.com` | `Admin1234` |
| Customer | register a new account on the site | any password with 8+ characters, a letter and a number |

## Features

**Customer side**
- Register, log in and log out with JWT authentication
- Forgot/reset password flow with one-time, expiring reset links
- Browse products with search, category filter, sorting and pagination
- Product details, with stock status and quantity selection
- Cart that persists between visits (saved in the browser)
- Checkout with shipping details and a choice of Cash on Delivery or a demo card payment
- Order confirmation, order history, order details with a status tracker
- Profile page to update your name and change your password

**Admin side**
- Dashboard with revenue, orders, products and customer counts, a 7-day revenue chart, orders by status, top-selling products, low-stock alerts and recent activity
- Product management: table with search, filter and pagination, add/edit form with image preview, delete with confirmation
- Category management (add, edit, delete)
- Order management: filter by status, search by order number or customer, change status, view full order details
- User management: search, filter by role, promote or demote users, delete users

**Other**
- Role-based access control: customers and admins see different routes, enforced on both the frontend and the backend
- Passwords hashed with bcrypt, with validation on both the client and the server
- Form validation, loading skeletons, empty states, error states and toast notifications
- Responsive layout that works on mobile
- Stock is checked and reduced when an order is placed, and restored if an admin cancels the order
- Order totals are calculated on the server from database prices, never trusted from the client

**Bonus features covered:** product images, search with pagination, admin/user roles, mock payment.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, Lucide React, React Hot Toast, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB Atlas with Mongoose |
| Auth | JSON Web Tokens, bcryptjs |
| Hosting | Vercel (frontend and backend), MongoDB Atlas |

## Project structure

```
ShopNest/
├── client/                 React frontend
│   └── src/
│       ├── api/            Axios instance
│       ├── components/     Navbar, Footer, ProductCard, AdminLayout, ProtectedRoute, dialogs...
│       ├── context/        AuthContext, CartContext
│       ├── pages/          Customer pages and admin pages
│       └── utils/          Formatting helpers
└── server/                 Express backend
    ├── config/             Database connection
    ├── controllers/        Request handlers
    ├── middleware/         JWT protection and role authorization
    ├── models/             Mongoose models (User, Product, Category, Order)
    ├── routes/             API routes
    └── server.js           App entry point
```

## Running it locally

You'll need Node.js 18 or newer and a MongoDB Atlas database (the free tier is enough).

**1. Clone the repo**

```bash
git clone https://github.com/YOUR-USERNAME/shopnest.git
cd shopnest
```

**2. Set up the backend**

```bash
cd server
npm install
```

Create a file called `.env` inside `server/`:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_long_random_string
SHOW_RESET_LINK=true
```

Then start it:

```bash
npm run dev
```

You should see `ShopNest server running on port 5000` and `MongoDB connected successfully`.

**3. Set up the frontend**

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173. The frontend talks to `http://localhost:5000/api` by default.

**4. Create an admin account**

Register a normal account on the site, then open the `users` collection in MongoDB Atlas and change that user's `role` from `user` to `admin`. Log out and back in to pick up the new role.

### Environment variables

**Backend (`server/.env`)**

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `PORT` | Port for local development (defaults to 5000) |
| `CLIENT_URL` | Allowed frontend origin for CORS. Leave empty locally, set it to the deployed site URL in production (no trailing slash) |
| `SHOW_RESET_LINK` | When `true`, the forgot-password response includes the reset link (demo mode, see Notes) |

**Frontend (`client/.env`)**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL, ending in `/api`. Defaults to `http://localhost:5000/api` |

### Sample data

`server/seed.js` adds 6 categories and 24 sample products. It skips products that already exist.

```bash
cd server
node seed.js            # add sample data
node seed.js --reset    # delete all products first, then add sample data
```

## API reference

Base URL: `/api`. Protected routes expect an `Authorization: Bearer <token>` header. "Admin" routes also require the user's role to be `admin`.

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an account (`name`, `email`, `password`) |
| POST | `/auth/login` | Public | Log in and receive a token and user |
| POST | `/auth/forgot-password` | Public | Generate a password reset link (`email`) |
| POST | `/auth/reset-password/:token` | Public | Set a new password (`password`) using a valid link |

Passwords must be at least 8 characters and include a letter and a number.

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users/profile` | User | Get the logged-in user |
| PUT | `/users/profile` | User | Update your name |
| PUT | `/users/password` | User | Change password (`currentPassword`, `newPassword`) |
| GET | `/users` | Admin | List all users |
| PUT | `/users/:id/role` | Admin | Change a user's role (`user` or `admin`) |
| DELETE | `/users/:id` | Admin | Delete a user (not yourself, and not users with orders) |

### Categories

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/categories` | Public | List categories |
| POST | `/categories` | Admin | Create a category |
| PUT | `/categories/:id` | Admin | Update a category |
| DELETE | `/categories/:id` | Admin | Delete a category (blocked if it still has products) |

### Products

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/products` | Public | List products |
| GET | `/products/:id` | Public | Get one product |
| POST | `/products` | Admin | Create a product |
| PUT | `/products/:id` | Admin | Update a product |
| DELETE | `/products/:id` | Admin | Delete a product |

`GET /products` query parameters:

| Parameter | Description |
|---|---|
| `search` | Case-insensitive match on the product name |
| `category` | Category id |
| `sort` | `newest` (default), `price-asc`, `price-desc` or `name` |
| `page`, `limit` | Pagination (default limit 12, maximum 50) |
| `featured` | `true` to return featured products only |
| `minPrice`, `maxPrice` | Price range |

The response looks like `{ products, page, pages, total }`.

### Orders

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/orders` | User | Place an order |
| GET | `/orders/my` | User | Your order history |
| GET | `/orders/:id` | User | One order (yours, or any order for admins) |
| GET | `/orders` | Admin | All orders |
| PUT | `/orders/:id/status` | Admin | Update order status |

Example body for `POST /orders`:

```json
{
  "items": [{ "product": "<productId>", "quantity": 2 }],
  "shippingAddress": {
    "fullName": "Jane Doe",
    "address": "12 Garden Road",
    "city": "Lahore",
    "postalCode": "54000",
    "phone": "+92 300 1234567"
  },
  "paymentMethod": "cod"
}
```

`paymentMethod` is `cod` or `mock`. Order status moves through `pending`, `processing`, `shipped`, `delivered`, and an order can also be `cancelled`. Cancelling restores the stock, and a cancelled order can't be changed again.

### Admin

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/stats` | Admin | Dashboard statistics |

## Deployment

The frontend and backend are deployed as two separate Vercel projects from this one repository.

| Project | Root directory | Environment variables |
|---|---|---|
| Backend | `server` | `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `SHOW_RESET_LINK` |
| Frontend | `client` | `VITE_API_URL` |

`client/vercel.json` rewrites all routes to `index.html` so refreshing a page on a React Router route works. MongoDB Atlas is set to accept connections from any IP address so the serverless functions can reach it.

## Notes and limitations

- **Password reset has no email service.** The reset link is printed in the server logs, and when `SHOW_RESET_LINK=true` it is also shown on the Forgot Password page so the flow can be demonstrated. In a real deployment this setting should be off and the link emailed to the user.
- **Payments are simulated.** The "Card Payment (Demo)" option validates the card form but never sends or stores card details. Orders paid this way are marked as paid.
- **Product images are URLs**, not uploaded files.
- Users who have placed orders can't be deleted, so order history always points to a real account.