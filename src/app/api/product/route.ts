import { NextRequest, NextResponse } from "next/server";
import api from "@/lib/axios";

export async function GET(request: NextRequest) {
  try {
    // Get products from your backend API
    const response = await api.get("v1/products");
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create a new product
    const response = await api.post("v1/products", body);
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}