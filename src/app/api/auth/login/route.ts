import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

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

    const isPasswordValid = bcrypt.compareSync(password, userData[0].password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid Password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, data: userData[0] });
  } catch (error) {
    console.error("Error inserting user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to Authenticate User" },
      { status: 500 }
    );
  }
}