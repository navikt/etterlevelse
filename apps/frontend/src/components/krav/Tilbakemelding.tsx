import {AdresseType, Krav, Tilbakemelding, TilbakemeldingRolle, TilbakemeldingType, Varslingsadresse} from '../../constants'
import {CreateTilbakemeldingRequest, tilbakemeldingNewMelding, TilbakemeldingNewMeldingRequest, useTilbakemeldinger} from '../../api/TilbakemeldingApi'
import React, {useState} from 'react'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {HeadingSmall, ParagraphMedium, ParagraphXSmall} from 'baseui/typography'
import Button from '../common/Button'
import {faChevronDown, faChevronRight, faPlus, faPlusCircle} from '@fortawesome/free-solid-svg-icons'
import {hideBorder, marginAll} from '../common/Style'
import {Spinner} from '../common/Spinner'
import {Cell, disableEnter, Row, Table} from '../common/Table'
import {PersonName} from '../common/PersonName'
import moment from 'moment'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Card, CardOverrides} from 'baseui/card'
import {user} from '../../services/User'
import {colors} from 'baseui/tokens'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'baseui/modal'
import {Form, Formik} from 'formik'
import {TextAreaField} from '../common/Inputs'
import * as yup from 'yup'
import {Notification} from 'baseui/notification'

export const Tilbakemeldinger = (props: {krav: Krav}) => {
  const [tilbakemeldinger, loading,replace] = useTilbakemeldinger(props.krav.kravNummer, props.krav.kravVersjon)
  const [focusNr, setFocusNr] = useState<string>()

  return (
    <Block marginTop={theme.sizing.scale2400}>
      <Block display='flex' justifyContent='space-between' alignItems='center' width='100%'>
        <HeadingSmall>Tilbakemeldinger</HeadingSmall>
        <Block>
          <Button kind='tertiary' size='compact' icon={faPlus}>Ny tilbakemelding</Button>
        </Block>
      </Block>
      <Block $style={{...marginAll('-' + theme.sizing.scale600)}}>
        {loading && <Spinner size={theme.sizing.scale800}/>}
        {!loading &&
        <Table data={tilbakemeldinger} emptyText='tilbakemeldinger' headers={[
          {title: 'Tittel'},
          {title: 'Melder'},
          {title: 'Type'},
          {title: 'Sist svar'},
          {title: 'Meldinger'},
        ]} render={state =>
          state.data.map(tilbakemelding => {
              const focused = tilbakemelding.id === focusNr
              return (
                <React.Fragment key={tilbakemelding.id}>
                  <div onClick={() => focused ? setFocusNr(undefined) : setFocusNr(tilbakemelding.id)}>
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
    </Block>
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
      borderRadius: '10px',
      ...hideBorder
    }
  }
})

const MessageList = ({tilbakemelding, setTilbakemelding}: {tilbakemelding: Tilbakemelding, setTilbakemelding: (t: Tilbakemelding) => void}) => {
  const [addMelding, setAddMelding] = useState<TilbakemeldingRolle | undefined>()
  const userRole = tilbakemelding.melderIdent === user.getIdent() ? TilbakemeldingRolle.MELDER : TilbakemeldingRolle.KRAVEIER

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
        <Block alignSelf='flex-end' marginTop={theme.sizing.scale800}>
          {(userRole === TilbakemeldingRolle.MELDER || user.isKraveier()) &&
          <Button icon={faPlusCircle} kind='tertiary' onClick={() => setAddMelding(TilbakemeldingRolle.MELDER)}>Ny melding til kraveier</Button>
          }
          {user.isKraveier() &&
          <Button icon={faPlusCircle} kind='tertiary' marginLeft onClick={() => setAddMelding(TilbakemeldingRolle.KRAVEIER)}>Nytt svar fra kraveier</Button>
          }
        </Block>
      </Block>
      <AddMeldingModal open={addMelding} close={updatedTilbakemelding => {
        setAddMelding(undefined)
        if (updatedTilbakemelding) setTilbakemelding(updatedTilbakemelding)
      }} tilbakemelding={tilbakemelding}/>
    </Block>
  )
}

const AddMeldingModal = ({open, close, tilbakemelding}: {open?: TilbakemeldingRolle, close: (update?: Tilbakemelding) => void, tilbakemelding: Tilbakemelding}) => {
  const [error, setError] = useState()

  const submit = (req: TilbakemeldingNewMeldingRequest) => {
    tilbakemeldingNewMelding(req)
    .then(close)
    .catch(e => setError(e.error))
  }

  return (
    <Modal unstable_ModalBackdropScroll isOpen={!!open} onClose={() => close()}>
      <Formik
        onSubmit={submit}
        initialValues={{tilbakemeldingId: tilbakemelding.id, melding: '', rolle: open!}}
        validationSchema={newTilbakemeldingSchema}
      >{({isSubmitting}) => (
        <Form onKeyDown={disableEnter}>
          <ModalHeader>
            Ny melding
          </ModalHeader>
          <ModalBody>
            <Block>
              <TextAreaField label='Melding' name='melding'/>
            </Block>
          </ModalBody>
          <ModalFooter>
            <Block display='flex' justifyContent='flex-end'>
              <Block>
                {error && <Notification kind='negative' overrides={{Body: {style: {marginBottom: '-25px'}}}}>{error}</Notification>}
              </Block>
              <Button kind='secondary' size='compact' type='button' onClick={close}> Avbryt </Button>
              <Button type='submit' marginLeft disabled={isSubmitting}>Lagre</Button>
            </Block>
          </ModalFooter>
        </Form>
      )}</Formik>
    </Modal>
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
      return 'God'
    case TilbakemeldingType.UKLAR:
      return 'Uklar'
    case TilbakemeldingType.ANNET:
      return 'Annet'
  }
}

const newTilbakemelding = (krav: Krav): CreateTilbakemeldingRequest => ({
  kravNummer: krav.kravNummer,
  kravVersjon: krav.kravVersjon,
  tittel: '',
  foersteMelding: '',
  type: TilbakemeldingType.UKLAR,
  varslingsadresse: {
    adresse: '',
    type: AdresseType.EPOST
  }
})

const varslingsadresse: yup.SchemaOf<Varslingsadresse> = yup.object({
  adresse: yup.string().required(),
  type: yup.mixed().oneOf(Object.values(AdresseType)).required()
})

const createTilbakemeldingSchema: yup.SchemaOf<CreateTilbakemeldingRequest> = yup.object({
  kravNummer: yup.number().required(),
  kravVersjon: yup.number().required(),
  tittel: yup.string().required(),
  foersteMelding: yup.string().required(),
  type: yup.mixed().oneOf(Object.values(TilbakemeldingType)).required(),
  varslingsadresse: varslingsadresse
})

const newTilbakemeldingSchema: yup.SchemaOf<TilbakemeldingNewMeldingRequest> = yup.object({
  tilbakemeldingId: yup.string().required(),
  melding: yup.string().required(),
  rolle: yup.mixed().oneOf(Object.values(TilbakemeldingRolle)).required(),
})
