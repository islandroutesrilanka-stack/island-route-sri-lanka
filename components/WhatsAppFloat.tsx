import { WhatsAppMark } from "@/components/icons";
import { waLink, defaultWaMessage } from "@/lib/site";

/**
 * Floating WhatsApp button.
 *
 * Was a framer-motion `motion.a` for what amounts to one entrance and two
 * hover states. It sat in the root layout, so every route on the site paid to
 * mount an animation component for it before anything else could hydrate —
 * and, being a client component, it forced its own hydration boundary too.
 * It is now plain CSS and a server component: no JavaScript at all.
 *
 * The entrance lives on the positioning wrapper rather than the anchor because
 * the anchor already owns `animate-pulse-soft`, and a second `animation`
 * declaration on the same element replaces it rather than joining it.
 */
export default function WhatsAppFloat() {
  return (
    <div
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom))",
        right: "max(1.25rem, env(safe-area-inset-right))",
        animationDelay: "1.2s",
      }}
      className="settle-in fixed z-50"
    >
      <a
        href={waLink(defaultWaMessage)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
        /*
          The mobile menu hides this while it is open — see the rule in
          globals.css. It is set here rather than on the wrapper because the
          wrapper's `settle-in` entrance holds opacity at 1 with `both`, and a
          CSS animation outranks an ordinary declaration. `pulse-soft` on this
          element only animates box-shadow, so opacity is free to transition.
        */
        data-wa-float
        className="animate-pulse-soft flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl ring-1 ring-deep/20 transition-[transform,opacity,visibility] duration-200 ease-out hover:scale-[1.08] active:scale-[0.94]"
      >
        <WhatsAppMark size={28} />
      </a>
    </div>
  );
}
