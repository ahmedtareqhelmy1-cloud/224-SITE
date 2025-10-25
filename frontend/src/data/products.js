export const products = [
  {
    id: 1,
    name: "ROG Strix Gaming Chair",
    price: 4999.99,
    originalPrice: 6999.99,
    image: "/src/assets/products/rog-chair.jpg",
    sale: true,
    category: "Gaming Chairs",
    description: "Premium gaming chair with RGB lighting, 4D armrests, and premium leather finish"
  },
  {
    id: 2,
    name: "ROG Claymore II Mechanical Keyboard",
    price: 3299.99,
    originalPrice: 4499.99,
    image: "/src/assets/products/rog-keyboard.jpg",
    sale: true,
    category: "Keyboards",
    description: "Wireless mechanical gaming keyboard with detachable numpad and ROG RX Blue switches"
  },
  {
    id: 3,
    name: "ROG Chakram X Gaming Mouse",
    price: 2499.99,
    originalPrice: 2999.99,
    image: "/src/assets/products/rog-mouse.jpg",
    sale: true,
    category: "Mice",
    description: "Wireless gaming mouse with 36000 DPI sensor and programmable joystick"
  },
  {
    id: 4,
    name: "ROG Delta S Gaming Headset",
    price: 2999.99,
    originalPrice: 3999.99,
    image: "/src/assets/products/rog-headset.jpg",
    sale: true,
    category: "Headsets",
    description: "Hi-Res ESS 9281 Quad DAC™ gaming headset with AI noise-cancelling microphone"
  },
  {
    id: 5,
    name: "ROG Swift PG32UQX Monitor",
    price: 29999.99,
    originalPrice: 34999.99,
    image: "/src/assets/products/rog-monitor.jpg",
    sale: true,
    category: "Monitors",
    description: "32-inch 4K HDR gaming monitor with Mini LED technology and 144Hz refresh rate"
  },
  {
    id: 6,
    name: "Razer BlackWidow V3 Pro",
    price: 2799.99,
    image: "/src/assets/products/razer-keyboard.jpg",
    sale: false,
    category: "Keyboards",
    description: "Wireless mechanical gaming keyboard with Razer Green switches"
  },
  {
    id: 7,
    name: "Logitech G Pro X Superlight",
    price: 1999.99,
    originalPrice: 2499.99,
    image: "/src/assets/products/logitech-mouse.jpg",
    sale: true,
    category: "Mice",
    description: "Ultra-lightweight wireless gaming mouse weighing less than 63 grams"
  },
  {
    id: 8,
    name: "SteelSeries Arctis Pro",
    price: 2499.99,
    image: "/src/assets/products/steelseries-headset.jpg",
    sale: false,
    category: "Headsets",
    description: "High-fidelity gaming headset with dedicated DAC and premium drivers"
  },
  {
    id: 9,
    name: "Secretlab TITAN Evo 2022",
    price: 5499.99,
    originalPrice: 6999.99,
    image: "/src/assets/products/secretlab-chair.jpg",
    sale: true,
    category: "Gaming Chairs",
    description: "Premium gaming chair with 4-way L-ADAPT™ lumbar support"
  },
  {
    id: 10,
    name: "ASUS TUF Gaming VG27AQ",
    price: 6999.99,
    image: "/src/assets/products/tuf-monitor.jpg",
    sale: false,
    category: "Monitors",
    description: "27-inch 1440p gaming monitor with 165Hz refresh rate and ELMB SYNC"
  }
  // Add more products as needed...
];

export const featuredProducts = [
  products[0], // ROG Strix Gaming Chair
  products[1], // ROG Claymore II
  products[4], // ROG Swift Monitor
  products[8]  // Secretlab TITAN
];