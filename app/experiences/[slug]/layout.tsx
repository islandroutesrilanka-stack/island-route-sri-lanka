import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTours } from "@/lib/data";
import { getPublishedExperience } from "@/lib/experiences";

export const revalidate = 60;

/**
 * Existence gate — returns a true 404 instead of a soft one. See the full
 * explanation in app/tours/[slug]/layout.tsx.
 *
 * "Doesn't exist" and "exists but has no journeys" are the same answer here,
 * which is `getPublishedExperience`'s contract: an empty category must not be
 * reachable by typing its URL when it isn't reachable by clicking.
 */
export default async function ExperienceSlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  if (!getPublishedExperience(await getTours(), params.slug)) notFound();
  return <>{children}</>;
}
