// Brown Community Visualization Data
// Real data for Brown University

const brownData = {
  year: 2024,
  totalCount: 16916,

  students: {
    total: 11205,
    byType: {
      undergrad: 7210,
      grad: 3399,
      medical: 596
    }
  },

  faculty: {
    total: 1740,
    byType: {
      instructional: 1164,
      research: 576
    }
  },

  staff: {
    total: 3971
  }
};

const brownData2014 = {
  year: 2014,
  students: {
    total: 8824,
    byType: {
      undergrad: 6243,
      grad: 2091,
      medical: 490
    }
  },
  faculty: {
    total: 1333,
    byType: {
      instructional: 924,
      research: 409
    }
  }
}

const brownData2004 = {
  year: 2004,
  students: {
    total: 7679,
    byType: {
      undergrad: 5752,
      grad: 1597,
      medical: 330
    }
  },
  faculty: {
    total: 1103,
    byType: {
      instructional: 805,
      research: 298
    }
  }
}

// Color palette
const colors = {
  students: '#4A90E2',
  faculty: '#F5A623',
  staff: '#7ED321',

  // Student type colors
  undergrad: '#4A90E2',
  grad: '#2D7DD2',
  medical: '#1B4F72',

  // Faculty type colors
  instructional: '#F5A623',
  research: '#D4820E',

  // Gender colors
  men: '#4A90E2',
  women: '#E94B8C',
  nonBinary: '#9B59B6',

  // Degree level colors
  bachelors: '#1E5A8E',
  masters: '#D35400',

  // Muted versions (30% opacity)
  mutedStudents: 'rgba(74, 144, 226, 0.3)',
  mutedFaculty: 'rgba(245, 166, 35, 0.3)',
  mutedStaff: 'rgba(126, 211, 33, 0.3)'
};
