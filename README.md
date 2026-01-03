# ByteLearn

A web platform that turns textbooks and syllabi into structured, interactive courses. Upload a PDF and the system breaks it into chapters, topics, and articles using Groq's Llama 3.3 70B model.

## What it does

1. You upload a textbook or syllabus as a PDF
2. The backend extracts text and sends it to Groq (Llama 3.3 70B)
3. The LLM returns a structured course outline — title, chapters, topics, keywords
4. Everything gets saved to Supabase and rendered as browseable course content
5. Articles are generated on-demand as you navigate through topics

Other features: bookmarks, playlists, read-later lists, reading history, article recommendations, progress tracking, and a command palette (Cmd+K).

## Tech stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, React Router v6, Supabase JS

**Backend:** FastAPI, Groq SDK (Llama 3.3 70B), pypdf

**Infrastructure:** Supabase (Postgres, Auth), Vercel (frontend hosting)

## Project structure

```
booktube/
├── frontend/                     React + Vite app
│   ├── src/
│   │   ├── components/           UI components
│   │   │   ├── steps/            Course creation wizard (5 steps)
│   │   │   ├── features/         Landing page feature tabs
│   │   │   └── ui/               shadcn/ui primitives
│   │   ├── pages/                Route pages (Courses, Articles, Playlists, Auth, etc.)
│   │   ├── services/             Supabase queries and API calls
│   │   ├── contexts/             Auth and Theme providers
│   │   ├── config/               API base URL config
│   │   ├── hooks/                Custom React hooks
│   │   ├── lib/                  Supabase client, OAuth, utils
│   │   ├── types/                TypeScript type definitions
│   │   └── utils/                Helper functions
│   └── package.json
│
└── Ai_backend/                   FastAPI server
    ├── app/
    │   ├── main.py               Entry point
    │   ├── core/config.py        Env config (GROQ_API_KEY)
    │   ├── routes/
    │   │   └── frontend_adapters.py   PDF upload → Groq → course JSON
    │   └── services/
    │       └── pdf_service.py    PDF text extraction
    └── requirements.txt
```


## How it works

```
Upload PDF → Extract text (pypdf) → Send to Groq (Llama 3.3 70B)
    → Get structured JSON (title, chapters, topics, keywords)
    → Save to Supabase → Render as interactive course
```

The PDF endpoint (`/process_pdf`) takes the first ~12k characters of extracted text, sends it to Groq with a JSON schema prompt, and returns a structured course outline. The frontend saves this to Supabase and lets users browse through the generated content.


