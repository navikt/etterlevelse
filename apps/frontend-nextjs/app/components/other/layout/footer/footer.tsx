import { BodyShort, Spacer } from '@navikt/ds-react'

// import {
//   VeilederEtterlevelseskrav,
//   behandlingsKatalogLink,
//   datajegerSlackLink,
//   documentationLink,
//   githubRepo,
//   omEtterlevelsePaNavet,
//   rutineForArkivering,
//   statusPageLink,
//   teamInfoLink,
// } from '../../util/config'
// import { etterlevelseLogoWhiteIcon } from '../Images'

export const Footer = () => {
  //   const [showButtonToTop, setShowButtonToTop] = useState(false)
  //   const [pageScroll, setPageScroll] = useState(window.scrollY)

  //   useEffect(() => {
  //     const checkScrollTop = () => {
  //       setPageScroll(window.scrollY)
  //       if (!showButtonToTop && window.scrollY > 100) {
  //         setShowButtonToTop(true)
  //       } else if (showButtonToTop && window.scrollY <= 100) {
  //         setShowButtonToTop(false)
  //       }
  //     }

  //     window.addEventListener('scroll', checkScrollTop)

  //     return () => window.removeEventListener('scroll', checkScrollTop)
  //   }, [pageScroll])

  return (
    <div
      className='bg-[#8269a2] text-white px-12 py-7 w-full mt-auto justify-center flex'
      role='contentinfo'
    >
      <div className='max-w-7xl w-full'>
        {/* {showButtonToTop && (
          <Button
            className='text-white'
            size='xsmall'
            icon={<ArrowUpIcon aria-label='' aria-hidden />}
            onClick={() => window.scrollTo(0, 0)}
            variant='tertiary-neutral'
          >
            Til toppen
          </Button>
        )} */}
        <div className='flex mt-11'>
          <div className=' flex flex-col'>
            <BodyShort className='text-2xl mb-5 flex items-baseline'>
              {/* <img
                className='mr-2.5'
                src={etterlevelseLogoWhiteIcon}
                alt='Etterlevlese logo'
                aria-hidden
                aria-label=''
              /> */}
              Støtte til etterlevelse
            </BodyShort>
            <BodyShort>2023 Nav</BodyShort>
            <BodyShort>Arbeids- og velferdsetaten</BodyShort>
          </div>
          <Spacer />
          <div className='flex flex-col gap-4'>
            <BodyShort>Nyttige lenker</BodyShort>
            {/* <Link className='text-white' href={statusPageLink}>
              Status på etterlevelse i Nav
            </Link>
            <Link className='text-white' href={omEtterlevelsePaNavet}>
              Om etterlevelse på Navet
            </Link>
            <Link className='text-white' href={behandlingsKatalogLink}>
              Behandlingskatalogen
            </Link>
            <Link className='text-white' href={VeilederEtterlevelseskrav}>
              Veileder for å skrive etterlevelseskrav
            </Link>
            <Link className='text-white' href={rutineForArkivering}>
              Rutine for arkivering av Etterlevelse
            </Link> */}
          </div>
          <Spacer />
          <div className='flex flex-col gap-4'>
            <BodyShort>Om nettstedet</BodyShort>
            {/* <Link className='text-white' href={documentationLink}>
              Hva er Støtte til etterlevelse?
            </Link> */}
          </div>
          <Spacer />
          <div className='flex flex-col gap-4'>
            <BodyShort>Finn oss</BodyShort>
            {/* <Link className='text-white' href={datajegerSlackLink}>
              Slack
            </Link>
            <Link className='text-white' href={githubRepo}>
              Github
            </Link>
            <Link className='text-white' href={teamInfoLink}>
              Teamkatalogen
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  )
}
