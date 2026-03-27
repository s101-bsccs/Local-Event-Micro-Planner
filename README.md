# Local Event Micro-Planner

A small but production-ready MEAN stack project for planning hyperlocal events.

## What It Includes

- Angular 17 frontend with standalone components and reactive forms
- Node.js + Express REST API
- MongoDB with local Compass-friendly connection by default
- Account login/register flow
- 5 planner profiles automatically created per account
- Event CRUD, RSVP, dashboard, bookmarks, filtering, search, analytics, theme toggle, toasts, and smart suggestions

## Local Run

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm start
```

### Frontend

```bash
cd frontend/local-event-micro-planner-app
npm install
npm start
```

## Demo Login

- Email: `demo@planner.com`
- Password: `Password@123`

## Render Deployment

A Render Blueprint file is included at [render.yaml](c:\Users\rajde\OneDrive\Rajdeep's File\MSD\Local-Event-Micro-Planner\render.yaml).

This deployment uses a single Render web service:
- Render builds the Angular frontend
- Express serves the built frontend in production
- API and UI share the same domain

### Steps

1. Push this repo to GitHub or GitLab.
2. In Render, choose `New` -> `Blueprint`.
3. Connect the repo that contains `render.yaml`.
4. When prompted, set these environment variables:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `CLIENT_URL` = your Render service URL, for example `https://local-event-micro-planner.onrender.com`
5. Deploy the blueprint.

### Important Notes

- Render's docs say Blueprint files live at the repo root and can define web/static services in `render.yaml`.
- Render web services must bind to a public port such as the provided `PORT`, and this project already reads `process.env.PORT`.
- Static client-side routes on the Angular app work in production because Express serves `index.html` for non-API routes.

### MongoDB Atlas Example

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/local-event-micro-planner?retryWrites=true&w=majority
```

## Why I Couldn’t Finish the Actual Cloud Deploy From Here

I don’t have access to:
- your Render account
- a linked Git remote for this repo
- a MongoDB Atlas production connection string

So I prepared the project into a deployable Render shape, but the final cloud-side click-through still needs your account.
