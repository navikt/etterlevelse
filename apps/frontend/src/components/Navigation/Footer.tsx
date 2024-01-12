import { ArrowUpIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Link, Spacer } from '@navikt/ds-react'
import * as React from 'react'
import {
  VeilederEtterlevelseskrav,
  behandlingsKatalogLink,
  datajegerSlackLink,
  documentationLink,
  githubRepo,
  omEtterlevelsePaNavet,
  statusPageLink,
  teamInfoLink,
} from '../../util/config'
import { etterlevelseLogoWhiteIcon } from '../Images'

export const Footer = () => {
  const [showButtonToTop, setShowButtonToTop] = React.useState(false)
  const [pageScroll, setPageScroll] = React.useState(window.scrollY)

  React.useEffect(() => {
    const checkScrollTop = () => {
      setPageScroll(window.scrollY)
      if (!showButtonToTop && window.scrollY > 100) {
        setShowButtonToTop(true)
      } else if (showButtonToTop && window.scrollY <= 100) {
        setShowButtonToTop(false)
      }
    }

    window.addEventListener('scroll', checkScrollTop)

    return () => window.removeEventListener('scroll', checkScrollTop)
  }, [pageScroll])

  return (
    <div className="bg-purple-400 text-white px-12 py-7 w-full mt-auto justify-center flex">
      <div className="max-w-7xl w-full">
        {showButtonToTop && (
          <Button
            className="text-white"
            size="xsmall"
            icon={<ArrowUpIcon aria-label="" aria-hidden />}
            onClick={() => window.scrollTo(0, 0)}
            variant="tertiary-neutral"
          >
            Til toppen
          </Button>
        )}
        <div className="flex mt-11">
          <div className=" flex flex-col">
            <BodyShort className="text-2xl mb-5 flex items-baseline">
              <img
                className="mr-2.5"
                src={etterlevelseLogoWhiteIcon}
                alt="Etterlevlese logo"
                aria-hidden
                aria-label=""
              />
              Støtte til etterlevelse
            </BodyShort>
            <BodyShort>2023 NAV</BodyShort>
            <BodyShort>Arbeids- og velferdsetaten</BodyShort>
          </div>
          <Spacer />
          <div className="flex flex-col gap-4">
            <BodyShort>Nyttige lenker</BodyShort>
            <Link className="text-white" href={statusPageLink}>
              Status på etterlevelse i NAV
            </Link>
            <Link className="text-white" href={omEtterlevelsePaNavet}>
              Om etterlevelse på Navet
            </Link>
            <Link className="text-white" href={behandlingsKatalogLink}>
              Behandlingskatalogen
            </Link>
            <Link className="text-white" href={VeilederEtterlevelseskrav}>
              Veileder for å skrive etterlevelseskrav
            </Link>
          </div>
          <Spacer />
          <div className="flex flex-col gap-4">
            <BodyShort>Om nettstedet</BodyShort>
            <Link className="text-white" href={documentationLink}>
              Hva er Støtte til etterlevelse?
            </Link>
          </div>
          <Spacer />
          <div className="flex flex-col gap-4">
            <BodyShort>Finn oss</BodyShort>
            <Link className="text-white" href={datajegerSlackLink}>
              Slack
            </Link>
            <Link className="text-white" href={githubRepo}>
              Github
            </Link>
            <Link className="text-white" href={teamInfoLink}>
              Teamkatalogen
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
