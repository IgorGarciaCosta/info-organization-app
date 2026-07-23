# Video Info Organizer

Mobile app that receives a YouTube link, retrieves the video transcript, and
uses Gemini to turn it into a structured analysis with a title, summary, theme,
genre, and topics ranked by importance.

## Features

- transcript retrieval from a YouTube URL or ID;
- structured transcript analysis with Gemini;
- topics organized by high, medium, and low importance;
- optional full transcript display;
- Android/iOS app built with Expo and React Native;
- FastAPI API ready to run locally or deploy to Render.

## Architecture

```text
YouTube ── direct transcript retrieval on device ──> Expo App
                             │
                             │ POST /summarize
                             ▼
                           FastAPI API
                             │
                             ▼
                          Gemini
```

The app retrieves the transcript directly on the device to avoid the blocks
YouTube commonly applies to datacenter IP addresses. Only the transcript text
is sent to the API. The Gemini key remains on the backend and is never included
in the app.

## Technologies

### Mobile

- Expo SDK 54 and Expo Router;
- React 19 and React Native 0.81;
- TypeScript;
- `youtube-transcript`.

### Backend

- Python 3.10+;
- FastAPI and Uvicorn;
- `google-genai`;
- Pydantic.

## Project Structure

```text
.
├── ai_services/          # Gemini contract and integration
├── mobile/               # Expo/React Native app
├── server.py             # endpoints FastAPI
├── test_ai_models.py     # AI response contract test
├── render.yaml           # Render deployment configuration
└── requirements.txt      # Python dependencies
```

## Prerequisites

- Python 3.10 or later;
- Node.js 20 or later and npm;
- a Gemini API key created in
  [Google AI Studio](https://aistudio.google.com/apikey);
- Expo Go, an emulator, or an Android/iOS device.

## Running the Backend

At the project root, create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create the environment file and add your key:

```powershell
Copy-Item .env.example .env
```

```dotenv
GEMINI_API_KEY=your_key_here
```

Start the API:

```powershell
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

Confirm it is running at `http://localhost:8000/health`. The interactive API
documentation is available at `http://localhost:8000/docs`.

## Running the App

In another terminal:

```powershell
Set-Location mobile
npm install
Copy-Item .env.example .env
npm start
```

Without a `mobile/.env` file, the development environment uses the backend
deployed on Render. To use the local API, keep this setting in the file:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:8000
```

On an Android device connected through USB, forward the port before opening the
app:

```powershell
adb reverse tcp:8000 tcp:8000
```

You can also start a specific platform directly:

```powershell
npm run android
npm run ios
npm run web
```

> Direct transcript retrieval is intended for Android and iOS. In a browser, it
> may fail because of YouTube's CORS policy.

## API

| Method | Route         | Description                                                       |
| ------ | ------------- | ----------------------------------------------------------------- |
| `GET`  | `/health`     | Confirms that the API is available.                               |
| `POST` | `/summarize`  | Receives `{ "text": "..." }` and returns the structured analysis. |

## Tests and Quality

At the project root:

```powershell
python -m unittest test_ai_models.py
```

In the `mobile` directory:

```powershell
npm run lint
```

## Deploy

The `render.yaml` file configures the backend on Render. When creating the
service from a Blueprint, add `GEMINI_API_KEY` in Render's environment variable
panel; the key must not be saved in the repository.

The app build profiles are in `mobile/eas.json`:

```powershell
Set-Location mobile
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile production --platform android
```

The `preview` profile generates an APK for direct installation. The `production`
profile generates an Android App Bundle for publishing.

## Current Limitations

- only YouTube videos are supported;
- the video must have captions available;
- many requests in a short period may trigger a temporary YouTube block;
- AI results depend on Gemini API availability and limits.
