import { Narrow, Wide } from '../components/scaffold/Page'
import { useEffect, useState } from 'react'
import { Markdown } from '../components/common/Markdown'
import { AlertType, Melding, MeldingStatus, MeldingType } from '../constants'
import { getMeldingByType } from '../api/MeldingApi'
import { ampli } from '../services/Amplitude'
import { TemaListeUtenBrodsti } from './TemaPage'
import { Button, Heading } from '@navikt/ds-react'

export const MainPage = () => {
  const [forsideVarsel, setForsideVarsle] = useState<Melding>()

  useEffect(() => {
    ;(async () => {
      await getMeldingByType(MeldingType.FORSIDE).then((r) => {
        if (r.numberOfElements > 0) {
          setForsideVarsle(r.content[0])
        }
      })
    })()
  }, [])

  ampli.logEvent('sidevisning', { side: 'Hovedside' })

  return (
    <div className="w-full pb-52" id="content" role="main">
      <div className="bg-surface-info-subtle p-10">
        <div className="flex flex-col pd">
          <Heading className="flex justify-center" size="xlarge">
            Etterlevelse i NAV
          </Heading>
          <span className="flex justify-center">Forstå og dokumentér</span>
        </div>
        <div className="bg-white mt-8 p-8">
          <Heading size="medium">Etterlevelse i NAV</Heading>
          <span>
            For å dokumentere etterlevelse må du opprette et etterlevelsesdokument. Du vil da se hvilke krav som gjelder for din løsning og kan dokumentere hvordan løsningen
            etterlever kravene.
          </span>
          <div className="mt-8 flex justify-end">
            <Button className="mr-3" variant="secondary">
              Nytt etterlevelsesdokument
            </Button>
            <Button variant="tertiary">Alle etterlevelsesdokumenter</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center w-full">
        <Wide>
          <div className="mt-8">
            <TemaListeUtenBrodsti />
          </div>
        </Wide>

        <Narrow>
          <div className="mt-16 mb-32" id="forsideVarselMelding">
            {forsideVarsel?.meldingStatus === MeldingStatus.ACTIVE && (
              <>
                {forsideVarsel.alertType === AlertType.INFO ? (
                  <div className="border-solid border-1 mt-16 p-8 bg-surface-info-subtle border-surface-info">
                    <Markdown source={forsideVarsel.melding} />
                  </div>
                ) : (
                  <div className="border-solid border-1 mt-16 p-8 bg-surface-warning-subtle border-surface-warning">
                    <Markdown source={forsideVarsel.melding} />
                  </div>
                )}
              </>
            )}
          </div>
        </Narrow>
      </div>
    </div>
  )
}
