## Split Expense

A full-stack MERN application for tracking shared group expenses and showing who owes whom.

## Core Features (MVP)
- User authentication (signup/login/logout)
- Create private groups
- Invite members (pending/accepted)
- Add, edit, delete expenses
- View group expense history
- View balances (who owes whom)

## Problem Statement
Managing shared expenses causes emotional and practical conflict for families, roommates, and travelers. People often forget who paid, how costs were split, or who still owes money. Existing solutions are either too complex or not designed for small personal groups.

This project solves that problem by allowing users to create private groups, log shared expenses, split costs fairly, and clearly see balances so everyone knows who owes what.

## MVP Description:
Users can register, log in, create private groups, invite members, and add shared expenses.
Expenses can be split equally (MVP). Percentage-based splitting is a future enhancement.
This functionality alone solves the core problem of shared expense tracking.


### Styling Framework
- Tailwind CSS
- Chosen for utility-first styling and responsive layouts

### Icon Library
- React Icons
- Lightweight and flexible icon usage

### Design Principles
- Clean and minimal UI
- Mobile-first
- Progressive disclosure
- Consistent spacing and typography

## Routes (Planned)
Public:
- /landing
- /signup
- /login

Authenticated:
- /app/groups
- /app/groups/new
- /app/groups/:groupId
- /app/groups/:groupId/members
- /app/groups/:groupId/balances
- /app/settings

## Tech Stack
- Frontend: React (Vite), React Router, Axios
- Backend: Node.js, Express
- Database: MongoDB Atlas, Mongoose
- Auth: JWT + bcrypt
- UI: Tailwind CSS, React Icons

## BackEnd structure:
server/
├── config/
│   └── database.js
├── controllers/
│   ├── aiController.js
│   ├── authController.js
│   ├── expensesController.js
│   ├── groupBalanceController.js
│   ├── groupMembersController.js
│   ├── groupsController.js
│   ├── invitesController.js
│   └── signupController.js
├── middlewares/
│   ├── auth.js
│   ├── errorHandler.js
│   └── groupAuth.js
├── models/
│   ├── ChatSession.js
│   ├── Expense.js
│   ├── Group.js
│   ├── GroupMember.js
│   └── User.js
├── routes/
│   ├── ai.routes.js
│   ├── balances.routes.js
│   ├── expenses.routes.js
│   ├── groupMembers.routes.js
│   ├── groups.routes.js
│   └── invites.routes.js
├── services/
│   └── aiService.js
├── utils/
│   └── generateToken.js
├── app.js
├── server.js
└── package.json