// Brown Community Visualization
// Main visualization logic


// ============================================
// Performance Configuration
// ============================================

let renderTimer = null;

// Reduce animation durations for snappier feel
const ANIM_FAST = 400;    // Quick transitions (was 600-800)
const ANIM_MEDIUM = 600;  // Standard transitions (was 800-1000)
const ANIM_SLOW = 800;    // Complex transitions (was 1200)

// Each dot represents this many people (1 = one dot per person, 2 = half as many dots, etc.)
// Increase this number to improve performance on slower devices
const PEOPLE_PER_DOT = 5;

// Dot radius in pixels (increase for larger dots)
const DOT_RADIUS = 4;

// Cluster spread multiplier - controls how spread out dots are within clusters
// Higher = more spread out, Lower = more compact (default is 2.5)
const CLUSTER_SPREAD = 4;

// Helper to scale counts by PEOPLE_PER_DOT
function scaledCount(count) {
  return Math.max(1, Math.round(count / PEOPLE_PER_DOT));
}


// ============================================
// State Management
// ============================================


const state = {
  currentScene: 'scene0', // scene0, scene1, scene2A, scene2A1, scene2A2
  dots: [],
  width: window.innerWidth,
  height: window.innerHeight,
  animating: false
};


// ============================================
// Utility Functions
// ============================================


// Pre-compute random values for better performance
const TWO_PI = 2 * Math.PI;

// Generate random position within a circle
function randomInCircle(cx, cy, radius) {
  const angle = Math.random() * TWO_PI;
  const r = Math.random() * radius;
  return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
}

// Calculate cluster radius based on count
function calcClusterRadius(count, multiplier = 2.5) {
  return Math.sqrt(count) * multiplier;
}

// Generate positions for a single centered cluster
function getSingleClusterPositions(count, cx = state.width / 2, cy = state.height / 2) {
  const positions = [];
  const clusterRadius = calcClusterRadius(count);
  for (let i = 0; i < count; i++) {
    positions.push(randomInCircle(cx, cy, clusterRadius));
  }
  return positions;
}

// Create legend HTML from items array
function createLegendHTML(items) {
  return items.map(({ color, label, style = '', opacity = '', border = '' }) => `
    <div class="legend-item"${style ? ' style="' + style + '"' : ''}>
      <div class="legend-dot" style="background: ${color};${opacity ? ' opacity: ' + opacity + ';' : ''}${border ? ' border: ' + border + ';' : ''}"></div>
      <span>${label}</span>
    </div>
  `).join('');
}

// Default legend for all three groups
const defaultLegendItems = [
  { color: colors.students, label: 'Students' },
  { color: colors.faculty, label: 'Faculty' },
  { color: colors.staff, label: 'Staff' }
];

// Clear labels helper
function clearLabels() {
  labelsGroup.selectAll('.cluster-label, .cluster-count').interrupt().remove();
}

// Show/hide element helpers
function hideElement(el) {
  el.style.opacity = '0';
  el.style.pointerEvents = 'none';
}

function showElement(el) {
  el.style.opacity = '1';
  el.style.pointerEvents = 'auto';
}

// Initialize slider to visible state
function showSlider() {
  sliderContainer.classList.add('visible');
  clusterSlider.value = 0;
  currentSliderState = 'single';
}

// Create popup bar stat HTML
function createBarStat(label, value, percent, color, opacity = 1) {
  return `
    <div class="popup-stat">
      <div class="popup-stat-label">${label}: ${value} (${percent}%)</div>
      <div class="popup-bar"><div class="popup-bar-fill" style="width: ${percent}%; background: ${color}; opacity: ${opacity};"></div></div>
    </div>`;
}

// Recreate dots with fade-in animation
// opacityFn: either a number (e.g. 0.9) or a function (e.g. d => d.opacity)
function recreateDots(duration = 800, opacityFn = 0.9) {
  const selection = dotsGroup.selectAll('circle')
    .data(state.dots)
    .join('circle') 
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', DOT_RADIUS)
    .attr('fill', d => d.color);
    // .attr('opacity', 0); // Be careful with this line

  // Adjust transition logic slightly so we don't flash invisible
  if (duration > 0) {
    selection.transition()
      .duration(duration)
      .attr('opacity', opacityFn);
  } else {
    selection.attr('opacity', opacityFn);
  }
}


// ============================================
// Interaction Lock (disable hover/click during animations)
// ============================================


function lockInteractions() {
  // Disable pointer events on all interactive elements
  //document.body.classList.add('interactions-locked');
  svg.selectAll('.cluster-hover-area').style('pointer-events', 'none');
  dotsGroup.style('pointer-events', 'none');
}


function unlockInteractions() {
  // Re-enable pointer events
  //document.body.classList.remove('interactions-locked');
  svg.selectAll('.cluster-hover-area').style('pointer-events', 'auto');
  dotsGroup.style('pointer-events', 'auto');
}


// ============================================
// SVG Setup
// ============================================


const svg = d3.select('#main-svg');
const backgroundCirclesGroup = svg.append('g').attr('id', 'background-circles-group');
const dotsGroup = svg.append('g').attr('id', 'dots-group');
const labelsGroup = svg.append('g').attr('id', 'labels-group');


// ============================================
// UI Elements
// ============================================


const titleOverlay = document.getElementById('title-overlay');
const legend = document.getElementById('legend');
const backButton = document.getElementById('back-button');
const backToArticle = document.getElementById('back-to-article');
const buttonContainer = document.getElementById('button-container');
const facultyButtonContainer = document.getElementById('faculty-button-container');
const sliderContainer = document.getElementById('slider-container');
const clusterSlider = document.getElementById('cluster-slider');
const clickInstruction = document.getElementById('click-instruction');
const popupOverlay = document.getElementById('popup-overlay');
const popupModal = document.getElementById('popup-modal');
const popupClose = document.getElementById('popup-close');


// ============================================
// Dot Generation with Degree Type Support
// ============================================


function generateDotsWithDegreeTypes(concentrations) {
  // Generate dots for seniors with Bachelor's and Master's differentiation
  const dots = [];


  concentrations.forEach(conc => {
    // Add bachelor's dots (scaled)
    for (let i = 0; i < scaledCount(conc.bachelors); i++) {
      dots.push({
        x: state.width / 2,
        y: state.height / 2,
        targetX: state.width / 2,
        targetY: state.height / 2,
        color: colors.bachelors,
        degreeType: 'bachelors',
        concentrationName: conc.name,
        metadata: {
          bachelors: conc.bachelors,
          masters: conc.masters,
          topCombinations: conc.topCombinations
        }
      });
    }


    // Add master's dots (scaled)
    for (let i = 0; i < scaledCount(conc.masters); i++) {
      dots.push({
        x: state.width / 2,
        y: state.height / 2,
        targetX: state.width / 2,
        targetY: state.height / 2,
        color: colors.masters,
        degreeType: 'masters',
        concentrationName: conc.name,
        metadata: {
          bachelors: conc.bachelors,
          masters: conc.masters,
          topCombinations: conc.topCombinations
        }
      });
    }
  });


  return dots;
}


function generateDots(config, shuffle = false) {
  const dots = [];

  // If shuffling, calculate total count and use shared radius for all dots
  // This ensures dots are truly mixed spatially, not just in render order
  if (shuffle && config.clusters.length > 0) {
    const totalCount = config.clusters.reduce((sum, c) => sum + scaledCount(c.count), 0);
    const sharedRadius = Math.sqrt(totalCount) * CLUSTER_SPREAD;
    const centerX = config.clusters[0].x;
    const centerY = config.clusters[0].y;

    config.clusters.forEach(cluster => {
      for (let i = 0; i < scaledCount(cluster.count); i++) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * sharedRadius;

        dots.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          targetX: centerX + Math.cos(angle) * radius,
          targetY: centerY + Math.sin(angle) * radius,
          color: cluster.color,
          clusterName: cluster.name,
          metadata: cluster.metadata || {}
        });
      }
    });

    // Shuffle dots to mix render order
    for (let i = dots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dots[i], dots[j]] = [dots[j], dots[i]];
    }
  } else {
    // Original behavior - each cluster has its own radius
    config.clusters.forEach(cluster => {
      const clusterRadius = Math.sqrt(scaledCount(cluster.count)) * CLUSTER_SPREAD;

      for (let i = 0; i < scaledCount(cluster.count); i++) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * clusterRadius;

        dots.push({
          x: cluster.x + Math.cos(angle) * radius,
          y: cluster.y + Math.sin(angle) * radius,
          targetX: cluster.x + Math.cos(angle) * radius,
          targetY: cluster.y + Math.sin(angle) * radius,
          color: cluster.color,
          clusterName: cluster.name,
          metadata: cluster.metadata || {}
        });
      }
    });
  }

  return dots;
}


// ============================================
// Scene Configurations
// ============================================


function getScene0Config() {
  return {
    clusters: [
      {
        x: state.width / 2,
        y: state.height * 0.55, // Lower to avoid title overlap
        count: brownData.students.total,
        color: colors.students,
        name: 'Students'
      },
      {
        x: state.width / 2,
        y: state.height * 0.55,
        count: brownData.faculty.total,
        color: colors.faculty,
        name: 'Faculty'
      },
      {
        x: state.width / 2,
        y: state.height * 0.55,
        count: brownData.staff.total,
        color: colors.staff,
        name: 'Staff'
      }
    ]
  };
}


function getScene1Config() {
  return {
    clusters: [
      {
        x: state.width * 0.25,
        y: state.height / 2,
        count: brownData.students.total,
        color: colors.students,
        name: 'Students',
        label: `Students\n${brownData.students.total.toLocaleString()}`
      },
      {
        x: state.width * 0.5,
        y: state.height / 2,
        count: brownData.faculty.total,
        color: colors.faculty,
        name: 'Faculty',
        label: `Faculty\n${brownData.faculty.total.toLocaleString()}`
      },
      {
        x: state.width * 0.75,
        y: state.height / 2,
        count: brownData.staff.total,
        color: colors.staff,
        name: 'Staff',
        label: `Staff\n${brownData.staff.total.toLocaleString()}`
      }
    ]
  };
}


function getScene2AConfig() {
  return {
    clusters: [
      {
        x: state.width / 2,
        y: state.height / 2,
        count: brownData.students.total,
        color: colors.students,
        name: 'Students',
        label: `Brown Students 2024\n~${brownData.students.total.toLocaleString()} students`
      }
    ]
  };
}


function getScene2BConfig() {
  return {
    clusters: [
      {
        x: state.width / 2,
        y: state.height / 2,
        count: brownData.faculty.total,
        color: colors.faculty,
        name: 'Faculty',
        label: `Brown Faculty 2024\n${brownData.faculty.total.toLocaleString()} faculty`
      }
    ]
  };
}


function getScene2CConfig() {
  return {
    clusters: [
      {
        x: state.width / 2,
        y: state.height / 2,
        count: brownData.staff.total,
        color: colors.staff,
        name: 'Staff',
        label: `Brown Staff 2024\n${brownData.staff.total.toLocaleString()} staff`
      }
    ]
  };
}


function getSeniorDotPositionsSingle() {
  return getSingleClusterPositions(state.dots.length);
}


function getSeniorDotPositionsClustered() {
  // Calculate positions for concentration clusters
  const concentrations = brownData.students.seniorsByConcentration;
  const numConcentrations = concentrations.length;


  const cols = 5;
  const rows = Math.ceil(numConcentrations / cols);
  const marginX = state.width * 0.14;
  const marginY = state.height * 0.2;
  const spacingX = (state.width - 2 * marginX) / (cols - 1);
  const spacingY = (state.height - 2 * marginY) / (rows - 1);


  const positions = [];
  const clusterInfo = [];


  concentrations.forEach((conc, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const centerX = marginX + col * spacingX;
    const centerY = marginY + row * spacingY;


    const totalInConc = conc.bachelors + conc.masters;
    // Count actual dots for this concentration from state.dots
    const actualDotCount = state.dots.filter(d => d.concentrationName === conc.name).length;
    const clusterRadius = Math.sqrt(actualDotCount) * CLUSTER_SPREAD;


    clusterInfo.push({
      name: conc.name,
      fullName: conc.fullName || conc.name,
      x: centerX,
      y: centerY,
      count: totalInConc,
      bachelors: conc.bachelors,
      masters: conc.masters
    });


    for (let j = 0; j < actualDotCount; j++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * clusterRadius;


      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        concentrationName: conc.name
      });
    }
  });


  return { positions, clusterInfo };
}


// ============================================
// Scene Rendering
// ============================================


function renderScene(config, options = {}) {
  if (state.animating) return;
  state.animating = true;
  lockInteractions();


  const { duration = ANIM_SLOW, showLabels = false, onComplete } = options;


  // For single cluster, position all dots to that cluster
  // For multiple clusters, distribute dots proportionally
  if (config.clusters.length === 1) {
    const cluster = config.clusters[0];
    const count = state.dots.length;
    const clusterRadius = Math.sqrt(count) * CLUSTER_SPREAD;

    state.dots.forEach(dot => {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * clusterRadius;
      dot.targetX = cluster.x + Math.cos(angle) * radius;
      dot.targetY = cluster.y + Math.sin(angle) * radius;
      dot.color = cluster.color;
      dot.clusterName = cluster.name;
      dot.metadata = cluster.metadata || {};
    });
  } else {
    // Multiple clusters - distribute proportionally based on actual dot counts
    let dotIndex = 0;
    config.clusters.forEach(cluster => {

      // FIX 1: Scale the radius so dots aren't too sparse
      const scaledC = scaledCount(cluster.count);
      const clusterRadius = Math.sqrt(scaledC) * CLUSTER_SPREAD;

      // FIX 2: Loop based on the SCALED count, not the raw count
      for (let i = 0; i < scaledC && dotIndex < state.dots.length; i++) {

        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * clusterRadius;

        state.dots[dotIndex].targetX = cluster.x + Math.cos(angle) * radius;
        state.dots[dotIndex].targetY = cluster.y + Math.sin(angle) * radius;
        state.dots[dotIndex].color = cluster.color;
        state.dots[dotIndex].clusterName = cluster.name;
        state.dots[dotIndex].metadata = cluster.metadata || {};

        dotIndex++;
      }
    });
  }


  // Animate dots - use timeout instead of on('end') for each element (much faster)
  dotsGroup.selectAll('circle')
    .data(state.dots)
    .transition()
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .attr('cx', d => d.targetX)
    .attr('cy', d => d.targetY)
    .attr('fill', d => d.color)
    .attr('opacity', 0.9);

  if (renderTimer) clearTimeout(renderTimer);

  // Handle completion with single timeout instead of per-element callbacks
  renderTimer = setTimeout(() => {
    state.dots.forEach(dot => {
      dot.x = dot.targetX;
      dot.y = dot.targetY;
    });
    state.animating = false;
    if (showLabels) {
      setTimeout(() => {
        unlockInteractions();
        if (onComplete) onComplete();
      }, 200);
    } else {
      unlockInteractions();
      if (onComplete) onComplete();
    }
  }, duration);


  // Update labels
  if (showLabels) {
    renderLabels(config.clusters);
  } else {
    clearLabels();
  }
}


function renderSeniorScene(positions, options = {}) {
  if (state.animating) return;
  state.animating = true;
  lockInteractions();


  const { duration = ANIM_SLOW, showLabels = false, clusterInfo = [], onComplete } = options;


  // Update each dot's target position
  state.dots.forEach((dot, i) => {
    if (i < positions.length) {
      dot.targetX = positions[i].x;
      dot.targetY = positions[i].y;
      if (positions[i].concentrationName) {
        dot.concentrationName = positions[i].concentrationName;
      }
    }
  });


  // Animate dots - use timeout instead of per-element callbacks
  dotsGroup.selectAll('circle')
    .data(state.dots)
    .transition()
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .attr('cx', d => d.targetX)
    .attr('cy', d => d.targetY)
    .attr('opacity', 0.9);

  // Handle completion with single timeout
  if (renderTimer) clearTimeout(renderTimer);

  renderTimer = setTimeout(() => {
    state.dots.forEach(dot => {
      dot.x = dot.targetX;
      dot.y = dot.targetY;
    });
    state.animating = false;
    if (showLabels) {
      setTimeout(() => {
        unlockInteractions();
        if (onComplete) onComplete();
      }, 200);
    } else {
      unlockInteractions();
      if (onComplete) onComplete();
    }
  }, duration);


  // Update labels for clustered view
  if (showLabels && clusterInfo.length > 0) {
    renderConcentrationLabels(clusterInfo);
  } else if (showLabels) {
    // Single cluster label
    const totalSeniors = brownData.students.seniorsByConcentration.reduce(
      (sum, c) => sum + c.bachelors + c.masters, 0
    );
    renderSingleLabel('Class of 2024 (Bachelors and Masters)', `${totalSeniors.toLocaleString()} students`);
  } else {
    clearLabels();
  }
}


function renderLabels(clusters, duration = 300) {
  clearLabels();

  // Add new labels
  clusters.forEach(cluster => {
    if (!cluster.label) return;

    const lines = cluster.label.split('\n');
    const radius = Math.sqrt(scaledCount(cluster.count)) * CLUSTER_SPREAD;

    labelsGroup.append('text')
      .attr('class', 'cluster-label')
      .attr('x', cluster.x)
      .attr('y', cluster.y - radius - 30)
      .text(lines[0])
      .style('opacity', 0)
      .transition()
      .duration(duration)
      .style('opacity', 1);

    if (lines[1]) {
      labelsGroup.append('text')
        .attr('class', 'cluster-count')
        .attr('x', cluster.x)
        .attr('y', cluster.y - radius - 10)
        .text(lines[1])
        .style('opacity', 0)
        .transition()
        .duration(duration)
        .style('opacity', 1);
    }
  });
}


function renderSingleLabel(title, subtitle, duration = 300) {
  clearLabels();

  const radius = Math.sqrt(state.dots.length) * CLUSTER_SPREAD;

  labelsGroup.append('text')
    .attr('class', 'cluster-label')
    .attr('x', state.width / 2)
    .attr('y', state.height / 2 - radius - 30)
    .text(title)
    .style('opacity', 0)
    .transition()
    .duration(duration)
    .style('opacity', 1);

  labelsGroup.append('text')
    .attr('class', 'cluster-count')
    .attr('x', state.width / 2)
    .attr('y', state.height / 2 - radius - 10)
    .text(subtitle)
    .style('opacity', 0)
    .transition()
    .duration(duration)
    .style('opacity', 1);
}


// Unified cluster label renderer
function renderClusterLabels(clusterInfo, options = {}) {
  const { duration = 300, yOffset = 20, getSubtitle } = options;
  clearLabels();

  clusterInfo.forEach(cluster => {
    const radius = Math.sqrt(scaledCount(cluster.count)) * CLUSTER_SPREAD;

    labelsGroup.append('text')
      .attr('class', 'cluster-label')
      .attr('x', cluster.x)
      .attr('y', cluster.y - radius - yOffset)
      .text(cluster.name)
      .style('opacity', 0)
      .transition()
      .duration(duration)
      .style('opacity', 1);

    if (getSubtitle) {
      labelsGroup.append('text')
        .attr('class', 'cluster-count')
        .attr('x', cluster.x)
        .attr('y', cluster.y - radius - yOffset + 15)
        .text(getSubtitle(cluster))
        .style('opacity', 0)
        .transition()
        .duration(duration)
        .style('opacity', 1);
    }
  });
}

function renderConcentrationLabels(clusterInfo, duration = 300) {
  renderClusterLabels(clusterInfo, { duration, yOffset: 20 });
}


// ============================================
// Scene Transitions
// ============================================


function transitionToScene0() {
  if (state.animating) return;
  state.currentScene = 'scene0';
  lockInteractions();

  svg.selectAll('.cluster-hover-area').remove();

  titleOverlay.style.opacity = '1';
  legend.classList.add('visible');
  backButton.classList.remove('visible');
  if (backToArticle) backToArticle.style.display = 'block';
  hideElement(buttonContainer);
  sliderContainer.classList.remove('visible');
  clickInstruction.classList.remove('visible');
  
  const totalCount = state.dots.length;
  const sharedRadius = Math.sqrt(totalCount) * CLUSTER_SPREAD;
  const centerX = state.width / 2;
  const centerY = state.height * 0.55;

  state.dots.forEach(dot => {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * sharedRadius;
    dot.targetX = centerX + Math.cos(angle) * radius;
    dot.targetY = centerY + Math.sin(angle) * radius;
  });

  dotsGroup.selectAll('circle')
    .data(state.dots)
    .transition()
    .duration(ANIM_SLOW)
    .ease(d3.easeCubicInOut)
    .attr('cx', d => d.targetX)
    .attr('cy', d => d.targetY)
    .attr('opacity', 0.9);

  if (renderTimer) clearTimeout(renderTimer);
  
  renderTimer = setTimeout(() => {
    state.dots.forEach(d => { 
      d.x = d.targetX; 
      d.y = d.targetY; 
    });
    state.animating = false;
    unlockInteractions();
  }, ANIM_SLOW);

  clearLabels();
}


function transitionToScene1() {
  state.animating = false;
  dotsGroup.selectAll('*').interrupt();
  if (renderTimer) clearTimeout(renderTimer);
  state.currentScene = 'scene1';
  lockInteractions();


  // Hide title overlay
  titleOverlay.style.opacity = '0';

  // Hide back button (in case coming back from a sub-scene)
  backButton.classList.remove('visible');
  if (backToArticle) backToArticle.style.display = 'block';

  clickInstruction.classList.add('visible');



  const config = getScene1Config();
  renderScene(config, {
    duration: ANIM_SLOW,
    showLabels: true,
    onComplete: () => {
      // Make clusters clickable
      enableClusterClicking(config.clusters);
    }
  });
}


function transitionToScene2A() {
  state.animating = false;
  dotsGroup.selectAll('*').interrupt();
  if (renderTimer) clearTimeout(renderTimer);
  state.currentScene = 'scene2A';
  lockInteractions();

  clickInstruction.classList.remove('visible');

  // Remove hover areas from previous scene
  svg.selectAll('.cluster-hover-area').remove();

  // Clear labels from previous scene
  clearLabels();

  // Hide click instruction
  clickInstruction.classList.remove('visible');


  // Show back button, hide back-to-article
  backButton.classList.add('visible');
  if (backToArticle) backToArticle.style.display = 'none';
  backButton.onclick = () => {
    // Hide slider when going back
    sliderContainer.classList.remove('visible');

    // Hide buttons
    hideElement(buttonContainer);

    // Clear background circles (from gender view)
    backgroundCirclesGroup.selectAll('*').remove();


    // Regenerate all dots when going back
    const config = getScene0Config();
    state.dots = generateDots(config);

    recreateDots(0, 0.9);

    // Reset legend to show all three roles
    legend.innerHTML = `
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.students};"></div>
       <span>Students</span>
     </div>
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.faculty};"></div>
       <span>Faculty</span>
     </div>
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.staff};"></div>
       <span>Staff</span>
     </div>
   `;


    transitionToScene1();
  };


  // Update legend to show only students
  legend.innerHTML = createLegendHTML([{ color: colors.students, label: 'Students' }]);


  // Keep only student dots, remove faculty and staff (filter by clusterName since dots may be shuffled)
  state.dots = state.dots.filter(d => d.clusterName === 'Students');


  // Remove excess circles from DOM
  dotsGroup.selectAll('circle')
    .data(state.dots)
    .exit()
    .transition()
    .duration(ANIM_FAST)
    .attr('opacity', 0)
    .remove();

  showElement(buttonContainer);

  renderScene(getScene2AConfig(), {
    duration: ANIM_FAST,
    showLabels: false
  });
}


function transitionToScene2A1() {
  if (state.animating) return;
  state.currentScene = 'scene2A1';
  lockInteractions();

  hideElement(buttonContainer);

  // Update legend for degree levels
  legend.innerHTML = `
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.bachelors};"></div>
     <span>Bachelor's</span>
   </div>
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.masters};"></div>
     <span>Master's</span>
   </div>
 `;


  // Update slider label
  document.getElementById('slider-label').textContent = 'Cluster by Concentration →';


  // Regenerate dots with Bachelor's/Master's colors for seniors only
  state.dots = generateDotsWithDegreeTypes(brownData.students.seniorsByConcentration);

  recreateDots(800, 0.9);

  // Position dots in single cluster
  const positions = getSeniorDotPositionsSingle();
  renderSeniorScene(positions, {
    duration: ANIM_MEDIUM,
    showLabels: true,
    onComplete: () => {
      showSlider();
    }
  });
}


// ============================================
// Scene 2A-2: Gender View
// ============================================


function generateDotsWithGenderTypes() {
  // Generate dots for Class of 2028 with gender differentiation
  const dots = [];
  const genderData = brownData.students.byGender;
  const genders = ['men', 'women', 'nonBinary'];


  // Process each gender in order
  genders.forEach(genderKey => {
    const data = genderData[genderKey];
    const color = colors[genderKey];


    // Use enrolled and admitted directly from data
    const enrolled = data.enrolled;
    const admitted = data.admitted;
    const notEnrolled = admitted - enrolled;


    // Add enrolled students (solid dots) - scaled
    for (let i = 0; i < scaledCount(enrolled); i++) {
      dots.push({
        x: state.width / 2,
        y: state.height / 2,
        targetX: state.width / 2,
        targetY: state.height / 2,
        color: color,
        opacity: 0.9,
        genderType: genderKey,
        enrolled: true,
        metadata: {
          ...data,
          genderName: genderKey === 'nonBinary' ? 'Non-binary' : genderKey.charAt(0).toUpperCase() + genderKey.slice(1)
        }
      });
    }


    // Add SAMPLED admitted but not enrolled students (shadow/muted dots)
    // Sample 30% of non-enrolled for performance (but show all if small number)
    const sampleSize = notEnrolled <= 10 ? notEnrolled : Math.round(notEnrolled * 0.3);
    for (let i = 0; i < scaledCount(sampleSize); i++) {
      dots.push({
        x: state.width / 2,
        y: state.height / 2,
        targetX: state.width / 2,
        targetY: state.height / 2,
        color: '#999', // Grey for non-enrolled
        opacity: 0.25,
        genderType: genderKey,
        enrolled: false,
        metadata: {
          ...data,
          genderName: genderKey === 'nonBinary' ? 'Non-binary' : genderKey.charAt(0).toUpperCase() + genderKey.slice(1)
        }
      });
    }
  });


  return dots;
}


function getGenderDotPositionsSingle() {
  return getSingleClusterPositions(state.dots.length);
}


function getGenderDotPositionsClustered() {
  // Calculate positions for 3 gender clusters (Class of 2028)
  const genderData = brownData.students.byGender;
  const genders = ['men', 'women', 'nonBinary'];


  const positions = [];
  const clusterInfo = [];

  // Count actual dots per gender and enrolled status from state.dots
  const dotCounts = {};
  state.dots.forEach(dot => {
    const key = `${dot.genderType}-${dot.enrolled}`;
    dotCounts[key] = (dotCounts[key] || 0) + 1;
  });

  genders.forEach((genderKey, idx) => {
    const data = genderData[genderKey];


    // Use data directly
    const enrolled = data.enrolled;
    const admitted = data.admitted;
    const applicants = data.applicants;

    // Get actual dot counts
    const actualEnrolled = dotCounts[`${genderKey}-true`] || 0;
    const actualSample = dotCounts[`${genderKey}-false`] || 0;
    const actualTotal = actualEnrolled + actualSample;


    // Position clusters horizontally - men and women spread apart, non-binary to the right
    // Men at 0.18, Women at 0.52, Non-binary at 0.82
    const xPositions = [0.18, 0.52, 0.82];
    const x = state.width * xPositions[idx];
    const y = state.height / 2;


    // SMALLER clusters to leave room for background circle
    const clusterRadius = Math.sqrt(actualTotal) * (CLUSTER_SPREAD * 0.48);


    // Calculate background circle radius based on total applicants
    const backgroundRadius = Math.sqrt(applicants) * (CLUSTER_SPREAD * 0.48);


    clusterInfo.push({
      name: genderKey === 'nonBinary' ? 'Non-binary' : genderKey.charAt(0).toUpperCase() + genderKey.slice(1),
      genderKey: genderKey,
      x: x,
      y: y,
      count: actualTotal,
      enrolled: enrolled,
      admitted: admitted,
      applicants: applicants,
      acceptanceRate: data.acceptanceRate,
      yieldRate: data.yieldRate,
      clusterRadius: clusterRadius,
      backgroundRadius: backgroundRadius
    });


    // Generate positions for ENROLLED dots (solid, colored)
    for (let j = 0; j < actualEnrolled; j++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * clusterRadius;


      positions.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        genderType: genderKey
      });
    }


    // Generate positions for SAMPLED non-enrolled dots (grey, faded)
    for (let j = 0; j < actualSample; j++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * clusterRadius;


      positions.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        genderType: genderKey
      });
    }
  });


  return { positions, clusterInfo };
}


function renderBackgroundCircles(clusterInfo, options = {}) {
  // Render large grey blob shapes with dotted borders representing total applicant pool
  const { duration = ANIM_SLOW, show = true } = options;


  if (!show) {
    // Fade out and remove background blobs and labels
    backgroundCirclesGroup.selectAll('circle, text')
      .transition()
      .duration(duration)
      .attr('opacity', 0)
      .remove();
    return;
  }


  // Remove existing background elements
  backgroundCirclesGroup.selectAll('circle, text').remove();


  // Draw background blobs for each cluster
  clusterInfo.forEach(cluster => {
    // Calculate blob radius based on applicants
    const blobRadius = cluster.backgroundRadius * 1.3;


    // Add the blob circle with dotted stroke
    backgroundCirclesGroup.append('circle')
      .attr('cx', cluster.x)
      .attr('cy', cluster.y)
      .attr('r', 0)
      .attr('fill', '#f0f0f0')
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '8,4')
      .attr('opacity', 0)
      .transition()
      .duration(duration)
      .attr('r', blobRadius)
      .attr('opacity', 0.4);


    // Add label for the blob
    backgroundCirclesGroup.append('text')
      .attr('x', cluster.x)
      .attr('y', cluster.y + blobRadius + 25)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .attr('fill', '#666')
      .attr('opacity', 0)
      .text(`${cluster.applicants.toLocaleString()} applicants (not admitted)`)
      .transition()
      .duration(duration)
      .attr('opacity', 1);
  });
}


function renderGenderScene(positions, options = {}) {
  if (state.animating) return;
  state.animating = true;
  lockInteractions();


  const { duration = ANIM_SLOW, showLabels = false, clusterInfo = [], onComplete } = options;


  // Update each dot's target position
  state.dots.forEach((dot, i) => {
    if (i < positions.length) {
      dot.targetX = positions[i].x;
      dot.targetY = positions[i].y;
      if (positions[i].genderType) {
        dot.genderType = positions[i].genderType;
      }
    }
  });


  // Animate dots - use timeout instead of per-element callbacks
  dotsGroup.selectAll('circle')
    .data(state.dots)
    .transition()
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .attr('cx', d => d.targetX)
    .attr('cy', d => d.targetY)
    .attr('opacity', d => d.opacity);

  // Handle completion with single timeout
  if (renderTimer) clearTimeout(renderTimer);

  renderTimer = setTimeout(() => {
    state.dots.forEach(dot => {
      dot.x = dot.targetX;
      dot.y = dot.targetY;
    });
    state.animating = false;
    if (showLabels) {
      setTimeout(() => {
        unlockInteractions();
        if (onComplete) onComplete();
      }, 200);
    } else {
      unlockInteractions();
      if (onComplete) onComplete();
    }
  }, duration);


  // Update labels
  if (showLabels && clusterInfo.length > 0) {
    renderGenderLabels(clusterInfo);
  } else if (showLabels) {
    // Calculate total enrolled students (Class of 2028)
    const totalEnrolled = brownData.students.byGender.men.enrolled +
      brownData.students.byGender.women.enrolled +
      brownData.students.byGender.nonBinary.enrolled;
    renderSingleLabel('Class of 2028 (Undergrads) by Gender', `${totalEnrolled.toLocaleString()} students enrolled`);
  } else {
    clearLabels();
  }
}


function renderGenderLabels(clusterInfo, duration = 300) {
  renderClusterLabels(clusterInfo, { duration, yOffset: 30, getSubtitle: c => `${c.enrolled.toLocaleString()} enrolled` });
}


// ============================================
// Faculty Dot Generation Functions
// ============================================


function generateFacultyDotsForDepartment() {
  // Generate dots for faculty - all same color (faculty orange)
  const dots = [];
  const departments = brownData.faculty.byDepartment;

  departments.forEach(dept => {
    for (let i = 0; i < scaledCount(dept.count); i++) {
      dots.push({
        x: state.width / 2,
        y: state.height / 2,
        targetX: state.width / 2,
        targetY: state.height / 2,
        color: colors.faculty,
        departmentName: dept.name,
        metadata: {
          count: dept.count
        }
      });
    }
  });

  return dots;
}


function generateFacultyDotsWithGender() {
  // Generate dots for faculty colored by gender, organized by rank
  const dots = [];
  const rankData = brownData.faculty.byRank;

  rankData.forEach((rank, idx) => {
    // Add men dots (scaled)
    for (let i = 0; i < scaledCount(rank.men); i++) {
      dots.push({
        x: state.width / 2,
        y: state.height / 2,
        targetX: state.width / 2,
        targetY: state.height / 2,
        color: colors.men,
        genderType: 'men',
        rankIndex: idx,
        rankName: rank.name,
        metadata: {
          total: rank.men + rank.women,
          men: rank.men,
          women: rank.women
        }
      });
    }

    // Add women dots (scaled)
    for (let i = 0; i < scaledCount(rank.women); i++) {
      dots.push({
        x: state.width / 2,
        y: state.height / 2,
        targetX: state.width / 2,
        targetY: state.height / 2,
        color: colors.women,
        genderType: 'women',
        rankIndex: idx,
        rankName: rank.name,
        metadata: {
          total: rank.men + rank.women,
          men: rank.men,
          women: rank.women
        }
      });
    }
  });

  return dots;
}


function getFacultyDotPositionsSingle() {
  // Calculate positions for single cluster at center - use actual dot count
  const count = state.dots.length;
  const positions = [];
  const clusterRadius = Math.sqrt(count) * CLUSTER_SPREAD;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * clusterRadius;

    positions.push({
      x: state.width / 2 + Math.cos(angle) * radius,
      y: state.height / 2 + Math.sin(angle) * radius
    });
  }

  return positions;
}


function getFacultyDotPositionsByDepartment() {
  // Calculate positions for 4 department clusters in a row
  const departments = brownData.faculty.byDepartment;
  const numDepts = departments.length;

  // Position 4 clusters horizontally
  const marginX = state.width * 0.12;
  const spacingX = (state.width - 2 * marginX) / (numDepts - 1);

  const positions = [];
  const clusterInfo = [];

  // Count actual dots per department from state.dots
  const dotCounts = {};
  state.dots.forEach(dot => {
    const name = dot.departmentName;
    dotCounts[name] = (dotCounts[name] || 0) + 1;
  });

  departments.forEach((dept, i) => {
    const centerX = marginX + i * spacingX;
    const centerY = state.height / 2;

    const actualDotCount = dotCounts[dept.name] || 0;
    const clusterRadius = Math.sqrt(actualDotCount) * CLUSTER_SPREAD;

    clusterInfo.push({
      name: dept.name,
      x: centerX,
      y: centerY,
      count: dept.count
    });

    for (let j = 0; j < actualDotCount; j++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * clusterRadius;

      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        departmentName: dept.name
      });
    }
  });

  return { positions, clusterInfo };
}


function getFacultyDotPositionsByRank() {
  // Calculate positions for 4 rank clusters
  const rankData = brownData.faculty.byRank;
  const numRanks = rankData.length;

  // Position 4 clusters horizontally
  const marginX = state.width * 0.1;
  const spacingX = (state.width - 2 * marginX) / (numRanks - 1);

  const positions = [];
  const clusterInfo = [];

  // Count actual dots per rank and gender from state.dots
  const dotCounts = {};
  state.dots.forEach(dot => {
    const key = `${dot.rankIndex}-${dot.genderType}`;
    dotCounts[key] = (dotCounts[key] || 0) + 1;
  });

  rankData.forEach((rank, idx) => {
    const actualMen = dotCounts[`${idx}-men`] || 0;
    const actualWomen = dotCounts[`${idx}-women`] || 0;
    const actualTotal = actualMen + actualWomen;

    const centerX = marginX + idx * spacingX;
    const centerY = state.height / 2;

    const clusterRadius = Math.sqrt(actualTotal) * CLUSTER_SPREAD;

    clusterInfo.push({
      name: rank.name,
      rankIndex: idx,
      x: centerX,
      y: centerY,
      count: rank.men + rank.women,
      men: rank.men,
      women: rank.women
    });

    // Generate positions for men
    for (let j = 0; j < actualMen; j++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * clusterRadius;

      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        rankIndex: idx,
        genderType: 'men'
      });
    }

    // Generate positions for women
    for (let j = 0; j < actualWomen; j++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * clusterRadius;

      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        rankIndex: idx,
        genderType: 'women'
      });
    }
  });

  return { positions, clusterInfo };
}


function renderFacultyScene(positions, options = {}) {
  if (state.animating) return;
  state.animating = true;
  lockInteractions();

  const { duration = ANIM_SLOW, showLabels = false, clusterInfo = [], onComplete } = options;

  // Update each dot's target position
  state.dots.forEach((dot, i) => {
    if (i < positions.length) {
      dot.targetX = positions[i].x;
      dot.targetY = positions[i].y;
      if (positions[i].departmentName) {
        dot.departmentName = positions[i].departmentName;
      }
      if (positions[i].rankIndex !== undefined) {
        dot.rankIndex = positions[i].rankIndex;
      }
    }
  });

  // Animate dots - use timeout instead of per-element callbacks
  dotsGroup.selectAll('circle')
    .data(state.dots)
    .transition()
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .attr('cx', d => d.targetX)
    .attr('cy', d => d.targetY)
    .attr('opacity', 0.9);

  // Handle completion with single timeout
  if (renderTimer) clearTimeout(renderTimer);

  renderTimer = setTimeout(() => {
    state.dots.forEach(dot => {
      dot.x = dot.targetX;
      dot.y = dot.targetY;
    });
    state.animating = false;
    if (showLabels) {
      setTimeout(() => {
        unlockInteractions();
        if (onComplete) onComplete();
      }, 200);
    } else {
      unlockInteractions();
      if (onComplete) onComplete();
    }
  }, duration);

  // Update labels
  if (showLabels && clusterInfo.length > 0) {
    renderFacultyLabels(clusterInfo);
  } else if (showLabels) {
    renderSingleLabel('Brown Faculty 2024', `${brownData.faculty.total.toLocaleString()} faculty members`);
  } else {
    clearLabels();
  }
}


function renderFacultyLabels(clusterInfo, duration = 300) {
  renderClusterLabels(clusterInfo, { duration, yOffset: 20, getSubtitle: c => `${c.count}` });
}


// ============================================
// Staff Dot Generation Functions
// ============================================


function generateStaffDots() {
  // Generate dots for staff - all same color (staff green)
  const dots = [];
  const divisions = brownData.staff.byDivision;

  divisions.forEach(div => {
    for (let i = 0; i < scaledCount(div.count); i++) {
      dots.push({
        x: state.width / 2,
        y: state.height / 2,
        targetX: state.width / 2,
        targetY: state.height / 2,
        color: colors.staff,
        divisionName: div.name,
        metadata: {
          count: div.count,
          subDepts: div.subDepts
        }
      });
    }
  });

  return dots;
}


function getStaffDotPositionsSingle() {
  // Calculate positions for single cluster at center - use actual dot count
  const count = state.dots.length;
  const positions = [];
  const clusterRadius = Math.sqrt(count) * CLUSTER_SPREAD;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * clusterRadius;

    positions.push({
      x: state.width / 2 + Math.cos(angle) * radius,
      y: state.height / 2 + Math.sin(angle) * radius
    });
  }

  return positions;
}


function getStaffDotPositionsByDivision() {
  // Calculate positions for 13 division clusters in a grid
  const divisions = brownData.staff.byDivision;
  const numDivs = divisions.length;

  // Use 5 columns for 13 items (3 rows: 5, 5, 3)
  const cols = 5;
  const rows = Math.ceil(numDivs / cols);
  const marginX = state.width * 0.12;
  const marginY = state.height * 0.24;
  const marginBottom = state.height * 0.25; // Extra space for slider
  const spacingX = (state.width - 2 * marginX) / (cols - 1);
  const spacingY = (state.height - marginY - marginBottom) / (rows - 1);

  const positions = [];
  const clusterInfo = [];

  // Count actual dots per division from state.dots
  const dotCounts = {};
  state.dots.forEach(dot => {
    const name = dot.divisionName;
    dotCounts[name] = (dotCounts[name] || 0) + 1;
  });

  divisions.forEach((div, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);

    // Center the last row if it has fewer items
    const itemsInThisRow = row === rows - 1 ? numDivs - (rows - 1) * cols : cols;
    const rowOffset = row === rows - 1 ? (cols - itemsInThisRow) * spacingX / 2 : 0;

    const centerX = marginX + col * spacingX + rowOffset;
    const centerY = marginY + row * spacingY;

    const actualDotCount = dotCounts[div.name] || 0;
    const clusterRadius = Math.sqrt(actualDotCount) * (CLUSTER_SPREAD * 0.8);

    clusterInfo.push({
      name: div.name,
      fullName: div.fullName || div.name,
      x: centerX,
      y: centerY,
      count: div.count
    });

    for (let j = 0; j < actualDotCount; j++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * clusterRadius;

      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        divisionName: div.name
      });
    }
  });

  return { positions, clusterInfo };
}


function renderStaffScene(positions, options = {}) {
  if (state.animating) return;
  state.animating = true;
  lockInteractions();

  const { duration = ANIM_SLOW, showLabels = false, clusterInfo = [], onComplete } = options;

  // Update each dot's target position
  state.dots.forEach((dot, i) => {
    if (i < positions.length) {
      dot.targetX = positions[i].x;
      dot.targetY = positions[i].y;
      if (positions[i].divisionName) {
        dot.divisionName = positions[i].divisionName;
      }
    }
  });

  // Animate dots - use timeout instead of per-element callbacks
  dotsGroup.selectAll('circle')
    .data(state.dots)
    .transition()
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .attr('cx', d => d.targetX)
    .attr('cy', d => d.targetY)
    .attr('opacity', 0.9);

  // Handle completion with single timeout

  if (renderTimer) clearTimeout(renderTimer);


  renderTimer = setTimeout(() => {
    state.dots.forEach(dot => {
      dot.x = dot.targetX;
      dot.y = dot.targetY;
    });
    state.animating = false;
    if (showLabels) {
      setTimeout(() => {
        unlockInteractions();
        if (onComplete) onComplete();
      }, 200);
    } else {
      unlockInteractions();
      if (onComplete) onComplete();
    }
  }, duration);

  // Update labels
  if (showLabels && clusterInfo.length > 0) {
    renderStaffLabels(clusterInfo);
  } else if (showLabels) {
    renderSingleLabel('Brown Staff 2024', `${brownData.staff.total.toLocaleString()} staff members`);
  } else {
    clearLabels();
  }
}


function renderStaffLabels(clusterInfo, duration = 300) {
  renderClusterLabels(clusterInfo, { duration, yOffset: 20, getSubtitle: c => `${c.count.toLocaleString()}` });
}


function transitionToScene2A2() {
  if (state.animating) return;
  state.currentScene = 'scene2A2';
  lockInteractions();

  hideElement(buttonContainer);

  // Update legend for gender with enrolled/admitted/applicants legend
  legend.innerHTML = `
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.men};"></div>
     <span>Men (enrolled)</span>
   </div>
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.women};"></div>
     <span>Women (enrolled)</span>
   </div>
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.nonBinary};"></div>
     <span>Non-binary (enrolled)</span>
   </div>
   <div class="legend-item" style="margin-top: 12px; border-top: 1px solid #e0e0e0; padding-top: 12px;">
     <div class="legend-dot" style="background: #999; opacity: 0.25;"></div>
     <span>Admitted (did not enroll)</span>
   </div>
   <div class="legend-item">
     <div class="legend-dot" style="background: #f0f0f0; border: 2px dotted #999; opacity: 0.6;"></div>
     <span>Total applicants (not admitted)</span>
   </div>
 `;


  // Update slider label
  document.getElementById('slider-label').textContent = 'Separate by Gender →';


  // Regenerate dots with gender colors for all students
  state.dots = generateDotsWithGenderTypes();

  recreateDots(800, d => d.opacity);

  // Position dots in single cluster
  const positions = getGenderDotPositionsSingle();
  renderGenderScene(positions, {
    duration: ANIM_MEDIUM,
    showLabels: true,
    onComplete: () => {
      showSlider();
    }
  });
}


// ============================================
// Scene 2B: Faculty View
// ============================================


function transitionToScene2B() {
  state.animating = false;
  dotsGroup.selectAll('*').interrupt();
  if (renderTimer) clearTimeout(renderTimer);
  state.currentScene = 'scene2B';
  lockInteractions();

  clickInstruction.classList.remove('visible');

  // Remove hover areas from previous scene
  svg.selectAll('.cluster-hover-area').remove();

  // Clear labels from previous scene
  clearLabels();

  // Hide click instruction
  clickInstruction.classList.remove('visible');

  // Show back button, hide back-to-article
  backButton.classList.add('visible');
  if (backToArticle) backToArticle.style.display = 'none';
  backButton.onclick = () => {
    // Hide slider and faculty buttons when going back
    sliderContainer.classList.remove('visible');
    hideElement(facultyButtonContainer);

    // Regenerate all dots when going back
    const config = getScene0Config();
    state.dots = generateDots(config);

    recreateDots(0, 0.9);

    // Reset legend to show all three roles
    legend.innerHTML = `
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.students};"></div>
       <span>Students</span>
     </div>
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.faculty};"></div>
       <span>Faculty</span>
     </div>
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.staff};"></div>
       <span>Staff</span>
     </div>
   `;

    transitionToScene1();
  };

  // Update legend to show only faculty
  legend.innerHTML = `
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.faculty};"></div>
     <span>Faculty</span>
   </div>
 `;

  // Keep only faculty dots (filter by clusterName since dots may be shuffled)
  state.dots = state.dots.filter(d => d.clusterName === 'Faculty');

  // Remove excess circles from DOM
  dotsGroup.selectAll('circle')
    .data(state.dots)
    .exit()
    .transition()
    .duration(ANIM_FAST)
    .attr('opacity', 0)
    .remove();


  showElement(facultyButtonContainer);
  // Update remaining dots to move to center
  const config = getScene2BConfig();
  renderScene(config, {
    duration: ANIM_FAST,
    showLabels: false
  });
}


function transitionToScene2B1() {
  if (state.animating) return;
  state.currentScene = 'scene2B1';
  lockInteractions();

  hideElement(facultyButtonContainer);

  // Update legend for faculty (single color)
  legend.innerHTML = `
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.faculty};"></div>
     <span>Faculty</span>
   </div>
 `;

  // Update slider label
  document.getElementById('slider-label').textContent = 'Cluster by Department →';

  // Regenerate dots for departments (all same color)
  state.dots = generateFacultyDotsForDepartment();

  recreateDots(800, 0.9);

  // Position dots in single cluster
  const positions = getFacultyDotPositionsSingle();
  renderFacultyScene(positions, {
    duration: ANIM_MEDIUM,
    showLabels: true,
    onComplete: () => {
      showSlider();
    }
  });
}


function transitionToScene2B2() {
  if (state.animating) return;
  state.currentScene = 'scene2B2';
  lockInteractions();

  hideElement(facultyButtonContainer);

  // Update legend for gender
  legend.innerHTML = `
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.men};"></div>
     <span>Men</span>
   </div>
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.women};"></div>
     <span>Women</span>
   </div>
 `;

  // Update slider label
  document.getElementById('slider-label').textContent = 'Cluster by Rank →';

  // Regenerate dots with gender colors
  state.dots = generateFacultyDotsWithGender();

  recreateDots(800, 0.9);

  // Position dots in single cluster
  const positions = getFacultyDotPositionsSingle();
  renderFacultyScene(positions, {
    duration: ANIM_MEDIUM,
    showLabels: true,
    onComplete: () => {
      showSlider();
    }
  });
}


// ============================================
// Scene 2C: Staff View
// ============================================


function transitionToScene2C() {
  state.animating = false;
  dotsGroup.selectAll('*').interrupt();
  if (renderTimer) clearTimeout(renderTimer);
  state.currentScene = 'scene2C';
  lockInteractions();

  clickInstruction.classList.remove('visible');

  // Remove hover areas from previous scene
  svg.selectAll('.cluster-hover-area').remove();

  // Clear labels from previous scene
  clearLabels();

  // Hide click instruction
  clickInstruction.classList.remove('visible');

  // Show back button, hide back-to-article
  backButton.classList.add('visible');
  if (backToArticle) backToArticle.style.display = 'none';
  backButton.onclick = () => {
    // Hide slider when going back
    sliderContainer.classList.remove('visible');

    // Regenerate all dots when going back
    const config = getScene0Config();
    state.dots = generateDots(config);

    recreateDots(0, 0.9);

    // Reset legend to show all three roles
    legend.innerHTML = `
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.students};"></div>
       <span>Students</span>
     </div>
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.faculty};"></div>
       <span>Faculty</span>
     </div>
     <div class="legend-item">
       <div class="legend-dot" style="background: ${colors.staff};"></div>
       <span>Staff</span>
     </div>
   `;

    transitionToScene1();
  };

  // Update legend to show only staff
  legend.innerHTML = `
   <div class="legend-item">
     <div class="legend-dot" style="background: ${colors.staff};"></div>
     <span>Staff</span>
   </div>
 `;

  // Update slider label
  document.getElementById('slider-label').textContent = 'Cluster by Division →';

  // Keep only staff dots (filter by clusterName since dots may be shuffled)
  state.dots = state.dots.filter(d => d.clusterName === 'Staff');

  // Remove excess circles from DOM
  dotsGroup.selectAll('circle')
    .data(state.dots)
    .exit()
    .transition()
    .duration(ANIM_FAST)
    .attr('opacity', 0)
    .remove();

  // Regenerate dots for staff
  state.dots = generateStaffDots();

  recreateDots(800, 0.9);

  showSlider();

  // Position dots in single cluster
  const positions = getStaffDotPositionsSingle();
  renderStaffScene(positions, {
    duration: ANIM_FAST,
    showLabels: true
  });
}


// ============================================
// Cluster Clicking
// ============================================


function enableClusterClicking(clusters) {
  // Remove any existing hover areas
  svg.selectAll('.cluster-hover-area').remove();


  // Create invisible hover areas for each cluster
  clusters.forEach(cluster => {
    const radius = Math.sqrt(scaledCount(cluster.count)) * CLUSTER_SPREAD; + 20;


    const hoverArea = svg.append('circle')
      .attr('class', 'cluster-hover-area')
      .attr('cx', cluster.x)
      .attr('cy', cluster.y)
      .attr('r', radius)
      .attr('fill', 'transparent')
      .attr('cursor', 'pointer')
      .on('mouseenter', function () {
        // Pulse effect
        d3.select(this)
          .transition()
          .duration(300)
          .attr('fill', 'rgba(0,0,0,0.05)');


        // Bold the label
        labelsGroup.selectAll('.cluster-label')
          .filter(function () {
            return d3.select(this).text() === cluster.label.split('\n')[0];
          })
          .transition()
          .duration(200)
          .style('font-weight', '700');
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('fill', 'transparent');


        labelsGroup.selectAll('.cluster-label')
          .transition()
          .duration(200)
          .style('font-weight', '600');
      })
      .on('click', function () {
        if (cluster.name === 'Students') {
          transitionToScene2A();
        } else if (cluster.name === 'Faculty') {
          transitionToScene2B();
        } else if (cluster.name === 'Staff') {
          transitionToScene2C();
        }
      });
  });
}


// ============================================
// Slider Interaction
// ============================================


let sliderAnimating = false;
let currentSliderState = 'single'; // 'single' or 'clustered'


clusterSlider.addEventListener('input', function (e) {
  if (sliderAnimating || state.animating) return;

  // Check if we're in a valid scene for slider interaction
  const validScenes = ['scene2A1', 'scene2A2', 'scene2B1', 'scene2B2', 'scene2C'];
  if (!validScenes.includes(state.currentScene)) return;


  const value = parseFloat(e.target.value);


  if (state.currentScene === 'scene2A1') {
    // Concentration view slider
    if (value < 0.5 && currentSliderState === 'clustered') {
      // Transition to single cluster
      sliderAnimating = true;
      currentSliderState = 'single';
      lockInteractions();


      const positions = getSeniorDotPositionsSingle();
      renderSeniorScene(positions, {
        duration: ANIM_MEDIUM,
        showLabels: true,
        onComplete: () => {
          sliderAnimating = false;
          svg.selectAll('.cluster-hover-area').remove();
        }
      });
    } else if (value >= 0.5 && currentSliderState === 'single') {
      // Transition to clustered
      sliderAnimating = true;
      currentSliderState = 'clustered';
      lockInteractions();


      const { positions, clusterInfo } = getSeniorDotPositionsClustered();
      renderSeniorScene(positions, {
        duration: ANIM_SLOW,
        showLabels: true,
        clusterInfo: clusterInfo,
        onComplete: () => {
          sliderAnimating = false;
          enableConcentrationClicking(clusterInfo);
        }
      });
    }
  } else if (state.currentScene === 'scene2A2') {
    // Gender view slider
    if (value < 0.5 && currentSliderState === 'clustered') {
      // Transition to single cluster
      sliderAnimating = true;
      currentSliderState = 'single';
      lockInteractions();


      const positions = getGenderDotPositionsSingle();


      // Hide background circles when in single cluster mode
      renderBackgroundCircles([], { duration: ANIM_MEDIUM, show: false });


      renderGenderScene(positions, {
        duration: ANIM_MEDIUM,
        showLabels: true,
        onComplete: () => {
          sliderAnimating = false;
          svg.selectAll('.cluster-hover-area').remove();
        }
      });
    } else if (value >= 0.5 && currentSliderState === 'single') {
      // Transition to clustered
      sliderAnimating = true;
      currentSliderState = 'clustered';
      lockInteractions();


      const { positions, clusterInfo } = getGenderDotPositionsClustered();


      // Show background circles when clustering
      renderBackgroundCircles(clusterInfo, { duration: ANIM_SLOW, show: true });


      renderGenderScene(positions, {
        duration: ANIM_SLOW,
        showLabels: true,
        clusterInfo: clusterInfo,
        onComplete: () => {
          sliderAnimating = false;
          enableGenderClicking(clusterInfo);
        }
      });
    }
  } else if (state.currentScene === 'scene2B1') {
    // Faculty department view slider
    if (value < 0.5 && currentSliderState === 'clustered') {
      // Transition to single cluster
      sliderAnimating = true;
      currentSliderState = 'single';
      lockInteractions();

      const positions = getFacultyDotPositionsSingle();
      renderFacultyScene(positions, {
        duration: ANIM_MEDIUM,
        showLabels: true,
        onComplete: () => {
          sliderAnimating = false;
          svg.selectAll('.cluster-hover-area').remove();
        }
      });
    } else if (value >= 0.5 && currentSliderState === 'single') {
      // Transition to clustered by department
      sliderAnimating = true;
      currentSliderState = 'clustered';
      lockInteractions();

      const { positions, clusterInfo } = getFacultyDotPositionsByDepartment();
      renderFacultyScene(positions, {
        duration: ANIM_SLOW,
        showLabels: true,
        clusterInfo: clusterInfo,
        onComplete: () => {
          sliderAnimating = false;
          enableDepartmentClicking(clusterInfo);
        }
      });
    }
  } else if (state.currentScene === 'scene2B2') {
    // Faculty rank view slider
    if (value < 0.5 && currentSliderState === 'clustered') {
      // Transition to single cluster
      sliderAnimating = true;
      currentSliderState = 'single';
      lockInteractions();

      const positions = getFacultyDotPositionsSingle();
      renderFacultyScene(positions, {
        duration: ANIM_MEDIUM,
        showLabels: true,
        onComplete: () => {
          sliderAnimating = false;
          svg.selectAll('.cluster-hover-area').remove();
        }
      });
    } else if (value >= 0.5 && currentSliderState === 'single') {
      // Transition to clustered by rank
      sliderAnimating = true;
      currentSliderState = 'clustered';
      lockInteractions();

      const { positions, clusterInfo } = getFacultyDotPositionsByRank();
      renderFacultyScene(positions, {
        duration: ANIM_SLOW,
        showLabels: true,
        clusterInfo: clusterInfo,
        onComplete: () => {
          sliderAnimating = false;
          enableRankClicking(clusterInfo);
        }
      });
    }
  } else if (state.currentScene === 'scene2C') {
    // Staff division view slider
    if (value < 0.5 && currentSliderState === 'clustered') {
      // Transition to single cluster
      sliderAnimating = true;
      currentSliderState = 'single';
      lockInteractions();

      const positions = getStaffDotPositionsSingle();
      renderStaffScene(positions, {
        duration: ANIM_MEDIUM,
        showLabels: true,
        onComplete: () => {
          sliderAnimating = false;
          svg.selectAll('.cluster-hover-area').remove();
        }
      });
    } else if (value >= 0.5 && currentSliderState === 'single') {
      // Transition to clustered by division
      sliderAnimating = true;
      currentSliderState = 'clustered';
      lockInteractions();

      const { positions, clusterInfo } = getStaffDotPositionsByDivision();
      renderStaffScene(positions, {
        duration: ANIM_SLOW,
        showLabels: true,
        clusterInfo: clusterInfo,
        onComplete: () => {
          sliderAnimating = false;
          enableDivisionClicking(clusterInfo);
        }
      });
    }
  }
});


// Snap slider on release
clusterSlider.addEventListener('change', function (e) {
  const value = parseFloat(e.target.value);
  e.target.value = value < 0.5 ? 0 : 1;
});


// ============================================
// Concentration Clicking
// ============================================


// Unified hover/click handler for cluster interactions
function enableHoverClicking(clusterInfo, options) {
  const { matchFn, getOpacity = () => 0.9, resetOpacity = 0.9, showPopup } = options;
  svg.selectAll('.cluster-hover-area').remove();

  clusterInfo.forEach(cluster => {
    const radius = Math.sqrt(scaledCount(cluster.count)) * CLUSTER_SPREAD + 10;

    svg.append('circle')
      .attr('class', 'cluster-hover-area')
      .attr('cx', cluster.x)
      .attr('cy', cluster.y)
      .attr('r', radius)
      .attr('fill', 'transparent')
      .attr('cursor', 'pointer')
      .on('mouseenter', function () {
        dotsGroup.selectAll('circle')
          .transition()
          .duration(200)
          .attr('opacity', d => matchFn(d, cluster) ? getOpacity(d) : getOpacity(d) * 0.3);

        labelsGroup.selectAll('.cluster-label')
          .filter(function () { return d3.select(this).text() === cluster.name; })
          .transition()
          .duration(200)
          .style('font-weight', '700')
          .style('font-size', '20px');
      })
      .on('mouseleave', function () {
        dotsGroup.selectAll('circle')
          .transition()
          .duration(200)
          .attr('opacity', d => typeof resetOpacity === 'function' ? resetOpacity(d) : resetOpacity);

        labelsGroup.selectAll('.cluster-label')
          .transition()
          .duration(200)
          .style('font-weight', '600')
          .style('font-size', '18px');
      })
      .on('click', function () { showPopup(cluster); });
  });
}

function enableConcentrationClicking(clusterInfo) {
  enableHoverClicking(clusterInfo, {
    matchFn: (d, c) => d.concentrationName === c.name,
    getOpacity: () => 1,
    resetOpacity: 0.9,
    showPopup: showConcentrationPopup
  });
}

function enableGenderClicking(clusterInfo) {
  enableHoverClicking(clusterInfo, {
    matchFn: (d, c) => d.genderType === c.genderKey,
    getOpacity: d => d.opacity || 0.9,
    resetOpacity: d => d.opacity || 0.9,
    showPopup: showGenderPopup
  });
}

function enableDepartmentClicking(clusterInfo) {
  enableHoverClicking(clusterInfo, {
    matchFn: (d, c) => d.departmentName === c.name,
    getOpacity: () => 1,
    resetOpacity: 0.9,
    showPopup: showDepartmentPopup
  });
}

function enableRankClicking(clusterInfo) {
  enableHoverClicking(clusterInfo, {
    matchFn: (d, c) => d.rankIndex === c.rankIndex,
    getOpacity: () => 1,
    resetOpacity: 0.9,
    showPopup: showRankPopup
  });
}

function enableDivisionClicking(clusterInfo) {
  enableHoverClicking(clusterInfo, {
    matchFn: (d, c) => d.divisionName === c.name,
    getOpacity: () => 1,
    resetOpacity: 0.9,
    showPopup: showDivisionPopup
  });
}


// ============================================
// Popup Modal
// ============================================

function showPopup(content) {
  document.getElementById('popup-content').innerHTML = content;
  popupOverlay.classList.add('visible');
  popupModal.classList.add('visible');
  setTimeout(() => document.querySelectorAll('.popup-bar-fill').forEach(bar => bar.style.width = bar.style.width), 50);
}

function showConcentrationPopup(cluster) {
  const { bachelors = 0, masters = 0, fullName = cluster.name } = cluster;
  const total = bachelors + masters;
  const bp = total > 0 ? (bachelors / total * 100).toFixed(1) : 0;
  const mp = total > 0 ? (masters / total * 100).toFixed(1) : 0;

  showPopup(`
    <h2>${fullName}</h2>
    <div class="popup-subtitle">Class of 2024</div>
    <div class="popup-stat"><div class="popup-stat-label">Total Students</div><div class="popup-stat-value">${total}</div></div>
    ${bachelors > 0 ? createBarStat("Bachelor's", bachelors, bp, colors.bachelors) : ''}
    ${masters > 0 ? createBarStat("Master's", masters, mp, colors.masters) : ''}
  `);
}

function showGenderPopup(cluster) {
  const { enrolled = 0, admitted = 0, applicants = 0, acceptanceRate = 0, yieldRate = 0 } = cluster;
  const totalEnrolled = brownData.students.byGender.men.enrolled + brownData.students.byGender.women.enrolled + brownData.students.byGender.nonBinary.enrolled;
  const totalAdmitted = brownData.students.byGender.men.admitted + brownData.students.byGender.women.admitted + brownData.students.byGender.nonBinary.admitted;
  const ep = ((enrolled / totalEnrolled) * 100).toFixed(1);
  const ap = ((admitted / totalAdmitted) * 100).toFixed(1);

  showPopup(`
    <h2>${cluster.name}</h2>
    <div class="popup-subtitle">Class of 2028</div>
    <div class="popup-stat"><div class="popup-stat-label">Applied</div><div class="popup-stat-value">${applicants.toLocaleString()}</div></div>
    ${createBarStat('Admitted', admitted.toLocaleString() + ' (' + ap + '% of total admitted)', ap, colors[cluster.genderKey], 0.5)}
    ${createBarStat('Enrolled', enrolled.toLocaleString() + ' (' + ep + '% of total enrolled)', ep, colors[cluster.genderKey])}
    <div class="popup-stat"><div class="popup-stat-label">Acceptance Rate</div><div class="popup-stat-value">${acceptanceRate.toFixed(2)}%</div></div>
    <div class="popup-stat"><div class="popup-stat-label">Yield Rate</div><div class="popup-stat-value">${yieldRate.toFixed(2)}%</div></div>
  `);
}

function showDepartmentPopup(cluster) {
  const { count = 0 } = cluster;
  const pct = ((count / brownData.faculty.total) * 100).toFixed(1);

  showPopup(`
    <h2>${cluster.name}</h2>
    <div class="popup-subtitle">Faculty Division (2024)</div>
    <div class="popup-stat"><div class="popup-stat-label">Total Faculty</div><div class="popup-stat-value">${count}</div></div>
    ${createBarStat('Percentage of All Faculty', pct + '%', pct, colors.faculty)}
  `);
}

function showRankPopup(cluster) {
  const { count = 0, men = 0, women = 0 } = cluster;
  const mp = count > 0 ? (men / count * 100).toFixed(1) : 0;
  const wp = count > 0 ? (women / count * 100).toFixed(1) : 0;

  showPopup(`
    <h2>${cluster.name}</h2>
    <div class="popup-subtitle">Faculty Rank (2024)</div>
    <div class="popup-stat"><div class="popup-stat-label">Total Faculty</div><div class="popup-stat-value">${count}</div></div>
    ${createBarStat('Men', men, mp, colors.men)}
    ${createBarStat('Women', women, wp, colors.women)}
  `);
}

function showDivisionPopup(cluster) {
  const { count = 0, fullName = cluster.name } = cluster;
  const pct = ((count / brownData.staff.total) * 100).toFixed(1);

  showPopup(`
    <h2>${fullName}</h2>
    <div class="popup-subtitle">Staff Division (2024)</div>
    <div class="popup-stat"><div class="popup-stat-label">Total Staff</div><div class="popup-stat-value">${count.toLocaleString()}</div></div>
    ${createBarStat('Percentage of All Staff', pct + '%', pct, colors.staff)}
  `);
}


function closePopup() {
  popupOverlay.classList.remove('visible');
  popupModal.classList.remove('visible');
}


popupClose.addEventListener('click', closePopup);
popupOverlay.addEventListener('click', closePopup);


// ============================================
// Button Handlers
// ============================================


document.getElementById('btn-concentration').addEventListener('click', () => {
  transitionToScene2A1();
});


document.getElementById('btn-gender').addEventListener('click', () => {
  transitionToScene2A2();
});


document.getElementById('btn-department').addEventListener('click', () => {
  transitionToScene2B1();
});


document.getElementById('btn-rank').addEventListener('click', () => {
  transitionToScene2B2();
});


// ============================================
// Scroll-based Navigation
// ============================================


let lastScrollY = 0;

// Use window-level flag that can be checked synchronously
window._interactiveScrollEnabled = false;

function enableInteractiveScroll() {
  window._interactiveScrollEnabled = true;
}

function disableInteractiveScroll() {
  window._interactiveScrollEnabled = false;
}

window.addEventListener('scroll', () => {
  // Check global flag first - this stops ALL processing
  if (!window._interactiveScrollEnabled) return;
  if (state.animating) return;

  // Calculate scroll position relative to main-container
  const mainContainer = document.getElementById('main-container');
  if (!mainContainer) return;
  
  const containerRect = mainContainer.getBoundingClientRect();
  const containerTop = mainContainer.offsetTop;
  const containerHeight = mainContainer.offsetHeight;
  const scrollY = window.scrollY;
  
  // How far we've scrolled into the interactive section (0 to 1)
  const scrollIntoContainer = scrollY - containerTop;
  const maxScroll = containerHeight - window.innerHeight;
  const scrollPercent = Math.max(0, Math.min(1, scrollIntoContainer / maxScroll));

  if (state.currentScene === 'scene0' && scrollPercent > 0.15) {
    transitionToScene1();
  } 
  else if (state.currentScene === 'scene1' && scrollPercent < 0.10) {
    transitionToScene0();
  }

  lastScrollY = scrollY;
});

// Expose for article-dots.js
window.enableInteractiveScroll = enableInteractiveScroll;
window.disableInteractiveScroll = disableInteractiveScroll;


// ============================================
// Window Resize
// ============================================


window.addEventListener('resize', () => {
  state.width = window.innerWidth;
  state.height = window.innerHeight;


  // Re-render current scene
  if (state.currentScene === 'scene0') {
    // For scene0, recalculate positions with shared radius to keep dots mixed
    const config = getScene0Config();
    const totalCount = config.clusters.reduce((sum, c) => sum + c.count, 0);
    const sharedRadius = Math.sqrt(totalCount) * CLUSTER_SPREAD;
    const centerX = config.clusters[0].x;
    const centerY = config.clusters[0].y;

    // Update each dot's position within the shared radius
    state.dots.forEach(dot => {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * sharedRadius;
      dot.x = centerX + Math.cos(angle) * radius;
      dot.y = centerY + Math.sin(angle) * radius;
      dot.targetX = dot.x;
      dot.targetY = dot.y;
    });

    // Re-render dots at new positions
    dotsGroup.selectAll('circle')
      .data(state.dots)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  } else if (state.currentScene === 'scene1') {
    const config = getScene1Config();
    renderScene(config, { duration: 0, showLabels: true });
    enableClusterClicking(config.clusters);
  }
  // Add other scenes as needed
});


// ============================================
// Initialization
// ============================================

// Flag to track if interactive mode has started
let interactiveStarted = false;

function init() {
  // Generate initial dots with shuffle to mix colors
  const config = getScene0Config();
  state.dots = generateDots(config, true);

  recreateDots(1000, 0.9);

  // Show initial UI
  legend.classList.add('visible');
}

// Function called by article-dots.js when scrolling into interactive section
function startInteractiveVisualization() {
  if (interactiveStarted) return;
  interactiveStarted = true;

  // Hide the article visualization (fixed SVG overlay)
  const articleVizContainer = document.getElementById('article-viz-container');
  if (articleVizContainer) {
    articleVizContainer.style.opacity = '0';
    articleVizContainer.style.pointerEvents = 'none';
  }

  // Show the interactive UI container
  const interactiveUI = document.getElementById('interactive-ui');
  if (interactiveUI) {
    interactiveUI.style.display = 'block';
  }

  // Initialize the interactive visualization
  init();
  
  // Enable scroll-based navigation for interactive section
  enableInteractiveScroll();
}

// Function to reset interactive mode (called when returning to article)
function resetInteractiveMode() {
  // Disable scroll FIRST before anything else
  window._interactiveScrollEnabled = false;
  interactiveStarted = false;
}

// Expose the function globally so article-dots.js can call it
window.startInteractiveVisualization = startInteractiveVisualization;
window.resetInteractiveMode = resetInteractiveMode;
