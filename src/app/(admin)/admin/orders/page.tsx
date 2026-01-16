// src/app/(admin)/admin/orders/page.tsx
'use client'

import { Suspense } from 'react'
import OrdersContent from './OrdersContent'
import { Loader2 } from 'lucide-react'

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    }>
      <OrdersContent />
    </Suspense>
  )
}