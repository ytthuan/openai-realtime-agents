/// <reference types="node" />

// @ts-nocheck
import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

// This route relies on Node.js APIs.
export const runtime = 'nodejs';

// Directory where JSON agent configs are stored
const CONFIG_DIR = path.join(process.cwd(), 'src', 'app', 'agentConfigs', 'json');

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9-_]/g, '');
}

function getConfigPath(name: string) {
  return path.join(CONFIG_DIR, `${sanitizeName(name)}.json`);
}

export async function GET(_req: NextRequest, { params }: { params: { configName: string } }) {
  const { configName } = params;
  if (!configName) {
    return NextResponse.json({ error: 'Config name is required' }, { status: 400 });
  }

  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    const data = await fs.readFile(getConfigPath(configName), 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }
    console.error('Error reading agent config', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { configName: string } }) {
  const { configName } = params;
  if (!configName) {
    return NextResponse.json({ error: 'Config name is required' }, { status: 400 });
  }

  let jsonBody: any;
  try {
    jsonBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.writeFile(getConfigPath(configName), JSON.stringify(jsonBody, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing agent config', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}