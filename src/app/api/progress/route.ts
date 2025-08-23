import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    const progress = await db
      .collection("progress")
      .find({ studentId: studentId })
      .toArray();
    return NextResponse.json(progress);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const progressData = await req.json();

    // Insert the new progress into the database
    const result = await db.collection("progress").insertOne(progressData);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error inserting progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to insert progress" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const { studentId, moduleId, activityIndex, activity } = await req.json();
    // Update the specific activity in the progress record
    const result = await db
      .collection("progress")
      .updateOne(
        { studentId, moduleId },
        { $set: { [`activities.${activityIndex}`]: activity } }
      );

    console.log(result);
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No progress record found or no changes made",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update progress" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const { studentId, moduleId, activityIndex } = await req.json();

    // Delete the specific activity from the progress record
    const unsetResult = await db
      .collection("progress")
      .updateOne(
        { studentId, moduleId },
        { $unset: { [`activities.${activityIndex}`]: 1 } }
      );

    // Remove nulls from the activities array
    const pullResult = await db
      .collection("progress")
      .updateOne({ studentId, moduleId }, {
        $pull: { activities: null },
      } as any);

    const result = {
      modifiedCount: unsetResult.modifiedCount + pullResult.modifiedCount,
    };

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No progress record found or no changes made",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete progress" },
      { status: 500 }
    );
  }
}
