import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const students = await db.collection("students").find({}).toArray();
    return NextResponse.json(students);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const studentData = await req.json();

    // Insert the new student into the database
    const result = await db.collection("students").insertOne(studentData);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error inserting student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to insert student" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const studentData = await req.json();
    const documentId = studentData._id;
    delete studentData._id; // Remove _id for update operation

    // Update the student in the database
    const result = await db
      .collection("students")
      .updateOne(
        { _id: ObjectId.createFromHexString(documentId) },
        { $set: studentData }
      );

    // Check if the update was successful
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to update student" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const { _id } = await req.json();

    // Delete the student from the database
    const result = await db.collection("students").deleteOne({
      _id: ObjectId.createFromHexString(_id),
    });

    // Check if the deletion was successful
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to delete student" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete student" },
      { status: 500 }
    );
  }
}