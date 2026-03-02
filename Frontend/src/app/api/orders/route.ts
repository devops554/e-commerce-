import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        // Forward the request to the backend
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/orders`, body, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
            },
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error in orders proxy:', error.response?.data || error.message);
        return NextResponse.json(
            error.response?.data || { message: 'Internal Server Order Proxy Error' },
            { status: error.response?.status || 500 }
        );
    }
}
