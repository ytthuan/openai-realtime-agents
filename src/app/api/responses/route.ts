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
    // const deployment = env.AZURE_OPENAI_DEPLOYMENT_MODEL ?? 'model-router';
    
  //   // Ensure we have at least one message
  //   let messages = body.messages || [];
  //   if (messages.length === 0) {
  //     messages = [{ role: 'user', content: body.text?.content || 'Generate a response.' }];
  //   }
    
  //   // Handle response format properly for JSON schema
  //   let responseFormat: any = { type: 'text' as const };
  //   if (body.text?.format?.type === 'json_schema') {
  //     // console.log('Processing JSON schema request, format:', body.text.format);
      
  //     // Use the actual schema from the request, not a fallback
  //     if (body.text.format.schema) {
  //       // Schema is directly in the format object (from zodTextFormat)
  //       responseFormat = {
  //         type: 'json_schema' as const,
  //         json_schema: {
  //           name: body.text.format.name || "response_schema",
  //           schema: body.text.format.schema,
  //           strict: body.text.format.strict
  //         }
  //       };
  //     } else if (body.text.format.json_schema) {
  //       // Schema is nested in json_schema property
  //       responseFormat = {
  //         type: 'json_schema' as const,
  //         json_schema: body.text.format.json_schema
  //       };
  //     } else {
  //       // Only use fallback if no schema is provided
  //       responseFormat = {
  //         type: 'json_schema' as const,
  //         json_schema: {
  //           name: "response_schema",
  //           schema: {
  //             type: "object",
  //             properties: {
  //               response: { type: "string" }
  //             },
  //             required: ["response"]
  //           }
  //         }
  //       };
  //     }
  //   } else if (body.text?.format?.type === 'json_object') {
  //     responseFormat = { type: 'json_object' as const };
  //   } else if (body.text?.format) {
  //     responseFormat = body.text.format;
  //   }
    
  //   // console.log('Final response format:', JSON.stringify(responseFormat, null, 2));
    
  //   const requestParams = {
  //     model: deployment,
  //     messages: messages,
  //     response_format: responseFormat,
  //     stream: false,
  //     max_tokens: body.max_tokens || 1000,
  //     temperature: body.temperature || 0.7,
  //   };
    
    // console.log('Azure OpenAI request params:', JSON.stringify(requestParams, null, 2));
    
    const response = await openai.responses.create({
      // model: deployment,
      ...(body as any),
      stream: false,
    });
    
    // console.log('Azure OpenAI response:', JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('responses proxy error', err);
    return NextResponse.json({ error: 'failed', details: err.message }, { status: 500 }); 
  }
}

async function textResponse(openai: AzureOpenAI, body: any) {
  try {
    // const deployment = env.AZURE_OPENAI_DEPLOYMENT_MODEL ?? 'model-router';
    
    // Ensure we have at least one message
    let messages = body.messages || [];
    if (messages.length === 0) {
      messages = [{ role: 'user', content: body.text?.content || 'Generate a response.' }];
    }
    
    const response = await openai.responses.create({
      ...(body as any),
      stream: false,
      // max_tokens: body.max_tokens || 1000,
      // temperature: body.temperature || 0.7,
    });
    // console.log('Azure OpenAI response:', JSON.stringify(response, null, 2));
    return NextResponse.json(response);
  } catch (err: any) {
    console.error('responses proxy error', err);
    return NextResponse.json({ error: 'failed', details: err.message }, { status: 500 });
  }
}
  