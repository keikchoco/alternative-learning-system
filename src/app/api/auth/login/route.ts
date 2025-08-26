import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const body = await req.json();
    const email = body?.email;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate password
    const password = body?.password;
    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    const userData = await db.collection("users").find({ email }).toArray();

    // Check if user exists
    if (userData.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: userData[0] });
  } catch (error) {
    console.error("Error inserting user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to insert user" },
      { status: 500 }
    );
  }
}