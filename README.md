# Preproute Test Management App

React + TypeScript web app for Preproute frontend assignment.

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router
- Zustand (auth state)
- React Hook Form + Zod (validation)
- Axios (API integration)

## Features Implemented

- Login page with validation and JWT storage
- Protected routes for authenticated flow
- Dashboard page with test list, search, edit/view/delete actions
- Create/Edit test page with subject/topic/sub-topic integration
- MCQ question management page with add/edit/delete in flow
- Preview and publish page
- Responsive UI for desktop/mobile

## API Base URL

Default configured URL:

`https://admin-moderator-backend-staging.up.railway.app/api`

Override with env variable:

`VITE_API_BASE_URL`

## Run Locally

```bash
cd preproute-test-manager
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Login Credentials

- userId: `vedant-admin`
- password: `vedant123`

## Project Structure

- `src/api` Axios client + endpoint services
- `src/store` Zustand auth store
- `src/components` Route guard + app shell
- `src/pages` 5-page assignment flow
- `src/types.ts` Shared API and domain types

## Technical Decisions

- Centralized API service layer keeps UI components clean.
- Zod schema validation provides strict input checks before API calls.
- Question editor keeps local draft list and writes to backend in bulk save.
- Route protection uses auth token state + localStorage persistence.

## Notes

- Delete action uses `DELETE /tests/:id`. If backend environment blocks this endpoint, app shows fallback error message.
- Editing previously saved questions creates new question revision when changed, then updates test question ID list.
