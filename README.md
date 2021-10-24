# Circular Sector

A set of functions computing cartesian coordinates, describing circular and annulus sectors.

Usable for drawing circular things on ex. `svg` and `canvas` elements, but not bound to either of them.

Great for circular visualisations like spread, progress and reticulated splines. 

## Usage

```javascript

const input = {
  center: { x: 100, y: 100 },
  radius: 50, 
  theta: -Math.PI * .5, 
  ratio: .2
}

const circularSector = createCircularSector(input)

```

### Result

Result applied to a `svg` `path` element

<svg  xmlns="http://www.w3.org/2000/svg" width="200" height="200"><path d="M 100 50 A 50 50 0 0 1 147.55282581475768 84.54915028125264 L 100 100 Z" stroke="none" fill="rgb(0, 124, 187, .8)" data-cx="114.69463130731182" data-cy="79.77457514062631" data-d="M 100 50 A 50 50 0 1 1 147.55282581475768 84.54915028125264 L 100 100 Z"></path></svg>


<details>
 <summary>Click here to expand stringify result</summary>

```json
{
  "source": {
    "center": {
      "x": 100,
      "y": 100
    },
    "radius": 50,
    "theta": -1.5707963267948966,
    "ratio": 0.2
  },
  "ratio": 0.2,
  "radius": 50,
  "center": {
    "x": 100,
    "y": 100
  },
  "angles": {
    "start": -1.5707963267948966,
    "mid": -0.9424777960769379,
    "end": -0.3141592653589793
  },
  "anchors": {
    "outer": {
      "start": {
        "x": 147.55282581475768,
        "y": 84.54915028125264
      },
      "mid": {
        "x": 129.38926261462365,
        "y": 59.54915028125263
      },
      "end": {
        "x": 100,
        "y": 50
      }
    },
    "middle": {
      "start": {
        "x": 123.77641290737884,
        "y": 92.27457514062631
      },
      "mid": {
        "x": 114.69463130731182,
        "y": 79.77457514062631
      },
      "end": {
        "x": 100,
        "y": 75
      }
    },
    "inner": {
      "start": {
        "x": 100,
        "y": 100
      },
      "mid": {
        "x": 100,
        "y": 100
      },
      "end": {
        "x": 100,
        "y": 100
      }
    }
  }
}

```
</details>
<br />

After creating a circular sector it can be transformed into an annulus sector or a marginalized sector - or both.

```javascript

const circularSector = createCircularSector(input)

const withMargin = createCircularSectorMargin(circularSector, 10)


```



## SVG Examples 

Examples generated using this thing:

### Circular Sectors 

![Example](./examples/circular-sectors.svg)

### Annulus sectors

![Example](./examples/annulus-sectors.svg)


### Circular sectors with margin

![Example](./examples/circular-sectors-with-margin.svg)


### Annulus sectors with margin

![Example](./examples/annulus-sectors-with-margin.svg)

### UN World Goals logo

![Example](./examples/un-world-goals.svg)


### Ethics Compas

![Example](./examples/ethics-compas.svg) 

## Todo

  - Center of mass and gravity

## See you

Thanks for getting this far. Please share result of usage.

Written in TypeScript.
