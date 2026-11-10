export interface Course {
  id: string;
  title: string;
  code: string;
  teacher: string;
  teacherEmail?: string;
  teacherUid?: string;
  teacherRole: string;
  branch: string;
  semester: string;
  category: 'Full Course' | 'Crash Course' | 'Handwritten Notes' | 'Exam Booster';
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  enrolledCount: number;
  duration: string;
  modulesCount: number;
  pdfPages?: number;
  description: string;
  learningOutcomes: string[];
  isTrending?: boolean;
  trendingRank?: number;
  fastTrackMinutes?: number;
  isApproved: boolean;
  syllabus: { title: string; duration: string; topics: string[] }[];
  pdfNotesUrl?: string;
  uploadedFileName?: string;
  notesContent?: string;
  isNew?: boolean;
  createdAt?: string;
}

const normalizeHonorificName = (raw: string): string =>
  raw
    .trim()
    .toLowerCase()
    .replace(/^(prof\.|dr\.|er\.|mr\.|ms\.|mrs\.)\s+/i, '')
    .replace(/\s+/g, ' ');

export const doesCourseBelongToTeacher = (
  course: Course,
  teacher: { email: string; name: string }
): boolean => {
  const teacherEmailNorm = teacher.email.trim().toLowerCase();
  if (course.teacherEmail && course.teacherEmail.trim().toLowerCase() === teacherEmailNorm) {
    return true;
  }
  if (!course.teacherEmail) {
    const courseTeacherNorm = normalizeHonorificName(course.teacher || '');
    const profileNameNorm = normalizeHonorificName(teacher.name || '');
    return Boolean(courseTeacherNorm && profileNameNorm && courseTeacherNorm === profileNameNorm);
  }
  return false;
};

export interface DailyNewsItem {
  id: string;
  title: string;
  category: 'Exam Alert' | 'Curriculum Update' | 'Campus News' | 'Tech & Placements' | 'Tribe Dispatch';
  summary: string;
  content: string;
  date: string;
  readTime: string;
  author: string;
  authorRole?: string;
  isBreaking?: boolean;
  isPinned?: boolean;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  college?: string;
  semester?: string;
  department?: string;
  targetSgpa?: number;
  weeklyStudyHours?: number[];
}

export interface CartItem {
  course: Course;
  addedAt: string;
}

export interface Order {
  id: string;
  date: string;
  items: { id: string; title: string; price: number; category: string }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking';
  transactionId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  studentEmail: string;
}

export interface EnrolledCourse {
  courseId: string;
  enrolledAt: string;
  progressPercent: number;
  lastAccessedModule: string;
  completedModules: string[];
  notesDownloaded: boolean;
}

export interface QuerySubmission {
  id: string;
  applicantUid?: string;
  studentName: string;
  contactNumber: string;
  email: string;
  query: string;
  timestamp: string;
  status: 'Received' | 'In Review' | 'Answered';
  ratingCategory?: 'teacher' | 'course' | 'quickLearning';
  targetId?: string;
  targetName?: string;
  rating?: number;
  feedbackText?: string;
}

export interface LiveSession {
  id: string;
  title: string;
  courseCode: string;
  hostName: string;
  hostEmail?: string;
  dateLabel: string;
  timeLabel: string;
  durationMinutes: number;
  roomNumber: string;
  meetingUrl?: string;
  agenda?: string;
  status: 'LIVE' | 'UPCOMING' | 'COMPLETED';
  isPublished: boolean;
}

export interface TeacherAccessRequest {
  id: string;
  email: string;
  name: string;
  phone?: string;
  college: string;
  department: string;
  subjectsTaught?: string;
  experienceYears?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
}

export interface VerifiedTeacherProfile {
  id: string;
  email: string;
  name: string;
  qualification: string;
  intro: string;
  photoUrl: string;
  isVisible: boolean;
  approvedAt?: string;
  updatedAt?: string;
}

export interface CourseReview {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentCollege?: string;
  studentBranch?: string;
  rating: number; // 1 to 5
  comment: string;
  gradeReceived?: string;
  examType?: string;
  createdAt: string;
  verifiedCompletion: boolean;
  helpfulCount: number;
  helpfulVoterIds?: string[];
}

export const INITIAL_REVIEWS: CourseReview[] = [
  {
    id: 'rev-1',
    courseId: 'course-1',
    studentId: 'usr-rahul',
    studentName: 'Rahul Sharma',
    studentCollege: 'Delhi Technological University (DTU)',
    studentBranch: 'Computer Science, 4th Sem',
    rating: 5,
    comment: 'Cleared the end-term with an 9.5 SGPA! The AVL rotation proofs and dynamic programming matrix chain multiplication breakdown were identical to questions in our final paper.',
    gradeReceived: 'SGPA 9.5 · O Grade',
    examType: 'End-Term Exam',
    createdAt: '2026-10-18',
    verifiedCompletion: true,
    helpfulCount: 42
  },
  {
    id: 'rev-2',
    courseId: 'course-1',
    studentId: 'usr-tanya',
    studentName: 'Tanya Mehrotra',
    studentCollege: 'Netaji Subhas University of Technology (NSUT)',
    studentBranch: 'IT, 3rd Sem',
    rating: 5,
    comment: 'Handwritten diagrams made Graph algorithms intuitive. The Kruskal vs Prim step-by-step layout alone fetched full 15 marks in Section B.',
    gradeReceived: 'Grade A+',
    examType: 'Mid-Sem & End-Sem',
    createdAt: '2026-10-22',
    verifiedCompletion: true,
    helpfulCount: 29
  },
  {
    id: 'rev-3',
    courseId: 'course-2',
    studentId: 'usr-devendra',
    studentName: 'Devendra Verma',
    studentCollege: 'IIT BHU',
    studentBranch: 'ECE, 4th Sem',
    rating: 5,
    comment: 'Banker’s Deadlock avoidance numericals and Round Robin Gantt charts were explained with crystal clarity. Finished the whole module over a Saturday.',
    gradeReceived: 'SGPA 9.1',
    examType: 'End-Term Exam',
    createdAt: '2026-10-29',
    verifiedCompletion: true,
    helpfulCount: 38
  },
  {
    id: 'rev-4',
    courseId: 'course-2',
    studentId: 'usr-ananya',
    studentName: 'Ananya Das',
    studentCollege: 'NIT Warangal',
    studentBranch: 'CSE, 4th Sem',
    rating: 4,
    comment: 'Virtual memory paging replacement formulas saved me 3 hours before the morning exam. Peterson’s algorithm proof template is pure gold.',
    gradeReceived: 'Grade A',
    examType: 'Mid-Term SOS',
    createdAt: '2026-10-30',
    verifiedCompletion: true,
    helpfulCount: 17
  },
  {
    id: 'rev-5',
    courseId: 'course-3',
    studentId: 'usr-rohit',
    studentName: 'Rohit Nair',
    studentCollege: 'BITS Pilani',
    studentBranch: 'Mechanical Engineering, 3rd Sem',
    rating: 5,
    comment: 'Laplace transforms always gave me anxiety. Dr. Sneha Iyer’s 3-step algorithm made it cake. Scored 48/50 in the calculus numericals!',
    gradeReceived: 'SGPA 9.4',
    examType: 'End-Term Exam',
    createdAt: '2026-10-14',
    verifiedCompletion: true,
    helpfulCount: 54
  },
  {
    id: 'rev-6',
    courseId: 'course-4',
    studentId: 'usr-riya',
    studentName: 'Riya Kulkarni',
    studentCollege: 'Pune University (SPPU)',
    studentBranch: 'Information Technology, 3rd Sem',
    rating: 5,
    comment: 'The handwritten DBMS notes are pure gold. The BCNF decomposition step-by-step layout alone fetched me full 20 marks in Section C.',
    gradeReceived: 'SGPA 9.2',
    examType: 'End-Term Exam',
    createdAt: '2026-10-20',
    verifiedCompletion: true,
    helpfulCount: 31
  },
  {
    id: 'rev-7',
    courseId: 'course-5',
    studentId: 'usr-harsh',
    studentName: 'Harsh Vardhan Singh',
    studentCollege: 'Vellore Institute of Technology (VIT)',
    studentBranch: 'ECE, 5th Sem',
    rating: 5,
    comment: 'Our college professors covered 8086 microprocessors in slides that made no sense. Techie Teacher’s Tribe timing diagrams made the whole paper a breeze.',
    gradeReceived: 'SGPA 8.9',
    examType: 'End-Term Exam',
    createdAt: '2026-10-12',
    verifiedCompletion: true,
    helpfulCount: 26
  },
  {
    id: 'rev-8',
    courseId: 'course-6',
    studentId: 'usr-snehal',
    studentName: 'Snehal Patil',
    studentCollege: 'College of Engineering Pune (COEP)',
    studentBranch: 'Computer Engineering, 5th Sem',
    rating: 5,
    comment: 'Subnetting CIDR calculations in 60 seconds is real. The sliding window protocol efficiency cheat sheet was a lifesaver.',
    gradeReceived: 'Grade A+',
    examType: 'End-Term Exam',
    createdAt: '2026-10-25',
    verifiedCompletion: true,
    helpfulCount: 33
  }
];


export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Data Structures & Algorithms: The Semester Buster',
    code: 'CS-301',
    teacher: 'Prof. Alok Verma',
    teacherEmail: 'alok.verma@techieteachertribe.org',
    teacherRole: 'Ex-IITD, Head of Algorithms',
    branch: 'Computer Science & IT',
    semester: 'Semester 3 & 4',
    category: 'Full Course',
    price: 1499,
    originalPrice: 3499,
    rating: 4.9,
    reviewsCount: 1420,
    enrolledCount: 6840,
    duration: '28 Hours',
    modulesCount: 14,
    pdfPages: 185,
    description: 'Comprehensive, zero-fluff syllabus breakdown of Trees, Graphs, Dynamic Programming, and Sorting for university end-term exams and technical interviews.',
    learningOutcomes: [
      'Master university derivation proofs & recurrence relations',
      'Solve previous 10 years end-term exam question patterns',
      'Handwritten high-yield diagrams for all graph & tree algorithms',
      'Interactive complexity calculation cheat sheets'
    ],
    isTrending: true,
    trendingRank: 1,
    isApproved: true,
    syllabus: [
      { title: 'Module 1: Asymptotic Analysis & Recurrences', duration: '2h 15m', topics: ['Big-O, Omega, Theta', 'Master Theorem tricks', 'Recursive tree methods'] },
      { title: 'Module 2: Advanced Linear Structures & Pointer Magic', duration: '3h 40m', topics: ['Circular DLL', 'Skip lists', 'Stack application in compiler evaluation'] },
      { title: 'Module 3: Non-Linear Structures: Trees & AVL Rotations', duration: '5h 10m', topics: ['BST properties', 'AVL tree auto-balancing', 'Red-black tree essentials'] },
      { title: 'Module 4: Graph Traversals & Minimum Spanning Trees', duration: '4h 50m', topics: ['Kruskal vs Prim step-by-step', 'Dijkstra shortest path proofs', 'Topological sort'] },
      { title: 'Module 5: Dynamic Programming Demystified', duration: '6h 00m', topics: ['0/1 Knapsack memoization', 'Longest Common Subsequence', 'Matrix Chain Multiplication'] }
    ]
  },
  {
    id: 'course-2',
    title: 'Operating Systems: Kernel to Concurrency Fast-Track',
    code: 'CS-402',
    teacher: 'Prof. Rohan Bhatt',
    teacherRole: 'Systems Architect & Linux Contributor',
    branch: 'Computer Science & IT',
    semester: 'Semester 4',
    category: 'Crash Course',
    price: 799,
    originalPrice: 1999,
    rating: 4.8,
    reviewsCount: 980,
    enrolledCount: 4230,
    duration: '11 Hours',
    modulesCount: 8,
    pdfPages: 112,
    description: 'Crush CPU scheduling, semaphore synchronization, paging memory management, and deadlock avoidance algorithms with step-by-step visual calculations.',
    learningOutcomes: [
      'Solve Banker’s Deadlock avoidance numericals with 100% precision',
      'Master Peterson’s Solution & Semaphores synchronization proofs',
      'Page replacement numericals (FIFO, LRU, Optimal)',
      'High-scoring 10-mark theory answer templates'
    ],
    isTrending: true,
    trendingRank: 2,
    fastTrackMinutes: 180,
    isApproved: true,
    syllabus: [
      { title: 'Module 1: Process Management & Inter-process Communication', duration: '2h 10m', topics: ['Process states', 'Fork mechanics', 'Context switching'] },
      { title: 'Module 2: CPU Scheduling Numerical Mastery', duration: '2h 45m', topics: ['Round Robin Gantt charts', 'Preemptive SJF/SRTF', 'Priority scheduling'] },
      { title: 'Module 3: Synchronization & Deadlocks', duration: '3h 15m', topics: ['Producer-Consumer problem', 'Dining Philosophers', 'Banker Algorithm safe state'] },
      { title: 'Module 4: Virtual Memory & Disk Scheduling', duration: '2h 50m', topics: ['Paging & TLB miss rates', 'LRU & FIFO numericals', 'SSTF, SCAN, LOOK disk'] }
    ]
  },
  {
    id: 'course-3',
    title: 'Engineering Mathematics III: Laplace & Fourier Formulas',
    code: 'MATH-201',
    teacher: 'Dr. Sneha Iyer',
    teacherEmail: 'sneha.iyer@techieteachertribe.org',
    teacherRole: 'Ph.D. Applied Mathematics',
    branch: 'Common for All Branches',
    semester: 'Semester 3',
    category: 'Exam Booster',
    price: 599,
    originalPrice: 1499,
    rating: 4.9,
    reviewsCount: 2150,
    enrolledCount: 9340,
    duration: '8 Hours',
    modulesCount: 6,
    pdfPages: 94,
    description: 'The definitive formula vault, step-by-step calculus proofs, Fourier series transforms, Laplace transforms, and boundary value solutions.',
    learningOutcomes: [
      'Over 200 solved university past-year calculus problems',
      'Handwritten high-contrast formula sheets ready for print',
      'Partial differential equations solved with separation of variables',
      'Complex integration and Cauchy Integral Formula shortcuts'
    ],
    isTrending: true,
    trendingRank: 3,
    fastTrackMinutes: 120,
    isApproved: true,
    syllabus: [
      { title: 'Module 1: Laplace Transforms & Inverse Transforms', duration: '2h 30m', topics: ['First & second shifting theorems', 'Convolution theorem', 'Dirac Delta functions'] },
      { title: 'Module 2: Fourier Analysis & Half-Range Expansions', duration: '2h 10m', topics: ['Euler formulas', 'Odd/even functions', 'Parseval identity'] },
      { title: 'Module 3: Partial Differential Equations', duration: '1h 50m', topics: ['Wave equation', 'Heat equation in 1D', 'Laplace 2D equations'] },
      { title: 'Module 4: Complex Variables & Residue Calculus', duration: '1h 30m', topics: ['Analytic functions', 'Cauchy-Riemann equations', 'Residue theorem'] }
    ]
  },
  {
    id: 'course-4',
    title: 'DBMS & SQL Complete University Exam Pack',
    code: 'CS-304',
    teacher: 'Dr. Nandini Sen',
    teacherRole: 'Database Systems Specialist',
    branch: 'Computer Science & IT',
    semester: 'Semester 3',
    category: 'Handwritten Notes',
    price: 499,
    originalPrice: 1299,
    rating: 4.8,
    reviewsCount: 1670,
    enrolledCount: 5120,
    duration: '6 Hours',
    modulesCount: 6,
    pdfPages: 140,
    description: 'Crisp handwritten topper notes covering Relational Algebra, ER Diagrams, Normalization (1NF to BCNF) proofs, and ACID transaction schedules.',
    learningOutcomes: [
      'Normal forms decomposition without losing dependency',
      'Conflict serializability precedence graph algorithms',
      'Complex nested SQL queries & indexing B+ trees',
      'Quick revision summary flash-notes'
    ],
    isTrending: false,
    isApproved: true,
    syllabus: [
      { title: 'Module 1: Relational Model & ER Design', duration: '1h 20m', topics: ['Entity-relationship mappings', 'Relational algebra operators', 'Tuple relational calculus'] },
      { title: 'Module 2: Functional Dependencies & Normal Forms', duration: '2h 00m', topics: ['Attribute closure', '1NF, 2NF, 3NF, BCNF decomposition', 'Lossless join test'] },
      { title: 'Module 3: Transaction Processing & Concurrency', duration: '1h 40m', topics: ['ACID criteria', 'Precedence graphs', 'Two-phase locking (2PL)'] },
      { title: 'Module 4: File Organization & B+ Tree Indexing', duration: '1h 00m', topics: ['Primary vs secondary indexes', 'B+ tree insert & split operations'] }
    ]
  },
  {
    id: 'course-5',
    title: 'Digital Electronics & Microprocessors 8085/8086',
    code: 'EC-302',
    teacher: 'Prof. Kabir Rao',
    teacherRole: 'Hardware Systems & Embedded Specialist',
    branch: 'Electronics & Communication',
    semester: 'Semester 3 & 4',
    category: 'Full Course',
    price: 1199,
    originalPrice: 2899,
    rating: 4.7,
    reviewsCount: 840,
    enrolledCount: 3200,
    duration: '22 Hours',
    modulesCount: 10,
    pdfPages: 160,
    description: 'From K-Maps and finite state machines to 8085/8086 pin diagrams, timing cycles, and assembly language programming for top university marks.',
    learningOutcomes: [
      'Karnaugh map minimization with don’t care conditions',
      'Synchronous and asynchronous counter design diagrams',
      '8085 machine cycles & timing diagram drawing methods',
      'Assembly subroutines & memory interfacing maps'
    ],
    isTrending: true,
    trendingRank: 4,
    isApproved: true,
    syllabus: [
      { title: 'Module 1: Boolean Algebra & Logic Minimization', duration: '3h 10m', topics: ['SOP and POS forms', 'Quine-McCluskey method', 'Hazard detection'] },
      { title: 'Module 2: Combinational & Sequential Circuit Design', duration: '5h 30m', topics: ['Multiplexers as universal logic', 'Flip-flop conversions', 'State reduction'] },
      { title: 'Module 3: 8085 Architecture & Timing Diagrams', duration: '6h 40m', topics: ['Bus timing', 'Opcode fetch & memory read cycles', 'Interrupt vectors'] },
      { title: 'Module 4: 8086 Extended Architecture & Interfacing', duration: '6h 40m', topics: ['Segmented memory model', 'Maximum vs minimum mode', '8255 PPI interfacing'] }
    ]
  },
  {
    id: 'course-6',
    title: 'Computer Networks: Protocol Stack Sprint Notes',
    code: 'CS-501',
    teacher: 'Er. Priya Desai',
    teacherRole: 'Network Infrastructure Lead',
    branch: 'Computer Science & IT',
    semester: 'Semester 5',
    category: 'Handwritten Notes',
    price: 449,
    originalPrice: 1199,
    rating: 4.9,
    reviewsCount: 1120,
    enrolledCount: 4180,
    duration: '5 Hours',
    modulesCount: 5,
    pdfPages: 128,
    description: 'Crisp diagrams for OSI vs TCP/IP, IP subnetting numericals, sliding window protocols (Go-Back-N, Selective Repeat), and routing algorithms.',
    learningOutcomes: [
      'CIDR subnetting and VLSM calculations in 60 seconds',
      'Sliding window efficiency and bandwidth-delay numericals',
      'Distance Vector & Link State routing step-by-step',
      'TCP 3-way handshake and congestion window graphs'
    ],
    isTrending: true,
    trendingRank: 5,
    fastTrackMinutes: 90,
    isApproved: true,
    isNew: true,
    createdAt: '2026-11-04',
    syllabus: [
      { title: 'Module 1: Physical & Data Link Layer Protocols', duration: '1h 15m', topics: ['Framing', 'CRC polynomial division', 'Stop-and-Wait vs GBN vs SR'] },
      { title: 'Module 2: Subnetting & Network Layer Routing', duration: '1h 35m', topics: ['IPv4 header breakdown', 'Subnet masks', 'Dijkstra shortest path'] },
      { title: 'Module 3: Transport Layer & Flow Control', duration: '1h 10m', topics: ['TCP vs UDP', 'Slow start & congestion avoidance', 'Timer calculation'] },
      { title: 'Module 4: Application Layer & Network Security', duration: '1h 00m', topics: ['DNS hierarchy', 'HTTP/HTTPS handshakes', 'RSA cryptography basics'] }
    ]
  },
  {
    id: 'course-7',
    title: 'Compiler Design & LL(1) Parsing Exam Accelerator',
    code: 'CS-601',
    teacher: 'Prof. Alok Verma',
    teacherEmail: 'alok.verma@techieteachertribe.org',
    teacherRole: 'Head of Algorithm Engineering',
    branch: 'Computer Science & IT',
    semester: 'Semester 5 & 6',
    category: 'Crash Course',
    price: 849,
    originalPrice: 2199,
    rating: 5.0,
    reviewsCount: 310,
    enrolledCount: 1420,
    duration: '10 Hours',
    modulesCount: 7,
    pdfPages: 110,
    description: 'Master FIRST & FOLLOW set computations, LL(1) and LR(0)/SLR(1) parser construction tables, and three-address code generation for university finals.',
    learningOutcomes: [
      'Compute FIRST and FOLLOW sets for complex ambiguous grammars',
      'Construct canonical collection of LR(0) and SLR(1) items without error',
      'Solve syntax-directed translation schemes and DAG generation',
      'Optimization proofs: loop unrolling and common subexpression elimination'
    ],
    isTrending: true,
    trendingRank: 6,
    isApproved: true,
    isNew: true,
    createdAt: '2026-11-08',
    syllabus: [
      { title: 'Module 1: Lexical Analysis & Regular Expressions to DFA', duration: '2h 00m', topics: ['Thompsons construction', 'DFA state minimization', 'Lexer token buffers'] },
      { title: 'Module 2: Top-Down Parsing & LL(1) Parsing Tables', duration: '2h 45m', topics: ['Left recursion removal', 'Left factoring', 'FIRST & FOLLOW calculation rules'] },
      { title: 'Module 3: Bottom-Up LR Parsing & Shift-Reduce Conflicts', duration: '3h 15m', topics: ['LR(0) items', 'SLR(1) parsing table', 'Operator precedence parsing'] },
      { title: 'Module 4: Intermediate Code & Machine Independent Optimization', duration: '2h 00m', topics: ['Three-address quadruples/triples', 'Control flow graphs', 'Peephole optimization'] }
    ]
  },
  {
    id: 'course-8',
    title: 'Theory of Computation & Automata Handwritten Topper Pack',
    code: 'CS-403',
    teacher: 'Dr. Sneha Iyer',
    teacherEmail: 'sneha.iyer@techieteachertribe.org',
    teacherRole: 'Ph.D. Applied Mathematics',
    branch: 'Computer Science & IT',
    semester: 'Semester 4',
    category: 'Handwritten Notes',
    price: 499,
    originalPrice: 1399,
    rating: 4.9,
    reviewsCount: 420,
    enrolledCount: 1890,
    duration: '7 Hours',
    modulesCount: 6,
    pdfPages: 96,
    description: 'Handwritten diagrammatic breakdowns of DFA/NFA conversions, Pumping Lemma contradiction proofs, Pushdown Automata, and Turing Machine state transitions.',
    learningOutcomes: [
      'Write flawless 10-mark Pumping Lemma non-regularity proofs',
      'Design deterministic Pushdown Automata for non-deterministic context-free languages',
      'Step-by-step state transition diagrams for Turing Machines',
      'Decidability & Post Correspondence Problem (PCP) exam templates'
    ],
    isTrending: false,
    isApproved: true,
    isNew: true,
    createdAt: '2026-11-09',
    syllabus: [
      { title: 'Module 1: Finite Automata & Equivalence Proofs', duration: '1h 45m', topics: ['Subset construction NFA to DFA', 'Myhill-Nerode theorem', 'Minimization algorithm'] },
      { title: 'Module 2: Regular Grammars & Pumping Lemma', duration: '1h 50m', topics: ['Regular expressions to FA', 'Pumping Lemma 3-step proof strategy', 'Closure properties'] },
      { title: 'Module 3: Context-Free Grammars & Pushdown Automata', duration: '2h 00m', topics: ['Chomsky Normal Form (CNF)', 'CYK algorithm', 'PDA instant descriptions'] },
      { title: 'Module 4: Turing Machines & Computability', duration: '1h 25m', topics: ['Standard Turing machine transition diagrams', 'Halting problem reduction', 'Recursive enumerable sets'] }
    ]
  }
];

export const INITIAL_NEWS: DailyNewsItem[] = [
  {
    id: 'news-1',
    title: 'AKTU & DTU Announce Even Semester 2026 Examination Timetables',
    category: 'Exam Alert',
    summary: 'Final theory exam schedules for B.Tech semesters 4, 6, and 8 have been released. Practical vivas commence 10 days before theory exams.',
    content: `University examination boards including AKTU, DTU, and NSUT have officially published the revised timetable for the upcoming Even Semester 2026 examinations. 

Key Highlights for University Cadets:
1. Theory examination papers will feature standard 100-mark structures: Section A (short mandatory concept questions, 20 marks), Section B (medium derivations, 30 marks), and Section C (full 10-mark proofs and numerical design problems, 50 marks).
2. Internal practical viva-voce examinations must be completed by department faculty no later than 12 days prior to the first theory paper.
3. Students carry physical hall tickets along with valid university identity cards. Electronic devices are strictly regulated.

Recommended Action:
Start with high-weightage numerical derivations in your core branches (DSA, Operating Systems, Digital Electronics, and Mathematics). Techie Teacher's Tribe has updated all course syllabus maps to match the latest question pattern for this exam cycle.`,
    date: '09 Nov 2026',
    readTime: '3 min read',
    author: 'Tribe Academic Cell',
    authorRole: 'Examination Strategy Division',
    isBreaking: true,
    isPinned: true,
    tags: ['Exam Dates', 'AKTU', 'DTU', 'Mid-Sem', 'Timetable']
  },
  {
    id: 'news-2',
    title: 'AICTE Releases Modernized 2026 Curriculum Guidelines for Engineering Colleges',
    category: 'Curriculum Update',
    summary: 'Updated syllabus guidelines introduce modern concurrent systems, cloud topologies, and hardware acceleration while retiring obsolete legacy units.',
    content: `The All India Council for Technical Education (AICTE) has rolled out its updated model curriculum for undergraduate engineering programs. 

Major Curriculum Shifts:
- Computer Science: Legacy 8085 assembly modules have been condensed into a dedicated foundational unit, making space for modern multicore architecture and RISC-V fundamentals.
- Operating Systems: Heavy emphasis on POSIX thread synchronization, lock-free data structures, and containerized virtualization concepts.
- Mathematics: Greater inclusion of discrete probability models and matrix factorization relevant for modern machine learning algorithms.

All Techie Teacher's Tribe courses and handwritten topper notes have already been refreshed to adhere 100% to these updated syllabus specifications.`,
    date: '08 Nov 2026',
    readTime: '4 min read',
    author: 'Prof. Alok Verma',
    authorRole: 'Curriculum Advisory Board',
    isBreaking: false,
    isPinned: true,
    tags: ['AICTE', 'Syllabus Revision', 'Curriculum', 'Systems']
  },
  {
    id: 'news-3',
    title: 'Tribe Releases Brand New Handwritten Theory of Computation & Automata Vault',
    category: 'Tribe Dispatch',
    summary: 'Over 96 pages of diagrammatic DFA/NFA proofs, Pumping Lemma 3-step contradiction templates, and Turing Machine state charts now available.',
    content: `Following hundreds of student requests across campus Telegram groups and college forums, the Techie Teacher faculty team has compiled the ultimate exam survival manual for Theory of Computation (CS-403).

What is Inside the New Vault:
- 3-Step bulletproof template to score full marks in Pumping Lemma non-regular proofs.
- Step-by-step conversion charts: NFA with epsilon-transitions to DFA without state explosion.
- Hand-drawn Turing Machine transition diagrams for classic problems (a^n b^n c^n, palindrome checking, binary addition).
- Solved past 10 years end-term numericals from top 25 universities.

Accessible immediately in digital PDF format, and eligible for 10-minute campus hostel delivery via our Blinkit and Zepto print partner network.`,
    date: '07 Nov 2026',
    readTime: '2 min read',
    author: 'Dr. Sneha Iyer',
    authorRole: 'Ph.D. Applied Mathematics',
    isBreaking: true,
    isPinned: false,
    tags: ['New Release', 'Automata', 'TOC', 'Handwritten Notes']
  },
  {
    id: 'news-4',
    title: 'Campus Placements 2026–27: Systems Programming & C++ Roles Jump 42%',
    category: 'Tech & Placements',
    summary: 'Placement cells report a surge in demand for students possessing deep fundamentals in Operating Systems, TCP/IP networking, and low-level memory layout.',
    content: `The latest placement season intelligence from tier-1 and tier-2 technical campuses reveals a distinct hiring shift. While frontend and generic web roles saw consolidation, high-compensation roles in quantitative systems, infrastructure engineering, and embedded firmware jumped by 42%.

Top Topics Tested in Technical Screening Rounds:
1. Virtual Memory, Page Faults, and TLB Thrashing in Operating Systems.
2. Custom memory allocators, cache-line alignment, and lock contention in C++.
3. TCP 3-Way Handshake, window sliding mechanics, and subnet routing.
4. Tree balancing and dynamic programming matrix optimizations.

Students preparing for off-campus and on-campus drives are advised to prioritize conceptual mastery over superficial framework tutorials.`,
    date: '06 Nov 2026',
    readTime: '4 min read',
    author: 'Er. Siddharth Sharma',
    authorRole: 'Founder & Tribe Architect',
    isBreaking: false,
    isPinned: false,
    tags: ['Placements', 'C++', 'Systems Engineering', 'Careers']
  },
  {
    id: 'news-5',
    title: 'Hostel SOS Print Deliveries Expanded: 10-Minute Dispatch to 18 Campuses',
    category: 'Campus News',
    summary: 'Spiral-bound, high-contrast monochrome notes now dispatched via quick-commerce dark stores in under 10 minutes during pre-exam crunch weeks.',
    content: `During night-before exam preparation, students often face printer breakdowns or closed campus xerox centers. 

To solve this perennial student bottleneck, Techie Teacher's Tribe has expanded its rapid fulfillment alliance with dark store operators across Delhi NCR, Pune, Bengaluru, and Hyderabad.

Eligible Campuses Include:
- DTU, NSUT, IIIT Delhi, Jamia, and IPU colleges.
- COEP, VIT Pune, and MIT World Peace University.
- RVCE, PES University, and BMSCE Bengaluru.

All physical notes are printed on heavy 80 GSM smudge-resistant paper with high-contrast diagrams specifically optimized for late-night study under dormitory desk lamps.`,
    date: '05 Nov 2026',
    readTime: '3 min read',
    author: 'Tribe Campus Logistics',
    authorRole: 'Operations Team',
    isBreaking: false,
    isPinned: false,
    tags: ['Hostel Delivery', 'Quick Commerce', 'Print Notes', 'Campuses']
  }
];

export const TEACHERS_LIST = [
  {
    name: 'Er. Siddharth "Techie" Sharma',
    role: 'Founder & Tribe Architect',
    subject: 'Core Engineering Systems & Exam Strategy',
    bio: '12+ years mentoring over 40,000 university students across India. Spearheaded the high-yield note methodology that turned average semester scorers into university rank holders.',
    experience: '12+ Years Experience',
    rating: 4.98,
    studentsTaught: '45,000+'
  },
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
];

export const STATS_LIST = [
  { value: 42000, suffix: '+', label: 'Active Students Enrolled' },
  { value: 180, suffix: '+', label: 'University Syllabi Covered' },
  { value: 99.4, suffix: '%', label: 'Semester Exam Clearance' },
  { value: 350, suffix: '+', label: 'Topper Handwritten Notes' }
];

export const TESTIMONIALS = [
  {
    quote: "I was on the verge of a backlog in Mathematics III with just 48 hours left for the end-term. The Tribe formula vault and Laplace crash course brought me an 8.6 SGPA.",
    student: 'Aarav Malhotra',
    college: 'Delhi Technological University (DTU)',
    branch: 'Computer Science, 4th Sem',
    score: 'SGPA 8.6'
  },
  {
    quote: "The handwritten DBMS notes are pure gold. The BCNF decomposition step-by-step layout alone fetched me full 20 marks in Section C.",
    student: 'Riya Kulkarni',
    college: 'Pune University (SPPU)',
    branch: 'Information Technology, 3rd Sem',
    score: 'SGPA 9.2'
  },
  {
    quote: "Our college professors covered 8086 microprocessors in slides that made no sense. Techie Teacher's Tribe timing diagrams made the whole paper a breeze.",
    student: 'Harsh Vardhan Singh',
    college: 'Vellore Institute of Technology (VIT)',
    branch: 'ECE, 5th Sem',
    score: 'SGPA 8.9'
  }
];

export const SLOGANS = [
  'Education, made simpler and smarter.',
  'Learn Smart. Learn Fast.',
  'Your Tribe. Your Future.',
  'From Notes to Knowledge.',
  'Built by Teachers. Made for Students.'
];

export const INITIAL_QUERIES: QuerySubmission[] = [
  {
    id: 'QRY-89214',
    studentName: 'Kartik Singhania',
    contactNumber: '+91 98112 34567',
    email: 'kartik.singhania@dtu.ac.in',
    query: '[Branch: Computer Science & IT] Urgent: Need previous 5 years solved numericals on B-Tree order 4 insertion and AVL double rotations for upcoming mid-term exam on Thursday.',
    timestamp: '08 Nov 2026, 09:42 PM',
    status: 'Received'
  },
  {
    id: 'QRY-77401',
    studentName: 'Pooja Deshmukh',
    contactNumber: '+91 97234 56789',
    email: 'pooja.deshmukh@coep.ac.in',
    query: '[Branch: Electronics & Communication] Query regarding Blinkit 10-minute delivery to COEP Pune hostel gate. Is the physical spiral edition for Signals and Systems in stock tonight?',
    timestamp: '07 Nov 2026, 04:15 PM',
    status: 'In Review'
  }
];

export const INITIAL_VERIFIED_TEACHER_EMAILS: string[] = [
  'alok.verma@techieteachertribe.org',
  'sneha.iyer@techieteachertribe.org'
];

export const INITIAL_TEACHER_REQUESTS: TeacherAccessRequest[] = [
  {
    id: 'TREQ-4012',
    email: 'meera.nair@nsut.ac.in',
    name: 'Dr. Meera Nair',
    phone: '+91 98104 22190',
    college: 'Netaji Subhas University of Technology (NSUT)',
    department: 'Computer Science & Engineering',
    subjectsTaught: 'Compiler Design, Formal Languages & Automata',
    experienceYears: '8 Years',
    status: 'PENDING',
    requestedAt: '09 Nov 2026, 06:15 PM',
    notes: 'Published 3 university exam guidebooks on LL(1) & LR(1) parsing. Requesting faculty portal access to upload end-term crash notes.'
  },
  {
    id: 'TREQ-4011',
    email: 'vikram.joshi@coep.ac.in',
    name: 'Prof. Vikram Joshi',
    phone: '+91 97655 10842',
    college: 'College of Engineering Pune (COEP)',
    department: 'Electronics & Telecommunication',
    subjectsTaught: 'Signals & Systems, Analog Circuits',
    experienceYears: '6 Years',
    status: 'PENDING',
    requestedAt: '09 Nov 2026, 01:40 PM',
    notes: 'Want to publish handwritten Fourier & Z-Transform numerical packs for SPPU & COEP semester 4 students.'
  },
  {
    id: 'TREQ-4002',
    email: 'alok.verma@techieteachertribe.org',
    name: 'Prof. Alok Verma',
    phone: '+91 98111 00412',
    college: 'IIT Delhi (Alumni Faculty)',
    department: 'Computer Science & IT',
    subjectsTaught: 'Data Structures, Algorithms, Compiler Design',
    experienceYears: '9 Years',
    status: 'APPROVED',
    requestedAt: '01 Oct 2026, 10:00 AM',
    approvedAt: '01 Oct 2026, 11:30 AM',
    approvedBy: 'Trust Directorate (Super Admin)',
    notes: 'Lead Mentor for DSA & Algorithm courses.'
  },
  {
    id: 'TREQ-4001',
    email: 'sneha.iyer@techieteachertribe.org',
    name: 'Dr. Sneha Iyer',
    phone: '+91 98200 77319',
    college: 'Techie Teacher Core Faculty',
    department: 'Applied Mathematics',
    subjectsTaught: 'Engineering Mathematics III, Theory of Computation',
    experienceYears: '11 Years',
    status: 'APPROVED',
    requestedAt: '01 Oct 2026, 09:45 AM',
    approvedAt: '01 Oct 2026, 11:30 AM',
    approvedBy: 'Trust Directorate (Super Admin)',
    notes: 'Senior Academician for Mathematics & Automata.'
  }
];

export const INITIAL_TEACHER_PROFILES: VerifiedTeacherProfile[] = [
  {
    id: 'TPROF-4002',
    email: 'alok.verma@techieteachertribe.org',
    name: 'Prof. Alok Verma',
    qualification: 'M.Tech CSE (IIT Delhi) · 9 Years Teaching',
    intro:
      'Former IIT Delhi researcher specializing in Data Structures, Algorithms, and Compiler Design. Known for turning complex AVL rotations, DP recurrences, and LR(1) parsing tables into visual exam-ready blueprints.',
    photoUrl: '/src/assets/images/student_desk_bw_1793717857911.jpg',
    isVisible: true,
    approvedAt: '01 Oct 2026, 11:30 AM',
    updatedAt: '01 Oct 2026, 11:30 AM'
  },
  {
    id: 'TPROF-4001',
    email: 'sneha.iyer@techieteachertribe.org',
    name: 'Dr. Sneha Iyer',
    qualification: 'Ph.D. Applied Mathematics · 11 Years Teaching',
    intro:
      'Doctorate in Applied Mathematics and Senior Academician for Engineering Mathematics III & Automata Theory. Famous across campuses for distilling 40-step Laplace, Fourier, and Pumping Lemma proofs into 3-step algorithms.',
    photoUrl: '/src/assets/images/tribe_campus_bw_1793717857750.jpg',
    isVisible: true,
    approvedAt: '01 Oct 2026, 11:30 AM',
    updatedAt: '01 Oct 2026, 11:30 AM'
  }
];

export const INITIAL_LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'live-cs301',
    title: 'Dynamic Programming & Graph Shortest Path Marathon',
    courseCode: 'CS-301',
    hostName: 'Prof. Alok Verma',
    hostEmail: 'alok.verma@techieteachertribe.org',
    dateLabel: 'Tonight',
    timeLabel: '09:00 PM IST',
    durationMinutes: 75,
    roomNumber: '402',
    agenda:
      'Step-by-step live walkthrough of 0/1 Knapsack, Matrix Chain Multiplication DP tables, and Dijkstra vs Bellman-Ford exam edge cases.',
    status: 'UPCOMING',
    isPublished: true
  },
  {
    id: 'live-math201',
    title: 'Laplace Convolution & Residue Calculus Doubt Clinic',
    courseCode: 'MATH-201',
    hostName: 'Dr. Sneha Iyer',
    hostEmail: 'sneha.iyer@techieteachertribe.org',
    dateLabel: 'Tomorrow',
    timeLabel: '07:30 PM IST',
    durationMinutes: 60,
    roomNumber: '204',
    agenda:
      'Live doubt resolution for 10-mark Partial Differential Equations and inverse Laplace transforms from last 5 years papers.',
    status: 'UPCOMING',
    isPublished: true
  }
];


