import {AdresseType, Krav, Tilbakemelding, TilbakemeldingMelding, TilbakemeldingRolle, TilbakemeldingType, Varslingsadresse} from '../../constants'
import {
  createNewTilbakemelding,
  CreateTilbakemeldingRequest,
  tilbakemeldingEditMelding,
  tilbakemeldingNewMelding,
  TilbakemeldingNewMeldingRequest,
  tilbakemeldingslettMelding,
  useTilbakemeldinger
} from '../../api/TilbakemeldingApi'
import React, {useEffect, useState} from 'react'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {HeadingXLarge, LabelSmall, ParagraphMedium, ParagraphSmall} from 'baseui/typography'
import Button from '../common/Button'
import {faChevronRight, faChevronUp, faEnvelope, faPencilAlt, faPlus, faSync, faUser} from '@fortawesome/free-solid-svg-icons'
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons'
import {borderColor, borderWidth} from '../common/Style'
import {Spinner} from '../common/Spinner'
import moment from 'moment'
import {Card} from 'baseui/card'
import {user} from '../../services/User'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'baseui/modal'
import {Field, FieldProps, Form, Formik} from 'formik'
import {OptionField, TextAreaField} from '../common/Inputs'
import * as yup from 'yup'
import {Notification} from 'baseui/notification'
import {faSlackHash} from '@fortawesome/free-brands-svg-icons'
import {FormControl} from 'baseui/form-control'
import {AddEmail, SlackChannelSearch, SlackUserSearch, VarslingsadresserTagList} from './Edit/KravVarslingsadresserEdit'
import {useHistory} from 'react-router-dom'
import {useQueryParam, useRefs} from '../../util/hooks'
import {ettlevColors, pageWidth} from '../../util/theme'
import {mailboxPoppingIcon} from '../Images'
import {InfoBlock} from '../common/InfoBlock'
import {Portrait} from '../common/Portrait'
import {PersonName} from '../common/PersonName'
import CustomizedTextarea from '../common/CustomizedTextarea'
import * as _ from 'lodash'

const DEFAULT_COUNT_SIZE = 5

export const Tilbakemeldinger = ({krav}: {krav: Krav}) => {
  const [tilbakemeldinger, loading, add, replace] = useTilbakemeldinger(krav.kravNummer, krav.kravVersjon)
  const [focusNr, setFocusNr] = useState<string | undefined>(useQueryParam('tilbakemeldingId'))
  const [addTilbakemelding, setAddTilbakemelding] = useState(false)
  const [tilbakemelding, setTilbakemelding] = useState<Tilbakemelding>()
  const [count, setCount] = useState(DEFAULT_COUNT_SIZE)
  const history = useHistory()

  const refs = useRefs<HTMLDivElement>(tilbakemeldinger.map(t => t.id))
  useEffect(() => {
    !loading && focusNr && setTimeout(() => refs[focusNr]?.current?.scrollIntoView(), 100)
  }, [loading])

  const setFocus = (id: string) => {
    setFocusNr(id)
    history.replace(`/krav/${krav.kravNummer}/${krav.kravVersjon}?tilbakemeldingId=${id}`)
  }

  return (
    <Block width='100%'>

      <HeadingXLarge marginTop={0}>Tilbakemeldinger</HeadingXLarge>

      {loading && <Spinner size={theme.sizing.scale800}/>}
      {!loading && !!tilbakemeldinger.length &&
      <Block display={'flex'} flexDirection={'column'}>
        <Block>
          {tilbakemeldinger.slice(0, count).map(t => {
            const focused = focusNr === t.id
            const {ubesvart, ubesvartOgKraveier, melderOrKraveier, sistMelding} = tilbakeMeldingStatus(t)
            return (
              <Card key={t.id} overrides={{
                Root: {
                  style: {
                    marginBottom: theme.sizing.scale300,
                    ...borderColor(ettlevColors.grey100),
                    ...borderWidth('1px')
                  }
                }
              }}>
                <Block display={'flex'}>
                  <Portrait ident={t.melderIdent}/>
                  <Block display={'flex'} flexDirection={'column'} marginLeft={theme.sizing.scale400} width={'100%'}>
                    <Block display={'flex'} justifyContent={'space-between'}>

                      <Block>
                        <LabelSmall><PersonName ident={t.melderIdent}/></LabelSmall>
                        <ParagraphSmall marginTop={0} marginBottom={0}>{moment(t.meldinger[0].tid).format('ll')}: {typeText(t.type)}</ParagraphSmall>
                      </Block>

                      <Block display={'flex'} flexDirection={'column'} alignItems={'flex-end'}>
                        <ParagraphSmall marginTop={0} marginBottom={0}>{t.meldinger.length} melding{t.meldinger.length > 1 ? 'er' : ''}</ParagraphSmall>
                        <ParagraphSmall marginTop={0} marginBottom={0}>
                          {ubesvart ? 'Ubesvart' : `Sist besvart ${moment(sistMelding.tid).format('ll')}`}
                        </ParagraphSmall>

                      </Block>
                    </Block>

                    <ParagraphMedium marginBottom={0} marginRight={theme.sizing.scale600}>
                      {focused ? t.meldinger[0].innhold : _.truncate(t.meldinger[0].innhold, {length: 180, separator: /[.,] +/})}
                    </ParagraphMedium>

                    {focused && t.meldinger.length === 1 &&
                    <MeldingKnapper melding={t.meldinger[0]} tilbakemeldingId={t.id} oppdater={replace}/>}

                    <Block marginTop={theme.sizing.scale600}>
                      {/* meldingsliste */}
                      {focused && <Block display={'flex'} flexDirection={'column'} marginTop={theme.sizing.scale400}>
                        {t.meldinger.slice(1).map(m => <ResponseMelding key={m.meldingNr} m={m} tilbakemelding={t} oppdater={replace}/>)}
                      </Block>}

                      {/* knapprad bunn */}
                      <Block display={'flex'} justifyContent={'space-between'} width={'100%'}>
                        <Block>
                          <Button kind={'underline-hover'} onClick={() => setFocus(focused ? '' : t.id)}
                                  hidePadding
                                  icon={focused ? faChevronUp : faChevronRight}>Vis {focused ? 'mindre' : 'mer'}</Button>
                        </Block>

                        {melderOrKraveier && user.canWrite() && focused &&
                        <Block>
                          <Button kind={ubesvartOgKraveier ? 'primary' : 'outline'} size={'compact'} onClick={() => {
                            setFocusNr(t.id)
                            setTilbakemelding(t)
                          }}>
                            {ubesvartOgKraveier ? 'Besvar' : 'Ny melding'}
                          </Button>
                        </Block>}
                      </Block>
                    </Block>

                  </Block>
                </Block>
              </Card>
            )
          })}
        </Block>

        {tilbakemeldinger.length > DEFAULT_COUNT_SIZE &&
        <Block $style={{alignSelf: 'flex-end'}} marginTop={theme.sizing.scale400}>
          <Button kind='tertiary' size='compact' icon={faPlus} onClick={() => setCount(count + DEFAULT_COUNT_SIZE)}
                  disabled={tilbakemeldinger.length <= count}>Last flere</Button>
        </Block>}
      </Block>}

      {!loading && !tilbakemeldinger.length &&
      <InfoBlock icon={mailboxPoppingIcon} alt={'Åpen mailboks icon'} text={'Det har ikke kommet inn noen tilbakemeldinger'} color={ettlevColors.red50}/>}


      <Block marginTop={theme.sizing.scale1000}>
        <HeadingXLarge>Gi en tilbakemelding</HeadingXLarge>
        <ParagraphMedium maxWidth={'600px'}>Gi tilbakemelding til kraveier dersom det er uklarheter vedrørende hvordan kravet skal forstås.</ParagraphMedium>

        {user.canWrite() &&
        <Button kind={'primary'} size='compact' onClick={() => setAddTilbakemelding(true)}>Ny tilbakemelding</Button>}
        {!user.canWrite() && <ParagraphSmall>Logg inn på toppen for å legge inn tilbakemelding</ParagraphSmall>}
      </Block>

      <NyTilbakemeldingModal krav={krav} open={addTilbakemelding} close={t => {
        t && add(t)
        setAddTilbakemelding(false)
      }}/>
      <TilbakemeldingSvarModal tilbakemelding={tilbakemelding} close={t => {
        t && replace(t)
        setTilbakemelding(undefined)
      }}/>

      <Block height='300px'/>
    </Block>
  )
}

const ResponseMelding = (props: {m: TilbakemeldingMelding, tilbakemelding: Tilbakemelding, oppdater: (t: Tilbakemelding) => void}) => {
  const {m, tilbakemelding, oppdater} = props
  const melder = m.rolle === TilbakemeldingRolle.MELDER
  const sisteMelding = m.meldingNr === tilbakemelding.meldinger[tilbakemelding.meldinger.length - 1].meldingNr

  return (
    <Block display={'flex'} flexDirection={'column'}
           marginBottom={theme.sizing.scale600}
           backgroundColor={melder ? 'inherit' : ettlevColors.grey50}
           padding={theme.sizing.scale600}
    >
      <Block display={'flex'}>
        <Portrait ident={m.fraIdent}/>
        <Block marginLeft={theme.sizing.scale200} marginRight={theme.sizing.scale200}
               display={'flex'} flexDirection={'column'}>
          <LabelSmall><PersonName ident={m.fraIdent}/>{!melder && ' (kraveier)'}</LabelSmall>
          <ParagraphSmall marginTop={0} marginBottom={0}>{moment(m.tid).format('ll')}</ParagraphSmall>
        </Block>
      </Block>

      <ParagraphMedium marginBottom={0} marginTop={theme.sizing.scale400} marginRight={theme.sizing.scale600}>{m.innhold}</ParagraphMedium>
      {sisteMelding && <MeldingKnapper melding={m} tilbakemeldingId={tilbakemelding.id} oppdater={oppdater}/>}
    </Block>
  )
}

const NyTilbakemeldingModal = ({open, close, krav}: {open?: boolean, close: (add?: Tilbakemelding) => void, krav: Krav}) => {
  const [error, setError] = useState()
  const [adresseType, setAdresseType] = useState<AdresseType>()

  const submit = (req: CreateTilbakemeldingRequest) => {
    createNewTilbakemelding(req)
    .then(close)
    .catch(e => setError(e.error))
  }

  return (
    <Modal unstable_ModalBackdropScroll isOpen={open} onClose={() => close()}>
      <Formik
        onSubmit={submit}
        initialValues={newTilbakemelding(krav) as CreateTilbakemeldingRequest}
        validationSchema={createTilbakemeldingSchema}
      >{({isSubmitting, setFieldValue, values, submitForm}) => {
        const setVarslingsadresse = (v?: Varslingsadresse) => {
          setFieldValue('varslingsadresse', v)
          setAdresseType(undefined)
        }
        return (
          <Form>
            <ModalHeader>
              Ny tilbakemelding
            </ModalHeader>
            <ModalBody>
              <Block>
                <TextAreaField label='Melding' name='foersteMelding'/>
                <OptionField label='Type' name='type' clearable={false} options={Object.values(TilbakemeldingType).map(o => ({id: o, label: typeText(o)}))}/>
                <Field name='varslingsadresse.adresse'>
                  {(p: FieldProps) =>
                    <FormControl label='Varslingsadresse' error={p.meta.error}>
                      <Block>
                        <Block display='flex' flexDirection='column' marginTop={theme.sizing.scale600}>
                          {adresseType === AdresseType.SLACK && <SlackChannelSearch add={setVarslingsadresse}/>}
                          {adresseType !== AdresseType.SLACK && !values.varslingsadresse &&
                          <Button kind='secondary' size='compact' type='button' icon={faSlackHash} onClick={() => setAdresseType(AdresseType.SLACK)}>
                            Slack-kanal
                          </Button>}
                          <Block marginTop={theme.sizing.scale400}/>
                          {adresseType === AdresseType.SLACK_USER && <SlackUserSearch add={setVarslingsadresse}/>}
                          {adresseType !== AdresseType.SLACK_USER && !values.varslingsadresse &&
                          <Button kind='secondary' size='compact' marginLeft type='button' icon={faUser} onClick={() => setAdresseType(AdresseType.SLACK_USER)}>
                            Slack-bruker
                          </Button>}
                          <Block marginTop={theme.sizing.scale400}/>
                          {adresseType === AdresseType.EPOST && <AddEmail add={setVarslingsadresse}/>}
                          {adresseType !== AdresseType.EPOST && !values.varslingsadresse &&
                          <Button kind='secondary' size='compact' marginLeft type='button' icon={faEnvelope} onClick={() => setAdresseType(AdresseType.EPOST)}>
                            Epost
                          </Button>}
                        </Block>
                        {values.varslingsadresse && <VarslingsadresserTagList varslingsadresser={[values.varslingsadresse]} remove={() => setVarslingsadresse(undefined)}/>}
                      </Block>
                    </FormControl>
                  }
                </Field>
              </Block>
            </ModalBody>
            <ModalFooter>
              <Block display='flex' justifyContent='flex-end'>
                <Block>
                  {error && <Notification kind='negative' overrides={{Body: {style: {marginBottom: '-25px'}}}}>{error}</Notification>}
                </Block>
                <Button kind='secondary' size='compact' type='button' onClick={close}> Avbryt </Button>
                <Button type='button' marginLeft disabled={isSubmitting} onClick={submitForm}>Lagre</Button>
              </Block>
            </ModalFooter>
          </Form>
        )
      }}</Formik>
    </Modal>
  )
}

const tilbakeMeldingStatus = (tilbakemelding: Tilbakemelding) => {
  const sistMelding = tilbakemelding.meldinger[tilbakemelding.meldinger.length - 1]
  const ubesvart = sistMelding.rolle === TilbakemeldingRolle.MELDER
  const melder = user.getIdent() === tilbakemelding.melderIdent
  const rolle = tilbakemelding?.melderIdent === user.getIdent() ? TilbakemeldingRolle.MELDER : TilbakemeldingRolle.KRAVEIER
  const melderOrKraveier = melder || user.isKraveier()
  const ubesvartOgKraveier = ubesvart && user.isKraveier()
  return {ubesvart, ubesvartOgKraveier, rolle, melder, melderOrKraveier, sistMelding}
}

const TilbakemeldingSvarModal = ({tilbakemelding, close}: {tilbakemelding?: Tilbakemelding, close: (t?: Tilbakemelding) => void}) => {
  if (!tilbakemelding) return null

  return (
    <Modal unstable_ModalBackdropScroll isOpen={!!tilbakemelding} onClose={() => close()} overrides={{
      Dialog: {
        style: {
          width: '60%', maxWidth: pageWidth
        }
      }
    }}>
      <ModalHeader>Svar på tilbakemelding</ModalHeader>
      <ModalBody>
        <TilbakemeldingSvar tilbakemelding={tilbakemelding} close={close}/>
      </ModalBody>
    </Modal>
  )
}

const MeldingKnapper = (props: {melding: TilbakemeldingMelding, tilbakemeldingId: string, oppdater: (t: Tilbakemelding) => void}) => {
  const {melding, tilbakemeldingId, oppdater} = props
  const meldingNr = melding.meldingNr
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  if ((!user.isAdmin() && melding.fraIdent !== user.getIdent()) || !user.canWrite()) return null

  return (
    <>
      <Block marginTop={theme.sizing.scale400}>
        <Button kind={'underline-hover'} size={'mini'} icon={faPencilAlt} onClick={() => setEditModal(true)}>Rediger</Button>
        <Button kind={'underline-hover'} size={'mini'} icon={faTrashAlt} marginLeft onClick={() => setDeleteModal(true)}>Slett</Button>
      </Block>

      {deleteModal && <Modal isOpen onClose={() => setDeleteModal(false)} unstable_ModalBackdropScroll>
        <ModalHeader>Er du sikker på at du vil slette meldingen?</ModalHeader>
        <ModalBody>
          {meldingNr === 1 && <ParagraphMedium>Hele meldingstråden vil bli slettet.</ParagraphMedium>}
          <ParagraphSmall>{moment(melding.tid).format('ll')} <PersonName ident={melding.fraIdent}/></ParagraphSmall>
          <ParagraphMedium>{melding.innhold}</ParagraphMedium>
        </ModalBody>
        <ModalFooter>
          <Button kind={'secondary'} size={'compact'} onClick={() => setDeleteModal(false)}>Avbryt</Button>
          <Button kind={'primary'} size={'compact'} marginLeft onClick={() => tilbakemeldingslettMelding({tilbakemeldingId, meldingNr}).then(oppdater)}>Slett</Button>
        </ModalFooter>
      </Modal>}

      {editModal && <Modal isOpen onClose={() => setEditModal(false)} unstable_ModalBackdropScroll overrides={{
        Dialog: {
          style: {
            width: '60%', maxWidth: pageWidth
          }
        }
      }}>
        <ModalHeader>Rediger melding</ModalHeader>
        <ModalBody>
          <ParagraphSmall>{moment(melding.tid).format('ll')} <PersonName ident={melding.fraIdent}/></ParagraphSmall>
          <TilbakemeldingEdit tilbakemeldingId={tilbakemeldingId} melding={melding} close={oppdater}/>
        </ModalBody>
      </Modal>}
    </>
  )
}

const TilbakemeldingSvar = ({tilbakemelding, close}: {tilbakemelding: Tilbakemelding, close: (t: Tilbakemelding) => void}) => {
  const melderInfo = tilbakeMeldingStatus(tilbakemelding)
  const [response, setResponse] = useState('')
  const [replyRole, setReplyRole] = useState(melderInfo.rolle)
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)

  const submit = () => {
    const req: TilbakemeldingNewMeldingRequest = {
      tilbakemeldingId: tilbakemelding.id,
      rolle: replyRole,
      melding: response
    }
    setLoading(true)
    tilbakemeldingNewMelding(req).then(close).catch(e => {
      setError(e.error)
      setLoading(false)
    })
  }

  return (
    <Block display='flex' alignItems='flex-end'>
      <CustomizedTextarea rows={15} onChange={e => setResponse((e.target as HTMLInputElement).value)} value={response}/>

      <Block display='flex' justifyContent='space-between' flexDirection='column' marginLeft={theme.sizing.scale400}>

        {user.isKraveier() && !loading && melderInfo.melder &&
        <Block marginBottom={theme.sizing.scale400} display='flex' flexDirection='column'>
          <LabelSmall alignSelf='center'>Jeg er</LabelSmall>
          <Button size='compact' icon={faSync} kind={'secondary'}
                  onClick={() => setReplyRole(replyRole === TilbakemeldingRolle.MELDER ? TilbakemeldingRolle.KRAVEIER : TilbakemeldingRolle.MELDER)}>
            {rolleText(replyRole)}
          </Button>
        </Block>}
        {loading && <Block alignSelf='center' marginBottom={theme.sizing.scale400}><Spinner size={theme.sizing.scale800}/></Block>}

        <Button size='compact' disabled={!response || loading} onClick={submit}>Send</Button>
      </Block>
      {error && <Notification kind='negative' overrides={{Body: {style: {marginBottom: '-25px'}}}}>{error}</Notification>}

    </Block>
  )
}

const TilbakemeldingEdit = ({tilbakemeldingId, melding, close}: {tilbakemeldingId: string, melding: TilbakemeldingMelding, close: (t: Tilbakemelding) => void}) => {
  const [response, setResponse] = useState(melding.innhold)
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)

  const submit = () => {

    setLoading(true)
    tilbakemeldingEditMelding({tilbakemeldingId, meldingNr: melding.meldingNr, text: response}).then(close).catch(e => {
      setError(e.error)
      setLoading(false)
    })
  }

  return (
    <Block display='flex' alignItems='flex-end'>
      <CustomizedTextarea rows={15} onChange={e => setResponse((e.target as HTMLInputElement).value)} value={response}/>
      <Button size='compact' marginLeft disabled={!response || loading} onClick={submit}>Send</Button>
      {error && <Notification kind='negative' overrides={{Body: {style: {marginBottom: '-25px'}}}}>{error}</Notification>}
    </Block>
  )
}

const rolleText = (rolle: TilbakemeldingRolle) => {
  switch (rolle) {
    case TilbakemeldingRolle.KRAVEIER:
      return 'Kraveier'
    case TilbakemeldingRolle.MELDER:
      return 'Melder'
  }
}
const typeText = (type: TilbakemeldingType) => {
  switch (type) {
    case TilbakemeldingType.GOD:
      return 'God kravbeskrivelse'
    case TilbakemeldingType.UKLAR:
      return 'Uklar kravbeskrivelse'
    case TilbakemeldingType.ANNET:
      return 'Annet'
  }
}

const newTilbakemelding = (krav: Krav): Partial<CreateTilbakemeldingRequest> => ({
  kravNummer: krav.kravNummer,
  kravVersjon: krav.kravVersjon,
  foersteMelding: '',
  type: TilbakemeldingType.UKLAR,
  varslingsadresse: undefined
})

const required = 'Påkrevd'

const varslingsadresse: yup.SchemaOf<Varslingsadresse> = yup.object({
  adresse: yup.string().required(required),
  type: yup.mixed().oneOf(Object.values(AdresseType)).required(required)
})

const createTilbakemeldingSchema: yup.SchemaOf<CreateTilbakemeldingRequest> = yup.object({
  kravNummer: yup.number().required(required),
  kravVersjon: yup.number().required(required),
  foersteMelding: yup.string().required(required),
  type: yup.mixed().oneOf(Object.values(TilbakemeldingType)).required(required),
  varslingsadresse: varslingsadresse.required(required)
})
