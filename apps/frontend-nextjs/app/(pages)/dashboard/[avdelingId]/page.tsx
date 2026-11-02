import { Suspense } from 'react'
import AvdelingDetailPage from '@/components/dashboard/AvdelingDetailPage'

const Page = async ({ params }: { params: Promise<{ avdelingId: string }> }) => {
  const { avdelingId } = await params
  return (
    <Suspense>
      <AvdelingDetailPage avdelingId={avdelingId} />
    </Suspense>
  )
}

export default Page
