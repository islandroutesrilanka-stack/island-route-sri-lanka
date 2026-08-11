/*
 * Lives in the (index) route group on purpose — do not move it up a level.
 *
 * A loading.tsx opens a Suspense boundary over its segment and everything
 * nested below it. Sitting in the group, this skeleton wraps only the index
 * page; at the parent level it would also wrap [slug], committing those
 * responses as 200 and turning every notFound() into a soft 404.
 * Full explanation in app/tours/[slug]/layout.tsx.
 */
import PageSkeleton from "@/components/patterns/PageSkeleton";

export default function Loading() {
  return <PageSkeleton cards={6} label="Loading experiences" />;
}
