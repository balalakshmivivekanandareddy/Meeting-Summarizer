import { GoogleGenAI, Type } from '@google/genai';
import type { SummaryResult } from '../types.ts'; 

// CRITICAL FIX: Check for the full variable name (GEMINI_API_KEY)
if (!process.env.GEMINI_API_KEY) {
    // Customizing the error message to reflect the correct key being checked
    throw new Error("GEMINI_API_KEY environment variable not set. Please set it in your environment.");
}

// CRITICAL FIX: Initialize the SDK using the correct variable name.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Helper function to convert File to a GenerativePart ---
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};


// --- Schema for Text-only Summarization ---
const summarySchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'A concise paragraph summarizing the key discussion points, decisions made, and overall outcomes of the meeting.'
    },
    keyDecisions: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: 'A specific decision that was made during the meeting.'
        },
        description: 'An array of strings, where each string is a key decision. If no decisions are found, this should be an empty array.'
    },
    actionItems: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        description: 'A clear, actionable task with the assigned person if mentioned.'
      },
      description: 'An array of strings, where each string is an action item. If no action items are found, this should be an empty array.'
    }
  },
  required: ['summary', 'keyDecisions', 'actionItems']
};


// --- Schema for Audio Transcription and Summarization ---
const transcriptionAndSummarySchema = {
    type: Type.OBJECT,
    properties: {
        transcript: {
            type: Type.STRING,
            description: "The full, accurate transcription of the audio from the meeting."
        },
        ...summarySchema.properties
    },
    required: ['transcript', 'summary', 'keyDecisions', 'actionItems']
}

interface TranscriptionAndSummaryResult {
    transcript: string;
    summary: SummaryResult;
}

// --- API call for summarizing pasted transcript ---
export const generateSummary = async (transcript: string): Promise<SummaryResult> => {
  const prompt = `
    You are an expert meeting assistant. Your task is to analyze the following meeting transcript and provide a concise summary, a list of key decisions, and a list of action items.

    The output must be a valid JSON object that adheres to the provided schema.
    - "summary": A paragraph summarizing the key discussion points, decisions made, and overall outcomes of the meeting.
    - "keyDecisions": An array of strings, where each string is a significant decision made.
    - "actionItems": An array of strings, where each string is a clear, actionable task assigned to someone. If no clear action items are present, return an empty array.

    Here is the transcript:
    ---
    ${transcript}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: summarySchema,
        temperature: 0.2,
      }
    });

    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText) as SummaryResult;
    
    // Basic validation
    if (typeof parsedResult.summary !== 'string' || !Array.isArray(parsedResult.actionItems) || !Array.isArray(parsedResult.keyDecisions)) {
        throw new Error("Invalid JSON structure received from API.");
    }

    return parsedResult;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    throw new Error("The AI model failed to generate a valid summary. This could be due to an issue with the input transcript or the API service.");
  }
};


// --- API call for transcribing and summarizing audio file ---
export const generateSummaryFromAudio = async (audioFile: File): Promise<TranscriptionAndSummaryResult> => {
    const audioPart = await fileToGenerativePart(audioFile);

    const prompt = `
        Your task is to process an audio file of a meeting. 
        First, provide a complete and accurate transcript of the audio. 
        Second, based on the transcript, create a summary, identify key decisions, and list action items. 
        Your entire output must be a single JSON object that adheres to the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [audioPart, {text: prompt}] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: transcriptionAndSummarySchema,
                temperature: 0.2
            }
        });
        
        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText) as { transcript: string } & SummaryResult;

        // Basic validation
        if (typeof parsedResult.transcript !== 'string' || typeof parsedResult.summary !== 'string' || !Array.isArray(parsedResult.actionItems) || !Array.isArray(parsedResult.keyDecisions)) {
            throw new Error("Invalid JSON structure received from API.");
        }

        return {
            transcript: parsedResult.transcript,
            summary: {
                summary: parsedResult.summary,
                keyDecisions: parsedResult.keyDecisions,
                actionItems: parsedResult.actionItems
            }
        };

    } catch (error) {
        console.error("Error generating summary from audio with Gemini:", error);
        throw new Error("The AI model failed to process the audio file. This could be due to an issue with the file format or the API service.");
    }
}
