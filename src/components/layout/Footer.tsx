import Navbar from '@/components/layout/Navbar'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}