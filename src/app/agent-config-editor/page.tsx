"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parseAgentsFromJson } from "@/app/lib/agentConfigLoader";

interface SaveStatus {
  type: "idle" | "saving" | "success" | "error";
  message?: string;
}

function AgentConfigEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialName = (searchParams.get("name") || "myConfig").trim();

  const [configName, setConfigName] = useState<string>(initialName);
  const [jsonText, setJsonText] = useState<string>(`[
  {
    "name": "myAgent",
    "voice": "alloy",
    "instructions": "Say hello!"
  }
]`);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ type: "idle" });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch existing config (if present) on first render / name change
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!configName) return;
      try {
        const res = await fetch(`/api/agentConfigs/${configName}`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          setJsonText(JSON.stringify(data, null, 2));
        }
      } catch (err) {
        // Ignore if not found – treat as new config. Other errors logged.
        console.warn("Failed to load config", err);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [configName]);

  // Validate JSON whenever it changes
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonText);
      parseAgentsFromJson(parsed); // will throw if invalid
      setValidationError(null);
    } catch (err: any) {
      setValidationError(err.message ?? "Invalid JSON");
    }
  }, [jsonText]);

  const handleSave = async () => {
    try {
      setSaveStatus({ type: "saving" });
      const parsed = JSON.parse(jsonText);
      const res = await fetch(`/api/agentConfigs/${configName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        setSaveStatus({ type: "success", message: "Saved successfully!" });
      } else {
        const err = (await res.json()) as { error?: string };
        setSaveStatus({ type: "error", message: err.error || res.statusText });
      }
    } catch (err: any) {
      setSaveStatus({ type: "error", message: err?.message || "Unknown error" });
    }
  };

  const colorMap = {
    idle: "text-gray-600",
    saving: "text-blue-600",
    success: "text-green-600",
    error: "text-red-600",
  } as const;

  const statusColor: string = colorMap[saveStatus.type as keyof typeof colorMap];

  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Agent Config Editor</h1>

      <label className="block mb-2 font-medium">Config name</label>
      <input
        className="border border-gray-300 rounded w-full p-2 mb-4"
        value={configName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setConfigName(e.target.value)}
      />

      <label className="block mb-2 font-medium">JSON Content</label>
      <textarea
        className="border border-gray-300 rounded w-full p-2 font-mono text-sm h-96"
        value={jsonText}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setJsonText(e.target.value)}
      />

      <div className="flex gap-2 mt-4">
        <button
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
          onClick={handleSave}
          disabled={saveStatus.type === "saving" || !!validationError}
        >
          {saveStatus.type === "saving" ? "Saving…" : "Save"}
        </button>
        <button
          className="bg-gray-200 text-gray-800 rounded px-4 py-2"
          onClick={() => router.back()}
        >
          Back
        </button>
      </div>

      {validationError && (
        <p className="mt-4 text-sm text-red-600">{validationError}</p>
      )}

      {saveStatus.message && !validationError && (
        <p className={`mt-4 text-sm ${statusColor}`}>{saveStatus.message}</p>
      )}
    </div>
  );
}

export default AgentConfigEditor;