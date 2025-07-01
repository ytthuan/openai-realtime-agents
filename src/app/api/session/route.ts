// this file is used to get the ephemeral key and webrtc url for the azure openai realtime api
// it is used in the app/hooks/useRealtimeSession.ts file
// follow the docs in https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/realtime-audio-webrtc

import { NextResponse } from "next/server";
import { getRealtimeModel } from "@/app/lib/envSetup";

export async function GET() {
  try {
    // Azure OpenAI configuration
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY;

    if (!azureEndpoint || !azureApiKey) {
      console.error("Azure OpenAI configuration missing");
      return NextResponse.json(
        { error: "Azure OpenAI configuration missing. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const model = getRealtimeModel();

    // Azure OpenAI API call
    const apiVersion = process.env.OPENAI_API_VERSION ?? "2025-04-01-preview";
    const url = `${azureEndpoint.replace(
      /\/+$/,
      ""
    )}/openai/realtimeapi/sessions?api-version=${apiVersion}`;
    const headers = {
      "api-key": azureApiKey,
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ 
        model:model, 
        voice: "sage"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Error from Azure sessions API:",
        response.status,
        errorText
      );
      return NextResponse.json(
        { error: `Error from Azure: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const ephemeralKey = data.client_secret?.value;
    const azureRegion = process.env.AZURE_OPENAI_REGION ?? "eastus2";

    if (!ephemeralKey) {
      console.error("Ephemeral key not found in Azure response:", data);
      return NextResponse.json(
        { error: "Ephemeral key not found in Azure response" },
        { status: 500 }
      );
    }

    if (!azureRegion) {
      console.error("AZURE_OPENAI_REGION is not set");
      return NextResponse.json(
        {
          error:
            "AZURE_OPENAI_REGION environment variable is not set. It's required for Azure WebRTC connection.",
        },
        { status: 500 }
      );
    }

    const webrtcUrl = `https://${azureRegion}.realtimeapi-preview.ai.azure.com/v1/realtimertc`;

    return NextResponse.json({
      ephemeral_key: ephemeralKey,
      webrtc_url: webrtcUrl,
      model: model,
      is_azure: true,
    });
  } catch (error) {
    console.error("Error in /session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
