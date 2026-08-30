# Air_Bnb — client

React 19 + Vite 8 + Tailwind v4 front end for the Air_Bnb rental platform.

See the [root README](../README.md) for the full project overview, setup and API reference.

## Run

```bash
cp .env.example .env    # optional, defaults to http://localhost:8000
npm install
npm run dev             # http://localhost:5173
```

## Scripts

| Command | Does |
|---------|------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Layout

```
src/
├── api/          axios instance
├── components/   shared UI, admin/, common/
├── i18n/         translations and LocaleContext
├── lib/          socket.js
├── pages/        public, guest, admin/
├── store/        apiSlice, api/ (RTK Query endpoints), slices/
└── layout/
```
