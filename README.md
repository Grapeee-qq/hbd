# Solo Birthday Room

A Three.js birthday ritual in a glass cabin beside an alpine lake.

Three selectable settings are available above the scene: snow mountains and aurora, sunrise coast, and European manor. Each changes the distant panorama, sky and room fill lighting. The coast retains animated water reflections; the manor replaces the lake with garden ground and a path. Switching settings preserves the current birthday ritual. If an image fails to load, the current setting stays visible and the user can retry.

The additional original built-in imagegen assets are `public/sunrise.png` (photorealistic Mediterranean dawn, champagne sunlight, calm sea and distant cliffs, no interior) and `public/manor.png` (photorealistic limestone European manor, formal garden, mature trees and soft morning sky, no interior). Both were requested as 3:1 panoramic environment images without people or text.

## Run

`npm install` then `npm run dev`. Production: `npm run build`.

## Experience

The camera arrives over ten seconds. Clicking the candle moves into a cake close-up, lights a match, brings it to the wick, then withdraws it. After this 6.5-second sequence there is a 6.5-second pause before choosing an open-palm-to-fist wish or candle-click ritual. There are 2,600 glowing wish particles. Capture compresses them into a bright orb, sends out a ring, and disperses them into a large two-line birthday message over 13 seconds. Aurora and reflections brighten while snow highlights warm to gold. Sound starts with the candle interaction and can be muted using the sound button; match strike, shimmer, capture and finale sounds are synthesized with Web Audio.

Hand tracking uses locally served MediaPipe WASM and model files, and only requests camera access after the explicit gesture button. Video remains in browser memory and is never uploaded or recorded. Tracks stop at completion, fallback, or page exit. GPU initialization falls back to CPU. Camera access requires localhost or HTTPS. Real-person hand tracking must still be checked with a camera; automated geometry tests do not substitute for that.

## Rendering

Real 3D cabin, furniture, cake, particles, animated aurora and planar water reflections. Distant mountains use an original generated panorama, not navigable mountain geometry. The generation prompt: “Photorealistic natural cinematic blue-hour snowy Norwegian alpine mountain range across a far lakeshore, detailed craggy peaks and snow gullies, dark slate blue muted palette, faint moon lighting, atmospheric mist between ranges. Wide 3:1 panorama, level far lakeshore around 85% height, bottom dark lake, clean navy sky, sparse stars, organic peaks and central valley. No aurora, buildings, foreground rocks or text.” Generated using built-in imagegen; asset: `public/mountains.png`.

Pixel ratio is capped at 1.6; reflections at 1280×800 and mobile shadows at 1024. Tracking runs every third animation frame and loads only on request. No microphone or third-party analytics.

## Validation

The current gesture control follows finger aperture: open fingers expand the stars, gradually curled fingers continuously contract them, and a fully closed fist held for 350 ms completes the wish after an open hand was established. Aperture is normalized against palm/finger bones, so moving toward the camera no longer drives expansion. Position and spread are smoothed every render frame; inference is capped near 22 Hz. Success immediately displays “你握住了它。” and transitions into particle lettering from 5.5 to 9.5 seconds. Cake close-ups include fluted cream piping, blueberry calyxes, gold flakes, and a porcelain gold rim.

`npm test`: gesture classification, scale/translation invariance, partial/missing/degenerate landmarks. Browser QA covered the candle route and final birthday text, and visual iterations on mountains, ceiling, and lighting. MediaPipe archive integrity was checked. Browser permission denial and live human gesture accuracy need device-level validation.
