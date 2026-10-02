# Payoo — Product Character

Payoo is the Payo AI character: a small orange workflow helper. He appears
wherever the product signs its work, and he is the planned face of the
Payoo chat assistant.

**Current status:** the chat assistant is not functional yet. Clicking the
Payoo bubble opens a small chat panel preview labelled **"Coming soon"**
(with a gently pulsing amber status dot). Typing appends messages locally
as a preview; nothing is sent to a server.

## What Payoo looks like

Flat vector shapes, three colours, no gradients, no glow. Drawn on a 64×64
viewBox in `src/components/payo/mark.tsx` as the `PayoMark` component.

| Part | Shape | Fill |
| --- | --- | --- |
| Tuft | rounded rect, 11×17, rx 5.5 | `#F97316` |
| Body | rounded rect, 52×51, rx 17.5 | `#F97316` |
| Eyes | ellipses, 3.6×5.2 | `#2A1708` |
| Eye shine | circles, r 1.15 | `#FFFFFF` |
| Blush | ellipses, 3.4×2.1 at 60% opacity | `#E2640E` |
| Smile | 3px round-cap stroke | `#2A1708` |

## Motion

- Gentle blink every 7.2s (`@keyframes payo-blink`, `src/app/globals.css:622`).
- The eye group scales via `transform-box: fill-box`.
- `prefers-reduced-motion: reduce` disables the blink (`globals.css:654`).
- The `PayoMark` `blink` prop (default `true`) opts a single instance out.

## Sizes in use

| Context | Size |
| --- | --- |
| Landing header / workspace shell | 26px |
| Landing footer | 24px |
| Overview empty state | 32px |
| Privacy page / About dialog | 28px |
| Chat bubble (floating widget) | 80px |

## Rules

- Payoo's orange is for the character and tiny brand details only. It never
  signals a state (root `design.md`: "Orange never signals a state; it only
  marks the Payo character and tiny brand details").
- Keep the drawing flat: no gradients, no glow, no re-colouring.
- Payoo is decorative in the UI (`aria-hidden` on the SVG); never use the
  mark as the only label for a control.
- Keep the blink gentle and infrequent; always respect reduced motion.

## Where Payoo lives

- Mark component: `src/components/payo/mark.tsx` (`PayoMark`)
- Chat bubble: `src/components/payo/payoo-chat.tsx` (`PayooChat`, "Coming
  soon" state)
