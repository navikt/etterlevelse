import { Button, Link, Spacer } from '@navikt/ds-react'
import * as React from 'react'

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
    <div className="bg-purple-400 text-white">
      <Button onClick={() => window.scrollTo(0, 0)} variant="tertiary">
        Til toppen
      </Button>
      <div className="flex">
        <div className="flex-1">Støtte til etterlevelse 2023 NAV Arbeids- og velferdsetaten</div>
        <div className="flex-1">
          Nyttige lenker
          <Link href="#">Status på etterlevelse i NAV</Link>
          <Link href="#">Om etterlevelse på Navet</Link>
          <Link href="#">Behandlingskatalogen</Link>
          <Link href="#">Veileder for å skrive etterlevelseskrav</Link>
        </div>
        <div className="flex-1">
          Om nettstedet
          <Link href="#">Hva er Støtte til etterlevelse?</Link>
        </div>
        <div className="flex-1">
          Finn oss
          <Link href="#">Slack</Link>
          <Link href="#">Github</Link>
          <Link href="#">Teamkatalogen</Link>
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
