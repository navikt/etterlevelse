import { ArrowUpIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Link, Spacer } from '@navikt/ds-react'
import * as React from 'react'
import { etterlevelseLogoWhiteIcon } from '../Images'

export const Footer = () => {
  const [showButtonToTop, setShowButtonToTop] = React.useState(false)
  const [pageScroll, setPageScroll] = React.useState(window.pageYOffset)

  React.useEffect(() => {
    const checkScrollTop = () => {
      setPageScroll(window.pageYOffset)
      if (!showButtonToTop && window.pageYOffset > 100) {
        setShowButtonToTop(true)
      } else if (showButtonToTop && window.pageYOffset <= 100) {
        setShowButtonToTop(false)
      }
    }

    window.addEventListener('scroll', checkScrollTop)

    return () => window.removeEventListener('scroll', checkScrollTop)
  }, [pageScroll])

  return (
    <div className="bg-purple-400 text-white px-12 py-7 w-full">
      <Button
        className="text-white"
        size="xsmall"
        icon={<ArrowUpIcon aria-label="" aria-hidden />}
        onClick={() => window.scrollTo(0, 0)}
        variant="tertiary-neutral"
      >
        Til toppen
      </Button>
      <div className="flex mt-11">
        <div className=" flex flex-col">
          <BodyShort className="text-2xl mb-5 flex">
            <div className="mr-2.5">
              <img src={etterlevelseLogoWhiteIcon} alt="Etterlevlese logo" aria-hidden aria-label="" />
            </div>
            Støtte til etterlevelse
          </BodyShort>
          <BodyShort>
            2023 NAV
          </BodyShort>
          <BodyShort>
            Arbeids- og velferdsetaten
          </BodyShort>
        </div>
        <Spacer />
        <div className="flex flex-col gap-4">
          <BodyShort>
            Nyttige lenker
          </BodyShort>
          <Link className="text-white" href="#">Status på etterlevelse i NAV</Link>
          <Link className="text-white" href="#">Om etterlevelse på Navet</Link>
          <Link className="text-white" href="#">Behandlingskatalogen</Link>
          <Link className="text-white" href="#">Veileder for å skrive etterlevelseskrav</Link>
        </div>
        <Spacer />
        <div className="flex flex-col gap-4">
          <BodyShort>
            Om nettstedet
          </BodyShort>
          <Link className="text-white" href="#">Hva er Støtte til etterlevelse?</Link>
        </div>
        <Spacer />
        <div className="flex flex-col gap-4">
          <BodyShort>
            Finn oss
          </BodyShort>
          <Link className="text-white" href="#">Slack</Link>
          <Link className="text-white" href="#">Github</Link>
          <Link className="text-white" href="#">Teamkatalogen</Link>
        </div>
      </div>
    </div>
    // <Block backgroundColor={ettlevColors.green800} width="100%" justifyContent="center" display="flex" position="absolute" bottom="0">
    //   <Block maxWidth={maxPageWidth} width="100%">
    //     <Block
    //       display="flex"
    //       width={responsiveWidthSmall}
    //       height="100px"
    //       paddingRight={responsivePaddingSmall}
    //       paddingLeft={responsivePaddingSmall}
    //       position="relative"
    //       $style={{ left: 0, right: 0, bottom: 0 }}
    //     >
    //       <div className="w-full min-h-[100px] flex items-center">
    //         <div className="w-full flex justify-around items-center">
    //           <ExternalLink href={datajegerSlackLink} className="text-white" openOnSamePage>
    //             #etterlevelse på Slack
    //           </ExternalLink>
    //           <ExternalLink href={githubRepo} openOnSamePage className="text-white">
    //             Github
    //           </ExternalLink>
    //           <ExternalLink href={documentationLink} openOnSamePage className="text-white">
    //             Dokumentasjon
    //           </ExternalLink>
    //         </div>
    //       </div>

    //       {showButtonToTop && (
    //         <Block position="relative" display="flex" justifyContent="flex-end" $style={{ cursor: 'pointer', top: '-50px' }} onClick={() => window.scrollTo(0, 0)}>
    //           <Button kind={KIND.tertiary} $style={{ ':hover': { backgroundColor: 'transparent' } }}>
    //             <img src={ToTopCircle} alt="Til toppen av siden" />
    //           </Button>
    //         </Block>
    //       )}
    //     </Block>
    //   </Block>
    // </Block>
  )
}
