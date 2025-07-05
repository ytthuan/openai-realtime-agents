import React, { useCallback, useMemo } from "react";
import { SessionStatus } from "@/app/types";

interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
  isPTTActive: boolean;
  setIsPTTActive: (val: boolean) => void;
  isPTTUserSpeaking: boolean;
  handleTalkButtonDown: () => void;
  handleTalkButtonUp: () => void;
  isEventsPaneExpanded: boolean;
  setIsEventsPaneExpanded: (val: boolean) => void;
  isAudioPlaybackEnabled: boolean;
  setIsAudioPlaybackEnabled: (val: boolean) => void;
  codec: string;
  onCodecChange: (newCodec: string) => void;
  showFunctionCalls: boolean;
  setShowFunctionCalls: (val: boolean) => void;
}

function BottomToolbar({
  sessionStatus,
  onToggleConnection,
  isPTTActive,
  setIsPTTActive,
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
  isEventsPaneExpanded,
  setIsEventsPaneExpanded,
  isAudioPlaybackEnabled,
  setIsAudioPlaybackEnabled,
  codec,
  onCodecChange,
  showFunctionCalls,
  setShowFunctionCalls,
}: BottomToolbarProps) {
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  const handleCodecChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCodec = e.target.value;
    onCodecChange(newCodec);
  }, [onCodecChange]);

  const handlePTTActiveChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPTTActive(e.target.checked);
  }, [setIsPTTActive]);

  const handleAudioPlaybackChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAudioPlaybackEnabled(e.target.checked);
  }, [setIsAudioPlaybackEnabled]);

  const handleLogsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEventsPaneExpanded(e.target.checked);
  }, [setIsEventsPaneExpanded]);

  const handleFunctionsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setShowFunctionCalls(e.target.checked);
  }, [setShowFunctionCalls]);

  const toggleEventsPaneExpanded = useCallback(() => {
    setIsEventsPaneExpanded(!isEventsPaneExpanded);
  }, [isEventsPaneExpanded, setIsEventsPaneExpanded]);

  const toggleShowFunctionCalls = useCallback(() => {
    setShowFunctionCalls(!showFunctionCalls);
  }, [showFunctionCalls, setShowFunctionCalls]);

  const connectionButtonLabel = useMemo(() => {
    if (isConnected) return "Disconnect";
    if (isConnecting) return "Connecting...";
    return "Connect";
  }, [isConnected, isConnecting]);

  const connectionButtonClasses = useMemo(() => {
    const baseClasses = "text-white text-base p-2 w-36 rounded-md h-full";
    const cursorClass = isConnecting ? "cursor-not-allowed" : "cursor-pointer";

    if (isConnected) {
      // Connected -> label "Disconnect" -> red
      return `bg-red-600 hover:bg-red-700 ${cursorClass} ${baseClasses}`;
    }
    // Disconnected or connecting -> label is either "Connect" or "Connecting" -> black
    return `bg-black hover:bg-gray-900 ${cursorClass} ${baseClasses}`;
  }, [isConnected, isConnecting]);

  const talkButtonClasses = useMemo(() => {
    const baseClasses = "py-1 px-4 cursor-pointer rounded-md";
    const speakingClass = isPTTUserSpeaking ? "bg-gray-300" : "bg-gray-200";
    const disabledClass = !isPTTActive ? " bg-gray-100 text-gray-400" : "";
    return `${speakingClass} ${baseClasses}${disabledClass}`;
  }, [isPTTUserSpeaking, isPTTActive]);

  return (
    <div className="p-4 flex flex-row items-center justify-center gap-x-6">
      <button
        onClick={onToggleConnection}
        className={connectionButtonClasses}
        disabled={isConnecting}
      >
        {connectionButtonLabel}
      </button>

      <div className="flex flex-row items-center gap-2">
        <input
          id="push-to-talk"
          type="checkbox"
          checked={isPTTActive}
          onChange={handlePTTActiveChange}
          disabled={!isConnected}
          className="w-4 h-4"
        />
        <label
          htmlFor="push-to-talk"
          className="flex items-center cursor-pointer"
        >
          Push to talk
        </label>
        <button
          onMouseDown={handleTalkButtonDown}
          onMouseUp={handleTalkButtonUp}
          onTouchStart={handleTalkButtonDown}
          onTouchEnd={handleTalkButtonUp}
          disabled={!isPTTActive}
          className={talkButtonClasses}
        >
          Talk
        </button>
      </div>

      <div className="flex flex-row items-center gap-1">
        <input
          id="audio-playback"
          type="checkbox"
          checked={isAudioPlaybackEnabled}
          onChange={handleAudioPlaybackChange}
          disabled={!isConnected}
          className="w-4 h-4"
        />
        <label
          htmlFor="audio-playback"
          className="flex items-center cursor-pointer"
        >
          Audio playback
        </label>
      </div>

      <div className="flex flex-row items-center gap-1">
        <input
          id="logs"
          type="checkbox"
          checked={isEventsPaneExpanded}
          onChange={handleLogsChange}
          className="w-4 h-4"
        />
        <label htmlFor="logs" className="flex items-center cursor-pointer">
          Logs
        </label>
        <button
          onClick={toggleEventsPaneExpanded}
          className={`ml-1 px-2 py-1 text-sm rounded-md ${isEventsPaneExpanded ? 'bg-gray-300' : 'bg-gray-200'} hover:bg-gray-300`}
          title={isEventsPaneExpanded ? "Hide logs" : "Show logs"}
        >
          {isEventsPaneExpanded ? "Hide" : "Show"}
        </button>
      </div>

      <div className="flex flex-row items-center gap-1">
        <input
          id="functions"
          type="checkbox"
          checked={showFunctionCalls}
          onChange={handleFunctionsChange}
          className="w-4 h-4"
        />
        <label htmlFor="functions" className="flex items-center cursor-pointer">
          Functions
        </label>
        <button
          onClick={toggleShowFunctionCalls}
          className={`ml-1 px-2 py-1 text-sm rounded-md ${showFunctionCalls ? 'bg-gray-300' : 'bg-gray-200'} hover:bg-gray-300`}
          title={showFunctionCalls ? "Hide function calls" : "Show function calls"}
        >
          {showFunctionCalls ? "Hide" : "Show"}
        </button>
      </div>

      <div className="flex flex-row items-center gap-2">
        <div>Codec:</div>
        {/*
          Codec selector – Lets you force the WebRTC track to use 8 kHz 
          PCMU/PCMA so you can preview how the agent will sound 
          (and how ASR/VAD will perform) when accessed via a 
          phone network.  Selecting a codec reloads the page with ?codec=...
          which our App-level logic picks up and applies via a WebRTC monkey
          patch (see codecPatch.ts).
        */}
        <select
          id="codec-select"
          value={codec}
          onChange={handleCodecChange}
          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none cursor-pointer"
        >
          <option value="opus">Opus (48 kHz)</option>
          <option value="pcmu">PCMU (8 kHz)</option>
          <option value="pcma">PCMA (8 kHz)</option>
        </select>
      </div>
    </div>
  );
}

export default React.memo(BottomToolbar);
