export const PAGE_PRESETS = {
  A4_PORTRAIT: { width: 595, height: 842, margin: 28 },
  A4_LANDSCAPE: { width: 842, height: 595, margin: 28 },
};

// Templates return slot rectangles in normalized coords (0..1)
export const TEMPLATES = {
  cover: {
    id: "cover",
    name: "Cover",
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
  },

  single: {
    id: "single",
    name: "Single",
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
  },

  // 2-up (left/right)
  two: {
    id: "two",
    name: "Two-up (Left / Right)",
    slots: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ],
  },

  // NEW: 2-up (top/bottom)
  two_v: {
    id: "two_v",
    name: "Two-up (Top / Bottom)",
    slots: [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 1, h: 0.5 },
    ],
  },

  grid3: {
    id: "grid3",
    name: "Grid 3",
    slots: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },

  // NEW: Grid 4 (2x2)
  grid4: {
    id: "grid4",
    name: "Grid 4 (2×2)",
    slots: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
};

export const TEMPLATE_ORDER = ["cover", "single", "two", "two_v", "grid3", "grid4"];
