# Zomato Lite

A two-screen restaurant review app for Ludhiana Burrito.

- `/restaurant/1` shows the restaurant, its computed rating, the latest review, and older reviews.
- `/review/1` lets a visitor write a review.

## The important design rule

The database stores facts only: restaurants and individual reviews. It has no `average_rating` column and no `latest_review` column. The backend computes the average, count, and newest review with SQL every time the restaurant page asks for them.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` and add your Neon connection string:

   ```bash
   DATABASE_URL=postgresql://...
   ```

3. Create the tables and seed the sample data:

   ```bash
   npm run db:setup
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## API

- `POST /api/reviews` validates the rating, comment, and restaurant before inserting one review.
- `GET /api/restaurants/[id]` returns the restaurant, `averageRating`, `totalReviews`, `latestReview`, and the remaining `reviews`.

The frontend renders those values. It does not calculate or sort ratings.

## Stack

Next.js 15 (App Router, TypeScript), Tailwind CSS, Neon Postgres, `@neondatabase/serverless`, raw SQL.
