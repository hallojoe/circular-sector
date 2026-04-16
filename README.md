# Circular Sector

Utilities for calculating the geometry needed to draw circular sectors and annular circular sectors.

The package is aimed at rendering workflows where you need coordinates and path data rather than a UI framework. It works well for SVG, Canvas, charting, dashboards, gauges, progress arcs, radial menus, and other circular visualizations.

## Features

- Create geometry for solid circular sectors
- Create geometry for annular sectors using `height`
- Apply linear gaps between sectors
- Build SVG path data for sectors and annular sectors
- Build sector paths using multiple drawing styles
- Build open guide paths for sector text labels
- Calculate centroids for both sector types
- Use small geometry helpers independently when needed

## Installation

```bash
npm install @casko/circular-sector
```

## Importing

Import from the package root:

```ts
import {
  buildCircularSectorGuidePath,
  buildCircularSectorPath,
  buildCircularSectorPathByMode,
  buildRectangularSectorPathByMode,
  createCircularSectorViewModel
} from "@casko/circular-sector"
```

## Core Concepts

### Circular sector

A wedge shape defined by:

- `center`
- `radius`
- `ratio`
- `theta`

### Annular circular sector

A ring-shaped sector defined by the same settings plus:

- `height`

The inner radius is derived as:

```ts
innerRadius = radius - height
```

### Gap

`gap` is treated as a linear distance along the outer arc. The library converts that into an angular trim and recalculates the geometry.

## Main API

### `createCircularSectorViewModel(input)`

Creates the derived geometry for a circular or annular sector.

Important input fields:

- `center`: `{ x, y }`
- `radius`: outer radius
- `ratio`: portion of a full circle, where `1` means a full circle
- `theta`: start angle in radians
- `gap`: linear gap distance along the arc
- `height`: thickness of an annular sector
- `borderRadius`: optional setting stored in the model, not currently used by the path builder

Returns a view model containing:

- `source`
- `ratio`
- `radius`
- `center`
- `angles`
- `anchors.outer`
- `anchors.middle`
- `anchors.inner`
- `anchors.centroid`

### `buildCircularSectorPath(sector, pathRadius?)`

Builds an SVG path string from a sector view model.

- `pathRadius = 0` builds a normal sharp-cornered path
- `pathRadius > 0` builds a rounded path

### `buildCircularSectorPathByMode(sector, options?)`

Builds an SVG path string from a sector view model using a selectable drawing mode.

Supported options:

- `mode`: `"arc" | "rounded" | "angular" | "beveled" | "faceted" | "scalloped" | "stepped" | "burst"`
- `cornerRadius`: used by `"rounded"`
- `bevelSize`: used by `"beveled"`
- `facetCount`: used by `"faceted"`
- `scallopCount` and `scallopDepth`: used by `"scalloped"`
- `stepCount` and `stepInset`: used by `"stepped"`
- `burstCount` and `burstDepth`: used by `"burst"`

Mode summary:

- `arc`: circular or annular sector using SVG arc commands
- `rounded`: rounded transitions based on a corner radius
- `angular`: line-only polygon using outer and inner anchor points
- `beveled`: angular path with chamfered corners
- `faceted`: arc approximated with straight line segments
- `scalloped`: playful curved bumps along the outer edge while keeping the normal sector closure
- `stepped`: terrace-like outer and inner edges made from straight segments
- `burst`: outward spikes along the outer edge with the normal inner closure

### `buildCircularSectorGuidePath(sector, options?)`

Builds an open SVG path suitable for `<textPath>` labels.

Supported options:

- `ring`: `"outer" | "middle" | "inner"`

Notes:

- The guide path uses the sector's already-trimmed anchor geometry so it stays aligned with gapped/trimmed sector placement.
- For solid sectors, `ring: "inner"` collapses to the center point because there is no inner arc to follow.

### `buildRectangularSectorPathByMode(sector, options?)`

Builds an SVG path string from the same sector view model, but reinterprets it as an axis-aligned rectangular slice.

Supported options:

- `mode`: `"vertical" | "horizontal"`

Notes:

- `radius` is treated as the outer rectangular span.
- `height` is treated as the reduction from the outer span to the inner span.
- `ratio` fills the primary span only.
- `theta` selects the anchor side.
- `gap` is not reinterpreted for rectangles in v1; the rectangular builder uses raw `source` dimensions and `center` placement.

## Example: Build SVG Path Data

```ts
import {
  buildCircularSectorPath,
  createCircularSectorViewModel
} from "@casko/circular-sector"

const sector = createCircularSectorViewModel({
  center: { x: 150, y: 150 },
  radius: 100,
  ratio: 0.25,
  theta: -Math.PI / 2,
  gap: 8,
  height: 40,
  borderRadius: 0
})

const path = buildCircularSectorPath(sector, 8)
```

## Example: Build Styled SVG Path Data

```ts
import {
  buildCircularSectorPathByMode,
  createCircularSectorViewModel
} from "@casko/circular-sector"

const sector = createCircularSectorViewModel({
  center: { x: 150, y: 150 },
  radius: 100,
  ratio: 0.25,
  theta: -Math.PI / 2,
  gap: 8,
  height: 40,
  borderRadius: 0
})

const angularPath = buildCircularSectorPathByMode(sector, {
  mode: "angular"
})

const beveledPath = buildCircularSectorPathByMode(sector, {
  mode: "beveled",
  bevelSize: 10
})

const facetedPath = buildCircularSectorPathByMode(sector, {
  mode: "faceted",
  facetCount: 8
})

const scallopedPath = buildCircularSectorPathByMode(sector, {
  mode: "scalloped",
  scallopCount: 6,
  scallopDepth: 5
})

const steppedPath = buildCircularSectorPathByMode(sector, {
  mode: "stepped",
  stepCount: 5,
  stepInset: 6
})

const burstPath = buildCircularSectorPathByMode(sector, {
  mode: "burst",
  burstCount: 8,
  burstDepth: 10
})

const rectangularVerticalPath = buildRectangularSectorPathByMode(sector, {
  mode: "vertical"
})

const rectangularHorizontalPath = buildRectangularSectorPathByMode(sector, {
  mode: "horizontal"
})
```

The playful modes are designed for decorative-but-readable use cases like badges, radial menus, dashboards, and stylized charts. They preserve the same sector geometry and gap trimming while reinterpreting the silhouette.

## Example: Build A Text Guide Path

```ts
import {
  buildCircularSectorGuidePath,
  createCircularSectorViewModel
} from "@casko/circular-sector"

const sector = createCircularSectorViewModel({
  center: { x: 150, y: 150 },
  radius: 100,
  ratio: 0.25,
  theta: -Math.PI / 2,
  gap: 8,
  height: 40,
  borderRadius: 0
})

const labelGuidePath = buildCircularSectorGuidePath(sector, {
  ring: "middle"
})
```

Example SVG usage:

```html
<svg viewBox="0 0 300 300">
  <defs>
    <path id="sector-label-guide" d="..."></path>
  </defs>

  <text>
    <textPath href="#sector-label-guide">Quarterly Revenue</textPath>
  </text>
</svg>
```

Example SVG usage:

```html
<svg viewBox="0 0 300 300">
  <path d="..." fill="tomato"></path>
</svg>
```

Replace `d="..."` with the generated `path` string.

## Example: Access Calculated Geometry

```ts
import { createCircularSectorViewModel } from "@casko/circular-sector"

const sector = createCircularSectorViewModel({
  center: { x: 0, y: 0 },
  radius: 120,
  ratio: 0.2,
  theta: 0,
  gap: 6,
  height: 0
})

console.log(sector.angles)
console.log(sector.anchors.outer.start)
console.log(sector.anchors.outer.mid)
console.log(sector.anchors.outer.end)
console.log(sector.anchors.centroid)
```

## Helper Functions

The package also includes focused helpers for common geometry tasks:

- `calculateSectorAngles`
- `calculateArcPoints`
- `calculateSectorCentroid`
- `calculateAnnularSectorCentroid`
- `calculateLineIntersection`
- `calculateDistanceBetweenPoints`
- `calculateMidpoint`
- `calculateEndPointOfLine`
- `calculateCircleArea`
- `calculateCircleCircumference`
- `calculateSectorLengthInRadians`
- `calculateIsoscelesTriangleHeight`
- `calculatePolarToCartesian`

## Angles

Angles are expressed in radians.

Common values:

- `0` points to the right
- `Math.PI / 2` points down
- `Math.PI` points left
- `-Math.PI / 2` points up

This follows the normal screen-coordinate convention used by SVG and Canvas, where positive `y` goes downward.

## Development

Build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Watch tests:

```bash
npm run test:watch
```

## License

MIT
