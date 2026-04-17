import { notFound } from 'next/navigation'
import { TillatGjenbrukHarness } from './tillatGjenbrukHarness'

const Page = () => {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return <TillatGjenbrukHarness />
}

export default Page
