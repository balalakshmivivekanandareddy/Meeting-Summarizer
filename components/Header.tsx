import React from 'react';
import { LogoIcon } from './Icons.tsx';

export const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 relative z-10">
      <div className="container mx-auto flex justify-center items-center gap-4">
        <LogoIcon className="w-10 h-10 text-purple-400" />
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
          Meeting Summarizer
        </h1>
      </div>
      <p className="text-center mt-2 text-slate-400">
        Instantly transform your meeting transcripts or audio into concise summaries.
      </p>
    </header>
  );
};