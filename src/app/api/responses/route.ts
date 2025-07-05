import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { env } from 'process';

function getAzureOpenAI() {
  const azureEndpoint = env.AZURE_OPENAI_ENDPOINT;
  const azureApiKey = env.AZURE_OPENAI_API_KEY;
  const apiVersion = env.OPENAI_API_VERSION ?? '2024-05-01-preview';
  const deployment = env.AZURE_OPENAI_DEPLOYMENT_MODEL ?? 'model-router';
  // Create Azure OpenAI client
  const client = new AzureOpenAI({
    endpoint: azureEndpoint,
    apiKey: azureApiKey,
    apiVersion: apiVersion,
    deployment: deployment,
  });

  return client;
}

// Proxy endpoint for the OpenAI Responses API
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Debug logging to understand the request structure
  // console.log('Responses API request body:', JSON.stringify(body, null, 2));

  const openai = getAzureOpenAI();

  if (body.text?.format?.type === 'json_schema') {
    return await structuredResponse(openai, body);
  } else {
    return await textResponse(openai, body);
  }
}

async function structuredResponse(openai: AzureOpenAI, body: any) {
  try {
    const response = await openai.responses.create({
      ...(body as any),
      stream: false,
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('responses proxy error', err);
    return NextResponse.json({ error: 'failed', details: err.message }, { status: 500 }); 
  }
}

async function textResponse(openai: AzureOpenAI, body: any) {
  try {
    let messages = body.messages || [];
    if (messages.length === 0) {
      messages = [{ role: 'user', content: body.text?.content || 'Generate a response.' }];
    }
    
    const response = await openai.responses.create({
      ...(body as any),
      stream: false,
    });
    return NextResponse.json(response);
  } catch (err: any) {
    console.error('responses proxy error', err);
    return NextResponse.json({ error: 'failed', details: err.message }, { status: 500 });
  }
}
  