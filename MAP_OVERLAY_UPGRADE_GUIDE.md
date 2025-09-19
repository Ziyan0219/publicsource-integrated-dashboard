# Pittsburgh Map Overlay System - Advanced Implementation Guide

## Problem Statement

The current Pittsburgh map overlay system suffers from a critical architectural flaw: overlays are positioned relative to the container div, while the underlying map image uses `object-cover` scaling. This creates perfect alignment between percentage-based overlays and the visible map area.

## Current Implementation (Post-Fix)

```javascript
// Current working solution
<div style={{ height: '450px' }}>
  <img className="object-cover" />  // Image fills container completely
  <div style={{ top: '8%', left: '8%' }} />  // Overlays position correctly
</div>
```

**Status**: ✅ WORKING - Overlays now align correctly with map regions

## Advanced Options for Future Enhancement

### Option 2: Dynamic Aspect Ratio Calculation (ROBUST)

**Complexity**: 🔴 High
**Reliability**: 🟢 Excellent
**Future-Proof**: 🟢 Excellent

#### What This Achieves
- Perfect overlay alignment regardless of image aspect ratio
- No image cropping (preserves full map visibility)
- Responsive design that works on any screen size
- Maintains image quality and proportions

#### Implementation Requirements

**File to Modify**: `frontend/src/components/PittsburghMap.jsx`

**Step 1: Add Image Dimension Detection**
```javascript
// Add these state variables after existing useState
const [imageDimensions, setImageDimensions] = useState(null);
const [containerDimensions, setContainerDimensions] = useState(null);
const containerRef = useRef(null);

// Add this effect to detect container size
useEffect(() => {
  if (containerRef.current) {
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      setContainerDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }
}, []);
```

**Step 2: Calculate Image Bounds**
```javascript
// Add this function to calculate actual image position within container
const calculateImageBounds = useCallback(() => {
  if (!imageDimensions || !containerDimensions) return null;

  const imageAspectRatio = imageDimensions.width / imageDimensions.height;
  const containerAspectRatio = containerDimensions.width / containerDimensions.height;

  let actualImageWidth, actualImageHeight, offsetX, offsetY;

  if (imageAspectRatio > containerAspectRatio) {
    // Image is wider - will be letterboxed top/bottom
    actualImageWidth = containerDimensions.width;
    actualImageHeight = containerDimensions.width / imageAspectRatio;
    offsetX = 0;
    offsetY = (containerDimensions.height - actualImageHeight) / 2;
  } else {
    // Image is taller - will be letterboxed left/right
    actualImageHeight = containerDimensions.height;
    actualImageWidth = containerDimensions.height * imageAspectRatio;
    offsetY = 0;
    offsetX = (containerDimensions.width - actualImageWidth) / 2;
  }

  return {
    width: actualImageWidth,
    height: actualImageHeight,
    offsetX,
    offsetY,
    // Convert to percentages for CSS
    widthPercent: (actualImageWidth / containerDimensions.width) * 100,
    heightPercent: (actualImageHeight / containerDimensions.height) * 100,
    offsetXPercent: (offsetX / containerDimensions.width) * 100,
    offsetYPercent: (offsetY / containerDimensions.height) * 100
  };
}, [imageDimensions, containerDimensions]);
```

**Step 3: Update Image Handler**
```javascript
// Replace the current onLoad handler
const handleImageLoad = (e) => {
  setImageLoaded(true);
  setImageDimensions({
    width: e.target.naturalWidth,
    height: e.target.naturalHeight
  });
};

// Update img tag
<img
  src="/pittsburgh-neighborhoods-detailed.jpg"
  alt="Pittsburgh Neighborhoods Map"
  className="absolute inset-0 w-full h-full object-contain"  // Back to object-contain
  onLoad={handleImageLoad}
  // ... rest of props
/>
```

**Step 4: Transform Overlay Positioning**
```javascript
// Replace the current regionOverlays mapping
{imageLoaded && imageBounds && regionOverlays.map(({ region, style }) => {
  // Transform overlay coordinates to image-relative positioning
  const transformedStyle = {
    // Scale position and size relative to actual image bounds
    top: `${imageBounds.offsetYPercent + (parseFloat(style.top) / 100) * imageBounds.heightPercent}%`,
    left: `${imageBounds.offsetXPercent + (parseFloat(style.left) / 100) * imageBounds.widthPercent}%`,
    width: `${(parseFloat(style.width) / 100) * imageBounds.widthPercent}%`,
    height: `${(parseFloat(style.height) / 100) * imageBounds.heightPercent}%`,
    // ... rest of styling
  };

  return (
    <div key={region} style={transformedStyle}>
      {/* overlay content */}
    </div>
  );
})}
```

**Step 5: Add Container Reference**
```javascript
// Update the container div
<div
  ref={containerRef}
  className="relative rounded-lg overflow-hidden border border-gray-300 shadow-lg"
  style={{ height: '450px', minHeight: '400px' }}
>
```

#### Testing Checklist
- [ ] Overlays align correctly on desktop (wide screen)
- [ ] Overlays align correctly on mobile (narrow screen)
- [ ] No visual regression when image loads
- [ ] Performance remains acceptable (< 100ms recalculation)
- [ ] Works with different image aspect ratios

---

### Option 3: SVG Vector Overlays (PROFESSIONAL)

**Complexity**: 🟡 Medium
**Reliability**: 🟢 Excellent
**Scalability**: 🟢 Excellent

#### What This Achieves
- Mathematical precision in overlay positioning
- Perfect scaling with any container size
- Vector-based rendering (crisp at any zoom level)
- Easier to maintain coordinate systems
- Better accessibility support

#### Implementation Requirements

**File to Modify**: `frontend/src\components\PittsburghMap.jsx`

**Step 1: Define SVG Coordinate System**
```javascript
// Add SVG viewBox constants (normalized to 1000x1000 coordinate system)
const SVG_VIEWBOX = "0 0 1000 1000";
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 1000;

// Convert current percentage coordinates to SVG coordinates
const regionOverlaysSVG = [
  // North Side: top: '8%', left: '8%', width: '42%', height: '35%'
  {
    region: "North Side",
    coords: { x: 80, y: 80, width: 420, height: 350 }
  },
  // Central Pittsburgh: top: '48%', left: '35%', width: '18%', height: '12%'
  {
    region: "Central Pittsburgh",
    coords: { x: 350, y: 480, width: 180, height: 120 }
  },
  // Add all other regions...
];
```

**Step 2: Replace Div Overlays with SVG**
```javascript
// Replace the current overlay mapping section
{imageLoaded && (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox={SVG_VIEWBOX}
    preserveAspectRatio="none"
  >
    {regionOverlaysSVG.map(({ region, coords }) => {
      const isHighlighted = getRegionHighlight(region);
      const regionData = geographicRegions[region];

      return (
        <g key={region}>
          {/* Interactive overlay region */}
          <rect
            x={coords.x}
            y={coords.y}
            width={coords.width}
            height={coords.height}
            fill={isHighlighted ? regionData.highlightColor : 'transparent'}
            stroke={isHighlighted ? 'rgba(251, 191, 36, 0.8)' : 'transparent'}
            strokeWidth="2"
            rx="8"
            className="transition-all duration-300 pointer-events-auto cursor-pointer"
            style={{
              filter: isHighlighted ? 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.4))' : 'none'
            }}
          >
            <title>{`${region}: ${regionData.description}`}</title>
          </rect>

          {/* Region label for highlighted areas */}
          {isHighlighted && (
            <text
              x={coords.x + coords.width / 2}
              y={coords.y + coords.height / 2}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-white text-xs font-medium pointer-events-none"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))' }}
            >
              {region}
            </text>
          )}
        </g>
      );
    })}
  </svg>
)}
```

**Step 3: Enhance SVG with Geographic Features**
```javascript
// Add this enhanced SVG with rivers and landmarks
<svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={SVG_VIEWBOX}>
  <defs>
    {/* Gradient definitions for rivers */}
    <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 0.6 }} />
      <stop offset="100%" style={{ stopColor: '#0284c7', stopOpacity: 0.8 }} />
    </linearGradient>
  </defs>

  {/* Rivers layer (behind overlays) */}
  <g opacity="0.3">
    {/* Allegheny River */}
    <path
      d="M150,250 Q350,300 500,350 Q650,400 850,350"
      fill="none"
      stroke="url(#riverGradient)"
      strokeWidth="15"
    />
    {/* Monongahela River */}
    <path
      d="M200,750 Q350,700 500,650 Q650,600 800,650"
      fill="none"
      stroke="url(#riverGradient)"
      strokeWidth="15"
    />
    {/* Ohio River */}
    <path
      d="M500,450 Q700,500 900,550"
      fill="none"
      stroke="#075985"
      strokeWidth="20"
    />
  </g>

  {/* Region overlays */}
  {/* ... region overlay code from Step 2 ... */}

  {/* Landmark layer (above overlays) */}
  <g>
    {/* Point State Park */}
    <circle
      cx="500"
      cy="450"
      r="15"
      fill="#10b981"
      opacity="0.8"
    />
  </g>
</svg>
```

#### Coordinate Conversion Helper
```javascript
// Utility function to convert percentage coordinates to SVG coordinates
const percentToSVG = (percentValue, dimension = 'both') => {
  if (dimension === 'x' || dimension === 'width') {
    return (parseFloat(percentValue) / 100) * SVG_WIDTH;
  } else if (dimension === 'y' || dimension === 'height') {
    return (parseFloat(percentValue) / 100) * SVG_HEIGHT;
  }
  return (parseFloat(percentValue) / 100) * 1000; // Default
};

// Convert current coordinates
const convertedCoords = regionOverlays.map(overlay => ({
  region: overlay.region,
  coords: {
    x: percentToSVG(overlay.style.left, 'x'),
    y: percentToSVG(overlay.style.top, 'y'),
    width: percentToSVG(overlay.style.width, 'width'),
    height: percentToSVG(overlay.style.height, 'height')
  }
}));
```

#### Testing Checklist
- [ ] SVG overlays render correctly
- [ ] Overlays scale properly with container resize
- [ ] Interactive hover/click events work
- [ ] Text labels remain readable at all sizes
- [ ] No performance degradation
- [ ] Accessibility attributes work correctly

---

## Migration Strategy

### Phase 1: Current (DONE ✅)
- **Status**: Using `object-cover` for immediate fix
- **Result**: Overlays align correctly with map

### Phase 2: Option 2 (Future Enhancement)
- **When**: If image cropping becomes a problem
- **Benefit**: No cropping, perfect alignment
- **Effort**: ~2-3 days development + testing

### Phase 3: Option 3 (Long-term)
- **When**: For maximum scalability and precision
- **Benefit**: Professional-grade mapping solution
- **Effort**: ~1-2 days development + testing

## Decision Matrix

| Requirement | Current | Option 2 | Option 3 |
|-------------|---------|----------|----------|
| **Overlay Alignment** | ✅ Good | ✅ Perfect | ✅ Perfect |
| **No Image Cropping** | ❌ Some cropping | ✅ None | ✅ None |
| **Performance** | ✅ Excellent | ✅ Good | ✅ Excellent |
| **Maintenance** | ✅ Simple | 🟡 Complex | ✅ Simple |
| **Scalability** | 🟡 Limited | ✅ Excellent | ✅ Excellent |
| **Development Time** | ✅ Done | 🔴 High | 🟡 Medium |

## Recommended Next Steps

1. **Monitor current solution** for any cropping issues
2. **If cropping is problematic**: Implement Option 2
3. **For long-term scalability**: Migrate to Option 3
4. **Consider hybrid approach**: SVG overlays + dynamic aspect ratio

---

*This guide provides complete implementation details for future agents to upgrade the map overlay system without the need for reverse engineering.*