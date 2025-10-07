let dots = []; // Array to hold all our dot objects
const numDots = 100; // The number of dots to create
let clusters = []; // Array to hold cluster information
let clusterColors = []; // Array to hold colors for each cluster
let centroids = []; // Store current centroids

// This function runs once when the script first loads.
function setup() {
    // Create a canvas that fills the entire browser window.
    createCanvas(windowWidth, windowHeight);
    // Create 100 dot objects and add them to the 'dots' array.
    for (let i = 0; i < numDots; i++) {
        dots.push(new Dot());
    }
    
    // Initialize cluster colors
    clusterColors = [
        color(255, 100, 100), // Red
        color(100, 255, 100), // Green
        color(100, 100, 255), // Blue
        color(255, 255, 100), // Yellow
        color(255, 100, 255), // Magenta
        color(100, 255, 255), // Cyan
        color(255, 150, 100), // Orange
        color(150, 100, 255)  // Purple
    ];
}

// This function runs continuously after setup() completes
function draw() {
    background(20); // Clear the canvas with a dark background
    
    // Update and display all dots
    for (let dot of dots) {
        dot.update();
        dot.show();
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
        
        // Cluster assignment
        this.clusterId = -1;
        
        // Movement properties
        this.maxSpeed = 2;
        this.maxForce = 0.1;
    }
    
    // Update dot position and movement
    update() {
        // If assigned to a cluster, move towards centroid
        if (this.clusterId >= 0 && this.clusterId < centroids.length) {
            let target = centroids[this.clusterId];
            let desired = p5.Vector.sub(target, this.pos);
            desired.normalize();
            desired.mult(this.maxSpeed);
            
            let steer = p5.Vector.sub(desired, this.vel);
            steer.limit(this.maxForce);
            
            this.vel.add(steer);
        }
        
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        
        // Keep dots within canvas bounds
        if (this.pos.x < 0) this.pos.x = width;
        if (this.pos.x > width) this.pos.x = 0;
        if (this.pos.y < 0) this.pos.y = height;
        if (this.pos.y > height) this.pos.y = 0;
    }
    
    // show() handles drawing the dot.
    show() {
        noStroke(); // No outline on the circle
        
        // Use cluster color if assigned, otherwise white
        if (this.clusterId >= 0 && this.clusterId < clusterColors.length) {
            fill(clusterColors[this.clusterId]);
        } else {
            fill(255);  // Fill with white color
        }
        
        ellipse(this.pos.x, this.pos.y, this.radius * 2); // Draw the circle
    }
}

// Add this function to cluster dots into groups
function clusterDots(k) {
    if (k <= 0 || k > dots.length) return [];
    
    // Initialize centroids randomly
    centroids = [];
    for (let i = 0; i < k; i++) {
        centroids.push(createVector(random(width), random(height)));
    }
    
    let clusters = [];
    let maxIterations = 50;
    
    for (let iter = 0; iter < maxIterations; iter++) {
        // Initialize empty clusters
        clusters = Array.from({ length: k }, () => []);
        
        // Assign each dot to nearest centroid
        for (let dot of dots) {
            let minDist = Infinity;
            let clusterIndex = 0;
            
            for (let i = 0; i < centroids.length; i++) {
                let dist = p5.Vector.dist(dot.pos, centroids[i]);
                if (dist < minDist) {
                    minDist = dist;
                    clusterIndex = i;
                }
            }
            
            // Assign cluster ID to the dot
            dot.clusterId = clusterIndex;
            clusters[clusterIndex].push(dot);
        }
        
        // Update centroids to cluster centers
        let converged = true;
        for (let i = 0; i < k; i++) {
            if (clusters[i].length > 0) {
                let newCentroid = createVector(0, 0);
                for (let dot of clusters[i]) {
                    newCentroid.add(dot.pos);
                }
                newCentroid.div(clusters[i].length);
                
                if (p5.Vector.dist(centroids[i], newCentroid) > 50) {
                    converged = false;
                }
                centroids[i] = newCentroid;
            }
        }
        
        if (converged) break;
    }
    
    return clusters;
}

// Wait for DOM to be ready before accessing elements
document.addEventListener('DOMContentLoaded', function() {
        let clusterButton = document.getElementById('cluster');
        if (clusterButton) {
                clusterButton.addEventListener('click', function() {
                        clusterDots(5);
                        console.log("CLICK")
                });
        }
});