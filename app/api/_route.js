// app/api/route.js 👈🏽

import { NextResponse } from "next/server";

// To handle a GET request to /api
export async function GET(request) {
	// Do whatever you want
	// console.log(request.query)
	return NextResponse.json({ message: "Hello World", lmao: "xd", boob: request.query }, { status: 200 });
}

// To handle a POST request to /api
export async function POST(request) {
	// Do whatever you want
	return NextResponse.json({ message: "Hello World" }, { status: 200 });
}

// Same logic to add a `PATCH`, `DELETE`...