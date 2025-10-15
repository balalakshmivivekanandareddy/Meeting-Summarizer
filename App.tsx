import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { TranscriptInput } from './components/TranscriptInput.tsx';
import { SummaryOutput } from './components/SummaryOutput.tsx';
import { AnimatedBackground } from './components/AnimatedBackground.tsx';
import { generateSummary, generateSummaryFromAudio } from './services/geminiService.ts';
import type { SummaryResult } from './types.ts';

function App() {
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarizeText = async (text: string) => {
    if (!text.trim()) {
      setError('Please enter a transcript to summarize.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummaryResult(null);
    setTranscript(null);
    setAudioFile(null);
    try {
      const result = await generateSummary(text);
      setSummaryResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarizeAudio = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setSummaryResult(null);
    setTranscript(null);
    setAudioFile(file);
    try {
      const result = await generateSummaryFromAudio(file);
      setSummaryResult(result.summary);
      setTranscript(result.transcript);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSummaryResult(null);
    setTranscript(null);
    setAudioFile(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <>
      <AnimatedBackground />
      <Header />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden ring-1 ring-slate-800">
          <div className="p-6 sm:p-8">
            {!summaryResult && !isLoading ? (
              <TranscriptInput
                onSummarizeText={handleSummarizeText}
                onSummarizeAudio={handleSummarizeAudio}
                isLoading={isLoading}
              />
            ) : (
              <SummaryOutput
                summaryResult={summaryResult}
                transcript={transcript}
                audioFile={audioFile}
                isLoading={isLoading}
                error={error}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by Google Gemini. UI designed for clarity and focus.</p>
        </footer>
      </main>
    </>
  );
}

export default App;