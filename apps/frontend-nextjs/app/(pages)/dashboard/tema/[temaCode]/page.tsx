import TemaDetailPage from '@/components/dashboard/TemaDetailPage'

const Page = async ({ params }: { params: Promise<{ temaCode: string }> }) => {
  const { temaCode } = await params
  return <TemaDetailPage temaCode={temaCode} />
}

export default Page
