// Curated, high-resolution, healthcare-focused imagery and avatar assets
// Uses reliable, high-speed Unsplash healthcare photography and optimized avatars with fallback SVGs

export const IMAGES = {
  // Brand & Hospital Architecture
  hospitalHero: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
  hospitalModern: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=80',
  hospitalInterior: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80',
  hospitalCorridor: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1000&q=80',
  emergencyCare: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',

  // Department Showcase Banners
  departments: {
    CARD: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=800&q=80', // Cardiology / Heart Monitor
    SURG: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80', // Modern Operating Theater
    NEUR: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80', // Neurology / Brain Scan
    PEDI: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80', // Pediatrics / Care
    ORTH: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80', // Orthopedics / Mobility
    EMER: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=800&q=80', // Emergency / Trauma
    LAB: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80', // Diagnostic Lab / Microscope
    PHARM: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80', // Pharmacy Dispensary
    ICU: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80', // ICU / Smart Monitoring
  },

  // Doctor Profile Avatars
  doctors: [
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80', // Male senior physician (Dr. House)
    'https://images.unsplash.com/photo-1594824813580-b7493a557b64?auto=format&fit=crop&w=400&q=80', // Female surgeon (Dr. Meredith)
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80', // Male doctor smiling
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80', // Female doctor with stethoscope
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80', // Male young doctor
    'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80', // Female specialist
  ],

  // Staff / Roles Avatars
  roles: {
    Administrator: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    Doctor: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    Nurse: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80',
    Receptionist: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    'Laboratory Staff': 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=400&q=80',
    Pharmacist: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=400&q=80',
    Accountant: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  },

  // Diverse Patient Avatars
  patients: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  ],
};

/**
 * Get a deterministic doctor avatar based on ID or index
 */
export const getDoctorAvatar = (idOrIndex) => {
  if (typeof idOrIndex === 'number') {
    return IMAGES.doctors[idOrIndex % IMAGES.doctors.length];
  }
  if (!idOrIndex) return IMAGES.doctors[0];
  const charSum = String(idOrIndex).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return IMAGES.doctors[charSum % IMAGES.doctors.length];
};

/**
 * Get a deterministic patient avatar based on ID or index
 */
export const getPatientAvatar = (idOrIndex) => {
  if (typeof idOrIndex === 'number') {
    return IMAGES.patients[idOrIndex % IMAGES.patients.length];
  }
  if (!idOrIndex) return IMAGES.patients[0];
  const charSum = String(idOrIndex).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return IMAGES.patients[charSum % IMAGES.patients.length];
};

/**
 * Get department banner photo
 */
export const getDepartmentImage = (deptCode) => {
  return IMAGES.departments[deptCode] || IMAGES.hospitalInterior;
};

/**
 * Get role avatar photo
 */
export const getRoleAvatar = (role) => {
  return IMAGES.roles[role] || IMAGES.roles.Administrator;
};

