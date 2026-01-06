// src/app/(admin)/admin/login/layout.tsx
// Layout خاص لصفحة تسجيل دخول الأدمن - يتجاوز الحماية الأساسية

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
