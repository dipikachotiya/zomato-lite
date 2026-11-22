"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RestaurantData, Review } from "@/lib/types";
import StarIcon from "@/app/components/StarIcon";

type LoadState = "loading" | "ready" | "error";

function formatDate(createdAt: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
}

function ReviewMeta({ review }: { review: Review }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <p className="text-sm font-semibold text-ink">
        {review.rating}
        <span className="ml-1.5 font-normal text-muted">out of 5</span>
      </p>
      <time
        dateTime={review.createdAt}
        className="shrink-0 text-xs text-muted"
      >
        {formatDate(review.createdAt)}
      </time>
    </div>
  );
}

export default function RestaurantView({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const [data, setData] = useState<RestaurantData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRestaurant() {
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          if (active) {
            setError(payload.error ?? "Could not load this restaurant.");
            setLoadState("error");
          }
          return;
        }

        if (active) {
          setData(payload);
          setLoadState("ready");
        }
      } catch {
        if (active) {
          setError("Could not reach the server. Please try again.");
          setLoadState("error");
        }
      }
    }

    loadRestaurant();

    return () => {
      active = false;
    };
  }, [restaurantId]);

  if (loadState === "loading") {
    return (
      <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto w-full max-w-[560px] animate-pulse">
          <div className="h-3 w-24 rounded bg-line" />
          <div className="mt-5 h-12 w-4/5 rounded bg-line" />
          <div className="mt-4 h-3 w-40 rounded bg-line" />
          <div className="mt-12 h-28 border-y border-line" />
          <div className="mt-10 h-36 rounded-2xl bg-line/60" />
        </div>
      </main>
    );
  }

  if (loadState === "error" || !data) {
    return (
      <main className="flex min-h-screen items-center px-5 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-[560px]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent">
            Zomato Lite
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight tracking-[-0.03em]">
            We could not load this restaurant.
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted">
            {error || "Please try again."}
          </p>
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

  const latestReview = data.latestReview;
  const reviewLabel = data.totalReviews === 1 ? "review" : "reviews";

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-[560px]">
        <header>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent">
            Restaurant
          </p>
          <h1 className="mt-3 font-display text-[2.65rem] leading-[1.04] tracking-[-0.035em] sm:text-[3.2rem]">
            {data.name}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {data.cuisine}
            <span aria-hidden="true" className="mx-2 text-line">
              /
            </span>
            {data.area}
          </p>
        </header>

        <section
          aria-label="Rating summary"
          className="mt-10 flex items-end justify-between border-y border-line py-7"
        >
          <div className="flex items-end gap-2.5">
            {/* This prints the number the API computed. It does not calculate it. */}
            <span className="font-display text-[4.7rem] leading-[0.8] tracking-[-0.06em]">
              {data.averageRating ?? "—"}
            </span>
            {data.averageRating !== null && (
              <StarIcon className="mb-1.5 h-7 w-7 text-accent" />
            )}
          </div>
          <p className="pb-1 text-sm text-muted">
            {data.totalReviews} {reviewLabel}
          </p>
        </section>

        {latestReview ? (
          <>
            <section className="pt-9" aria-labelledby="latest-review-heading">
              <div className="flex items-center gap-3">
                <h2
                  id="latest-review-heading"
                  className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-accent"
                >
                  Latest review
                </h2>
                <span aria-hidden="true" className="h-px flex-1 bg-line" />
              </div>

              <article className="mt-4 rounded-2xl border border-line bg-card px-5 py-5">
                <ReviewMeta review={latestReview} />
                <p className="mt-4 font-display text-[1.35rem] leading-[1.45] tracking-[-0.01em] text-ink">
                  {latestReview.comment}
                </p>
              </article>
            </section>

            {data.reviews.length > 0 && (
              <section className="mt-11" aria-labelledby="older-reviews-heading">
                <h2
                  id="older-reviews-heading"
                  className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted"
                >
                  Earlier reviews
                </h2>

                <div className="mt-3 border-t border-line">
                  {data.reviews.map((review) => (
                    <article
                      key={review.id}
                      className="border-b border-line py-6"
                    >
                      <ReviewMeta review={review} />
                      <p className="mt-3 text-[0.95rem] leading-7 text-ink/85">
                        {review.comment}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="mt-9 border-y border-line py-10">
            <h2 className="font-display text-2xl tracking-[-0.02em]">
              No reviews yet.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Be the first to say something about this place.
            </p>
          </section>
        )}

        <Link
          href={`/review/${restaurantId}`}
          className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Write a review
        </Link>
      </div>
    </main>
  );
}
