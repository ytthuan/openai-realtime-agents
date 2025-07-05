// @ts-nocheck
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AgentConfigEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialName = searchParams.get("name") || "myConfig";

  const [configName, setConfigName] = useState<string>(initialName);
  const [jsonText, setJsonText] = useState<string>(`[
  {
    "name": "myAgent",
    "voice": "alloy",
    "instructions": "Say hello!"
  }
]`);
  const [statusMsg, setStatusMsg] = useState<string>("");

  // Load existing config if present
  useEffect(() => {
    async function load() {
      if (!configName) return;
      try {
        const res = await fetch(`/api/agentConfigs/${configName}`);
        if (res.ok) {
          const data = await res.json();
          setJsonText(JSON.stringify(data, null, 2));
        }
      } catch (err) {
        console.warn("No existing config or failed to load", err);
      }
    }
    load();
  }, [configName]);

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(jsonText);
      const res = await fetch(`/api/agentConfigs/${configName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        setStatusMsg("Saved successfully!");
      } else {
        const err = await res.json();
        setStatusMsg("Error: " + (err?.error || res.statusText));
      }
    } catch (err: any) {
      setStatusMsg("Invalid JSON: " + err.message);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Agent Config Editor</h1>

      <label className="block mb-2 font-medium">Config name</label>
      <input
        className="border border-gray-300 rounded w-full p-2 mb-4"
        value={configName}
        onChange={(e) => setConfigName(e.target.value)}
      />

      <label className="block mb-2 font-medium">JSON Content</label>
      <textarea
        className="border border-gray-300 rounded w-full p-2 font-mono text-sm h-96"
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
      />

      <div className="flex gap-2 mt-4">
        <button
          className="bg-blue-600 text-white rounded px-4 py-2"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="bg-gray-200 text-gray-800 rounded px-4 py-2"
          onClick={() => router.back()}
        >
          Back
        </button>
      </div>
      {statusMsg && <p className="mt-4 text-sm">{statusMsg}</p>}
    </div>
  );
}

export default AgentConfigEditor;