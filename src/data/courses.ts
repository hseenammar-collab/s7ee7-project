export interface Course {
  id: string
  title: string
  description: string
  category: string
  lessons: number
  duration: string
  level: string
  instructor: string
  image: string
  price?: number
  featured?: boolean
}

export interface Category {
  id: string
  name: string
  nameEn: string
  icon: string
  count: number
}

// Categories
export const categories: Category[] = [
  {
    id: 'cybersecurity',
    name: 'الأمن السيبراني',
    nameEn: 'Cybersecurity',
    icon: '🛡️',
    count: 8,
  },
  {
    id: 'programming',
    name: 'البرمجة',
    nameEn: 'Programming',
    icon: '💻',
    count: 1,
  },
  {
    id: 'marketing',
    name: 'التسويق الرقمي',
    nameEn: 'Digital Marketing',
    icon: '📈',
    count: 4,
  },
  {
    id: 'networking',
    name: 'الشبكات و IT',
    nameEn: 'Networking & IT',
    icon: '🌐',
    count: 1,
  },
]

// Courses Data
export const courses: Course[] = [
  // ==================== CYBERSECURITY ====================
  {
    id: 'nmap',
    title: 'NMAP Course - دورة فحص الأنظمة',
    description: 'تعلم فحص الشبكات والأنظمة باستخدام NMAP',
    category: 'cybersecurity',
    lessons: 37,
    duration: '2.5 ساعة',
    level: 'متوسط - متقدم',
    instructor: 'صحيح',
    image: '/images/courses/nmap.png',
    price: 0,
    featured: false,
  },
  {
    id: 'metasploit',
    title: 'دورة الاختراق بالميتاسبلويت',
    description: 'ابدأ باستعمال واحدة من أفضل مشاريع اختبار الاختراق حول العالم',
    category: 'cybersecurity',
    lessons: 78,
    duration: '6 ساعات',
    level: 'مبتدئ - متوسط',
    instructor: 'صحيح',
    image: '/images/courses/metasploit.jpeg',
    price: 0,
    featured: true,
  },
  {
    id: 'bug-bounty',
    title: 'Bug Bounty Hacker',
    description: 'تعلم اكتشاف الثغرات في المواقع والحصول على مكافآت',
    category: 'cybersecurity',
    lessons: 87,
    duration: '8 ساعات',
    level: 'متوسط - محترف',
    instructor: 'صحيح',
    image: '/images/courses/bug.png',
    price: 0,
    featured: true,
  },
  {
    id: 'ethical-hacking',
    title: 'الاختراق الأخلاقي الشامل',
    description: 'دورة شاملة في اختبار الاختراق من الصفر للاحتراف',
    category: 'cybersecurity',
    lessons: 96,
    duration: '10 ساعات',
    level: 'متوسط - متقدم',
    instructor: 'صحيح',
    image: '/images/courses/dirb.jpg',
    price: 0,
    featured: true,
  },
  {
    id: 'dark-web',
    title: 'دورة الدارك ويب',
    description: 'تعلم التصفح الآمن والخصوصية على الإنترنت',
    category: 'cybersecurity',
    lessons: 48,
    duration: '4 ساعات',
    level: 'جميع المستويات',
    instructor: 'صحيح',
    image: '/images/courses/dark-web.jpg',
    price: 0,
    featured: false,
  },
  {
    id: 'comptia-security-plus',
    title: 'CompTIA Security+ SY0-701',
    description: 'تحضير شامل لاختبار شهادة Security+',
    category: 'cybersecurity',
    lessons: 30,
    duration: '19 ساعة',
    level: 'متوسط',
    instructor: 'عبدالله العماني',
    image: '/images/courses/security-plus.png',
    price: 0,
    featured: false,
  },
  {
    id: 'dark-hacker',
    title: 'Dark Hacker - اختبار اختراق وأمان الويب',
    description: 'تعلّم اختبار اختراق وأمان الويب عمليًا',
    category: 'cybersecurity',
    lessons: 32,
    duration: '14 ساعة',
    level: 'جميع المستويات',
    instructor: 'عبدالرحمن عذيب',
    image: '/images/courses/darkhacer.jpeg',
    price: 0,
    featured: false,
  },

  // ==================== PROGRAMMING ====================
  {
    id: 'python',
    title: 'تعلم البرمجة مع البايثون - من الصفر',
    description: 'إعطاء التعليمات البرمجية لجهاز الكمبيوتر للقيام بمهام معينة',
    category: 'programming',
    lessons: 64,
    duration: '6 ساعات',
    level: 'مبتدئ - احترافي',
    instructor: 'صحيح',
    image: '/images/courses/python.jpeg',
    price: 0,
    featured: false,
  },

  // ==================== MARKETING ====================
  {
    id: 'snapchat-ads',
    title: 'أقوى دورة عربية في إعلانات سناب شات',
    description: 'تعلم واحترف كل ما يخص سناب شات في الإعلانات',
    category: 'marketing',
    lessons: 21,
    duration: '3.5 ساعات',
    level: 'جميع المستويات',
    instructor: 'صحيح',
    image: '/images/courses/snapchat-ads.png',
    price: 0,
    featured: false,
  },
  {
    id: 'tiktok-ads',
    title: 'كورس إعلانات التيك توك',
    description: 'احترف إعلانات التيك توك وتعلم طريقة عمل الإعلانات الممولة',
    category: 'marketing',
    lessons: 15,
    duration: '2.5 ساعة',
    level: 'جميع المستويات',
    instructor: 'باسم مجدي',
    image: '/images/courses/tiktok-ads.png',
    price: 0,
    featured: false,
  },
  {
    id: 'linkedin-ads',
    title: 'تعلم إعلانات لينكدإن',
    description: 'ابدأ بنمو نشاطك التجاري مع إعلانات لينكدإن الممولة',
    category: 'marketing',
    lessons: 30,
    duration: '3.5 ساعات',
    level: 'جميع المستويات',
    instructor: 'صحيح',
    image: '/images/courses/linkeedin.png',
    price: 0,
    featured: false,
  },
  {
    id: 'meta-ads',
    title: 'الدورة الشاملة لإعلانات فيسبوك 2025',
    description: 'تعلم أسرار بناء حملات إعلانية ناجحة على فيسبوك وانستغرام',
    category: 'marketing',
    lessons: 18,
    duration: '3.5 ساعات',
    level: 'جميع المستويات',
    instructor: 'صحيح',
    image: '/images/courses/meta.jpeg',
    price: 0,
    featured: true,
  },

  // ==================== NETWORKING ====================
  {
    id: 'linux-rhcsa',
    title: 'Linux RHCSA (EX200) Complete Training 2025',
    description: 'Master Red Hat Linux System Administration & Pass the RHCSA EX200 Exam',
    category: 'networking',
    lessons: 203,
    duration: '19.5 ساعة',
    level: 'متوسط',
    instructor: 'صحيح',
    image: '/images/courses/RHCSA.jpeg',
    price: 0,
    featured: false,
  },
]

// Helper functions
export const getCoursesByCategory = (categoryId: string): Course[] => {
  return courses.filter((course) => course.category === categoryId)
}

export const getFeaturedCourses = (): Course[] => {
  return courses.filter((course) => course.featured)
}

export const getCourseById = (id: string): Course | undefined => {
  return courses.find((course) => course.id === id)
}

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find((category) => category.id === id)
}

export const getTotalLessons = (): number => {
  return courses.reduce((total, course) => total + course.lessons, 0)
}

export const getTotalCourses = (): number => {
  return courses.length
}
