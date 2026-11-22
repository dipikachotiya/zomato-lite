import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type RestaurantRow = { id: number };
type NewReviewRow = { id: number };

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Send a valid JSON body." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Send a valid JSON object." },
      { status: 400 },
    );
  }

  const { restaurantId, rating, comment } = body as Record<string, unknown>;

  // 1. Rating: a whole number from 1 to 5.
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 },
    );
  }

  // 2. Comment: non-empty after trimming whitespace.
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 },
    );
  }

  // 3. Restaurant: must be a whole number and must exist in the database.
  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "Restaurant ID must be a whole number." },
      { status: 400 },
    );
  }

  try {
    const restaurants = (await sql`
      SELECT id
      FROM restaurants
      WHERE id = ${restaurantId}
    `) as RestaurantRow[];

    if (!restaurants[0]) {
      return NextResponse.json(
        { error: `Restaurant ${restaurantId} does not exist.` },
        { status: 400 },
      );
    }

    const newReviews = (await sql`
      INSERT INTO reviews (restaurant_id, rating, comment)
      VALUES (${restaurantId}, ${rating}, ${comment.trim()})
      RETURNING id
    `) as NewReviewRow[];

    return NextResponse.json(
      { success: true, reviewId: newReviews[0].id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to save review:", error);
    return NextResponse.json(
      { error: "Could not save your review right now." },
      { status: 500 },
    );
  }
}
