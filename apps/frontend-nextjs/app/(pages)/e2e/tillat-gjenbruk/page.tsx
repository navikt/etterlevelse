import { notFound } from 'next/navigation'
import { TillatGjenbrukHarness } from './tillatGjenbrukHarness'

const Page = () => {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_E2E_PAGES !== 'true') {
    notFound()
  }

  return <TillatGjenbrukHarness />
}

export default Page
