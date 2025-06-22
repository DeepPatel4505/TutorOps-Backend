# 📚 TutorOps Backend

A production-ready backend server built with **Node.js**, **ES6**, **Babel**, **Prisma**, and **module-aliases**.  
This server powers the TutorOps platform — enabling smart assignment generation, student management, scheduling, and more.

---

## 🚀 Features

- ES6 syntax via Babel
- Modular folder structure (`src/`)
- Module aliasing (`@api`, `@utils`, etc.)
- Prisma ORM with PostgreSQL
- Prettier for consistent code formatting
- Nodemon for live-reload during development

---

## 📁 Folder Structure

```

backend/
├── src/
│   ├── api/             # Route-level logic
│   ├── config/          # DB, env, logger config
│   ├── core/            # Server setup (router/socket)
│   ├── entities/        # DB logic / repositories
│   ├── jobs/            # Scheduled tasks
│   ├── middlewares/     # Auth, error, etc.
│   ├── utils/           # Helpers, mail, PDF, etc.
│   └── index.js         # App entry point
├── prisma/              # Prisma schema & seed
├── .env                 # Environment variables
├── .babelrc             # Babel config
├── .prettierrc          # Prettier formatting rules
├── jsconfig.json        # VSCode alias support
└── package.json         # Scripts & dependencies

````

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/DeepPatel4505/TutorOps-Backend.git
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Fill out:

* `DATABASE_URL=postgresql://...`
* `PORT=5000`

### 4. Setup the database

Run Prisma commands:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

> ⚠️ Make sure your PostgreSQL server is running and the `DATABASE_URL` is correct.

### 5. Start development server

```bash
npm run dev
```

This uses `nodemon` + `babel-node` and supports ES6 + module aliases.

---

## 📦 Available Scripts

| Script         | Description                               |
| -------------- | ----------------------------------------- |
| `dev`          | Start dev server with live reload         |
| `build`        | Compile source to `/dist` with Babel      |
| `start`        | Start the compiled production server      |
| `format`       | Format code using Prettier                |
| `format:check` | Check if code follows Prettier formatting |

---

## 💡 Tech Stack

* Node.js (v18+)
* Express
* Babel
* Prisma
* PostgreSQL


## 🤝 Contributing

Want to contribute?
Fork the repo, make your changes, and open a pull request!

---

## 📬 Contact

Built by [**Deep**]("https://github.com/DeepPatel4505")🚀
