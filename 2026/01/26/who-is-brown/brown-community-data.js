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
    },
    byClass: {
      firstYear: 2500,
      sophomore: 2500,
      junior: 2500,
      senior: 2500
    },
    // Class of 2028 gender data (admitted in 2024)
    byGender: {
      men: {
        enrolled: 855,
        admitted: 1326,
        applicants: 18960,
        acceptanceRate: 6.99,
        yieldRate: 64.48
      },
      women: {
        enrolled: 863,
        admitted: 1309,
        applicants: 29917,
        acceptanceRate: 4.38,
        yieldRate: 65.93
      },
      nonBinary: {
        enrolled: 1,
        admitted: 3,
        applicants: 27,
        acceptanceRate: 11.11,
        yieldRate: 33.33
      }
    },
    // Class of 2024 by concentration
    seniorsByConcentration: [
      {
        name: "Social Sciences",
        fullName: "Social Sciences",
        bachelors: 361,
        masters: 141
      },
      {
        name: "Computer Sciences",
        fullName: "Computer and Information Sciences and Support Services",
        bachelors: 222,
        masters: 150
      },
      {
        name: "Biological Sciences",
        fullName: "Biological and Biomedical Sciences",
        bachelors: 224,
        masters: 57
      },
      {
        name: "Engineering",
        fullName: "Engineering",
        bachelors: 99,
        masters: 151
      },
      {
        name: "Mathematics",
        fullName: "Mathematics and Statistics",
        bachelors: 179,
        masters: 14
      },
      {
        name: "Interdisciplinary Studies",
        fullName: "Multi/Interdisciplinary Studies",
        bachelors: 97,
        masters: 113
      },
      {
        name: "English and Literature",
        fullName: "English Language and Literature/Letters",
        bachelors: 82,
        masters: 26
      },
      {
        name: "Physical Sciences",
        fullName: "Physical Sciences",
        bachelors: 52,
        masters: 53
      },
      {
        name: "Health Professions",
        fullName: "Health Professions and Related Programs",
        bachelors: 0,
        masters: 77
      },
      {
        name: "Public Administration",
        fullName: "Public Administration and Social Service Professions",
        bachelors: 12,
        masters: 66
      },
      {
        name: "Visual and Performing Arts",
        fullName: "Visual and Performing Arts",
        bachelors: 49,
        masters: 32
      },
      {
        name: "Psychology",
        fullName: "Psychology",
        bachelors: 55,
        masters: 2
      },
      {
        name: "Education",
        fullName: "Education",
        bachelors: 15,
        masters: 40
      },
      {
        name: "Cultural and Gender Studies",
        fullName: "Area, Ethnic, Cultural, Gender, and Group Studies",
        bachelors: 39,
        masters: 13
      },
      {
        name: "History",
        fullName: "History",
        bachelors: 43,
        masters: 9
      },
      {
        name: "Business and Management",
        fullName: "Business, Management, Marketing, and Related Support Services",
        bachelors: 34,
        masters: 38
      },
      {
        name: "Conservation",
        fullName: "Natural Resources and Conservation",
        bachelors: 34,
        masters: 0
      },
      {
        name: "Foreign Languages",
        fullName: "Foreign Languages, Literatures, and Linguistics",
        bachelors: 28,
        masters: 1
      },
      {
        name: "Communication",
        fullName: "Communication, Journalism, and Related Programs",
        bachelors: 23,
        masters: 2
      },
      {
        name: "Philosophy",
        fullName: "Philosophy and Religious Studies",
        bachelors: 20,
        masters: 1
      },
      {
        name: "Architecture",
        fullName: "Architecture and Related Services",
        bachelors: 14,
        masters: 0
      }
    ]
  },

  faculty: {
    total: 1740,
    byType: {
      instructional: 1164,
      research: 576
    },
    byDepartment: [
      { name: "Humanities", count: 235 },
      { name: "Life & Medical Sciences", count: 193 },
      { name: "Physical Sciences", count: 229 },
      { name: "Social Sciences", count: 223 }
    ],
    byRank: [
      { name: "Professor", men: 313, women: 122 },
      { name: "Associate Professor", men: 97, women: 78 },
      { name: "Assistant Professor", men: 83, women: 84 },
      { name: "Distinguished Senior Lecturer", men: 36, women: 67 }
    ]
  },

  staff: {
    total: 3971,
    byDivision: [
      { name: "Computer & Engineering", fullName: "Computer, Engineering, Science", count: 723 },
      { name: "Business & Finance", fullName: "Business and Financial Operations", count: 647 },
      { name: "Service", fullName: "Service", count: 582 },
      { name: "Office & Admin", fullName: "Office and Administrative Support", count: 529 },
      { name: "Management", fullName: "Management", count: 523 },
      { name: "Community & Arts", fullName: "Community Service, Legal, Arts & Media", count: 351 },
      { name: "Student Affairs", fullName: "Student and Academic Affairs", count: 266 },
      { name: "Maintenance", fullName: "Natural Resources, Construction, Maintenance", count: 119 },
      { name: "Librarians", fullName: "Librarians, Archivists, Curators", count: 65 },
      { name: "Healthcare", fullName: "Healthcare Practitioners and Technical", count: 62 },
      { name: "Library Techs", fullName: "Library Technicians", count: 59 },
      { name: "Sales", fullName: "Sales", count: 26 },
      { name: "Production", fullName: "Production, Transportation, Material Moving", count: 19 }
    ]
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
