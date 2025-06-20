import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const URL = 'http://209.97.189.88';

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const headers = Object.fromEntries(request.headers.entries());

    const response = await axios.get(`${URL}${path}`, { headers });

    return NextResponse.json(response.data);
  } catch (error: any) {
    const response = error.response.data;
    return NextResponse.json(response || { error: 'Internal server error' }, {
      status: error.response?.status || 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    let path = request.url.split('?')?.[1]?.split('=')?.[1];

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    path = path.replace(/%2F/g, '/');

    const body = await request.json();

    const headers = Object.fromEntries(request.headers.entries());

    console.log(JSON.stringify(body, null, 2));
    console.log(JSON.stringify(headers, null, 2));

    return axios
      .post(`${URL}${path}`, body, { headers })
      .then((response) => {
        return NextResponse.json(response.data);
      })
      .catch((error) => {
        const response = error.response.data;
        console.log(response);
        return NextResponse.json(response, {
          status: error.response?.status || 500,
        });
      });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    let path = request.url.split('?')?.[1]?.split('=')?.[1];

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    path = path.replace(/%2F/g, '/');

    const body = await request.json();

    const headers = Object.fromEntries(request.headers.entries());

    const response = await axios.put(`${URL}${path}`, body, { headers });

    return NextResponse.json(response.data);
  } catch (error: any) {
    const response = error.response.data;
    return NextResponse.json(response || { error: 'Internal server error' }, {
      status: error.response?.status || 500,
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
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
  } catch (error: any) {
    const response = error.response.data;
    return NextResponse.json(response || { error: 'Internal server error' }, {
      status: error.response?.status || 500,
    });
  }
}
