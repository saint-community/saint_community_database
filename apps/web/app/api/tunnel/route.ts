import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const URL = 'http://209.97.189.88';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  const headers = Object.fromEntries(request.headers.entries());

  const response = await axios.get(`${URL}${path}`, { headers });

  return NextResponse.json(response.data);
}

export async function POST(request: NextRequest) {
  let path = request.url.split('?')?.[1]?.split('=')?.[1];

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  path = path.replace(/%2F/g, '/');

  const body = await request.json();

  const headers = Object.fromEntries(request.headers.entries());

  const response = await axios.post(`${URL}${path}`, body, { headers });

  return NextResponse.json(response.data);
}

export async function PUT(request: NextRequest) {
  let path = request.url.split('?')?.[1]?.split('=')?.[1];

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  path = path.replace(/%2F/g, '/');

  const body = await request.json();

  const headers = Object.fromEntries(request.headers.entries());

  const response = await axios.put(`${URL}${path}`, body, { headers });

  return NextResponse.json(response.data);
}

export async function DELETE(request: NextRequest) {
  let path = request.url.split('?')?.[1]?.split('=')?.[1];

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  path = path.replace(/%2F/g, '/');

  const headers = Object.fromEntries(request.headers.entries());

  const response = await axios.delete(`${URL}${path}`, {
    headers,
  });

  return NextResponse.json(response.data);
}
