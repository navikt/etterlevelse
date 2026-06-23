import { Link } from '@navikt/ds-react'

const SkipToContent = () => (
  <>
    <div className='focus-within:w-32 bg-gray-900'>
      <Link className='p-2 absolute -top-10 left-0 focus:top-0 text-white' href='#content'>
        Hovedinnhold
      </Link>
    </div>
  </>
)

export default SkipToContent
