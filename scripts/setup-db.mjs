import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(databaseUrl);

function splitStatements(source) {
  return source
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const seed = await readFile(new URL("../db/seed.sql", import.meta.url), "utf8");

console.log("Resetting the two tables...");
await sql.query("DROP TABLE IF EXISTS reviews");
await sql.query("DROP TABLE IF EXISTS restaurants");

console.log("Creating the schema...");
for (const statement of splitStatements(schema)) {
  await sql.query(statement);
}

console.log("Adding Ludhiana Burrito and three reviews...");
for (const statement of splitStatements(seed)) {
  await sql.query(statement);
}

const restaurants = await sql`
  SELECT id, name, cuisine, area
  FROM restaurants
  ORDER BY id
`;

const reviews = await sql`
  SELECT id, restaurant_id, rating, comment, created_at
  FROM reviews
  ORDER BY id
`;

console.log("\nrestaurants");
console.table(restaurants);

console.log("\nreviews");
console.table(reviews);

console.log("\nDatabase setup complete.");
