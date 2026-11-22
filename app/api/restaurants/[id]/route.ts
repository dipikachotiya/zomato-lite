import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Review, RestaurantData } from "@/lib/types";

export const dynamic = "force-dynamic";

type RestaurantRow = {
  id: number;
  name: string;
  cuisine: string;
  area: string;
};

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  created_at: string | Date;
};

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 404 },
    );
  }

  const restaurantId = Number(id);

  try {
    const restaurants = (await sql`
      SELECT id, name, cuisine, area
      FROM restaurants
      WHERE id = ${restaurantId}
    `) as RestaurantRow[];

    const restaurant = restaurants[0];

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 404 },
      );
    }

    // These answers are computed fresh on every request.
    // There is deliberately no average_rating or latest_review column.
    const stats = (await sql`
      SELECT
        ROUND(AVG(rating)::numeric, 1)::float8 AS average_rating,
        COUNT(*)::int AS total_reviews
      FROM reviews
      WHERE restaurant_id = ${restaurantId}
    `) as { average_rating: number | null; total_reviews: number }[];

    const reviewRows = (await sql`
      SELECT id, rating, comment, created_at
      FROM reviews
      WHERE restaurant_id = ${restaurantId}
      ORDER BY created_at DESC, id DESC
    `) as ReviewRow[];

    const allReviews = reviewRows.map(toReview);
    const latestReview = allReviews[0] ?? null;
    const olderReviews = allReviews.slice(1);

    const response: RestaurantData = {
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      averageRating: stats[0]?.average_rating ?? null,
      totalReviews: stats[0]?.total_reviews ?? 0,
      latestReview,
      reviews: olderReviews,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to load restaurant:", error);
    return NextResponse.json(
      { error: "Could not load this restaurant right now." },
      { status: 500 },
    );
  }
}
