// noprotect
// "Where cognition meets code"
// Drifting neurons that connect when they're close.
// Move your mouse to gently pull them. Click to fire a note.
 
let nodes = [];
let audio; // the browser's built-in sound engine
 
// A pentatonic scale: every note sounds good together
const notes = [60, 62, 64, 67, 69, 72, 74, 76, 79];
 
function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < 55; i++) {
    nodes.push(new Neuron(random(width), random(height)));
  }
}
 
function draw() {
  // A slightly see-through background leaves soft trails
  background(13, 17, 23, 60);
 
  // Draw a connection between any two neurons that are close
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      let d = dist(nodes[i].pos.x, nodes[i].pos.y, nodes[j].pos.x, nodes[j].pos.y);
      if (d < 120) {
        let glow = max(nodes[i].glow, nodes[j].glow);
        stroke(140, 120 + glow / 2, 255, map(d, 0, 120, 150, 0) + glow / 3);
        strokeWeight(1);
        line(nodes[i].pos.x, nodes[i].pos.y, nodes[j].pos.x, nodes[j].pos.y);
      }
    }
  }
 
  for (let n of nodes) {
    n.update();
    n.show();
  }
 
  // Tagline
  noStroke();
  fill(230, 237, 243, 120);
  textAlign(CENTER);
  textSize(14);
  text("where cognition meets code  ·  move and click", width / 2, height - 24);
}
 
function mousePressed() {
  // Browsers require a click before sound can play
  if (!audio) {
    audio = new AudioContext();
  }
 
  // Left side of the screen plays low notes, right side plays high ones
  let index = floor(map(mouseX, 0, width, 0, notes.length));
  index = constrain(index, 0, notes.length - 1);
  playNote(notes[index]);
 
  // Light up the neurons near the click
  for (let n of nodes) {
    if (dist(mouseX, mouseY, n.pos.x, n.pos.y) < 150) {
      n.glow = 255;
    }
  }
}
 
// Turn a note number into a pitch, then play a short, soft tone
function playNote(note) {
  let freq = 440 * pow(2, (note - 69) / 12);
  let now = audio.currentTime;
 
  let osc = audio.createOscillator();
  let volume = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
 
  // Fade in quickly, then fade out slowly
  volume.gain.setValueAtTime(0, now);
  volume.gain.linearRampToValueAtTime(0.3, now + 0.02);
  volume.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
 
  osc.connect(volume);
  volume.connect(audio.destination);
  osc.start(now);
  osc.stop(now + 1.3);
}
 
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
 
class Neuron {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.3, 1));
    this.glow = 0;
  }
 
  update() {
    // Gently pull toward the mouse when it's nearby
    let mouse = createVector(mouseX, mouseY);
    if (p5.Vector.dist(this.pos, mouse) < 150) {
      this.vel.add(p5.Vector.sub(mouse, this.pos).setMag(0.05));
    }
    this.vel.limit(2);
    this.pos.add(this.vel);
 
    // Wrap around the edges of the screen
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
 
    // Glow fades over time
    this.glow *= 0.95;
  }
 
  show() {
    noStroke();
    fill(120 + this.glow / 2, 180, 255, 200);
    circle(this.pos.x, this.pos.y, 5 + this.glow / 40);
  }
}