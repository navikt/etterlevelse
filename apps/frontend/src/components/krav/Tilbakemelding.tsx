import {AdresseType, Krav, Tilbakemelding, TilbakemeldingRolle, TilbakemeldingType, Varslingsadresse} from '../../constants'
import {createNewTilbakemelding, CreateTilbakemeldingRequest, tilbakemeldingNewMelding, TilbakemeldingNewMeldingRequest, useTilbakemeldinger} from '../../api/TilbakemeldingApi'
import React, {useEffect, useState} from 'react'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {HeadingSmall, LabelSmall, ParagraphMedium, ParagraphXSmall} from 'baseui/typography'
import Button from '../common/Button'
import {faChevronDown, faChevronRight, faEnvelope, faPlus, faPlusCircle, faSync, faUser} from '@fortawesome/free-solid-svg-icons'
import {borderRadius, hideBorder, marginAll} from '../common/Style'
import {Spinner} from '../common/Spinner'
import {Cell, Row, Table} from '../common/Table'
import {PersonName} from '../common/PersonName'
import moment from 'moment'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Card, CardOverrides} from 'baseui/card'
import {user} from '../../services/User'
import {colors} from 'baseui/tokens'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'baseui/modal'
import {Field, FieldProps, Form, Formik} from 'formik'
import {InputField, OptionField, TextAreaField} from '../common/Inputs'
import * as yup from 'yup'
import {Notification} from 'baseui/notification'
import {faSlackHash} from '@fortawesome/free-brands-svg-icons'
import {FormControl} from 'baseui/form-control'
import {AddEmail, SlackChannelSearch, SlackUserSearch} from './Varslingsadresser'
import {VarslingsadresserTagList} from './EditKrav'
import {useHistory} from 'react-router-dom'
import {useQueryParam, useRefs} from '../../util/hooks'
import {personIdentSort} from '../../api/TeamApi'
import {Textarea} from 'baseui/textarea'

export const Tilbakemeldinger = ({krav}: {krav: Krav}) => {
  const [tilbakemeldinger, loading, add, replace] = useTilbakemeldinger(krav.kravNummer, krav.kravVersjon)
  const [focusNr, setFocusNr] = useState<string | undefined>(useQueryParam('tilbakemeldingId'))
  const [addTilbakemelding, setAddTilbakemelding] = useState(false)
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
    <Block marginTop={theme.sizing.scale2400}>
      <Block display='flex' justifyContent='space-between' alignItems='center' width='100%'>
        <HeadingSmall>Tilbakemeldinger</HeadingSmall>
        <Block>
          <Button kind='tertiary' size='compact' icon={faPlus} onClick={() => setAddTilbakemelding(true)}>Ny tilbakemelding</Button>
        </Block>
      </Block>
      <Block $style={{...marginAll('-' + theme.sizing.scale600)}}>
        {loading && <Spinner size={theme.sizing.scale800}/>}
        {!loading &&
        <Table data={tilbakemeldinger} emptyText='tilbakemeldinger'
               config={{
                 useDefaultStringCompare: true,
                 initialSortColumn: 'id',
                 sorting: {
                   meldinger: (a, b) => b.meldinger.length - a.meldinger.length,
                   id: (a, b) => moment(b.meldinger[b.meldinger.length - 1].tid).valueOf() - moment(a.meldinger[a.meldinger.length - 1].tid).valueOf(),
                   melderIdent: (a, b) => personIdentSort(a.melderIdent, b.melderIdent)
                 }
               }}
               headers={[
                 {title: 'Tittel', column: 'tittel'},
                 {title: 'Melder', column: 'melderIdent'},
                 {title: 'Type', column: 'type'},
                 {title: 'Sist svar', column: 'id'},
                 {title: 'Meldinger', column: 'meldinger'},
               ]} render={state =>
          state.data.map(tilbakemelding => {
              const focused = tilbakemelding.id === focusNr
              return (
                <React.Fragment key={tilbakemelding.id}>
                  <div onClick={() => focused ? setFocusNr(undefined) : setFocus(tilbakemelding.id)} ref={refs[tilbakemelding.id]}>
                    <Row $style={{cursor: 'pointer'}}>
                      <Cell>{tilbakemelding.tittel}</Cell>
                      <Cell><PersonName ident={tilbakemelding.melderIdent}/></Cell>
                      <Cell>{typeText(tilbakemelding.type)}</Cell>
                      <Cell>{moment(tilbakemelding.meldinger[tilbakemelding.meldinger.length - 1].tid).format('lll')}</Cell>
                      <Cell>
                        <Block display='flex' justifyContent='space-between' width='100%' alignItems='center'>
                          <Block>
                            {tilbakemelding.meldinger.length}
                          </Block>
                          <Block>
                            <FontAwesomeIcon icon={focused ? faChevronDown : faChevronRight}/>
                          </Block>
                        </Block>
                      </Cell>
                    </Row>
                  </div>
                  {focused && <MessageList tilbakemelding={tilbakemelding} setTilbakemelding={replace}/>}
                </React.Fragment>
              )
            }
          )
        }/>}
      </Block>
      <AddTilbakemeldingModal krav={krav} open={addTilbakemelding} close={t => {
        t && add(t)
        setAddTilbakemelding(false)
      }}/>
      <Block height='400px'/>
    </Block>
  )
}

const AddTilbakemeldingModal = ({open, close, krav}: {open?: boolean, close: (add?: Tilbakemelding) => void, krav: Krav}) => {
  const [error, setError] = useState()
  const [adresseType, setAdresseType] = useState<AdresseType>()

  const submit = (req: CreateTilbakemeldingRequest) => {
    createNewTilbakemelding(req)
    .then(close)
    .catch(e => setError(e.error))
  }

  return (
    <Modal unstable_ModalBackdropScroll isOpen={!!open} onClose={() => close()}>
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
                <InputField label='Tittel' name='tittel'/>
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


const meldingCardOverrides = (isUser: boolean): CardOverrides => ({
  Root: {
    style: {
      marginTop: theme.sizing.scale400,
      width: 'fit-content',
      maxWidth: '80%',
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      backgroundColor: isUser ? theme.colors.inputFillActive : theme.colors.mono100,
      ...borderRadius('10px'),
      ...hideBorder
    }
  }
})

const MessageList = ({tilbakemelding, setTilbakemelding}: {tilbakemelding: Tilbakemelding, setTilbakemelding: (t: Tilbakemelding) => void}) => {
  const [showResponse, setShowResponse] = useState(false)
  const userRole = tilbakemelding.melderIdent === user.getIdent() ? TilbakemeldingRolle.MELDER : TilbakemeldingRolle.KRAVEIER
  const melder = userRole === TilbakemeldingRolle.MELDER;
  const melderOrKraveier = melder || user.isKraveier()


  return (
    <Block width='100%' display='flex' justifyContent='flex-end'>
      <Block padding={theme.sizing.scale600} width='100%' maxWidth='700px' display='flex' flexDirection='column' backgroundColor={colors.gray50}>
        {tilbakemelding.meldinger.map(melding => {
          return (
            <Card key={melding.meldingNr} overrides={meldingCardOverrides(melding.rolle === userRole)}>
              <Block display='flex' flexDirection='column'>
                <ParagraphMedium marginTop={0} marginBottom={0}>{melding.innhold}</ParagraphMedium>
                <ParagraphXSmall alignSelf={melding.rolle === userRole ? 'flex-end' : 'flex-start'} marginBottom={0}>
                  <PersonName ident={melding.fraIdent}/> {moment(melding.tid).format('lll')}
                </ParagraphXSmall>
              </Block>
            </Card>
          )
        })}

        {!showResponse && melderOrKraveier &&
        <Block alignSelf='flex-end' marginTop={theme.sizing.scale800}>
          <Button icon={faPlusCircle} size='compact' onClick={() => setShowResponse(true)}>Ny melding</Button>
        </Block>}
        {showResponse && <MeldingResponse
          userRole={userRole} tilbakemeldingId={tilbakemelding.id}
          close={t => {
            setTilbakemelding(t)
            setShowResponse(false)
          }}/>}
      </Block>
    </Block>
  )
}

const MeldingResponse = ({userRole, close, tilbakemeldingId}: {userRole: TilbakemeldingRolle, close: (t: Tilbakemelding) => void, tilbakemeldingId: string}) => {
  const [response, setResponse] = useState('')
  const [replyRole, setReplyRole] = useState(userRole)
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)

  const isMelder = userRole === TilbakemeldingRolle.MELDER

  const submit = () => {
    const req: TilbakemeldingNewMeldingRequest = {
      tilbakemeldingId: tilbakemeldingId,
      rolle: replyRole,
      melding: response
    }
    setLoading(true)
    tilbakemeldingNewMelding(req)
    .then(r => {
      close(r)
    })
    .catch(e => {
      setError(e.error)
      setLoading(false)
    })
  }

  return (
    <Card overrides={{
      Root: {
        style: {
          alignSelf: 'flex-end',
          marginTop: theme.sizing.scale800,
          width: '90%',
          backgroundColor: theme.colors.inputFillActive,
          ...borderRadius('10px')
        }
      },
      Contents: {
        style: {
          ...marginAll(theme.sizing.scale200)
        }
      },
      Body: {
        style: {
          marginBottom: 0
        }
      }
    }}>
      <Block display='flex' alignItems='flex-end'>
        <Textarea overrides={{
          InputContainer: {
            style: {
              backgroundColor: theme.colors.inputFillActive
            }
          },
          Input: {
            style: {
              backgroundColor: theme.colors.inputFillActive
            }
          }
        }} onChange={e => setResponse((e.target as HTMLInputElement).value)} value={response}/>

        <Block display='flex' justifyContent='space-between' flexDirection='column'
               marginLeft={theme.sizing.scale400}>

          {user.isKraveier() && !loading && isMelder &&
          <Block marginBottom={theme.sizing.scale400} display='flex' flexDirection='column'>
            <LabelSmall alignSelf='center'>Jeg er</LabelSmall>
            <Button size='compact' icon={faSync}
                    onClick={() => setReplyRole(replyRole === TilbakemeldingRolle.MELDER ? TilbakemeldingRolle.KRAVEIER : TilbakemeldingRolle.MELDER)}>
              {rolleText(replyRole)}
            </Button>
          </Block>}
          {loading && <Block alignSelf='center' marginBottom={theme.sizing.scale400}><Spinner size={theme.sizing.scale800}/></Block>}

          <Button size='compact' disabled={!response || loading} onClick={submit}>Send</Button>
        </Block>
        {error && <Notification kind='negative' overrides={{Body: {style: {marginBottom: '-25px'}}}}>{error}</Notification>}

      </Block>
    </Card>
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
  tittel: '',
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
  tittel: yup.string().required(required),
  foersteMelding: yup.string().required(required),
  type: yup.mixed().oneOf(Object.values(TilbakemeldingType)).required(required),
  varslingsadresse: varslingsadresse.required(required)
})
