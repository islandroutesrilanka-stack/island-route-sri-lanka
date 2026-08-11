import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/data";

export const revalidate = 60;

/**
 * Existence gate — returns a true 404 instead of a soft one. See the full
 * explanation in app/tours/[slug]/layout.tsx.
 */
export default async function PostSlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  if (!(await getPostBySlug(params.slug))) notFound();
  return <>{children}</>;
}
