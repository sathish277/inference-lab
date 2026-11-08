# Inside the Machine

An interactive 3D course on how AI models really run on hardware, from bits and bytes to GPUs and quantization.

## Run it

```bash
npm install
npm run dev      # open http://localhost:3000
npm test         # check the simulation math
npm run build    # static site in ./out (Vercel deploys this automatically)
```

## Where things live

| Folder | What's in it |
| --- | --- |
| `app/` | Pages: home and `lessons/[slug]` |
| `content/` | The course map and each lesson's text, quiz and "done when" list |
| `components/lesson/` | The lesson template: Predict, the four tabs, Quiz |
| `world/` | The shared 3D laptop, camera, colors and part descriptions |
| `scenes/` | One 3D scene per lesson (what moves, and why) |
| `lib/sim/` | The math every number comes from, with unit tests |
| `data/devices.ts` | Real device specs, each with its source |
| `store/lab.ts` | Shared state: knobs, selected part, open tab |

## Adding a lesson

1. Write `content/lessons/<name>.ts` (copy `memory-wall.ts`).
2. Add a `slug` to that lesson in `content/course.ts`.
3. Build its scene in `scenes/` on top of `world/Laptop.tsx`.
4. Put any new math in `lib/sim/` with tests.
5. Register the content in `app/lessons/[slug]/page.tsx`.

## Color language

Amber = data moving through memory · teal = compute · violet = cache · red = doesn't fit.
