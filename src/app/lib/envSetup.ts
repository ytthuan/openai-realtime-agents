import dotenv from 'dotenv';

dotenv.config({path: '.env'})

// Model constants and environment variable setup
export const DEFAULT_TRANSCRIPT_MODEL = 'gpt-4o-mini-transcribe';
export const DEFAULT_REALTIME_MODEL = 'gpt-4o-mini-realtime-preview';

// Get transcript model from environment or use default
export const getTranscriptModel = (): string => {
    console.log("Transcript model: ", process.env.AZURE_OPENAI_TRANSCRIPT_MODEL);
    if (typeof process !== 'undefined' && process.env) {
        
        return process.env.AZURE_OPENAI_TRANSCRIPT_MODEL || DEFAULT_TRANSCRIPT_MODEL;
    }
    return DEFAULT_TRANSCRIPT_MODEL;
};

// Get realtime model from environment or use default
export const getRealtimeModel = (): string => {
  if (typeof process !== 'undefined' && process.env) {
    console.log("Realtime model: ", process.env.AZURE_OPENAI_REALTIME_DEPLOYMENT_NAME);
    return  process.env.AZURE_OPENAI_REALTIME_DEPLOYMENT_NAME || 
           DEFAULT_REALTIME_MODEL;
  }
  return DEFAULT_REALTIME_MODEL;
};