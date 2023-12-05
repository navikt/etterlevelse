import { Narrow, Page, Wide } from '../components/scaffold/Page'
import { ettlevColors, theme } from '../util/theme'
import { Block } from 'baseui/block'
import { HeadingXXLarge } from 'baseui/typography'
import { borderColor, borderStyle, borderWidth, paddingAll } from '../components/common/Style'
import { useEffect, useState } from 'react'
import { Markdown } from '../components/common/Markdown'
import { AlertType, Melding, MeldingStatus, MeldingType } from '../constants'
import { getMeldingByType } from '../api/MeldingApi'
import { ampli } from '../services/Amplitude'
import { TemaListe } from './TemaPage'

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
      <HeadingXXLarge display={'flex'} flexDirection={'column'} marginTop={theme.sizing.scale1400} marginBottom={theme.sizing.scale1400}>
        <span style={{ fontWeight: 400 }}>Støtte til etterlevelse</span>
        <span>som ivaretar rettssikkerheten til brukerne våre</span>
      </HeadingXXLarge>
      <div className="flex flex-col items-center w-full">
        <Wide>
          <div>
            <TemaListe />
          </div>
        </Wide>

        <Narrow>
          <div className="mt-16 mb-32" id="forsideVarselMelding">
            {forsideVarsel?.meldingStatus === MeldingStatus.ACTIVE && (
              <>
                {forsideVarsel.alertType === AlertType.INFO ? (
                  <div className="border-blue-100 border-solid border-1  bg-blue-100  mt-16 p-8">
                    <Markdown source={forsideVarsel.melding} />
                  </div>
                ) : (
                  <div className="border-solid border-1 border-orange-100 bg-orange-100  mt-16 p-8">
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
