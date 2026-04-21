import AvdelingDetailPage from '@/components/dashboard/AvdelingDetailPage'

const Page = async ({ params }: { params: Promise<{ avdelingId: string }> }) => {
  const { avdelingId } = await params
  return <AvdelingDetailPage avdelingId={avdelingId} />
}

export default Page
