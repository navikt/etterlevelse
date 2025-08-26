import { Portrait } from '@/components/common/portrait/portrait'
import StatusTag from '@/components/common/statusTag/statusTagComponent'
import { getMelderInfo } from '@/components/etterlevelse/getMelderInfo/getMelderInfo'
import { ShowWarningMessage } from '@/components/etterlevelse/kravCard/KravCard'
import { ContentLayout } from '@/components/others/layout/content/content'
import { IKrav } from '@/constants/krav/kravConstants'
import { ITilbakemelding } from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'
import { kravNummerVersjonUrl } from '@/routes/krav/kravRoutes'
import { TRefs, useRefs } from '@/util/hooks/customHooks/customHooks'
import { tilbakemeldingStatusToText } from '@/util/tilbakemelding/tilbakemeldingUtils'
import { PlusIcon } from '@navikt/aksel-icons'
import { Accordion, BodyShort, Button, Spacer } from '@navikt/ds-react'
import _ from 'lodash'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { usePathname, useRouter } from 'next/navigation'
import { Dispatch, FunctionComponent, SetStateAction, useEffect, useState } from 'react'
import { KravTilbakemeldingBruker } from './kravTilbakemeldingBruker/kravTilbakemeldingBruker'
import { KravTilbakemeldingFocusAccordionContent } from './kravTilbakemeldingFocusAccordionContent/kravTilbakemeldingFocusAccordionContent'

type TProps = {
  tilbakemeldinger: ITilbakemelding[]
  krav: IKrav
  loading: boolean
  focusNr: string | undefined
  setFocusNr: Dispatch<SetStateAction<string | undefined>>
  replace: (tilbakemelding: ITilbakemelding) => void
  remove: (tilbakemelding: ITilbakemelding) => void
}

const DEFAULT_COUNT_SIZE = 5

export const KravTilbakemeldingLoadedAccordion: FunctionComponent<TProps> = ({
  tilbakemeldinger,
  krav,
  loading,
  focusNr,
  setFocusNr,
  replace,
  remove,
}) => {
  const router: AppRouterInstance = useRouter()
  const pathname: string = usePathname()

  const [count, setCount] = useState(DEFAULT_COUNT_SIZE)

  const setFocus = (id: string): void => {
    setFocusNr(id)
    if (pathname.split('/')[1] === 'krav')
      router.push(kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon, id))
  }

  const refs: TRefs<HTMLDivElement> = useRefs<HTMLDivElement>(
    tilbakemeldinger.map((tilbakemelding: ITilbakemelding) => tilbakemelding.kravId)
  )

  useEffect(() => {
    if (!loading && focusNr) {
      setTimeout(() => refs[focusNr]?.current?.scrollIntoView(), 100)
    }
  }, [loading])

  return (
    <div className='flex flex-col'>
      <Accordion>
        {tilbakemeldinger.slice(0, count).map((tilbakemelding: ITilbakemelding) => {
          const focused = focusNr === tilbakemelding.kravId
          const { status, ubesvartOgKraveier, melderOrKraveier } = getMelderInfo(tilbakemelding)

          return (
            <Accordion.Item key={tilbakemelding.kravId} open={tilbakemelding.kravId === focusNr}>
              <Accordion.Header onClick={() => setFocus(focused ? '' : tilbakemelding.kravId)}>
                <div className='w-full p-2 flex'>
                  <div>
                    {tilbakemelding.endretKrav && (
                      <ShowWarningMessage warningMessage='Spørsmålet har ført til at innholdet i kravet er endret' />
                    )}
                    <div className={`flex w-full ${tilbakemelding.endretKrav ? 'mt-2' : ''}`}>
                      <Portrait ident={tilbakemelding.melderIdent} />
                      <div className='flex flex-col w-full ml-2.5'>
                        <KravTilbakemeldingBruker tilbakemelding={tilbakemelding} />
                        {!focused && (
                          <ContentLayout>
                            <BodyShort className='mr-7 mt-1 w-full'>
                              {_.truncate(tilbakemelding.meldinger[0].innhold, {
                                length: 80,
                                separator: /[.,] +/,
                              })}
                            </BodyShort>
                          </ContentLayout>
                        )}
                      </div>
                    </div>
                  </div>
                  <Spacer />
                  <div>
                    <StatusTag status={tilbakemeldingStatusToText(status)} />
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Content>
                {focused && (
                  <KravTilbakemeldingFocusAccordionContent
                    tilbakemelding={tilbakemelding}
                    replace={replace}
                    remove={remove}
                    melderOrKraveier={melderOrKraveier}
                    setFocusNr={setFocusNr}
                    ubesvartOgKraveier={ubesvartOgKraveier}
                  />
                )}
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion>

      {tilbakemeldinger.length > DEFAULT_COUNT_SIZE && (
        <div className='self-end mt-2.5'>
          <Button
            variant='tertiary'
            icon={<PlusIcon aria-label='' aria-hidden />}
            onClick={() => setCount(count + DEFAULT_COUNT_SIZE)}
            disabled={tilbakemeldinger.length <= count}
          >
            Last flere
          </Button>
        </div>
      )}
    </div>
  )
}
