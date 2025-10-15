# Meeting Summarizer

Instantly transform meeting audio or transcripts into concise, actionable summaries using the power of the Google Gemini API. This web application provides a clean, modern interface for generating executive summaries, key decisions, and action items from your meeting content.

![Meeting Summarizer Screenshot](https://storage.googleapis.com/aistudio-hosting/project-assets/5cd01b50-399a-4d7a-a63e-b83884c7590d/readme_screenshot.png)

---

## ✨ Key Features

- **Audio-to-Summary**: Upload audio files (MP3, WAV, M4A, etc.) to get a full transcript and a structured summary.
- **Text-to-Summary**: Paste a meeting transcript directly into the application for quick analysis.
- **Speech-to-Text Dictation**: Use your microphone to dictate notes or transcripts directly into the text area, powered by the browser's native SpeechRecognition API.
- **Action-Oriented Output**: The summary is broken down into three clear sections:
    - **Executive Summary**: A concise paragraph of the meeting's key points.
    - **Key Decisions**: A bulleted list of important decisions made.
    - **Action Items**: A bulleted list of actionable tasks.
- **Audio Playback**: Listen to the original uploaded audio file alongside the generated summary and transcript.
- **Responsive Design**: A sleek, modern UI with a dynamic animated background that works seamlessly across all devices.
- **User-Friendly Interface**: Features include drag-and-drop file upload, a resizable text area with a character counter, and clear loading/error states.

---

## 🚀 Technology Stack

- **Frontend**:
    - **React**: A JavaScript library for building user interfaces.
    - **TypeScript**: A statically typed superset of JavaScript that adds type safety.
    - **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **AI & Services**:
    - **Google Gemini API**: The core AI engine for transcription and summarization (`gemini-2.5-pro` for audio and `gemini-2.5-flash` for text).
    - **Web Speech API**: For real-time speech-to-text dictation in the browser.
- **UI & Effects**:
    - **Vanta.js**: For the interactive, animated background effect.

---

## 🛠️ Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A valid **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/meeting-summarizer.git
    cd meeting-summarizer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Google Gemini API key:
    ```
    API_KEY="YOUR_GEMINI_API_KEY"
    ```
    *This is a client-side application, so be mindful of exposing API keys. For production use, it's recommended to route API calls through a secure backend proxy.*

4.  **Run the development server:**
    ```bash
    npm start
    ```
    The application should now be running on `http://localhost:3000`.

---

## 📂 Project Structure

```
/
├── public/
│   └── index.html      # Main HTML file
├── src/
│   ├── components/     # Reusable React components
│   │   ├── AnimatedBackground.tsx
│   │   ├── Header.tsx
│   │   ├── Icons.tsx
│   │   ├── SummaryOutput.tsx
│   │   └── TranscriptInput.tsx
│   ├── services/
│   │   └── geminiService.ts # Logic for interacting with the Gemini API
│   ├── types/
│   │   └── index.ts      # TypeScript type definitions
│   ├── App.tsx           # Main application component and state management
│   ├── index.css         # Global styles and Tailwind CSS directives
│   └── index.tsx         # React entry point
├── .env                  # Environment variables (API key)
├── package.json
└── README.md
```
