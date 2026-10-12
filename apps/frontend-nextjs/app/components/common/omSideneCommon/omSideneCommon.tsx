import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { FunctionComponent } from 'react'

type TOmNavigeringProps = {
  router: AppRouterInstance
  forrigeLenke: string
  forrigeLenkeTekst: string
  nesteLenke: string
  nesteLenkeTekst: string
}

export const OmNavigering: FunctionComponent<TOmNavigeringProps> = ({
  router,
  forrigeLenke,
  forrigeLenkeTekst,
  nesteLenke,
  nesteLenkeTekst,
}) => (
  <div className='z-10 flex flex-col w-full items-center mt-5 button_container sticky bottom-0  bg-white'>
    <div className='w-full max-w-7xl py-4 px-4 border-t-2 z-2'>
      <div className='flex w-full flex-row-reverse justify-evenly gap-2 items-end'>
        <Button
          icon={<ChevronRightIcon aria-hidden />}
          iconPosition='right'
          type='button'
          variant='tertiary'
          onClick={() => {
            router.push(nesteLenke)
          }}
        >
          Fortsett til {nesteLenkeTekst}
        </Button>

        <Button
          icon={<ChevronLeftIcon aria-hidden />}
          type='button'
          variant='tertiary'
          onClick={() => {
            router.push(forrigeLenke)
          }}
        >
          Tilbake til {forrigeLenkeTekst}
        </Button>
      </div>
    </div>
  </div>
)
