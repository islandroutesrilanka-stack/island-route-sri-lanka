/**
 * Meta-description helper.
 * Google truncates around 155–160 characters — this trims on a word boundary
 * so descriptions never end mid-word or get cut off in search results.
 */
export function clampDesc(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\-–—]$/, "") + "…";
}

/** Page title helper — keeps titles inside Google's ~60 character display limit. */
export function clampTitle(text: string, max = 60): string {
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + "…";
}
