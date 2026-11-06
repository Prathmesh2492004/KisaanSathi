# KisaanSathi — Frontend

React 19 + Vite web app for KisaanSathi. It talks to the FastAPI backend in `../Backend`.

## Pages

| Page | Route | Backend endpoint |
|---|---|---|
| **Home** | `#/home` | — |
| **Check schemes**: a 4-step form (land, personal details, farm and existing schemes, family exclusions) followed by results with reasons, benefits and document checklists | `#/eligibility` | `POST /check-eligibility` |
| **Ask Sahayak**: a chat grounded in the scheme documents, with sources shown | `#/chat` | `POST /chat` |

The header shows whether the backend is reachable (`GET /`).

Other details:
- Land size can be entered in acres or hectares. Acres are converted to hectares before the request is sent.
- On a scheme card, "How to apply" opens the chat with the question already sent.
- The layout works on phones and supports dark mode. There are no extra dependencies beyond React.

## Run locally

```bash
# 1. Backend (from ../Backend), needs GROQ_API_KEY in Backend/.env and a built chroma_db (python ingest.py)
uvicorn app:app --reload          # http://localhost:8000

# 2. Frontend (from this folder)
npm install
npm run dev                       # http://localhost:5173
```

The backend URL defaults to `http://localhost:8000`. To change it, copy `.env.example` to `.env` and set `VITE_API_URL`. When you deploy, also add the frontend's URL to `allow_origins` in `Backend/app.py`.

## Structure

```
src/
├── api.js                      # fetch wrapper for the 3 backend endpoints
├── App.jsx                     # hash routing + shared state (profile, results, chat)
├── index.css                   # design tokens and all styles
└── components/
    ├── Header.jsx              # nav + backend status
    ├── Home.jsx
    ├── EligibilityForm.jsx     # 4-step wizard with validation
    ├── EligibilityResults.jsx  # summary, filter tabs, scheme cards
    ├── Chat.jsx                # Sahayak chat
    ├── FormattedText.jsx       # safe rendering of LLM markdown (lists, bold)
    ├── profileFields.js        # mirrors Backend/farmer_profile.py
    └── Logo.jsx
```

If you add a field to `FarmerProfile` in the backend, add it to `profileFields.js` too.

## Scripts

`npm run dev` · `npm run build` · `npm run preview` · `npm run lint`
