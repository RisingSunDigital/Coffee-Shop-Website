/**
 * JACOBY'S COFFEE — MENU DATA
 * ------------------------
 * This is the ONLY file you need to edit to update the menu.
 * Add, remove, or change items below. Each item needs:
 *   id       - unique short code, no spaces (used internally, e.g. in Stripe)
 *   name     - shown to customers
 *   desc     - one short line, shown under the name
 *   price    - in dollars, e.g. 4.50 (use a decimal, not a string)
 *   category - "coffee", "tea", "food", or "extras" (or add your own category,
 *              just make sure it also appears in the CATEGORIES list below)
 *   sizes    - optional. If an item has sizes, list them with a price
 *              difference from the base price. Leave out for one-size items.
 *   soldOut  - optional. Set to true to show "Sold out" and disable ordering.
 *
 * When you're ready to send me the real menu, just tell me the items and
 * I'll update this file for you — or you can edit it directly following
 * the pattern below.
 */

const CATEGORIES = [
  { id: "coffee", label: "Coffee" },
  { id: "tea", label: "Tea" },
  { id: "food", label: "Food" },
  { id: "extras", label: "Extras" },
];

const MENU_ITEMS = [
  {
    id: "drip",
    name: "House Drip",
    desc: "Our daily roast, brewed fresh all morning.",
    price: 3.25,
    category: "coffee",
    sizes: [
      { label: "12oz", diff: 0 },
      { label: "16oz", diff: 0.5 },
    ],
  },
  {
    id: "latte",
    name: "Rise Latte",
    desc: "Double shot, steamed milk, a little foam.",
    price: 4.75,
    category: "coffee",
    sizes: [
      { label: "12oz", diff: 0 },
      { label: "16oz", diff: 0.75 },
    ],
  },
  {
    id: "cortado",
    name: "Cortado",
    desc: "Equal parts espresso and warm milk. No fuss.",
    price: 4.25,
    category: "coffee",
  },
  {
    id: "cold-brew",
    name: "Slow Cold Brew",
    desc: "Steeped 18 hours. Served over ice.",
    price: 4.5,
    category: "coffee",
  },
  {
    id: "chai",
    name: "House Chai",
    desc: "Steeped spices, steamed milk, light sweetness.",
    price: 4.5,
    category: "tea",
  },
  {
    id: "green-tea",
    name: "Loose Green Tea",
    desc: "Grown at altitude, brewed to order.",
    price: 3.5,
    category: "tea",
  },
  {
    id: "croissant",
    name: "Butter Croissant",
    desc: "Baked each morning, next door.",
    price: 3.75,
    category: "food",
  },
  {
    id: "avo-toast",
    name: "Avocado Toast",
    desc: "Sourdough, chili flake, flaky salt.",
    price: 7.5,
    category: "food",
  },
  {
    id: "oat-milk",
    name: "Oat Milk Swap",
    desc: "Swap the milk in any drink.",
    price: 0.75,
    category: "extras",
  },
  {
    id: "extra-shot",
    name: "Extra Shot",
    desc: "Because one is rarely enough.",
    price: 1.0,
    category: "extras",
  },
];
