// Brown Community Visualization - Article Dots
// This file controls the view-only dots that respond to article scrolling
// These dots are separate from the interactive visualization dots

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================

  const CONFIG = {
    dotRadius: 4,
    peoplePerDot: 5,
    clusterSpread: 4,
    stage0ClusterSpread: 8, // Larger spread for stage 0
    stage12StaffSpread: 8,  // Larger spread for Staff blob in stage 12 only
    animDuration: 400,      // Faster for responsive scrolling
    fadeOutDuration: 200,
    observerRootMargin: '-10% 0px -10% 0px',
    observerThreshold: 0.1,
    // Three-group layout (Students/Faculty/Staff) - horizontal positions
    threeGroupX1: 0.28,       // First group X position (Students)
    threeGroupX2: 0.55,        // Second group X position (Faculty)
    threeGroupX3: 0.78,       // Third group X position (Staff)
    // Student subtypes layout (Undergrad/Grad/Medical) - horizontal positions
    studentSubtypeX1: 0.35,   // Undergraduate X position
    studentSubtypeX2: 0.59,   // Graduate X position
    studentSubtypeX3: 0.75,   // Medical X position
    // Faculty subtypes layout (Instructional/Research) - horizontal positions
    facultySubtypeX1: 0.35,   // Instructional X position
    facultySubtypeX2: 0.65,   // Research X position
    // Year label position
    yearX: 0.08               // Year label X position (fraction of screen width)
  };

  // Mobile-specific configuration - adjust these values for portrait/vertical screens
  const MOBILE_CONFIG = {
    clusterSpread: 2.5,       // Cluster spread on mobile (smaller = tighter dots)
    labelOffset: 15,          // Distance from cluster bottom to label
    countOffset: 30,          // Distance from cluster bottom to count number
    labelFontSize: '14px',
    countFontSize: '12px',
    yearFontSize: '56px',
    yearY: 0.12,              // Year label Y position (fraction of screen height)
    // Three-group layout (Students/Faculty/Staff) - vertical positions
    threeGroupY1: 0.2,        // First group Y position
    threeGroupY2: 0.5,        // Second group Y position  
    threeGroupY3: 0.8,        // Third group Y position
    // Student subtypes layout (Undergrad/Grad/Medical) - vertical positions
    studentSubtypeY1: 0.3,   // Undergraduate Y position
    studentSubtypeY2: 0.55,    // Graduate Y position
    studentSubtypeY3: 0.8,   // Medical Y position
    // Faculty subtypes layout (Instructional/Research) - vertical positions
    facultySubtypeY1: 0.35,   // Instructional Y position
    facultySubtypeY2: 0.65    // Research Y position
  };

  // ============================================
  // State
  // ============================================

  const articleState = {
    currentStage: -1,
    dots: [],
    width: window.innerWidth,
    height: window.innerHeight,
    animating: false,
    initialized: false,
    hidden: false
  };

  // ============================================
  // Utility Functions
  // ============================================

  function scaledCount(count) {
    return Math.max(1, Math.round(count / CONFIG.peoplePerDot));
  }

  function randomInCircle(cx, cy, radius) {
    const angle = Math.random() * 2 * Math.PI;
    const r = Math.random() * radius;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  }

  function isPortrait() {
    return articleState.height > articleState.width;
  }

  // ============================================
  // SVG Setup
  // ============================================

  const articleSvg = d3.select('#article-svg');
  if (articleSvg.empty()) {
    console.error('Article SVG not found!');
    return;
  }
  const articleDotsGroup = articleSvg.append('g').attr('id', 'article-dots-group');
  const articleLabelsGroup = articleSvg.append('g').attr('id', 'article-labels-group');

  // ============================================
  // Stage Definitions - CONFIGURE YOUR STAGES HERE
  // ============================================
  
  // Each stage function returns an array of groups with:
  // { name, count, color, x, y, visible }
  
  function getStage0() {
    // All three groups mixed together in center
    const centerX = articleState.width / 2;
    const centerY = articleState.height / 2;
    return {
      shuffle: true, // Mix all dots together
      groups: [
        { name: 'Students', count: brownData.students.total, color: colors.students, x: centerX, y: centerY, visible: true },
        { name: 'Faculty', count: brownData.faculty.total, color: colors.faculty, x: centerX, y: centerY, visible: true },
        { name: 'Staff', count: brownData.staff.total, color: colors.staff, x: centerX, y: centerY, visible: true }
      ]
    };
  }

  function getStage1() {
    // Split into three groups: Students, Faculty, Staff (same colors as stage 0)
    const portrait = isPortrait();
    const centerX = articleState.width / 2;
    return {
      shuffle: false,
      showLabels: true,
      groups: [
        { name: 'Students', count: brownData.students.total, color: colors.students, x: portrait ? centerX : articleState.width * CONFIG.threeGroupX1, y: portrait ? articleState.height * MOBILE_CONFIG.threeGroupY1 : articleState.height / 2, visible: true },
        { name: 'Faculty', count: brownData.faculty.total, color: colors.faculty, x: portrait ? centerX : articleState.width * CONFIG.threeGroupX2, y: portrait ? articleState.height * MOBILE_CONFIG.threeGroupY2 : articleState.height / 2, visible: true },
        { name: 'Staff', count: brownData.staff.total, color: colors.staff, x: portrait ? centerX : articleState.width * CONFIG.threeGroupX3, y: portrait ? articleState.height * MOBILE_CONFIG.threeGroupY3 : articleState.height / 2, visible: true }
      ]
    };
  }

  function getStage2() {
    // Students only, with colors for undergrad/grad/medical - all in one center cluster
    const centerX = articleState.width / 2;
    const centerY = articleState.height / 2;
    const byType = brownData.students.byType;
    
    return {
      shuffle: true, // Mix all student types together
      showLabels: false,
      groups: [
        { name: 'Undergraduate', count: byType.undergrad, color: colors.undergrad, x: centerX, y: centerY, visible: true, sourceGroup: 'Students' },
        { name: 'Graduate', count: byType.grad, color: colors.grad, x: centerX, y: centerY, visible: true, sourceGroup: 'Students' },
        { name: 'Medical', count: byType.medical, color: colors.medical, x: centerX, y: centerY, visible: true, sourceGroup: 'Students' },
        { name: 'Faculty', count: brownData.faculty.total, color: colors.faculty, x: centerX, y: centerY, visible: false },
        { name: 'Staff', count: brownData.staff.total, color: colors.staff, x: centerX, y: centerY, visible: false }
      ]
    };
  }

  function getStage3() {
    // Undergrad, Grad, Medical split into three separate groups - 2024 data
    const byType = brownData.students.byType;
    const portrait = isPortrait();
    const centerX = articleState.width / 2;
    
    return {
      shuffle: false,
      showLabels: true,
      showYear: 2024,
      keepPositions: true, // Part of year comparison group - dots stay in place for 3↔4↔5
      groups: [
        { name: 'Undergraduate', count: byType.undergrad, color: colors.undergrad, x: portrait ? centerX : articleState.width * CONFIG.studentSubtypeX1, y: portrait ? articleState.height * MOBILE_CONFIG.studentSubtypeY1 : articleState.height / 2, visible: true, sourceGroup: 'Students' },
        { name: 'Graduate', count: byType.grad, color: colors.grad, x: portrait ? centerX : articleState.width * CONFIG.studentSubtypeX2, y: portrait ? articleState.height * MOBILE_CONFIG.studentSubtypeY2 : articleState.height / 2, visible: true, sourceGroup: 'Students' },
        { name: 'Medical', count: byType.medical, color: colors.medical, x: portrait ? centerX : articleState.width * CONFIG.studentSubtypeX3, y: portrait ? articleState.height * MOBILE_CONFIG.studentSubtypeY3 : articleState.height / 2, visible: true, sourceGroup: 'Students' },
        { name: 'Faculty', count: brownData.faculty.total, color: colors.faculty, x: articleState.width / 2, y: articleState.height / 2, visible: false },
        { name: 'Staff', count: brownData.staff.total, color: colors.staff, x: articleState.width / 2, y: articleState.height / 2, visible: false }
      ]
    };
  }

  function getStage4() {
    // 2014 data - Undergrad, Grad, Medical split
    const byType = brownData2014.students.byType;
    const portrait = isPortrait();
    const centerX = articleState.width / 2;
    
    return {
      shuffle: false,
      showLabels: true,
      showYear: 2014,
      keepPositions: true, // Dots stay in place, only fade
      groups: [
        { name: 'Undergraduate', count: byType.undergrad, color: colors.undergrad, x: portrait ? centerX : articleState.width * CONFIG.studentSubtypeX1, y: portrait ? articleState.height * MOBILE_CONFIG.studentSubtypeY1 : articleState.height / 2, visible: true, sourceGroup: 'Students' },
        { name: 'Graduate', count: byType.grad, color: colors.grad, x: portrait ? centerX : articleState.width * CONFIG.studentSubtypeX2, y: portrait ? articleState.height * MOBILE_CONFIG.studentSubtypeY2 : articleState.height / 2, visible: true, sourceGroup: 'Students' },
        { name: 'Medical', count: byType.medical, color: colors.medical, x: portrait ? centerX : articleState.width * CONFIG.studentSubtypeX3, y: portrait ? articleState.height * MOBILE_CONFIG.studentSubtypeY3 : articleState.height / 2, visible: true, sourceGroup: 'Students' },
        { name: 'Faculty', count: 0, color: colors.faculty, x: articleState.width / 2, y: articleState.height / 2, visible: false },
        { name: 'Staff', count: 0, color: colors.staff, x: articleState.width / 2, y: articleState.height / 2, visible: false }
      ]
    };
  }

  function getStage5() {
    // 2004 data - Undergrad, Grad, Medical split
    const byType = brownData2004.students.byType;
    const portrait = isPortrait();
    const centerX = articleState.width / 2;
    
    return {
      shuffle: false,
      showLabels: true,
      showYear: 2004,
      keepPositions: true, // Dots stay in place, only fade
      groups: [
        { name: 'Undergraduate', count: byType.undergrad, color: colors.undergrad, x: portrait ? centerX : articleState.width * CONFIG.studentSubtypeX1, y: portrait ? articleState.height * MOBILE_CONFIG.studentSubtypeY1 : articleState.height / 2, visible: true, sourceGroup: 'Students' },
        { name: 'Graduate', count: byType.grad, color: colors.grad, x: portrait ? centerX : articleState.width * CONFIG.studentSubtypeX2, y: portrait ? articleState.height * MOBILE_CONFIG.studentSubtypeY2 : articleState.height / 2, visible: true, sourceGroup: 'Students' },
        { name: 'Medical', count: byType.medical, color: colors.medical, x: portrait ? centerX : articleState.width * CONFIG.studentSubtypeX3, y: portrait ? articleState.height * MOBILE_CONFIG.studentSubtypeY3 : articleState.height / 2, visible: true, sourceGroup: 'Students' },
        { name: 'Faculty', count: 0, color: colors.faculty, x: articleState.width / 2, y: articleState.height / 2, visible: false },
        { name: 'Staff', count: 0, color: colors.staff, x: articleState.width / 2, y: articleState.height / 2, visible: false }
      ]
    };
  }

  function getStage6() {
    // Return to three-group view: Students combine back, Faculty and Staff appear
    // Students merge back into single color, faculty and staff fade in
    const portrait = isPortrait();
    const centerX = articleState.width / 2;
    return {
      shuffle: false,
      showLabels: true,
      groups: [
        { name: 'Students', count: brownData.students.total, color: colors.students, x: portrait ? centerX : articleState.width * CONFIG.threeGroupX1, y: portrait ? articleState.height * MOBILE_CONFIG.threeGroupY1 : articleState.height / 2, visible: true },
        { name: 'Faculty', count: brownData.faculty.total, color: colors.faculty, x: portrait ? centerX : articleState.width * CONFIG.threeGroupX2, y: portrait ? articleState.height * MOBILE_CONFIG.threeGroupY2 : articleState.height / 2, visible: true },
        { name: 'Staff', count: brownData.staff.total, color: colors.staff, x: portrait ? centerX : articleState.width * CONFIG.threeGroupX3, y: portrait ? articleState.height * MOBILE_CONFIG.threeGroupY3 : articleState.height / 2, visible: true }
      ]
    };
  }

  function getStage7() {
    // Faculty only, with colors for instructional/research - all in one center cluster
    const centerX = articleState.width / 2;
    const centerY = articleState.height / 2;
    const byType = brownData.faculty.byType;
    
    return {
      shuffle: true, // Mix all faculty types together
      showLabels: false,
      groups: [
        { name: 'Instructional', count: byType.instructional, color: colors.instructional, x: centerX, y: centerY, visible: true, sourceGroup: 'Faculty' },
        { name: 'Research', count: byType.research, color: colors.research, x: centerX, y: centerY, visible: true, sourceGroup: 'Faculty' },
        { name: 'Students', count: brownData.students.total, color: colors.students, x: centerX, y: centerY, visible: false },
        { name: 'Staff', count: brownData.staff.total, color: colors.staff, x: centerX, y: centerY, visible: false }
      ]
    };
  }

  function getStage8() {
    // Instructional and Research split into two separate groups - 2024 data
    const byType = brownData.faculty.byType;
    const portrait = isPortrait();
    const centerX = articleState.width / 2;
    
    return {
      shuffle: false,
      showLabels: true,
      showYear: 2024,
      yearColor: colors.faculty,
      keepPositions: true, // Part of year comparison group
      groups: [
        { name: 'Instructional', count: byType.instructional, color: colors.instructional, x: portrait ? centerX : articleState.width * CONFIG.facultySubtypeX1, y: portrait ? articleState.height * MOBILE_CONFIG.facultySubtypeY1 : articleState.height / 2, visible: true, sourceGroup: 'Faculty' },
        { name: 'Research', count: byType.research, color: colors.research, x: portrait ? centerX : articleState.width * CONFIG.facultySubtypeX2, y: portrait ? articleState.height * MOBILE_CONFIG.facultySubtypeY2 : articleState.height / 2, visible: true, sourceGroup: 'Faculty' },
        { name: 'Students', count: brownData.students.total, color: colors.students, x: articleState.width / 2, y: articleState.height / 2, visible: false },
        { name: 'Staff', count: brownData.staff.total, color: colors.staff, x: articleState.width / 2, y: articleState.height / 2, visible: false }
      ]
    };
  }

  function getStage9() {
    // 2014 faculty data - Instructional and Research split
    const byType = brownData2014.faculty.byType;
    const portrait = isPortrait();
    const centerX = articleState.width / 2;
    
    return {
      shuffle: false,
      showLabels: true,
      showYear: 2014,
      yearColor: colors.faculty,
      keepPositions: true, // Dots stay in place, only fade
      groups: [
        { name: 'Instructional', count: byType.instructional, color: colors.instructional, x: portrait ? centerX : articleState.width * CONFIG.facultySubtypeX1, y: portrait ? articleState.height * MOBILE_CONFIG.facultySubtypeY1 : articleState.height / 2, visible: true, sourceGroup: 'Faculty' },
        { name: 'Research', count: byType.research, color: colors.research, x: portrait ? centerX : articleState.width * CONFIG.facultySubtypeX2, y: portrait ? articleState.height * MOBILE_CONFIG.facultySubtypeY2 : articleState.height / 2, visible: true, sourceGroup: 'Faculty' },
        { name: 'Students', count: 0, color: colors.students, x: articleState.width / 2, y: articleState.height / 2, visible: false },
        { name: 'Staff', count: 0, color: colors.staff, x: articleState.width / 2, y: articleState.height / 2, visible: false }
      ]
    };
  }

  function getStage10() {
    // 2004 faculty data - Instructional and Research split
    const byType = brownData2004.faculty.byType;
    const portrait = isPortrait();
    const centerX = articleState.width / 2;
    
    return {
      shuffle: false,
      showLabels: true,
      showYear: 2004,
      yearColor: colors.faculty,
      keepPositions: true, // Dots stay in place, only fade
      groups: [
        { name: 'Instructional', count: byType.instructional, color: colors.instructional, x: portrait ? centerX : articleState.width * CONFIG.facultySubtypeX1, y: portrait ? articleState.height * MOBILE_CONFIG.facultySubtypeY1 : articleState.height / 2, visible: true, sourceGroup: 'Faculty' },
        { name: 'Research', count: byType.research, color: colors.research, x: portrait ? centerX : articleState.width * CONFIG.facultySubtypeX2, y: portrait ? articleState.height * MOBILE_CONFIG.facultySubtypeY2 : articleState.height / 2, visible: true, sourceGroup: 'Faculty' },
        { name: 'Students', count: 0, color: colors.students, x: articleState.width / 2, y: articleState.height / 2, visible: false },
        { name: 'Staff', count: 0, color: colors.staff, x: articleState.width / 2, y: articleState.height / 2, visible: false }
      ]
    };
  }

  function getStage11() {
    // Return to three-group view: Students, Faculty, and Staff
    const portrait = isPortrait();
    const centerX = articleState.width / 2;
    return {
      shuffle: false,
      showLabels: true,
      groups: [
        { name: 'Students', count: brownData.students.total, color: colors.students, x: portrait ? centerX : articleState.width * CONFIG.threeGroupX1, y: portrait ? articleState.height * MOBILE_CONFIG.threeGroupY1 : articleState.height / 2, visible: true },
        { name: 'Faculty', count: brownData.faculty.total, color: colors.faculty, x: portrait ? centerX : articleState.width * CONFIG.threeGroupX2, y: portrait ? articleState.height * MOBILE_CONFIG.threeGroupY2 : articleState.height / 2, visible: true },
        { name: 'Staff', count: brownData.staff.total, color: colors.staff, x: portrait ? centerX : articleState.width * CONFIG.threeGroupX3, y: portrait ? articleState.height * MOBILE_CONFIG.threeGroupY3 : articleState.height / 2, visible: true }
      ]
    };
  }

  function getStage12() {
    // Staff only, centered
    const centerX = articleState.width / 2;
    const centerY = articleState.height / 2;
    
    return {
      shuffle: false,
      showLabels: false,
      groups: [
        { name: 'Staff', count: brownData.staff.total, color: colors.staff, x: centerX, y: centerY, visible: true, clusterSpread: CONFIG.stage12StaffSpread },
        { name: 'Students', count: brownData.students.total, color: colors.students, x: centerX, y: centerY, visible: false },
        { name: 'Faculty', count: brownData.faculty.total, color: colors.faculty, x: centerX, y: centerY, visible: false }
      ]
    };
  }

  function getStage13() {
    // Final view: all three groups mixed together in center (like stage 0)
    const centerX = articleState.width / 2;
    const centerY = articleState.height / 2;
    return {
      shuffle: true, // Mix all dots together
      groups: [
        { name: 'Students', count: brownData.students.total, color: colors.students, x: centerX, y: centerY, visible: true },
        { name: 'Faculty', count: brownData.faculty.total, color: colors.faculty, x: centerX, y: centerY, visible: true },
        { name: 'Staff', count: brownData.staff.total, color: colors.staff, x: centerX, y: centerY, visible: true }
      ]
    };
  }

  const STAGE_FUNCTIONS = [getStage0, getStage1, getStage2, getStage3, getStage4, getStage5, getStage6, getStage7, getStage8, getStage9, getStage10, getStage11, getStage12, getStage13];

  // ============================================
  // Dot Generation - Creates base dots for the 3 main groups
  // ============================================

  function generateBaseDots() {
    const dots = [];
    const centerX = articleState.width / 2;
    const centerY = articleState.height / 2;
    
    // Calculate total for shared radius
    const totalCount = scaledCount(brownData.students.total) + 
                       scaledCount(brownData.faculty.total) + 
                       scaledCount(brownData.staff.total);
    const sharedRadius = Math.sqrt(totalCount) * CONFIG.stage0ClusterSpread;

    // Generate student dots with fixed subgroup assignments based on 2024 data
    const byType = brownData.students.byType;
    const undergradCount = scaledCount(byType.undergrad);
    const gradCount = scaledCount(byType.grad);
    const medicalCount = scaledCount(byType.medical);
    
    // Track index within each subgroup for historical visibility
    let undergradIdx = 0;
    let gradIdx = 0;
    let medicalIdx = 0;
    
    for (let i = 0; i < scaledCount(brownData.students.total); i++) {
      const pos = randomInCircle(centerX, centerY, sharedRadius);
      
      // Assign fixed subgroup based on 2024 proportions
      let subGroup, subGroupIndex;
      if (i < undergradCount) {
        subGroup = 'Undergraduate';
        subGroupIndex = undergradIdx++;
      } else if (i < undergradCount + gradCount) {
        subGroup = 'Graduate';
        subGroupIndex = gradIdx++;
      } else {
        subGroup = 'Medical';
        subGroupIndex = medicalIdx++;
      }
      
      dots.push({
        x: pos.x,
        y: pos.y,
        targetX: pos.x,
        targetY: pos.y,
        color: colors.students,
        baseGroup: 'Students',
        subGroup: subGroup,           // Fixed subgroup assignment
        subGroupIndex: subGroupIndex, // Index within subgroup for historical visibility
        currentGroup: 'Students',
        opacity: 0,
        targetOpacity: 0.9
      });
    }

    // Generate faculty dots with fixed subgroup assignments
    const facultyByType = brownData.faculty.byType;
    const instructionalCount = scaledCount(facultyByType.instructional);
    const researchCount = scaledCount(facultyByType.research);
    
    let instructionalIdx = 0;
    let researchIdx = 0;
    
    for (let i = 0; i < scaledCount(brownData.faculty.total); i++) {
      const pos = randomInCircle(centerX, centerY, sharedRadius);
      
      // Assign fixed subgroup based on proportions
      let facultySubGroup, facultySubGroupIndex;
      if (i < instructionalCount) {
        facultySubGroup = 'Instructional';
        facultySubGroupIndex = instructionalIdx++;
      } else {
        facultySubGroup = 'Research';
        facultySubGroupIndex = researchIdx++;
      }
      
      dots.push({
        x: pos.x,
        y: pos.y,
        targetX: pos.x,
        targetY: pos.y,
        color: colors.faculty,
        baseGroup: 'Faculty',
        subGroup: facultySubGroup,
        subGroupIndex: facultySubGroupIndex,
        currentGroup: 'Faculty',
        opacity: 0,
        targetOpacity: 0.9
      });
    }

    // Generate staff dots
    for (let i = 0; i < scaledCount(brownData.staff.total); i++) {
      const pos = randomInCircle(centerX, centerY, sharedRadius);
      dots.push({
        x: pos.x,
        y: pos.y,
        targetX: pos.x,
        targetY: pos.y,
        color: colors.staff,
        baseGroup: 'Staff',
        subGroup: null,
        currentGroup: 'Staff',
        opacity: 0,
        targetOpacity: 0.9
      });
    }

    // Shuffle for mixed rendering order
    for (let i = dots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dots[i], dots[j]] = [dots[j], dots[i]];
    }

    return dots;
  }

  // ============================================
  // Stage Transitions
  // ============================================

  let pendingStage = null;
  let animationTimer = null;

  function transitionToStage(stageIndex, force = false) {
    if (stageIndex < 0 || stageIndex >= STAGE_FUNCTIONS.length) return;
    if (stageIndex === articleState.currentStage) return;

    // If animating, either queue this stage or interrupt
    if (articleState.animating && !force) {
      pendingStage = stageIndex;
      return;
    }

    // Cancel any pending animation timer
    if (animationTimer) {
      clearTimeout(animationTimer);
      animationTimer = null;
    }

    // Interrupt any ongoing transitions
    articleDotsGroup.selectAll('circle').interrupt();
    articleLabelsGroup.selectAll('*').interrupt();

    const previousStage = articleState.currentStage;
    articleState.animating = true;
    articleState.currentStage = stageIndex;
    pendingStage = null;

    const stage = STAGE_FUNCTIONS[stageIndex]();
    
    // Determine if we should keep positions:
    // - Only keep positions if BOTH current and previous stage have keepPositions
    // - This means 3→4, 4→5, 5→4 keep positions (year transitions)
    // - But 5→6 and 6→5 allow movement (entering/leaving year comparison mode)
    const prevStageConfig = previousStage >= 0 ? STAGE_FUNCTIONS[previousStage]() : null;
    const comingFromKeepPositionsStage = prevStageConfig && prevStageConfig.keepPositions;
    const shouldKeepPositions = stage.keepPositions === true && comingFromKeepPositionsStage;
    
    // Clear labels and year display
    articleLabelsGroup.selectAll('.article-label, .article-year')
      .transition()
      .duration(CONFIG.fadeOutDuration)
      .attr('opacity', 0)
      .remove();

    // Build group lookup
    const groupMap = new Map();
    stage.groups.forEach(g => groupMap.set(g.name, g));

    // Handle student subgroups for stages 2-5 (but not stage 6 which returns to base groups)
    if (stageIndex >= 2 && stageIndex <= 5) {
      const undergrad = groupMap.get('Undergraduate');
      const grad = groupMap.get('Graduate');
      const medical = groupMap.get('Medical');
      
      // Get historical counts for this stage
      const undergradLimit = scaledCount(undergrad.count);
      const gradLimit = scaledCount(grad.count);
      const medicalLimit = scaledCount(medical.count);
      
      // For each subgroup, sort dots by distance from group center
      // and hide the furthest ones beyond the historical limit
      const subGroups = [
        { name: 'Undergraduate', group: undergrad, limit: undergradLimit },
        { name: 'Graduate', group: grad, limit: gradLimit },
        { name: 'Medical', group: medical, limit: medicalLimit }
      ];
      
      subGroups.forEach(({ name, group, limit }) => {
        const subGroupDots = articleState.dots.filter(d => d.subGroup === name);
        const centerX = group.x;
        const centerY = group.y;
        
        // Calculate distance from center for each dot
        subGroupDots.forEach(dot => {
          dot.distanceFromCenter = Math.sqrt(
            Math.pow(dot.x - centerX, 2) + Math.pow(dot.y - centerY, 2)
          );
        });
        
        // Sort by distance (closest first)
        subGroupDots.sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);
        
        // Mark visibility - keep the closest `limit` dots visible
        subGroupDots.forEach((dot, idx) => {
          dot.currentGroup = dot.subGroup;
          dot.historicallyVisible = idx < limit;
        });
      });
      
      // Non-student dots stay hidden
      articleState.dots.forEach(dot => {
        if (dot.baseGroup !== 'Students') {
          dot.historicallyVisible = true;
        }
      });
    } else if (stageIndex >= 7 && stageIndex <= 10) {
      // Handle faculty subgroups for stages 7-10
      const instructional = groupMap.get('Instructional');
      const research = groupMap.get('Research');
      
      // Get historical counts for this stage (stages 8-10 have year data)
      const instructionalLimit = scaledCount(instructional.count);
      const researchLimit = scaledCount(research.count);
      
      // For stages 8-10, sort dots by distance and hide furthest ones beyond historical limit
      if (stageIndex >= 8) {
        const facultySubGroups = [
          { name: 'Instructional', group: instructional, limit: instructionalLimit },
          { name: 'Research', group: research, limit: researchLimit }
        ];
        
        facultySubGroups.forEach(({ name, group, limit }) => {
          const subGroupDots = articleState.dots.filter(d => d.subGroup === name && d.baseGroup === 'Faculty');
          const centerX = group.x;
          const centerY = group.y;
          
          // Calculate distance from center for each dot
          subGroupDots.forEach(dot => {
            dot.distanceFromCenter = Math.sqrt(
              Math.pow(dot.x - centerX, 2) + Math.pow(dot.y - centerY, 2)
            );
          });
          
          // Sort by distance (closest first)
          subGroupDots.sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);
          
          // Mark visibility - keep the closest `limit` dots visible
          subGroupDots.forEach((dot, idx) => {
            dot.currentGroup = dot.subGroup;
            dot.historicallyVisible = idx < limit;
          });
        });
      } else {
        // Stage 7: just set faculty dots to their subgroups, all visible
        articleState.dots.forEach(dot => {
          if (dot.baseGroup === 'Faculty') {
            dot.currentGroup = dot.subGroup;
            dot.historicallyVisible = true;
          }
        });
      }
      
      // Non-faculty dots
      articleState.dots.forEach(dot => {
        if (dot.baseGroup !== 'Faculty') {
          dot.historicallyVisible = true;
        }
      });
    } else {
      // Reset all dots to base group (stages 0, 1, 6)
      articleState.dots.forEach(dot => {
        dot.currentGroup = dot.baseGroup;
        dot.historicallyVisible = true;
      });
    }

    // Calculate positions and visibility for each dot
    if (stage.shuffle) {
      // All visible dots go to shared center position
      const visibleGroups = new Set(stage.groups.filter(g => g.visible).map(g => g.name));
      const visibleDots = articleState.dots.filter(d => d.historicallyVisible && (visibleGroups.has(d.currentGroup) || visibleGroups.has(d.subGroup) || visibleGroups.has(d.baseGroup)));
      const totalCount = visibleDots.length;
      const sharedRadius = Math.sqrt(totalCount) * CONFIG.stage0ClusterSpread;
      const centerX = articleState.width / 2;
      const centerY = articleState.height / 2;

      articleState.dots.forEach(dot => {
        if (!dot.historicallyVisible) {
          dot.targetOpacity = 0;
          return;
        }
        // Check subGroup first for faculty/student type colors, then currentGroup, then baseGroup
        const group = groupMap.get(dot.subGroup) || groupMap.get(dot.currentGroup) || groupMap.get(dot.baseGroup);
        if (group && group.visible) {
          const pos = randomInCircle(centerX, centerY, sharedRadius);
          dot.targetX = pos.x;
          dot.targetY = pos.y;
          dot.targetOpacity = 0.9;
          dot.color = group.color;
        } else {
          dot.targetOpacity = 0;
        }
      });
    } else {
      // Each group gets its own position
      stage.groups.forEach(group => {
        if (!group.visible) return;
        
        // Get all dots for this group (including hidden ones for keepPositions stages)
        const groupDots = articleState.dots.filter(d => {
          if (group.sourceGroup) {
            return d.baseGroup === group.sourceGroup && d.currentGroup === group.name;
          }
          return d.currentGroup === group.name || d.baseGroup === group.name;
        });
        
        // Only count visible dots for cluster radius
        const visibleGroupDots = groupDots.filter(d => d.historicallyVisible);
        const spreadMultiplier = group.clusterSpread || (isPortrait() ? MOBILE_CONFIG.clusterSpread : CONFIG.clusterSpread);
        const clusterRadius = Math.sqrt(visibleGroupDots.length || 1) * spreadMultiplier;

        groupDots.forEach(dot => {
          // If shouldKeepPositions is true, don't move any dots - only change opacity
          if (shouldKeepPositions) {
            dot.targetX = dot.x;
            dot.targetY = dot.y;
          } else {
            const pos = randomInCircle(group.x, group.y, clusterRadius);
            dot.targetX = pos.x;
            dot.targetY = pos.y;
          }
          dot.targetOpacity = dot.historicallyVisible ? 0.9 : 0;
          dot.color = group.color;
        });
      });

      // Handle dots whose groups are not visible
      const visibleGroupNames = new Set(stage.groups.filter(g => g.visible).map(g => g.name));
      articleState.dots.forEach(dot => {
        const inVisible = visibleGroupNames.has(dot.currentGroup) || 
                          stage.groups.some(g => g.visible && g.sourceGroup === dot.baseGroup && g.name === dot.currentGroup);
        if (!inVisible && !visibleGroupNames.has(dot.baseGroup)) {
          dot.targetOpacity = 0;
          if (shouldKeepPositions) {
            dot.targetX = dot.x;
            dot.targetY = dot.y;
          }
        }
      });
    }

    // Animate dots
    articleDotsGroup.selectAll('circle')
      .data(articleState.dots)
      .transition()
      .duration(CONFIG.animDuration)
      .ease(d3.easeCubicInOut)
      .attr('cx', d => d.targetX)
      .attr('cy', d => d.targetY)
      .attr('fill', d => d.color)
      .attr('opacity', d => d.targetOpacity);

    // After animation, update actual positions and show labels
    animationTimer = setTimeout(() => {
      articleState.dots.forEach(dot => {
        dot.x = dot.targetX;
        dot.y = dot.targetY;
        dot.opacity = dot.targetOpacity;
      });

      // Show year label if specified
      if (stage.showYear) {
        renderYearLabel(stage.showYear, stage.yearColor || '#4A90E2');
      }

      if (stage.showLabels) {
        renderLabels(stage.groups.filter(g => g.visible));
      }

      articleState.animating = false;
      
      // If there's a pending stage, transition to it
      if (pendingStage !== null && pendingStage !== articleState.currentStage) {
        const nextStage = pendingStage;
        pendingStage = null;
        transitionToStage(nextStage, true);
      }
    }, CONFIG.animDuration);
  }

  // ============================================
  // Year Label Rendering
  // ============================================

  function renderYearLabel(year, color) {
    const portrait = isPortrait();
    articleLabelsGroup.append('text')
      .attr('class', 'article-year')
      .attr('x', portrait ? articleState.width / 2 : articleState.width * CONFIG.yearX)
      .attr('y', portrait ? articleState.height * MOBILE_CONFIG.yearY : articleState.height / 2)
      .attr('text-anchor', portrait ? 'middle' : 'start')
      .attr('dominant-baseline', 'middle')
      .attr('fill', color)
      .attr('font-family', '"freight-text-pro", Georgia, serif')
      .attr('font-size', portrait ? MOBILE_CONFIG.yearFontSize : '72px')
      .attr('font-weight', '700')
      .attr('opacity', 0)
      .text(year)
      .transition()
      .duration(CONFIG.animDuration / 2)
      .attr('opacity', 1);
  }

  // ============================================
  // Label Rendering
  // ============================================

  function renderLabels(groups) {
    const portrait = isPortrait();
    groups.forEach(group => {
      const count = scaledCount(group.count);
      const spreadMultiplier = group.clusterSpread || (portrait ? MOBILE_CONFIG.clusterSpread : CONFIG.clusterSpread);
      const radius = Math.sqrt(count) * spreadMultiplier;
      const labelOffset = portrait ? MOBILE_CONFIG.labelOffset : 25;
      const countOffset = portrait ? MOBILE_CONFIG.countOffset : 45;

      articleLabelsGroup.append('text')
        .attr('class', 'article-label')
        .attr('x', group.x)
        .attr('y', group.y + radius + labelOffset)
        .attr('text-anchor', 'middle')
        .attr('fill', '#333')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', portrait ? MOBILE_CONFIG.labelFontSize : '16px')
        .attr('font-weight', '600')
        .attr('opacity', 0)
        .text(group.name)
        .transition()
        .duration(CONFIG.animDuration / 2)
        .attr('opacity', 1);

      articleLabelsGroup.append('text')
        .attr('class', 'article-label')
        .attr('x', group.x)
        .attr('y', group.y + radius + countOffset)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', portrait ? MOBILE_CONFIG.countFontSize : '14px')
        .attr('opacity', 0)
        .text(group.count.toLocaleString())
        .transition()
        .duration(CONFIG.animDuration / 2)
        .attr('opacity', 1);
    });
  }

  // ============================================
  // IntersectionObserver Setup
  // ============================================

  function setupArticleObserver() {
    const articleSections = document.querySelectorAll('.article-section');
    
    if (articleSections.length === 0) {
      setTimeout(() => transitionToStage(0), 500);
      return;
    }

    // Track intersection ratios to determine which section is most visible
    const sectionVisibility = new Map();
    
    const observer = new IntersectionObserver((entries) => {
      // Update visibility map
      entries.forEach(entry => {
        const stageIndex = parseInt(entry.target.dataset.stage, 10);
        if (!isNaN(stageIndex)) {
          sectionVisibility.set(stageIndex, entry.intersectionRatio);
        }
      });
      
      // Find the most visible section
      let mostVisibleStage = -1;
      let highestRatio = 0;
      
      sectionVisibility.forEach((ratio, stage) => {
        if (ratio > highestRatio) {
          highestRatio = ratio;
          mostVisibleStage = stage;
        }
      });
      
      // Only transition if we have a clear winner with decent visibility
      if (mostVisibleStage >= 0 && highestRatio > 0.2) {
        transitionToStage(mostVisibleStage);
      }
    }, {
      root: null,
      rootMargin: CONFIG.observerRootMargin,
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0]
    });

    articleSections.forEach(section => observer.observe(section));

    // Fallback scroll listener for fast scrolling
    // Checks which section is most centered in viewport
    let scrollTimeout = null;
    let lastCheckedStage = -1;
    
    function checkVisibleSection() {
      const viewportCenter = window.innerHeight / 2;
      let closestStage = -1;
      let closestDistance = Infinity;

      articleSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        
        // Only consider sections that are at least partially visible
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          if (distance < closestDistance) {
            closestDistance = distance;
            closestStage = parseInt(section.dataset.stage, 10);
          }
        }
      });

      if (closestStage >= 0 && closestStage !== lastCheckedStage) {
        lastCheckedStage = closestStage;
        transitionToStage(closestStage);
      }
    }
    
    window.addEventListener('scroll', () => {
      // Immediate check for fast response
      checkVisibleSection();
      
      // Also debounced check to catch settling
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkVisibleSection, 100);
    }, { passive: true });
  }

  // ============================================
  // Initialization
  // ============================================

  function initArticleDots() {
    if (articleState.initialized) return;

    // Generate base dots
    articleState.dots = generateBaseDots();

    // Initial render (invisible)
    articleDotsGroup.selectAll('circle')
      .data(articleState.dots)
      .join('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', CONFIG.dotRadius)
      .attr('fill', d => d.color)
      .attr('opacity', 0);

    // Setup scroll observer
    setupArticleObserver();

    // Trigger first stage
    setTimeout(() => transitionToStage(0), 300);

    articleState.initialized = true;
  }

  // ============================================
  // Window Resize
  // ============================================

  window.addEventListener('resize', () => {
    articleState.width = window.innerWidth;
    articleState.height = window.innerHeight;

    if (articleState.initialized && articleState.currentStage >= 0) {
      const currentStage = articleState.currentStage;
      articleState.currentStage = -1;
      articleState.animating = false;
      transitionToStage(currentStage);
    }
  });

  // ============================================
  // Start
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArticleDots);
  } else {
    initArticleDots();
  }

})();
