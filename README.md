# 🌱 CropGenius: an AI crop doctor for smallholder farmers

CropGenius helps small-scale farmers in East Africa work out what is wrong with a sick crop. A farmer takes a photo with their phone or describes the symptoms, and **Claude**, acting as an experienced agronomist, identifies the likely disease, pest or deficiency and explains what to do about it. It answers in **Kinyarwanda, Swahili, French or English**, and every answer can be **read aloud**.

## What it does

- **Photo diagnosis with Claude vision:** gives the disease, cause, symptoms, how confident it is, how severe it is, and *why* it reached that answer. It also outlines the affected area on the photo.
- **Advice farmers can afford:** every treatment plan includes a low-cost or organic option using things found locally, alongside chemical options. Chemicals are named by active ingredient, with a dose per 15 L knapsack sprayer and safety reminders.
- **Honest about uncertainty:** when a photo is unclear, Claude says so and tells the farmer what to check, or when to call an extension officer such as RAB in Rwanda.
- **Follow-up chat:** farmers ask "Can I still eat the beans?" or "Where do I buy this?" and get an answer in the context of their diagnosis.
- **Read aloud:** for farmers who would rather listen than read.
- Weather disease-risk view, seasonal advice, a community outbreak heatmap, a marketplace, and the farmer's diagnosis history (Firebase).

## Built with Claude

| | |
|---|---|
| **Claude API** | Sonnet does the photo diagnosis. A forced tool call (`report_diagnosis`) makes sure the JSON always comes back in the right shape. Haiku handles the quick follow-up chat. |
| **Claude Code** | Used to move the app from its original AI provider to Claude, write the server API, and add read-aloud. |

Architecture: the browser sends requests to `/api/diagnose` and `/api/chat`. Those run as Vercel serverless functions in `api/`, using the shared logic in `server/claude.ts`, and call the Claude API from there. The API key stays on the server and is never sent to the phone.

## Run locally

**Prerequisites:** Node.js 20+

1. `npm install`
2. Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY` (from https://console.anthropic.com).
3. `npm run dev` and open http://localhost:3000

## Deploy (Vercel)

Import the repo into Vercel and add `ANTHROPIC_API_KEY` under **Settings → Environment Variables**. Add the `VITE_FIREBASE_*` variables too if you use sign-in and history. The `api/` folder is picked up automatically.
