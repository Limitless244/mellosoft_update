# Mellosoft

Next.js 14 App Router, TypeScript, Tailwind, GSAP/ScrollTrigger, Lenis, and React Three Fiber.

## Run

Use Node 20 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Production: npm run build then npm start. Lint: npm run lint. On PowerShell systems that block npm.ps1, use npm.cmd.

## Replace placeholders

- Copy, products, prices, collections, and illustrative testimonials: lib/data.ts. Statistics are in components/CuratedGrid.tsx; these are demo claims. Brand and contact copy live in their respective components.
- Photos: replace public/images/*.jpg with licensed images. Keep filenames or update references. Assets are local Unsplash placeholder photography. Image frames reserve space with explicit aspect ratios and next/image fill + sizes.
- 3D: put bed.glb in public/models. No fake GLB is included: a missing file uses the procedural frame, mattress, pillows, and legs. GLTF/Draco loading is supported by drei. Match the procedural scale (roughly 3 by 4 units); place the base at y=0. For multiple real collection models, extend BedModel with a per-variant path mapping. Fabric switching and collection silhouettes currently use the procedural model; a real GLB should expose its fabric materials for recoloring.
- Newsletter: replace the local success handler in Newsletter.tsx with your email provider endpoint. It does not collect or send addresses.
- Shopping bag: local browser storage only; no checkout or payments. Social links point to platform homepages until real brand profiles are supplied.

## Behavior and accessibility

ScrollTrigger pins and expands the hero over 85% of viewport scroll. Lenis drives ScrollTrigger updates. Reduced motion disables pinning, entrance animations, and bed motion. Desktop 3D loads only near the stage; mobile and low-memory devices use photography. The hero has an optional Explore in 3D control. Fabric swatches recolor the procedural bed. Collection changes update the model rotation and counter. Product rail supports touch scrolling and mouse dragging.

Designed for 375, 768, 1280 and 1536px. Lighthouse 90+ is a target, not a measured claim. Verify layout and WebGL behavior in a browser before publication.

## Verification notes

Production build and lint pass. The initial route is statically prerendered with approximately 145 kB first-load JavaScript; 3D is a separate lazy chunk. Browser viewport checks and Lighthouse were not available in this environment. next/font/google downloads the specified fonts during the first build, so network access is required.

The requested Next.js 14 and Tailwind 3 dependency family currently reports npm audit advisories, including a critical Next.js advisory. The audit-proposed fix upgrades Next.js to a newer major version. Review and upgrade the framework before a public production release; this implementation preserves the explicitly requested stack.
