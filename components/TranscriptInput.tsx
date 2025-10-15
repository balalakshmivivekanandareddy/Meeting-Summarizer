import React, { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import { UploadIcon, ClipboardIcon, MicrophoneIcon, StopCircleIcon } from './Icons.tsx';

interface TranscriptInputProps {
  onSummarizeText: (transcript: string) => void;
  onSummarizeAudio: (file: File) => void;
  isLoading: boolean;
}

// Fix: Add necessary types for the Web Speech API to resolve TypeScript errors.
// These are minimal definitions to support the functionality used in this component.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};


// Fix: Add types for vendor-prefixed SpeechRecognition API to the global window object.
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Check for SpeechRecognition API vendor prefixes
// Fix: Renamed constant to avoid shadowing the native 'SpeechRecognition' type.
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

const MAX_CHARS = 5000;

export const TranscriptInput: React.FC<TranscriptInputProps> = ({ onSummarizeText, onSummarizeAudio, isLoading }) => {
  const [inputType, setInputType] = useState<'text' | 'audio'>('audio');
  const [transcript, setTranscript] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Fix: This now correctly refers to the SpeechRecognition interface type, not the local constant.
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Fix: Use the renamed constant.
    if (!SpeechRecognitionAPI) {
      console.log('Speech Recognition API not supported by this browser.');
      return;
    }

    // Fix: Use the renamed constant.
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(prev => prev.trim() ? `${prev} ${finalTranscript}` : finalTranscript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      onSummarizeAudio(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
       if (file.type.startsWith('audio/')) {
        setFileName(file.name);
        onSummarizeAudio(file);
      } else {
        alert('Please drop an audio file.');
      }
    }
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTranscript(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert('Failed to paste from clipboard. Please paste manually.');
    }
  };

  return (
    <div>
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setInputType('audio')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${inputType === 'audio' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Upload Audio
        </button>
        <button
          onClick={() => setInputType('text')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${inputType === 'text' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Paste Transcript
        </button>
      </div>

      <div className="pt-6">
        {inputType === 'text' ? (
          <div className="space-y-4">
            <div>
                <div className="relative">
                <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste your meeting transcript here, or use the microphone to dictate..."
                    className="w-full min-h-64 resize-y p-3 pr-20 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-300 transition-colors"
                    disabled={isLoading}
                    maxLength={MAX_CHARS}
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    {/* Fix: Use the renamed constant. */}
                    {SpeechRecognitionAPI && (
                    <button 
                        onClick={toggleRecording} 
                        className={`p-1 rounded-full transition-colors ${isRecording ? 'text-red-400 bg-red-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} 
                        title={isRecording ? 'Stop recording' : 'Start dictation'}>
                        {isRecording ? <StopCircleIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                    </button>
                    )}
                    <button onClick={handlePaste} className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700" title="Paste from clipboard">
                        <ClipboardIcon className="w-5 h-5" />
                    </button>
                </div>
                </div>
                <div className={`text-sm text-right pr-1 pt-1 ${transcript.length >= MAX_CHARS ? 'text-red-400' : 'text-slate-400'}`}>
                    {transcript.length} / {MAX_CHARS}
                </div>
            </div>
            <button
              onClick={() => onSummarizeText(transcript)}
              className="w-full bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
              disabled={isLoading || !transcript.trim()}
            >
              Summarize Transcript
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragEnter={handleDragEvents}
            onDragLeave={handleDragEvents}
            onDragOver={handleDragEvents}
            className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragging ? 'border-purple-500 bg-slate-800/50' : 'border-slate-700 hover:border-slate-500 bg-slate-800'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/*"
              className="hidden"
              disabled={isLoading}
            />
            <UploadIcon className="w-10 h-10 text-slate-500 mb-4" />
            <p className="text-slate-400">
              <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500 mt-1">
              MP3, WAV, M4A, etc.
            </p>
            {fileName && <p className="text-sm text-slate-300 mt-4">{fileName}</p>}
          </div>
        )}
      </div>
    </div>
  );
};