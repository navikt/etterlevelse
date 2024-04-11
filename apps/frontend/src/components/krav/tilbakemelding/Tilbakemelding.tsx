import { PlusIcon, TrashIcon } from '@navikt/aksel-icons'
import {
  Accordion,
  Alert,
  BodyLong,
  BodyShort,
  Button,
  Checkbox,
  Heading,
  Label,
  Loader,
  Modal,
  Select,
  Spacer,
  Textarea,
} from '@navikt/ds-react'
import * as _ from 'lodash'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ITilbakemeldingNewMeldingRequest,
  tilbakemeldingNewMelding,
  tilbakemeldingslettMelding,
  updateTilbakemeldingStatusOgEndretKrav,
  useTilbakemeldinger,
} from '../../../api/TilbakemeldingApi'
import {
  ETilbakemeldingMeldingStatus,
  ETilbakemeldingRolle,
  IKrav,
  ITilbakemelding,
} from '../../../constants'
import { user } from '../../../services/User'
import { useQueryParam, useRefs } from '../../../util/hooks/customHooks'
import { ettlevColors } from '../../../util/theme'
import { LoginButton } from '../../Header'
import { mailboxPoppingIcon } from '../../Images'
import { InfoBlock } from '../../common/InfoBlock'
import { PersonName } from '../../common/PersonName'
import { Portrait } from '../../common/Portrait'
import StatusView from '../../common/StatusTag'
import { ShowWarningMessage } from '../../etterlevelseDokumentasjonTema/KravCard'
import ResponseMelding from './ResponseMelding'
import EndretInfo from './edit/EndreInfo'
import MeldingKnapper from './edit/MeldingKnapper'
import NyTilbakemeldingModal from './edit/NyTilbakemeldingModal'
import {
  getParsedOptionsforTilbakeMelding,
  getTilbakeMeldingStatusToOption,
  tilbakemeldingStatusToText,
} from './utils'

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
  const location = useLocation()
  const navigate = useNavigate()

  const refs = useRefs<HTMLDivElement>(tilbakemeldinger.map((tilbakemelding) => tilbakemelding.id))
  useEffect(() => {
    !loading && focusNr && setTimeout(() => refs[focusNr]?.current?.scrollIntoView(), 100)
  }, [loading])

  const setFocus = (id: string) => {
    setFocusNr(id)
    if (location.pathname.split('/')[1] === 'krav')
      navigate(`/krav/${krav.kravNummer}/${krav.kravVersjon}?tilbakemeldingId=${id}`, {
        replace: true,
      })
  }

  return (
    <div className="w-full py-5">
      {loading && <Loader size="large" />}
      {!loading && !!tilbakemeldinger.length && (
        <div className="flex flex-col">
          <Accordion>
            {tilbakemeldinger.slice(0, count).map((tilbakemelding) => {
              const focused = focusNr === tilbakemelding.id
              const { status, ubesvartOgKraveier, melderOrKraveier } = getMelderInfo(tilbakemelding)
              return (
                <Accordion.Item key={tilbakemelding.id} open={tilbakemelding.id === focusNr}>
                  <Accordion.Header onClick={() => setFocus(focused ? '' : tilbakemelding.id)}>
                    <div className="w-full p-2 flex">
                      <div>
                        {tilbakemelding.endretKrav && (
                          <ShowWarningMessage warningMessage="Spørsmålet har ført til at innholdet i kravet er endret" />
                        )}
                        <div className={`flex w-full ${tilbakemelding.endretKrav ? 'mt-2' : ''}`}>
                          <Portrait ident={tilbakemelding.melderIdent} />
                          <div className="flex flex-col w-full ml-2.5">
                            <div className="flex w-full items-center">
                              <Label>
                                <PersonName ident={tilbakemelding.melderIdent} />
                              </Label>
                              <div className="flex ml-6">
                                <BodyShort>
                                  Sendt: {moment(tilbakemelding.meldinger[0].tid).format('lll')}
                                </BodyShort>
                                <BodyShort className="ml-3.5">
                                  Kravversjon: K{tilbakemelding.kravNummer}.
                                  {tilbakemelding.kravVersjon}
                                </BodyShort>
                              </div>
                            </div>
                            {!focused && (
                              <div className="flex w-full">
                                <BodyShort className="mr-7 mt-1 w-full">
                                  {_.truncate(tilbakemelding.meldinger[0].innhold, {
                                    length: 80,
                                    separator: /[.,] +/,
                                  })}
                                </BodyShort>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Spacer />
                      <div>
                        <StatusView status={tilbakemeldingStatusToText(status)} />
                      </div>
                    </div>
                  </Accordion.Header>
                  <Accordion.Content>
                    {focused && (
                      <div className="flex w-full">
                        <BodyLong>{tilbakemelding.meldinger[0].innhold}</BodyLong>
                      </div>
                    )}
                    <div className="flex w-full items-center mt-4">
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
                      <div className="flex flex-col mt-4">
                        {tilbakemelding.meldinger.slice(1).map((melding) => (
                          <ResponseMelding
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
                        setFocusNummer={setFocusNr}
                        ubesvartOgKraveier={ubesvartOgKraveier}
                        close={(t) => {
                          t && replace(t)
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
            <div className="self-end mt-2.5">
              <Button
                variant="tertiary"
                icon={<PlusIcon aria-label="" aria-hidden />}
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
          <div className="mt-10">
            <Heading size="medium" level="1">
              Spørsmål til kraveier
            </Heading>
            {user.isLoggedIn() ? (
              <BodyLong className="max-w-xl">
                Her kan du stille kraveier et spørsmål dersom det er uklarheter vedrørende hvordan
                kravet skal forstås. Spørsmål og svar fra kraveier blir synlig for alle på denne
                siden.
              </BodyLong>
            ) : (
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

          <NyTilbakemeldingModal
            krav={krav}
            open={addTilbakemelding}
            close={(t) => {
              t && add(t)
              setAddTilbakemelding(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

const getStatus = (tilbakemelding: ITilbakemelding) => {
  let status = ETilbakemeldingMeldingStatus.UBESVART

  if (tilbakemelding.status) {
    status = tilbakemelding.status
  } else {
    if (
      tilbakemelding.meldinger[tilbakemelding.meldinger.length - 1].rolle ===
      ETilbakemeldingRolle.KRAVEIER
    ) {
      status = ETilbakemeldingMeldingStatus.BESVART
    }
  }

  return status
}

export const getMelderInfo = (tilbakemelding: ITilbakemelding) => {
  const sistMelding = tilbakemelding.meldinger[tilbakemelding.meldinger.length - 1]
  const status = getStatus(tilbakemelding)
  const melder = user.getIdent() === tilbakemelding.melderIdent
  const rolle =
    tilbakemelding?.melderIdent === user.getIdent()
      ? ETilbakemeldingRolle.MELDER
      : ETilbakemeldingRolle.KRAVEIER
  const melderOrKraveier = melder || user.isKraveier()
  const ubesvartOgKraveier = status === ETilbakemeldingMeldingStatus.UBESVART && user.isKraveier()
  const kanSkrive =
    (status === ETilbakemeldingMeldingStatus.UBESVART && rolle === ETilbakemeldingRolle.KRAVEIER) ||
    (status !== ETilbakemeldingMeldingStatus.UBESVART && rolle === ETilbakemeldingRolle.MELDER)
  return { status, ubesvartOgKraveier, rolle, melder, melderOrKraveier, sistMelding, kanSkrive }
}

type TTilbakemeldingSvarProps = {
  tilbakemelding: ITilbakemelding
  setFocusNummer: (fn: string | undefined) => void
  close: (t: ITilbakemelding) => void
  ubesvartOgKraveier: boolean
  remove: (t: ITilbakemelding) => void
  replace: (t: ITilbakemelding) => void
}

const TilbakemeldingSvar = ({
  tilbakemelding,
  setFocusNummer,
  close,
  ubesvartOgKraveier,
  remove,
  replace,
}: TTilbakemeldingSvarProps) => {
  const melderInfo = getMelderInfo(tilbakemelding)
  const [response, setResponse] = useState('')
  const [replyRole] = useState(melderInfo.rolle)
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [tilbakeMeldingStatus, setTilbakemeldingStatus] = useState<ETilbakemeldingMeldingStatus>(
    tilbakemelding.status || ETilbakemeldingMeldingStatus.UBESVART
  )
  const [isEndretKrav, setIsEndretKrav] = useState<boolean>(tilbakemelding.endretKrav || false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)

  const submit = () => {
    if (response) {
      setFocusNummer(tilbakemelding.id)

      const req: ITilbakemeldingNewMeldingRequest = {
        tilbakemeldingId: tilbakemelding.id,
        rolle: replyRole,
        melding: response,
        status: tilbakeMeldingStatus,
        endretKrav: isEndretKrav,
      }

      setLoading(true)

      tilbakemeldingNewMelding(req)
        .then((t) => {
          close(t)
          setLoading(false)
          setResponse('')
        })
        .catch((e) => {
          setError(e.error)
          setLoading(false)
        })
    }
  }

  return (
    <div className="w-full">
      {(melderInfo.kanSkrive || user.isKraveier()) && (
        <Heading size="medium" className="mb-2 mt-8">
          {ubesvartOgKraveier ? 'Besvar' : 'Ny melding'}
        </Heading>
      )}

      {user.isKraveier() && (
        <div>
          <div className="w-fit mb-2">
            <Checkbox value={isEndretKrav} onChange={() => setIsEndretKrav(!isEndretKrav)}>
              Tilbakemelding har ført til kravendring
            </Checkbox>
          </div>
          <div className="flex items-center mb-2">
            <Label className="mr-2 w-fit">Velg spørsmål status:</Label>
            <Select
              label="Velg spørsmål status"
              hideLabel
              value={getTilbakeMeldingStatusToOption(tilbakeMeldingStatus)[0].id}
              onChange={(e) => {
                setTilbakemeldingStatus(e.target.value as ETilbakemeldingMeldingStatus)
              }}
            >
              {getParsedOptionsforTilbakeMelding().map((option, index) => (
                <option key={index + '_' + option.label} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}
      <div className="flex w-full items-end justify-center">
        {(melderInfo.kanSkrive || user.isKraveier()) && (
          <Textarea
            className="w-full"
            label="Ny tilbakemelding"
            hideLabel
            minRows={6}
            onChange={(e) => setResponse((e.target as HTMLTextAreaElement).value)}
            value={response}
            disabled={loading}
          />
        )}
        {deleteModal && (
          <Modal
            open={deleteModal}
            onClose={() => setDeleteModal(false)}
            header={{
              heading: 'Er du sikker på at du vil slette hele meldingen?',
              closeButton: false,
            }}
          >
            <Modal.Body>
              <BodyShort className="flex">
                {moment(tilbakemelding.meldinger[0].tid).format('ll')}
                <div className="ml-1">
                  <PersonName ident={tilbakemelding.meldinger[0].fraIdent} />
                </div>
              </BodyShort>
              <BodyLong>{tilbakemelding.meldinger[0].innhold}</BodyLong>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setDeleteModal(false)}>
                Avbryt
              </Button>
              <Button
                className="ml-2.5"
                onClick={() =>
                  tilbakemeldingslettMelding({
                    tilbakemeldingId: tilbakemelding.id,
                    meldingNr: 1,
                  }).then((t) => {
                    remove({ ...t, meldinger: [] })
                    setDeleteModal(false)
                  })
                }
              >
                Slett
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
      <div className="flex mt-2 w-full">
        {user.isAdmin() && (
          <Button
            icon={<TrashIcon aria-label="" aria-hidden />}
            variant="secondary"
            onClick={() => setDeleteModal(true)}
          >
            Slett hele samtalen
          </Button>
        )}
        {/* {user.isKraveier() && !loading && melderInfo.melder && (
              <Block marginBottom={theme.sizing.scale400} display="flex" flexDirection="column">
                <Button
                  size="compact"
                  icon={faSync}
                  kind={'secondary'}
                  onClick={() => setReplyRole(replyRole === TilbakemeldingRolle.MELDER ? TilbakemeldingRolle.KRAVEIER : TilbakemeldingRolle.MELDER)}
                >
                  Jeg er {rolleText(replyRole)}
                </Button>
              </Block>
            )} */}
        {loading && (
          <div className="self-center ml-2.5">
            <Loader size="large" />
          </div>
        )}

        {(melderInfo.kanSkrive || user.isKraveier()) && (
          <div className="flex flex-1 justify-end">
            {user.isKraveier() && (
              <div>
                {isUpdatingStatus ? (
                  <div className="self-center ml-2.5">
                    <Loader size="large" />
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="ml-2.5"
                    onClick={() => {
                      setIsUpdatingStatus(true)
                      updateTilbakemeldingStatusOgEndretKrav({
                        tilbakemeldingId: tilbakemelding.id,
                        status: tilbakeMeldingStatus,
                        endretKrav: isEndretKrav,
                      })
                        .then((response) => {
                          replace(response)
                          setIsUpdatingStatus(false)
                        })
                        .catch(() => setIsUpdatingStatus(false))
                    }}
                  >
                    Oppdater status
                  </Button>
                )}
              </div>
            )}
            <Button className="ml-2.5" disabled={!response} onClick={submit}>
              {ubesvartOgKraveier ? 'Svar' : 'Send'}
              {user.isKraveier() ? ' og oppdater status' : ''}
            </Button>
          </div>
        )}
      </div>
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  )
}
