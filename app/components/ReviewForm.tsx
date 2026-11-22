"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import StarIcon from "@/app/components/StarIcon";

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export default function ReviewForm({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState("");
  const [nameError, setNameError] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRestaurantName() {
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          if (active) {
            setNameError(payload.error ?? "Could not load this restaurant.");
          }
          return;
        }

        if (active) {
          setRestaurantName(payload.name);
        }
      } catch {
        if (active) {
          setNameError("Could not reach the server. Please try again.");
        }
      }
    }

    loadRestaurantName();

    return () => {
      active = false;
    };
  }, [restaurantId]);

  const canSubmit = rating !== null && comment.trim().length > 0 && !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          rating,
          comment,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        // Show exactly what the backend said. Do not invent a replacement.
        setError(payload.error ?? "Could not save your review.");
        setSubmitting(false);
        return;
      }

      router.push(`/restaurant/${restaurantId}`);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  if (nameError) {
    return (
      <main className="flex min-h-screen items-center px-5 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-[560px]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent">
            Write a review
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight tracking-[-0.03em]">
            We could not load this restaurant.
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted">{nameError}</p>
          <Link
            href="/restaurant/1"
            className="mt-8 inline-flex rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-colors hover:bg-accent"
          >
            Go to Ludhiana Burrito
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-[560px]">
        <Link
          href={`/restaurant/${restaurantId}`}
          className="text-sm text-muted transition-colors hover:text-ink"
        >
          Back to restaurant
        </Link>

        <header className="mt-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent">
            Write a review
          </p>
          <h1 className="mt-3 font-display text-[2.5rem] leading-[1.08] tracking-[-0.035em]">
            {restaurantName ? `How was ${restaurantName}?` : "How was your meal?"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            A star rating and a few words. That is all.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-10">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">
              Your rating
            </legend>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div
                role="group"
                aria-label="Choose a rating from 1 to 5"
                className="flex gap-1"
              >
                {STAR_VALUES.map((value) => {
                  const selected = rating !== null && value <= rating;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-label={`${value} out of 5 stars`}
                      aria-pressed={rating === value}
                      className={`rounded-lg p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        selected
                          ? "text-accent"
                          : "text-line hover:text-muted"
                      }`}
                    >
                      <StarIcon className="h-10 w-10" filled={selected} />
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-muted">
                {rating === null ? "Pick one" : `${rating} of 5`}
              </p>
            </div>
          </fieldset>

          <div className="mt-8">
            <label
              htmlFor="comment"
              className="text-sm font-semibold text-ink"
            >
              Your comment
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={5}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="What stood out?"
              className="mt-3 w-full resize-none rounded-2xl border border-line bg-card px-4 py-3.5 text-[0.95rem] leading-7 text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm leading-6 text-accent"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:bg-line disabled:text-muted"
          >
            {submitting ? "Saving..." : "Submit review"}
          </button>
        </form>
      </div>
    </main>
  );
}
