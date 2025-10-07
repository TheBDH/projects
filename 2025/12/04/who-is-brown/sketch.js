let dots = []; // Array to hold all our dot objects
const numDots = 100; // The number of dots to create

// This function runs once when the script first loads.
function setup() {
  // Create a canvas that fills the entire browser window.
  createCanvas(windowWidth, windowHeight);

  // Create 100 dot objects and add them to the 'dots' array.
  for (let i = 0; i < numDots; i++) {
    dots.push(new Dot());
  }
}

// This function runs in a continuous loop, drawing each frame.
function draw() {
  // Set a dark background color for each frame.
  background(51); 

  // Loop through every dot in the array.
  for (let dot of dots) {
    dot.update(); // Update its position
    dot.show();   // Draw it on the canvas
  }
}

// This is a "class" that defines what a Dot is and what it can do.
class Dot {
  constructor() {
    // Give each dot a random starting position.
    this.pos = createVector(random(width), random(height));
    
    // Give each dot a random velocity (direction and speed).
    this.vel = createVector(random(-1.5, 1.5), random(-1.5, 1.5));
    
    // Set a fixed radius for the dots.
    this.radius = 5;
  }

  // update() handles the movement and bouncing logic.
  update() {
    // Add velocity to the position to make the dot move.
    this.pos.add(this.vel);

    // Bounce off the horizontal walls.
    if (this.pos.x < this.radius || this.pos.x > width - this.radius) {
      this.vel.x *= -1;
    }
    // Bounce off the vertical walls.
    if (this.pos.y < this.radius || this.pos.y > height - this.radius) {
      this.vel.y *= -1;
    }
  }

  // show() handles drawing the dot.
  show() {
    noStroke(); // No outline on the circle
    fill(255);  // Fill with white color
    ellipse(this.pos.x, this.pos.y, this.radius * 2); // Draw the circle
  }
}

// This function makes the canvas responsive if the browser window is resized.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}