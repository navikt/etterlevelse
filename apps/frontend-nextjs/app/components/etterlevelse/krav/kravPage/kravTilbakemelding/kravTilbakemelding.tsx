import { useTilbakemeldinger } from '@/api/tilbakemelding/tilbakemeldingApi'
import { InfoBlock } from '@/components/common/infoBlock/infoBlock'
import PersonNavn from '@/components/common/personNavn/personNavn'
import { Portrait } from '@/components/common/portrait/portrait'
import StatusTag from '@/components/common/statusTag/statusTagComponent'
import { MeldingKnapper } from '@/components/etterlevelse/edit/meldingKnapper/meldingKnapper'
import { getMelderInfo } from '@/components/etterlevelse/getMelderInfo/getMelderInfo'
import { ShowWarningMessage } from '@/components/etterlevelse/kravCard/kravCard'
import EndretInfo from '@/components/etterlevelse/tilbakemeldingEditInfo/tilbakemeldingsEditInfo'
import { TilbakemeldingNyModal } from '@/components/etterlevelse/tilbakemeldingNyModal/tilbakemeldingNyModal'
import TilbakemeldingResponseMelding from '@/components/etterlevelse/tilbakemeldingResponseMelding/tilbakemeldingResponseMelding'
import TilbakemeldingSvar from '@/components/etterlevelse/tilbakemeldingSvar/tilbakemeldingSvar'
import { mailboxPoppingIcon } from '@/components/others/images/images'
import { ContentLayout } from '@/components/others/layout/contentLayout/contentLayoutComponent'
import { LoginButton } from '@/components/others/layout/header/login/login'
import { IKrav } from '@/constants/krav/kravConstants'
import { ITilbakemelding } from '@/constants/tilbakemelding/tilbakemeldingConstants'
import { kravNummerVersjonUrl } from '@/routes/krav/kravRoutes'
import { user } from '@/services/user/userService'
import { useQueryParam, useRefs } from '@/util/hooks/customHooks/customHooks'
import { ettlevColors } from '@/util/theme/theme'
import { tilbakemeldingStatusToText } from '@/util/tilbakemelding/tilbakemeldingUtils'
import { PlusIcon } from '@navikt/aksel-icons'
import {
  Accordion,
  BodyLong,
  BodyShort,
  Button,
  Heading,
  Label,
  Loader,
  Spacer,
} from '@navikt/ds-react'
import * as _ from 'lodash'
import moment from 'moment'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const DEFAULT_COUNT_SIZE = 5

export const Tilbakemeldinger = ({
  krav,
  hasKravExpired,
}: {
  krav: IKrav
  hasKravExpired: boolean
}) => {
  const [tilbakemeldinger, loading, add, replace, remove] = useTilbakemeldinger(
    krav.kravNummer,
    krav.kravVersjon
  )
  const [focusNr, setFocusNr] = useState<string | undefined>(useQueryParam('tilbakemeldingId'))
  const [addTilbakemelding, setAddTilbakemelding] = useState(false)
  const [count, setCount] = useState(DEFAULT_COUNT_SIZE)
  const navigate = useNavigate()
  const pathname = usePathname()

  const refs = useRefs<HTMLDivElement>(tilbakemeldinger.map((tilbakemelding) => tilbakemelding.id))
  useEffect(() => {
    if (!loading && focusNr) {
      setTimeout(() => refs[focusNr]?.current?.scrollIntoView(), 100)
    }
  }, [loading])

  const setFocus = (id: string) => {
    setFocusNr(id)
    if (pathname.split('/')[1] === 'krav')
      navigate(kravNummerVersjonUrl(krav.kravNummer, krav.kravVersjon, id), {
        replace: true,
      })
  }

  return (
    <div className='w-full py-5'>
      {loading && <Loader size='large' />}
      {!loading && !!tilbakemeldinger.length && (
        <div className='flex flex-col'>
          <Accordion>
            {tilbakemeldinger.slice(0, count).map((tilbakemelding) => {
              const focused = focusNr === tilbakemelding.id
              const { status, ubesvartOgKraveier, melderOrKraveier } = getMelderInfo(tilbakemelding)
              return (
                <Accordion.Item key={tilbakemelding.id} open={tilbakemelding.id === focusNr}>
                  <Accordion.Header onClick={() => setFocus(focused ? '' : tilbakemelding.id)}>
                    <div className='w-full p-2 flex'>
                      <div>
                        {tilbakemelding.endretKrav && (
                          <ShowWarningMessage warningMessage='Spørsmålet har ført til at innholdet i kravet er endret' />
                        )}
                        <div className={`flex w-full ${tilbakemelding.endretKrav ? 'mt-2' : ''}`}>
                          <Portrait ident={tilbakemelding.melderIdent} />
                          <div className='flex flex-col w-full ml-2.5'>
                            <div className='flex w-full items-center'>
                              <Label>
                                <PersonNavn ident={tilbakemelding.melderIdent} />
                              </Label>
                              <div className='flex ml-6'>
                                <BodyShort>
                                  Sendt: {moment(tilbakemelding.meldinger[0].tid).format('LLL')}
                                </BodyShort>
                                <BodyShort className='ml-3.5'>
                                  Kravversjon: K{tilbakemelding.kravNummer}.
                                  {tilbakemelding.kravVersjon}
                                </BodyShort>
                              </div>
                            </div>
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
                      <ContentLayout>
                        <BodyLong>{tilbakemelding.meldinger[0].innhold}</BodyLong>
                      </ContentLayout>
                    )}
                    <div className='flex w-full items-center mt-4'>
                      {focused && tilbakemelding.meldinger.length === 1 && (
                        <MeldingKnapper
                          marginLeft
                          melding={tilbakemelding.meldinger[0]}
                          tilbakemeldingId={tilbakemelding.id}
                          oppdater={replace}
                          remove={remove}
                        />
                      )}

                      {focused && <EndretInfo melding={tilbakemelding.meldinger[0]} />}
                    </div>

                    {/* meldingsliste */}
                    {focused && (
                      <div className='flex flex-col mt-4'>
                        {tilbakemelding.meldinger.slice(1).map((melding) => (
                          <TilbakemeldingResponseMelding
                            key={melding.meldingNr}
                            melding={melding}
                            tilbakemelding={tilbakemelding}
                            oppdater={replace}
                            remove={remove}
                          />
                        ))}
                      </div>
                    )}

                    {/* knapprad bunn */}
                    {melderOrKraveier && user.canWrite() && focused && (
                      <TilbakemeldingSvar
                        tilbakemelding={tilbakemelding}
                        setFokusNummer={setFocusNr}
                        ubesvartOgKraveier={ubesvartOgKraveier}
                        close={(tilbakemelding: ITilbakemelding) => {
                          if (tilbakemelding) {
                            replace(tilbakemelding)
                          }
                        }}
                        remove={remove}
                        replace={replace}
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
      )}

      {!loading && !tilbakemeldinger.length && (
        <InfoBlock
          icon={mailboxPoppingIcon}
          alt={'Åpen mailboks icon'}
          text={'Det har ikke kommet inn noen tilbakemeldinger'}
          color={ettlevColors.red50}
        />
      )}

      {!hasKravExpired && (
        <div>
          <div className='mt-10'>
            <Heading size='medium' level='1'>
              Spørsmål til kraveier
            </Heading>
            {user.isLoggedIn() && (
              <BodyLong className='max-w-xl'>
                Her kan du stille kraveier et spørsmål dersom det er uklarheter vedrørende hvordan
                kravet skal forstås. Spørsmål og svar fra kraveier blir synlig for alle på denne
                siden.
              </BodyLong>
            )}
            {!user.isLoggedIn() && (
              <BodyShort>
                Du må være innlogget for å stille kraveier et spørsmål, og for å se tidligere
                spørsmål og svar.
              </BodyShort>
            )}
            {user.canWrite() && (
              <Button onClick={() => setAddTilbakemelding(true)}>Still et spørsmål</Button>
            )}
            {!user.isLoggedIn() && <LoginButton />}
          </div>

          <TilbakemeldingNyModal
            krav={krav}
            open={addTilbakemelding}
            close={(tilbakemelding) => {
              if (tilbakemelding) {
                add(tilbakemelding)
              }
              setAddTilbakemelding(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
