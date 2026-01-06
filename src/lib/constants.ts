// Category labels
export const categoryLabels: Record<string, string> = {
  'cybersecurity': 'الأمن السيبراني',
  'marketing': 'التسويق الرقمي',
  'programming': 'البرمجة',
  'networking': 'الشبكات و IT',
  'app-development': 'تطوير التطبيقات',
  'design': 'التصميم والمونتاج',
  'web-development': 'تطوير الويب',
}

// Level labels
export const levelLabels: Record<string, string> = {
  'beginner': 'مبتدئ',
  'intermediate': 'متوسط',
  'advanced': 'متقدم',
}

// Level colors for badges
export const levelColors: Record<string, string> = {
  'beginner': 'bg-green-100 text-green-700',
  'intermediate': 'bg-yellow-100 text-yellow-700',
  'advanced': 'bg-red-100 text-red-700',
}

// Categories array for select
export const categories = [
  { value: 'cybersecurity', label: 'الأمن السيبراني' },
  { value: 'marketing', label: 'التسويق الرقمي' },
  { value: 'programming', label: 'البرمجة' },
  { value: 'networking', label: 'الشبكات و IT' },
  { value: 'app-development', label: 'تطوير التطبيقات' },
  { value: 'design', label: 'التصميم والمونتاج' },
  { value: 'web-development', label: 'تطوير الويب' },
]

// Levels array for select
export const levels = [
  { value: 'beginner', label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'متقدم' },
]

// Sort options
export const sortOptions = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'popular', label: 'الأكثر مبيعاً' },
  { value: 'price_low', label: 'السعر: من الأقل' },
  { value: 'price_high', label: 'السعر: من الأعلى' },
  { value: 'rating', label: 'الأعلى تقييماً' },
]

// Format price in Iraqi Dinar
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-IQ').format(price)
}

// Format duration
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} دقيقة`
  if (mins === 0) return `${hours} ساعة`
  return `${hours}س ${mins}د`
}

// Format seconds to mm:ss
export const formatSeconds = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Helper: Get level label
export const getLevelLabel = (level: string): string => {
  return levelLabels[level] || level
}

// Helper: Get category label
export const getCategoryLabel = (category: string): string => {
  return categoryLabels[category] || category
}
