import React, { useState, useEffect } from 'react';
import type { SummaryResult } from '../types.ts';
import { SparklesIcon, ListChecksIcon, AlertTriangleIcon, LoaderIcon, AudioWaveformIcon } from './Icons.tsx';

interface SummaryOutputProps {
  summaryResult: SummaryResult | null;
  transcript: string | null;
  audioFile: File | null;
  isLoading: boolean;
  error: string | null;
  onReset: () => void;
}

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-slate-800/50 rounded-lg p-4 ring-1 ring-slate-700/50">
        <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2 mb-3">
            {icon}
            {title}
        </h3>
        {children}
    </div>
);

export const SummaryOutput: React.FC<SummaryOutputProps> = ({ summaryResult, transcript, audioFile, isLoading, error, onReset }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);

      // Cleanup function to revoke the object URL on component unmount
      return () => {
        URL.revokeObjectURL(url);
        setAudioUrl(null);
      };
    }
  }, [audioFile]);

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <LoaderIcon className="w-12 h-12 text-purple-400 mx-auto animate-spin" />
        <p className="mt-4 text-slate-300 text-lg">Analyzing your meeting...</p>
        <p className="text-slate-400">This may take a moment, especially for audio files.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-start gap-3 max-w-md mx-auto">
          <AlertTriangleIcon className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold">An Error Occurred</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="mt-6 bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!summaryResult) {
    return null; // Should not happen if not loading and no error, but good for safety
  }

  return (
    <div className="space-y-8 animate-fade-in">
        <ResultCard title="Executive Summary" icon={<SparklesIcon className="w-5 h-5" />}>
            <p className="text-slate-300 leading-relaxed">{summaryResult.summary}</p>
        </ResultCard>

        {summaryResult.keyDecisions.length > 0 && (
            <ResultCard title="Key Decisions" icon={<ListChecksIcon className="w-5 h-5" />}>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                    {summaryResult.keyDecisions.map((decision, index) => (
                        <li key={`decision-${index}`}>{decision}</li>
                    ))}
                </ul>
            </ResultCard>
        )}
        
        {summaryResult.actionItems.length > 0 && (
            <ResultCard title="Action Items" icon={<ListChecksIcon className="w-5 h-5" />}>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                    {summaryResult.actionItems.map((item, index) => (
                        <li key={`action-${index}`}>{item}</li>
                    ))}
                </ul>
            </ResultCard>
        )}

        {audioUrl && (
            <ResultCard title="Original Audio" icon={<AudioWaveformIcon className="w-5 h-5" />}>
                <audio controls className="w-full">
                    <source src={audioUrl} type={audioFile?.type} />
                    Your browser does not support the audio element.
                </audio>
            </ResultCard>
        )}

        {transcript && (
            <details className="bg-slate-800/50 rounded-lg p-4 ring-1 ring-slate-700/50">
                <summary className="font-semibold text-slate-200 cursor-pointer">View Full Transcript</summary>
                <p className="mt-4 text-slate-400 whitespace-pre-wrap leading-relaxed">{transcript}</p>
            </details>
        )}

      <div className="text-center pt-4">
        <button
          onClick={onReset}
          className="bg-purple-600 text-white font-semibold py-2 px-8 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Summarize Another
        </button>
      </div>
    </div>
  );
};