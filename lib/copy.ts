/**
 * Splitting authored prose into a lede and a remainder.
 *
 * The site's index pages had become walls of type: every region card, every
 * seasonal panel and every catalogue row carried the full two- or three-sentence
 * note that belongs on a detail page. The fix is not to delete the writing —
 * it is good writing, it is what the search engines index, and it is the reason
 * the cards say something true rather than something generic. The fix is to
 * show the first sentence and put the rest one interaction away.
 *
 * So nothing here rewrites, truncates or ellipsises. `splitLede` returns both
 * halves of the original string, whole; the caller decides what to do with the
 * second one. Concatenating `lede` and `rest` with a single space reproduces the
 * input exactly, which is the property that makes this safe to run over copy
 * nobody is reviewing again.
 */

/*
  Abbreviations that end in a full stop and are followed by a capital, which is
  otherwise indistinguishable from a sentence boundary. Deliberately short: it
  covers what the copy on this site actually uses, and a missed abbreviation
  costs a slightly early split, not a lost word.
*/
const ABBREVIATION =
  /\b(?:Mr|Mrs|Ms|Dr|Prof|St|Mt|No|vs|approx|e\.g|i\.e|etc)\.$/i;

/*
  Below this, a first sentence is a fragment rather than a lede, and the split
  is pushed out to the next boundary. 38 is set by the copy: "The island changes
  hands between monsoons." (42) is a lede anyone would be glad to lead with,
  while "The second changeover." (22) says nothing on its own and is correctly
  kept with the sentence that explains it.
*/
const MIN_LEDE = 38;

/*
  Below this, a paragraph is not a wall and hiding half of it costs the reader
  a click to save them a line. Two-sentence copy under ~150 characters is left
  exactly as it is. Only prose long enough to be the reason someone stopped
  reading gets a disclosure.
*/
const MIN_TO_SPLIT = 150;

export type SplitCopy = {
  /** The first sentence (or two, if the first is very short). Always non-empty. */
  lede: string;
  /** Everything after it, verbatim. Empty when the text is a single sentence. */
  rest: string;
};

export function splitLede(text: string): SplitCopy {
  const t = (text ?? "").trim();
  if (!t) return { lede: "", rest: "" };

  /* A terminator, any closing quote or bracket that belongs to it, then space
     and the start of something that looks like a new sentence. */
  const boundary = /([.!?])(["'”’)\]]?)\s+(?=[A-Z“"'(])/g;

  let m: RegExpExecArray | null;
  while ((m = boundary.exec(t)) !== null) {
    const head = t.slice(0, m.index + m[0].length).trim();
    if (head.length < MIN_LEDE) continue;
    if (ABBREVIATION.test(head)) continue;
    return { lede: head, rest: t.slice(boundary.lastIndex).trim() };
  }
  return { lede: t, rest: "" };
}

/**
 * `splitLede`, but only when the text is long enough for the split to be worth
 * an interaction. Short copy comes back whole, with an empty `rest`, and the
 * caller's `{rest && …}` guard does the rest of the work.
 *
 * This is what index-page components should reach for. It means a short note
 * written next month renders as a plain paragraph rather than sprouting a
 * disclosure for one extra line, without anyone having to think about it.
 */
export function splitIfLong(text: string, over = MIN_TO_SPLIT): SplitCopy {
  const t = (text ?? "").trim();
  return t.length > over ? splitLede(t) : { lede: t, rest: "" };
}

/** Just the lede — for callers that have nowhere to put the remainder. */
export function lede(text: string): string {
  return splitLede(text).lede;
}
