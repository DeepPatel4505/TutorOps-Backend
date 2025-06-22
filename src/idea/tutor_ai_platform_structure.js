/*
tutor-app/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── controller.js
│   │   │   │   ├── service.js
│   │   │   │   ├── routes.js
│   │   │   │   └── dto.js
│   │   │   ├── users/
│   │   │   │   ├── controller.js
│   │   │   │   ├── service.js
│   │   │   │   ├── routes.js
│   │   │   │   └── dto.js
│   │   │   ├── assignments/
│   │   │   ├── submissions/
│   │   │   ├── attendance/
│   │   │   ├── reports/
│   │   │   ├── scheduler/
│   │   │   └── zoom/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── env.js
│   │   │   ├── logger.js
│   │   │   └── mailer.js
│   │   ├── core/
│   │   │   ├── router.js
│   │   │   └── socket.js
│   │   ├── jobs/
│   │   │   └── weeklyReports.js
│   │   ├── middlewares/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── roleCheck.js
│   │   ├── utils/
│   │   │   ├── aiAgent.js
│   │   │   ├── pdfGenerator.js
│   │   │   └── fileUploader.js
│   │   └── index.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── TutorDashboard/
│   │   │   ├── StudentDashboard/
│   │   │   └── ParentReports/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
├── .gitignore
├── README.md
└── nginx/
    └── default.conf

*/