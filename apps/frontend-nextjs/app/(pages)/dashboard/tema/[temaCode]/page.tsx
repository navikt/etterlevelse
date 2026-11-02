import { Suspense } from 'react'
import TemaDetailPage from '@/components/dashboard/TemaDetailPage'

const Page = async ({ params }: { params: Promise<{ temaCode: string }> }) => {
  const { temaCode } = await params
  return (
    <Suspense>
      <TemaDetailPage temaCode={temaCode} />
    </Suspense>
  )
}

export default Page
