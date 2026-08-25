/**
 * Brand marks lucide does not carry.
 *
 * lucide has Instagram and Facebook, and the site uses them — in the footer's
 * icon row and now in the mobile menu's. It has no WhatsApp glyph, and
 * `MessageCircle` is a generic speech bubble that says "a message" rather than
 * "WhatsApp". On a control whose entire promise is which app it opens, the
 * mark has to be the real one.
 *
 * It lives here rather than inline because two places draw it — the floating
 * button on every page, and the mobile menu's WhatsApp button — and a path
 * this long, pasted twice, is a fork waiting to happen. No imports and no
 * hooks, so both server and client components can render it.
 */
export function WhatsAppMark({
  size = 20,
  className,
}: {
  size?: number;
  /** Decorative in every current caller: the label sits next to it. */
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M16.04 5.33c-5.9 0-10.69 4.79-10.69 10.68 0 1.88.49 3.72 1.43 5.34L5.3 26.7l5.48-1.44a10.65 10.65 0 0 0 5.25 1.38h.01c5.89 0 10.68-4.79 10.68-10.68 0-2.86-1.11-5.54-3.13-7.56a10.6 10.6 0 0 0-7.55-3.07zm0 19.5h-.01a8.9 8.9 0 0 1-4.52-1.24l-.32-.19-3.25.85.87-3.17-.21-.33a8.86 8.86 0 0 1-1.36-4.74c0-4.9 3.99-8.88 8.9-8.88 2.37 0 4.6.93 6.28 2.6a8.83 8.83 0 0 1 2.6 6.29c0 4.9-3.99 8.88-8.89 8.88zm4.87-6.65c-.27-.13-1.58-.78-1.83-.87-.24-.09-.42-.13-.6.13-.18.27-.69.87-.85 1.05-.16.18-.31.2-.58.07-.27-.13-1.13-.42-2.15-1.33-.79-.7-1.33-1.57-1.48-1.84-.16-.27-.02-.41.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.33-.02-.47-.07-.13-.6-1.45-.82-1.98-.22-.52-.44-.45-.6-.46l-.51-.01c-.18 0-.47.07-.71.33-.24.27-.93.91-.93 2.23 0 1.31.96 2.58 1.09 2.76.13.18 1.88 2.87 4.56 4.03.64.27 1.13.44 1.52.56.64.2 1.22.17 1.68.11.51-.08 1.58-.65 1.8-1.27.22-.62.22-1.16.16-1.27-.07-.11-.24-.18-.51-.31z" />
    </svg>
  );
}
