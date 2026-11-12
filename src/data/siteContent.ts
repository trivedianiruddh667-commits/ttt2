export interface TechnicalStaffMember {
  name: string;
  role: string;
  domain: string;
  bio: string;
  experience: string;
  rating: number;
  impactMetric: string;
  imageUrl?: string;
}

export interface SiteContent {
  home: {
    hero: {
      badge: string;
      headlinePart1: string;
      headlinePart2: string;
      description: string;
      ctaExploreLabel: string;
      ctaJoinLabel: string;
      trustStrip: string[];
    };
    editorial: {
      badge: string;
      headline: string;
      description: string;
      imageUrl: string;
      imageAlt: string;
      checkPoints: string[];
    };
    stats: {
      value: number;
      suffix: string;
      label: string;
    }[];
    slogans: {
      slogan1: string;
      subtext1: string;
      slogan2: string;
      subtext2: string;
      slogan3: string;
      subtext3: string;
    };
    marqueeItems: string[];
    testimonials: {
      student: string;
      score: string;
      college: string;
      branch: string;
      quote: string;
    }[];
  };

  about: {
    header: {
      badge: string;
      titleLine1: string;
      titleLine2: string;
      description: string;
    };
    story: {
      badge: string;
      headline: string;
      paragraph1: string;
      paragraph2: string;
      quoteBox: string;
      imageUrl: string;
      imageAlt: string;
    };
    pillarsBadge: string;
    pillarsTitle: string;
    pillars: {
      number: string;
      title: string;
      description: string;
      tag: string;
    }[];
    marqueeItems: string[];
  };

  team: {
    header: {
      badge: string;
      title: string;
      description: string;
    };
    founderSpotlightBadge: string;
    founderTitle: string;
    founderSub: string;
    founderBio: string;
    founderQuote: string;
    founderImageUrl: string;
    members: {
      name: string;
      role: string;
      subject: string;
      bio: string;
      experience: string;
      rating: number;
      studentsTaught: string;
      imageUrl?: string;
    }[];
    technicalHeader?: {
      badge: string;
      title: string;
      description: string;
    };
    technicalMembers?: TechnicalStaffMember[];
    marqueeItems: string[];
  };

  collabs: {
    header: {
      badge: string;
      title: string;
      description: string;
    };
    marqueeItems: string[];
    blinkit: {
      partnerName: string;
      partnerBadge: string;
      headline: string;
      description: string;
      promoCode: string;
      discountText: string;
      features: string[];
    };
    zepto: {
      partnerName: string;
      partnerBadge: string;
      headline: string;
      description: string;
      promoCode: string;
      discountText: string;
      features: string[];
    };
    howItWorksTitle: string;
    howItWorksSteps: {
      step: string;
      title: string;
      description: string;
    }[];
  };

  quickLearning: {
    header: {
      badge: string;
      title: string;
      description: string;
    };
    sosBannerTitle: string;
    sosBannerSubtext: string;
    marqueeItems: string[];
    features: {
      title: string;
      description: string;
    }[];
  };

  contact: {
    header: {
      badge: string;
      title: string;
      description: string;
    };
    sosDirectLineTitle: string;
    sosDirectLineSub: string;
    phone1: string;
    phone2: string;
    emailSupport: string;
    emailGrievance: string;
    officeAddress: string;
    officeHours: string;
    faqs: {
      question: string;
      answer: string;
    }[];
  };

  footer: {
    brandDescription: string;
    estYear: string;
    enrolledCount: string;
    isoCompliance: string;
    copyrightText: string;
    emergencyEmail: string;
    telegramCommunity: string;
  };

  ratingOverrides?: {
    teachers?: Record<string, number>;
    courses?: Record<string, number>;
    quickLearning?: Record<string, number>;
  };
}

export const AVAILABLE_GALLERY_IMAGES = [
  {
    id: 'hero_students',
    name: 'Engineering Students Studying (Editorial Hero)',
    url: '/src/assets/images/hero_students_bw_1793717856347.jpg'
  },
  {
    id: 'founder_portrait',
    name: 'Ajay "Techie" Kalki (Founder Portrait)',
    url: '/assets/aistudio/Founder_photo_94b319e5.png'
  },
  {
    id: 'tribe_campus',
    name: 'Brutalist Campus Library & Quad (Campus Architecture)',
    url: '/src/assets/images/tribe_campus_bw_1793717857750.jpg'
  },
  {
    id: 'student_desk',
    name: 'Late-Night Student Study Desk with Notes (Desk Setup)',
    url: '/src/assets/images/student_desk_bw_1793717857911.jpg'
  },
  {
    id: 'aniruddh_portrait',
    name: 'Aniruddh Trivedi (Website Designer and Administrator)',
    url: '/assets/aistudio/Aniruddh_photo_47ab7886.png'
  },
  {
    id: 'aryan_photo',
    name: 'Aryan Yadav (Researcher and Content Organiser)',
    url: '/assets/aistudio/WhatsApp_Image_2026-11-12_at_13.57.50_756694f5.jpeg'
  }
];

export const INITIAL_SITE_CONTENT: SiteContent = {
  home: {
    hero: {
      badge: 'BATTLE-TESTED CURRICULUM · ISO 9001:2015 COMPLIANT',
      headlinePart1: 'DOMINATE YOUR SEMESTER.',
      headlinePart2: 'BUILT BY TECHIE TEACHERS.',
      description:
        'Battle-tested university curriculum simplified. Concise handwritten topper notes, 3-hour fast-track exam busters, and university derivations for ambitious college students.',
      ctaExploreLabel: 'Explore Courses',
      ctaJoinLabel: 'Join the Tribe',
      trustStrip: ['OVER 180+ UNIVERSITIES', 'INSTANT DIGITAL ACCESS', 'ZERO FLUFF PROMISE']
    },
    editorial: {
      badge: 'THE REALITY CHECK',
      headline: '900 Pages of Reference Books condensed into 60 high-yield pages.',
      description:
        'Semester syllabi are notorious for bulky 1,200-page foreign author textbooks that professors read off slides. We replace confusion with hand-drawn timing diagrams, proof templates that score 10/10, and crash courses you can finish over a single weekend.',
      imageUrl: '/src/assets/images/hero_students_bw_1793717856347.jpg',
      imageAlt: 'Engineering students studying with Techie Teacher notes',
      checkPoints: [
        'Step-by-step mathematical proofs with marking scheme hints',
        'Direct exam question patterns from last 10 years',
        'Physical delivery in 10 minutes via Blinkit & Zepto'
      ]
    },
    stats: [
      { value: 42000, suffix: '+', label: 'Active Students Enrolled' },
      { value: 180, suffix: '+', label: 'University Syllabi Covered' },
      { value: 99.4, suffix: '%', label: 'Semester Exam Clearance' },
      { value: 350, suffix: '+', label: 'Topper Handwritten Notes' }
    ],
    slogans: {
      slogan1: 'Education, made simpler and smarter.',
      subtext1:
        'Zero jargon. Zero filler. Crafted by experienced professors who know exactly what examiners look for.',
      slogan2: 'From Notes to Knowledge.',
      subtext2:
        "Don't just pass. Understand the core principles and carry them straight into your placements and internships.",
      slogan3: 'Built by Teachers. Made for Students.',
      subtext3:
        "We are educators by trade, engineers by choice, and students' biggest allies by mission."
    },
    marqueeItems: [
      'ZERO ACADEMIC FLUFF',
      'HIGH-YIELD HANDWRITTEN PROOFS',
      'END-TERM SOS ACCELERATOR',
      '10-MINUTE QUICK COMMERCE PRINT DISPATCH',
      '180+ UNIVERSITY SYLLABI'
    ],
    testimonials: [
      {
        quote:
          'I was on the verge of a backlog in Mathematics III with just 48 hours left for the end-term. The Tribe formula vault and Laplace crash course brought me an 8.6 SGPA.',
        student: 'Aarav Malhotra',
        college: 'Delhi Technological University (DTU)',
        branch: 'Computer Science, 4th Sem',
        score: 'SGPA 8.6'
      },
      {
        quote:
          'The handwritten DBMS notes are pure gold. The BCNF decomposition step-by-step layout alone fetched me full 20 marks in Section C.',
        student: 'Riya Kulkarni',
        college: 'Pune University (SPPU)',
        branch: 'Information Technology, 3rd Sem',
        score: 'SGPA 9.2'
      },
      {
        quote:
          "Our college professors covered 8086 microprocessors in slides that made no sense. Techie Teacher's Tribe timing diagrams made the whole paper a breeze.",
        student: 'Harsh Vardhan Singh',
        college: 'Vellore Institute of Technology (VIT)',
        branch: 'ECE, 5th Sem',
        score: 'SGPA 8.9'
      }
    ]
  },

  about: {
    header: {
      badge: 'OUR PURPOSE & CALLING',
      titleLine1: 'WE ARE THE TRUST.',
      titleLine2: 'WE ARE THE TRIBE.',
      description:
        'Founded by veteran college faculty and software architects to deliver engineering clarity, eliminate backlog dread, and give students back their weekends.'
    },
    story: {
      badge: 'CHAPTER 01 · THE PROBLEM',
      headline: 'Higher education was designed in 1982. Students live in 2026.',
      paragraph1:
        'Every semester, 1.5 million Indian engineering students are handed 1,200-page foreign author textbooks, obscure photocopied notes, and PowerPoint slides read verbatim by bored lecturers.',
      paragraph2:
        "When end-term exams approach, panic sets in. Students pull frantic all-nighters, hunting through 10 disparate YouTube playlists and illegible xerox packets. We realized: this isn't a student problem. It’s an educational delivery failure.",
      quoteBox:
        'Students don’t need more data. They need distilled signal, structured answers, and teachers who know the pain of exam halls.',
      imageUrl: '/src/assets/images/tribe_campus_bw_1793717857750.jpg',
      imageAlt: 'Engineering students discussing notes in concrete library'
    },
    pillarsBadge: 'THE THREE LAWS',
    pillarsTitle: "Why Techie Teacher's Tribe Trust Exists",
    pillars: [
      {
        number: '01',
        title: 'The 10-Mark Answer Formula',
        description:
          'University evaluators spend 90 seconds scanning an answer sheet. Our handwritten notes teach you the exact diagram layouts, bold keywords, and proof deductions that score full marks every single time.',
        tag: 'MAXIMUM MARKS PER MINUTE'
      },
      {
        number: '02',
        title: '3-Hour Fast-Track Modules',
        description:
          'Every course is structured as an emergency sprint. No 90-hour rambling lectures. We explain the core theory, work through past 10 years exam numericals, and furnish printable cheat sheets in under 180 minutes.',
        tag: 'ZERO WAFFLE GUARANTEE'
      },
      {
        number: '03',
        title: 'The Teacher-Student Trust Bond',
        description:
          'Unlike faceless corporate ed-tech platforms, every module here is personally authored and updated every semester by verified senior professors who remain directly reachable on campus helplines.',
        tag: 'VERIFIED FACULTY ONLY'
      }
    ],
    marqueeItems: [
      'THE TRIBE MANIFESTO',
      'ACADEMIC RIGOR',
      'NO BACKLOGS',
      'STUDENT FIRST',
      '180+ UNIVERSITIES'
    ]
  },

  team: {
    header: {
      badge: 'FACULTY & ARCHITECTS',
      title: 'Our Tribe',
      description:
        "The educators behind Techie Teacher's Tribe Trust aren't corporate pitchmen. We are battle-hardened professors, former exam toppers, and system engineers who know what examiners evaluate."
    },
    founderSpotlightBadge: 'FOUNDER SPOTLIGHT',
    founderTitle: 'Ajay "Techie" Kalki',
    founderSub: 'Founder & Chief Tribe Architect · University Mentorship',
    founderBio:
      'Over the past decade, Ajay has mentored more than 1500 students across India. Disillusioned with outdated university slides and bulky foreign textbooks, he created the high-yield note methodology that turned average semester scorers into university rank holders.',
    founderQuote:
      'If a student fails an end-term exam, the professor failed first. Our mission is to make sure not a single hardworking student ever faces backlog dread again.',
    founderImageUrl: '/assets/aistudio/Founder_photo_94b319e5.png',
    members: [
      {
        name: 'Prof. Alok Verma',
        role: 'Lead Mentor',
        subject: 'Data Structures, Algorithms & C++',
        bio: 'Ex-IIT Delhi, specialized in making abstract pointer trees and recursive mathematical models instantly graspable with crisp whiteboard diagrams.',
        experience: '9 Years Teaching',
        rating: 4.92,
        studentsTaught: '28,000+'
      },
      {
        name: 'Dr. Sneha Iyer',
        role: 'Senior Academician',
        subject: 'Applied Mathematics & Computational Methods',
        bio: 'Doctorate in Applied Mathematics. Renowned across campuses for reducing 40-step Laplace & Fourier derivations into memorable 3-step algorithms.',
        experience: '11 Years Teaching',
        rating: 4.95,
        studentsTaught: '32,000+'
      },
      {
        name: 'Prof. Kabir Rao',
        role: 'Hardware Systems Lead',
        subject: 'Digital Electronics, Microprocessors & IoT',
        bio: 'Veteran embedded systems educator. Breaks down intricate 8086 timing diagrams and digital state machines with zero academic fluff.',
        experience: '8 Years Teaching',
        rating: 4.88,
        studentsTaught: '19,500+'
      },
      {
        name: 'Dr. Nandini Sen',
        role: 'Systems Mentor',
        subject: 'Database Systems, Cloud Architectures & SQL',
        bio: 'Author of the acclaimed "Relational Algebra to SQL Masterbook". Guiding students to score full 10-out-of-10 marks in normalization questions.',
        experience: '10 Years Teaching',
        rating: 4.91,
        studentsTaught: '24,000+'
      },
      {
        name: 'Er. Priya Desai',
        role: 'Network Specialist',
        subject: 'Computer Networks, Web Architecture & Security',
        bio: 'Passionate computer science educator bringing practical protocol trace analysis and packet breakdown directly to end-term theory exam prep.',
        experience: '7 Years Teaching',
        rating: 4.89,
        studentsTaught: '17,200+'
      }
    ],
    technicalHeader: {
      badge: 'INFRASTRUCTURE & SYSTEMS CADRE',
      title: 'Technical Tribal',
      description:
        'The systems engineers and software architects building the high-speed infrastructure that delivers semester courses, real-time live doubt sessions, and handwritten notes without downtime.'
    },
    technicalMembers: [
      {
        name: 'Aniruddh Trivedi',
        role: 'Website Designer and Administrator',
        domain: 'UI/UX Architecture, Web Performance & Platform Administration',
        bio: "Lead designer and platform administrator of Techie Teacher's Tribe Trust. Architect of the high-impact visual design system, responsive student interfaces, and cloud platform operations.",
        experience: 'Lead Designer & Administrator',
        rating: 4.99,
        impactMetric: 'OFFICIAL PLATFORM ARCHITECT',
        imageUrl: '/assets/aistudio/Aniruddh_photo_47ab7886.png'
      },
      {
        name: 'Aryan Yadav',
        role: 'Researcher and Content Organiser',
        domain: 'Structuring Raw Information Into Organised Digital Assets, Websites And Knowledge Bases',
        bio: 'Specializes in structuring and transforming complex engineering curricula and raw research notes into organized, high-yield digital learning assets, structured portals, and student knowledge vaults.',
        experience: 'Content & Research Lead',
        rating: 4.97,
        impactMetric: 'CURRICULUM RESEARCH LEAD',
        imageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-12_at_13.57.50_756694f5.jpeg'
      }
    ],
    marqueeItems: [
      'FOUNDER & ARCHITECTS',
      'RESEARCHERS',
      'EX-IIT FACULTY',
      'TOPPER MENTORS',
      'ZERO JARGON'
    ]
  },

  collabs: {
    header: {
      badge: 'STRATEGIC PARTNERSHIPS',
      title: 'Our Collabs',
      description:
        "We teamed up with India's leading quick-commerce giants to solve the perennial campus dilemma: getting physical printed notes and formula sheets in 10 minutes flat."
    },
    marqueeItems: [
      'BLINKIT 10-MINUTES',
      'ZEPTO EXAM SOS',
      'PHYSICAL PRINTED NOTES',
      'HOSTEL GATE DELIVERY',
      'CAMPUS EXCLUSIVE OFFERS'
    ],
    blinkit: {
      partnerName: 'Blinkit',
      partnerBadge: 'OFFICIAL 10-MIN CAMPUS PRINT PARTNER',
      headline: 'Spiral-Bound Notes to your Hostel Gate in 10 Minutes',
      description:
        'Forgot to print formula sheets for tomorrow morning’s 9 AM exam? Order Techie Teacher’s Tribe official high-contrast printed booklets directly via the Blinkit app.',
      promoCode: 'TRIBE10',
      discountText: 'Use code TRIBE10 for ₹50 off on first print delivery',
      features: [
        '80 GSM heavy smudge-proof matte paper',
        'High-contrast black & white diagrams optimized for desk lamps',
        'Pre-punched spiral binding with protective frosted covers',
        'Available 24x7 during university examination weeks'
      ]
    },
    zepto: {
      partnerName: 'Zepto',
      partnerBadge: 'NIGHT SPRINT SOS PARTNER',
      headline: 'Midnight SOS Delivery for Night Owls & Exam Preppers',
      description:
        'Late-night cram sessions meet 10-minute dark store delivery. Get printed past-10-years solved question banks right outside your college gate until 3:00 AM.',
      promoCode: 'ZEPTOTRIBE',
      discountText: 'Use code ZEPTOTRIBE for flat ₹75 off on orders above ₹299',
      features: [
        'Late-night hostel delivery across 18 major engineering hubs',
        'Direct pickup locker support outside campus hostels',
        'Bundled with highlighter pens and formula bookmarks',
        'Real-time rider tracking with discreet delivery protocol'
      ]
    },
    howItWorksTitle: 'How Quick-Commerce Campus Delivery Works',
    howItWorksSteps: [
      {
        step: '01',
        title: 'Open Blinkit or Zepto App',
        description: 'Search for "Techie Teacher Notes" or scan QR codes posted across your college notice boards.'
      },
      {
        step: '02',
        title: 'Select Your University Subject',
        description: 'Choose your exact branch, semester, and course code (e.g., CS-301 DSA or MATH-201).'
      },
      {
        step: '03',
        title: 'Collect at Hostel Gate in 10 Mins',
        description: 'A rider delivers your spiral-bound high-contrast printed kit in ten minutes flat.'
      }
    ]
  },

  quickLearning: {
    header: {
      badge: 'FAST-TRACK SPRINT DIVISION',
      title: 'Quick Learning SOS',
      description:
        'Exam in 48 hours? Our battle-tested 3-hour fast-track modules and high-contrast formula sheets turn panic into top-tier university SGPA scores.'
    },
    sosBannerTitle: 'THE 3-HOUR EXAM RESCUE FORMULA',
    sosBannerSubtext:
      'We dissected 10 years of university end-term papers across DTU, AKTU, SPPU, Anna Univ, and VTU. 80% of questions come from just 20% of core topics.',
    marqueeItems: [
      '3-HOUR FAST-TRACK MODULES',
      'NO MORE BACKLOG PANIC',
      'HIGH-YIELD DERIVATION PROOFS',
      'HANDWRITTEN FORMULA VAULTS',
      'WEEKEND PASS GUARANTEE'
    ],
    features: [
      {
        title: '180-Minute Maximum Length',
        description: 'Every fast-track module is strictly edited down to 3 hours. Zero professor tangents or boring slide readings.'
      },
      {
        title: 'Anticipated 10-Mark Questions',
        description: 'We highlight the exact numerical problems and derivation proofs examiners repeat year after year.'
      },
      {
        title: 'Print-Ready Formula Sheets',
        description: 'Every module includes a 2-page concise PDF summary that contains every equation you need to memorize.'
      }
    ]
  },

  contact: {
    header: {
      badge: 'DIRECT STUDENT DESK',
      title: 'Contact the Tribe',
      description:
        'Have a question about a syllabus breakdown, need urgent notes before tomorrow’s exam, or seeking university mentorship? Our faculty desk responds within 2 hours.'
    },
    sosDirectLineTitle: 'SOS EXAM HELPLINE & PHYSICAL HEADQUARTERS',
    sosDirectLineSub: 'Active 24/7 during university end-term exam cycles.',
    phone1: '+91 98765 43210 (SOS Exam Desk)',
    phone2: '+91 87654 32109 (Faculty Line)',
    emailSupport: 'cadet-support@techieteachertribe.org',
    emailGrievance: 'directorate@techieteachertribe.org',
    officeAddress: 'Techie Teacher’s Tribe Trust, Level 3, Academic Block B, Okhla Phase III, New Delhi 110020, India',
    officeHours: 'Monday - Saturday: 8:00 AM - 10:00 PM (24/7 during End-Term Weeks)',
    faqs: [
      {
        question: 'Are Techie Teacher notes aligned with my university syllabus?',
        answer: 'Yes. Our curriculum cell maps notes 1:1 against syllabi from DTU, AKTU, SPPU, VTU, Anna University, Mumbai University, and 180+ affiliated colleges.'
      },
      {
        question: 'How quickly do I get digital access after purchase?',
        answer: 'Instant. As soon as payment completes via UPI or Card, your dashboard unlocks full PDF downloads and video streaming immediately.'
      },
      {
        question: 'Can I get physical printed notes delivered to my college hostel?',
        answer: 'Yes! We have partnered with Blinkit and Zepto across 18 major engineering clusters for 10-minute spiral-bound delivery directly to your gate.'
      },
      {
        question: 'Can college professors or toppers contribute notes?',
        answer: 'Absolutely. Use our Teacher Portal to register as a Faculty Mentor or student contributor and earn direct royalties through the Trust.'
      }
    ]
  },

  footer: {
    brandDescription:
      "Techie Teacher's Tribe Trust is an autonomous engineering ed-tech initiative. We produce zero-fluff semester crash courses, handwritten exam booster formulas, and syllabus masterpacks for college and university students nationwide.",
    estYear: 'EST. 2024',
    enrolledCount: '42,000+ ENROLLED',
    isoCompliance: 'ISO 9001:2015 COMPLIANT CURRICULUM',
    copyrightText: '© 2026 Techie Teacher’s Tribe Trust. All rights reserved. Registered under the Indian Trusts Act, 1882.',
    emergencyEmail: 'sos@techieteachertribe.org',
    telegramCommunity: '@TechieTeacherTribe'
  },

  ratingOverrides: {
    teachers: {},
    courses: {},
    quickLearning: {}
  }
};
