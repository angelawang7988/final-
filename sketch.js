let img;
let shards = [];

function preload() {
  img = loadImage('R.jpg');
}

function setup() {
  // 1. Fit image to screen
  let scaleFactor = 1;
  if (img.width > windowWidth) scaleFactor = windowWidth / img.width;
  if (img.height * scaleFactor > windowHeight) scaleFactor = windowHeight / img.height;
  
  let newW = floor(img.width * scaleFactor);
  let newH = floor(img.height * scaleFactor);
  
  img.resize(newW, newH);
  createCanvas(newW, newH);
  noStroke();

  // 2. Generate shards
  makeShards();
}

function makeShards() {
  shards = [];
  
  let x = 0;
  
  // Settings
  let distortionAmp = width * 0.15; // Moderate distortion
  let noiseScale = 0.005;
  
  while (x < width) {
    // SIZE ADJUSTMENT: 
    // Random(60, 100) creates roughly 8-12 blocks across on a standard screen.
    let w = random(50, 100); 
    if (x + w > width) w = width - x;

    let y = 0;
    while (y < height) {
      let h = random(80, 150); 
      if (y + h > height) h = height - y;

      // --- Distortion Logic ---
      let n = noise(x * noiseScale, y * noiseScale);
      let offsetX = map(n, 0, 1, -distortionAmp, distortionAmp);
      let offsetY = map(n, 0, 1, -distortionAmp, distortionAmp);
      
      // Add randomness so it's not too perfect
      let sx = x + offsetX + random(-15, 15);
      let sy = y + offsetY + random(-15, 15);

      // Stretch/Squash
      let stretch = random(0.8, 1.2); 
      let sw = w * stretch; 
      let sh = h * stretch;

      // Constrain inside image
      sx = constrain(sx, 0, img.width - sw);
      sy = constrain(sy, 0, img.height - sh);

      // --- CREATE THE PIECE ---
      let piece = img.get(sx, sy, sw, sh);
      
      // --- ADD RANDOM BLUR ---
      // 25% chance to blur a block
      if (random() < 0.2) {
        // Amount of blur (2 to 4 radius)
        piece.filter(BLUR, random(2, 3));
      }

      shards.push({
        x: x, 
        y: y, 
        w: w, 
        h: h, 
        img: piece,
        // Tint: Some blocks slightly darker for depth
        tintVal: random(220, 255) 
      });

      y += h;
    }
    x += w;
  }
}

function draw() {
  // Use black background to prevent white lines
  background(0);

  // Mouse Interaction
  // Left (0) = Distorted
  // Right (width) = Original
  let amt = constrain(map(mouseX, 0, width, 0, 1), 0, 1);

  // --- DRAWING STRATEGY FOR NO LINES ---
  
  // 1. Always draw the Distorted Layer first (Solid)
  // We don't fade this out completely until the very end to prevent 
  // background colors from bleeding through the gaps.
  push();
  tint(255); 
  for (let s of shards) {
    // Apply texture tint
    tint(s.tintVal);
    // Draw with +2 pixel overlap to kill gaps/lines
    image(s.img, s.x, s.y, s.w + 2, s.h + 2);
  }
  pop();

  // 2. Draw Original Image on top (Fading In)
  // As mouse moves right, 'amt' goes 0 -> 1
  if (amt > 0.01) {
    push();
    tint(255, 255 * amt); // Fade alpha
    image(img, 0, 0);
    pop();
  }
}

function windowResized() {
  setup();
}