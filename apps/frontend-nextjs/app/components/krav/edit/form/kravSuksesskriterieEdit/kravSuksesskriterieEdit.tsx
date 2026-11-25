import { PadlockLockedFillIcon, PlusIcon, TrashIcon } from '@navikt/aksel-icons'
import {
  Accordion,
  BodyLong,
  BodyShort,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  ExpansionCard,
  Heading,
  InlineMessage,
  LocalAlert,
  Radio,
  RadioGroup,
  TextField,
  ToggleGroup,
} from '@navikt/ds-react'
import { AccordionHeader, AccordionItem } from '@navikt/ds-react/Accordion'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import _ from 'lodash'
import { ChangeEvent, FunctionComponent, useEffect, useRef, useState } from 'react'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { LabelWithDescription } from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { Markdown } from '@/components/common/markdown/markdown'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { RearrangeButtons } from '@/components/common/rearrangeButtons/rearrangeButtons'
import TextEditor from '@/components/common/textEditor/TextEditor'
import {
  ESuksesskriterieStatus,
  suksesskriterieStatusOptions as statusOptions,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import {
  EKravStatus,
  ESuksesskriteriumFlyt,
  ISuksesskriterie,
} from '@/constants/krav/kravConstants'
import { useDebouncedState } from '@/util/hooks/customHooks/customHooks'
import KravSuksesskriterieFlytRadioField from './kravSuksesskriterieFlytRadioField'

const suksesskriterieStatusOptions = statusOptions.map((option) => ({
  ...option,
  obligatorisk: option.value !== ESuksesskriterieStatus.IKKE_RELEVANT,
}))

type TKravSuksesskriterieEditProps = {
  newVersion?: boolean
  newKrav?: boolean
}

export const KravSuksesskriterierEdit: FunctionComponent<TKravSuksesskriterieEditProps> = ({
  newVersion,
  newKrav,
}) => (
  <FieldWrapper>
    <FieldArray name='suksesskriterier'>
      {(fieldArrayRenderProps: FieldArrayRenderProps) => (
        <KriterieList
          fieldArrayRenderProps={fieldArrayRenderProps}
          newVersion={newVersion}
          newKrav={newKrav}
        />
      )}
    </FieldArray>
  </FieldWrapper>
)

const nextId = (suksesskriterier: ISuksesskriterie[]): number => {
  const max = _.max(suksesskriterier.map((suksesskriterium) => suksesskriterium.id)) || 0
  return max + 1
}

interface IPropsKriterieList {
  fieldArrayRenderProps: FieldArrayRenderProps
  newVersion?: boolean
  newKrav?: boolean
}

type TAddSuksessKriterieButtonProps = {
  fieldArrayRenderProps: FieldArrayRenderProps
  suksesskriterier: ISuksesskriterie[]
}

const AddSuksessKriterieButton: FunctionComponent<TAddSuksessKriterieButtonProps> = ({
  suksesskriterier,
  fieldArrayRenderProps,
}) => (
  <div className='my-4'>
    <Button
      type='button'
      icon={<PlusIcon aria-label='' aria-hidden />}
      variant='secondary'
      disabled={suksesskriterier.length >= 15}
      onClick={() =>
        fieldArrayRenderProps.push({
          id: nextId(suksesskriterier),
          navn: '',
          beskrivelse: '',
          behovForBegrunnelse: 'true',
        })
      }
    >
      Legg til suksesskriterium
    </Button>
  </div>
)

const nullstillFlyt = (
  suksesskriterium: ISuksesskriterie
): { suksesskriterium: ISuksesskriterie; nullstilt: boolean } => {
  const { GA_OVER_NOEN_SUKSESSKRITERIER, GA_OVER_RESTERENDE_SUKSESSKRITERIER, UNDEFINED } =
    ESuksesskriteriumFlyt
  const skalNullstilles = (flyt: ESuksesskriteriumFlyt) =>
    flyt === GA_OVER_NOEN_SUKSESSKRITERIER || flyt === GA_OVER_RESTERENDE_SUKSESSKRITERIER
  const oppfylt = skalNullstilles(suksesskriterium.oppfyltStatusFlyt)
  const ikkeOppfylt = skalNullstilles(suksesskriterium.ikkeOppfyltStatusFlyt)
  const ikkeRelevant = skalNullstilles(suksesskriterium.ikkeRelevantStatusFlyt)

  return {
    nullstilt: oppfylt || ikkeOppfylt || ikkeRelevant,
    suksesskriterium: {
      ...suksesskriterium,
      ...(oppfylt && {
        oppfyltStatusFlyt: UNDEFINED,
        hopperOverTilSuksesskriterieIndexForOppfyltFlyt: undefined,
      }),
      ...(ikkeOppfylt && {
        ikkeOppfyltStatusFlyt: UNDEFINED,
        hopperOverTilSuksesskriterieIndexForIkkeOppfyltFlyt: undefined,
      }),
      ...(ikkeRelevant && {
        ikkeRelevantStatusFlyt: UNDEFINED,
        hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt: undefined,
      }),
    },
  }
}

const KriterieList = ({ fieldArrayRenderProps, newVersion, newKrav }: IPropsKriterieList) => {
  const suksesskriterier = fieldArrayRenderProps.form.values.suksesskriterier as ISuksesskriterie[]
  const [nullstiltFlytIds, setNullstiltFlytIds] = useState<number[]>([])

  const updateIndex = (index: number, newIndex: number) => {
    const sukesskriterieListToUpdate = [...suksesskriterier]
    const [suksesskriterieToMove] = sukesskriterieListToUpdate.splice(index, 1)
    sukesskriterieListToUpdate.splice(newIndex, 0, suksesskriterieToMove)

    const resultat = sukesskriterieListToUpdate.map(nullstillFlyt)
    const nyeNullstilteIds = resultat
      .filter(({ nullstilt }) => nullstilt)
      .map(({ suksesskriterium }) => suksesskriterium.id)

    fieldArrayRenderProps.form.setFieldValue(
      'suksesskriterier',
      resultat.map(({ suksesskriterium }) => suksesskriterium)
    )
    setNullstiltFlytIds((ids) => _.union(ids, nyeNullstilteIds))
  }

  return (
    <div className='flex flex-col gap-2'>
      {suksesskriterier.map((suksesskriterium, index) => (
        <Kriterie
          key={suksesskriterium.id}
          suksesskriterium={suksesskriterium}
          index={index}
          arrayLength={suksesskriterier.length}
          update={(updated) => fieldArrayRenderProps.replace(index, updated)}
          remove={() => {
            fieldArrayRenderProps.remove(index)
          }}
          fieldArrayRenderProps={fieldArrayRenderProps}
          newVersion={newVersion}
          updateIndex={(newIndex) => updateIndex(index, newIndex)}
          visFlytNullstiltVarsel={nullstiltFlytIds.includes(suksesskriterium.id)}
        />
      ))}

      {newKrav && (
        <AddSuksessKriterieButton
          suksesskriterier={suksesskriterier}
          fieldArrayRenderProps={fieldArrayRenderProps}
        />
      )}

      {!newKrav &&
        (fieldArrayRenderProps.form.initialValues.status !== EKravStatus.AKTIV || newVersion) && (
          <AddSuksessKriterieButton
            suksesskriterier={suksesskriterier}
            fieldArrayRenderProps={fieldArrayRenderProps}
          />
        )}
    </div>
  )
}

interface IPropsKriterie {
  suksesskriterium: ISuksesskriterie
  index: number
  arrayLength: number
  remove: () => void
  update: (suksesskriterium: ISuksesskriterie) => void
  fieldArrayRenderProps: FieldArrayRenderProps
  newVersion?: boolean
  updateIndex: (newIndex: number) => void
  visFlytNullstiltVarsel: boolean
}

const Kriterie = ({
  suksesskriterium,
  index,
  arrayLength,
  update,
  remove,
  fieldArrayRenderProps,
  newVersion,
  updateIndex,
  visFlytNullstiltVarsel,
}: IPropsKriterie) => {
  const debounceDelay = 500
  const [navn, setNavn] = useState(suksesskriterium.navn)
  const [beskrivelse, setBeskrivelse] = useDebouncedState(
    suksesskriterium.beskrivelse || '',
    debounceDelay
  )
  const [behovForBegrunnelse, setBehovForBegrunnelse] = useState<string>(
    suksesskriterium.behovForBegrunnelse === undefined
      ? 'true'
      : suksesskriterium.behovForBegrunnelse.toString()
  )

  const [deaktiverteSuksesskriterieStatus, setDeaktiverteSuksesskriterieStatus] = useState<
    ESuksesskriterieStatus[]
  >(suksesskriterium.deaktiverteSuksesskriterieStatus || [])

  const [oppfyltStatusFlyt, setOppflytStatusFlyt] = useState<ESuksesskriteriumFlyt>(
    suksesskriterium.oppfyltStatusFlyt || ESuksesskriteriumFlyt.UNDEFINED
  )
  const [
    hopperOverTilSuksesskriterieIndexForOppfyltFlyt,
    setHopperOverTilSuksesskriterieIndexForOppfyltFlyt,
  ] = useState<number | undefined>(suksesskriterium.hopperOverTilSuksesskriterieIndexForOppfyltFlyt)
  const [ikkeOppfyltStatusFlyt, setIkkeOppflytStatusFlyt] = useState<ESuksesskriteriumFlyt>(
    suksesskriterium.ikkeOppfyltStatusFlyt || ESuksesskriteriumFlyt.UNDEFINED
  )
  const [
    hopperOverTilSuksesskriterieIndexForIkkeOppfyltFlyt,
    setHopperOverTilSuksesskriterieIndexForIkkeOppfyltFlyt,
  ] = useState<number | undefined>(
    suksesskriterium.hopperOverTilSuksesskriterieIndexForIkkeOppfyltFlyt
  )
  const [ikkeRelevantStatusFlyt, setIkkeRelevantStatusFlyt] = useState<ESuksesskriteriumFlyt>(
    suksesskriterium.ikkeRelevantStatusFlyt || ESuksesskriteriumFlyt.UNDEFINED
  )
  const [
    hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt,
    setHopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt,
  ] = useState<number | undefined>(
    suksesskriterium.hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt
  )

  const [mode, setMode] = useState('edit')
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState<number>(0)

  const nummer = index + 1

  const flytFraSkjema = [
    suksesskriterium.oppfyltStatusFlyt,
    suksesskriterium.hopperOverTilSuksesskriterieIndexForOppfyltFlyt,
    suksesskriterium.ikkeOppfyltStatusFlyt,
    suksesskriterium.hopperOverTilSuksesskriterieIndexForIkkeOppfyltFlyt,
    suksesskriterium.ikkeRelevantStatusFlyt,
    suksesskriterium.hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt,
  ].join('|')
  const [forrigeFlytFraSkjema, setForrigeFlytFraSkjema] = useState<string>(flytFraSkjema)

  if (flytFraSkjema !== forrigeFlytFraSkjema) {
    setForrigeFlytFraSkjema(flytFraSkjema)
    setOppflytStatusFlyt(suksesskriterium.oppfyltStatusFlyt || ESuksesskriteriumFlyt.UNDEFINED)
    setHopperOverTilSuksesskriterieIndexForOppfyltFlyt(
      suksesskriterium.hopperOverTilSuksesskriterieIndexForOppfyltFlyt
    )
    setIkkeOppflytStatusFlyt(
      suksesskriterium.ikkeOppfyltStatusFlyt || ESuksesskriteriumFlyt.UNDEFINED
    )
    setHopperOverTilSuksesskriterieIndexForIkkeOppfyltFlyt(
      suksesskriterium.hopperOverTilSuksesskriterieIndexForIkkeOppfyltFlyt
    )
    setIkkeRelevantStatusFlyt(
      suksesskriterium.ikkeRelevantStatusFlyt || ESuksesskriteriumFlyt.UNDEFINED
    )
    setHopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt(
      suksesskriterium.hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt
    )
  }

  const flytVelgesPaNyttAlert =
    visFlytNullstiltVarsel &&
    [oppfyltStatusFlyt, ikkeOppfyltStatusFlyt, ikkeRelevantStatusFlyt].includes(
      ESuksesskriteriumFlyt.UNDEFINED
    )

  const [flytAccordionOpen, setFlytAccordionOpen] = useState<boolean>(flytVelgesPaNyttAlert)
  const [forrigeFlytVelgesPaNyttAlert, setForrigeFlytVelgesPaNyttAlert] =
    useState<boolean>(flytVelgesPaNyttAlert)

  if (flytVelgesPaNyttAlert !== forrigeFlytVelgesPaNyttAlert) {
    setForrigeFlytVelgesPaNyttAlert(flytVelgesPaNyttAlert)
    if (flytVelgesPaNyttAlert) setFlytAccordionOpen(true)
  }

  useEffect(() => {
    update({
      id: suksesskriterium.id,
      navn,
      beskrivelse,
      behovForBegrunnelse: behovForBegrunnelse === 'true' ? true : false,
      deaktiverteSuksesskriterieStatus,
      oppfyltStatusFlyt,
      hopperOverTilSuksesskriterieIndexForOppfyltFlyt,
      ikkeOppfyltStatusFlyt,
      hopperOverTilSuksesskriterieIndexForIkkeOppfyltFlyt,
      ikkeRelevantStatusFlyt,
      hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt,
    })
  }, [
    navn,
    beskrivelse,
    behovForBegrunnelse,
    deaktiverteSuksesskriterieStatus,
    oppfyltStatusFlyt,
    hopperOverTilSuksesskriterieIndexForOppfyltFlyt,
    ikkeOppfyltStatusFlyt,
    hopperOverTilSuksesskriterieIndexForIkkeOppfyltFlyt,
    ikkeRelevantStatusFlyt,
    hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt,
  ])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const observer = new ResizeObserver(() => setHeaderHeight(header.offsetHeight))
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  return (
    <ExpansionCard aria-label={navn}>
      <ExpansionCard.Header ref={headerRef} className='sticky top-0 z-10 bg-white'>
        <ExpansionCard.Title size='small' className='wrap-anywhere'>
          {navn}
          <BodyShort size='medium'>{`Suksesskriterium ${nummer} av ${arrayLength}`}</BodyShort>
        </ExpansionCard.Title>
      </ExpansionCard.Header>
      <ExpansionCard.Content className='data-[open=true]:overflow-visible'>
        <Box
          padding='space-16'
          background='brand-blue-soft'
          borderRadius='0 0 0 8'
          className='mt-5 mb-2.5'
        >
          <div className='relative'>
            <Heading level='4' size='small' className='mb-10'>
              Beskriv suksesskriteriet
            </Heading>

            <div className='flex items-center absolute right-0 top-0'>
              <RearrangeButtons
                label='suksesskriterium'
                index={index}
                arrayLength={arrayLength}
                updateIndex={updateIndex}
                marginLeft
              />
            </div>
          </div>

          <div className='mb-6.5'>
            <TextField
              label={`Navngi suksesskriterium ${nummer}`}
              value={navn}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setNavn((event.target as HTMLInputElement).value)
              }
              placeholder='Navn'
              error={
                fieldArrayRenderProps.form.errors &&
                fieldArrayRenderProps.form.errors['suksesskriterier'] && (
                  <FormError fieldName='suksesskriterier' />
                )
              }
            />
          </div>

          <div>
            <div>
              <LabelWithDescription
                label='Utfyllende om kriteriet'
                description='Som etterlever skal det være mulig å forstå fra suksesskriteriumsbeskrivelsen om man har oppnådd eller ikke oppnådd kriteriet, eller eventuelt om kriteriet ikke er relevant.'
                noMarginBottom
              />
            </div>

            {mode === 'edit' && (
              <TextEditor initialValue={beskrivelse} setValue={setBeskrivelse} height='15.625rem' />
            )}

            {mode === 'view' && (
              <div className='p-8 border-border-subtle-hover border border-solid rounded-md bg-white'>
                <Markdown source={beskrivelse} />
              </div>
            )}
          </div>
          <div className='flex justify-end -mt-px'>
            <ToggleGroup defaultValue='edit' onChange={setMode} size='small'>
              <ToggleGroup.Item value='edit'>Redigering</ToggleGroup.Item>
              <ToggleGroup.Item value='view'>Forhåndsvisning</ToggleGroup.Item>
            </ToggleGroup>
          </div>
        </Box>

        <Accordion className='mb-2.5'>
          <AccordionItem>
            <AccordionHeader className='sticky z-9 bg-white' style={{ top: headerHeight }}>
              <Heading level='4' size='small'>
                Obligatorisk: velg om suksesskriteriet også skal ha status “ikke relevant”.
              </Heading>
            </AccordionHeader>
            <Accordion.Content>
              <Box
                padding='space-16'
                background='brand-blue-soft'
                borderRadius='0 0 0 8'
                className='flex flex-1 mt-1'
              >
                <CheckboxGroup
                  legend='Velg om suksesskriteriet også skal ha status "Ikke relevant".'
                  description='Alle suksesskriterier må ha statusene Ikke påbegynt, Under arbeid, Oppfylt og Ikke oppfylt.'
                  value={suksesskriterieStatusOptions
                    .map((option) => option.value)
                    .filter((status) => !deaktiverteSuksesskriterieStatus.includes(status))}
                  onChange={(aktiveStatuser: ESuksesskriterieStatus[]) => {
                    setDeaktiverteSuksesskriterieStatus(
                      suksesskriterieStatusOptions
                        .filter(
                          (option) => !option.obligatorisk && !aktiveStatuser.includes(option.value)
                        )
                        .map((option) => option.value)
                    )
                  }}
                >
                  {suksesskriterieStatusOptions.map((option) => (
                    <Checkbox
                      key={option.value}
                      value={option.value}
                      readOnly={option.obligatorisk}
                      className='flex items-center'
                    >
                      <BodyLong className='flex justify-center items-center'>
                        {option.obligatorisk && <PadlockLockedFillIcon aria-hidden />}{' '}
                        {option.label}
                      </BodyLong>
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </Box>
            </Accordion.Content>
          </AccordionItem>
          <AccordionItem>
            <AccordionHeader className='sticky z-9 bg-white' style={{ top: headerHeight }}>
              <Heading level='4' size='small'>
                Obligatorisk: velg hvordan etterlever skal kunne besvare suksesskriteriet
              </Heading>
            </AccordionHeader>
            <Accordion.Content>
              <Box
                padding='space-16'
                background='brand-blue-soft'
                borderRadius='0 0 0 8'
                className='flex flex-1 mt-1'
              >
                <RadioGroup
                  legend='Velg type besvarelse:'
                  value={behovForBegrunnelse}
                  onChange={(value) => {
                    fieldArrayRenderProps.form.setFieldValue(
                      'behovForBegrunnelse',
                      value === 'true' ? true : false
                    )
                    setBehovForBegrunnelse(value)
                  }}
                >
                  <Radio value='true'>Bekreftelse med tekstlig begrunnelse</Radio>
                  <Radio value='false'>Kun bekreftelse </Radio>
                </RadioGroup>
              </Box>
            </Accordion.Content>
          </AccordionItem>
          <AccordionItem open={flytAccordionOpen} onOpenChange={setFlytAccordionOpen}>
            <AccordionHeader className='sticky z-9 bg-white' style={{ top: headerHeight }}>
              <Heading level='4' size='small'>
                Obligatorisk: styr flyt etter hvorvidt suksesskriteriet vurderes som oppfylt
              </Heading>
            </AccordionHeader>
            <Accordion.Content>
              <InlineMessage status='info' className='mb-3'>
                Det anbefales at styring av flyt tas sist, etter at alle suksesskriterier er
                opprettet og beskrevet.
              </InlineMessage>

              {flytVelgesPaNyttAlert && (
                <LocalAlert status='warning' className='mb-3'>
                  <LocalAlert.Header>
                    <LocalAlert.Title>
                      Fordi du har endret rekkefølgen til noen suksesskriterier, må du velge
                      konsekvens for flyt på nytt.
                    </LocalAlert.Title>
                  </LocalAlert.Header>
                </LocalAlert>
              )}

              <KravSuksesskriterieFlytRadioField
                index={index}
                suksesskriterier={fieldArrayRenderProps.form.values.suksesskriterier}
                fieldArrayRenderProps={fieldArrayRenderProps}
                fieldName='oppfyltStatusFlyt'
                suksesskriterieStatus='Oppfylt'
                value={oppfyltStatusFlyt}
                setValue={setOppflytStatusFlyt}
                hopperOverTilIndex={hopperOverTilSuksesskriterieIndexForOppfyltFlyt}
                setHopperOverTilIndex={setHopperOverTilSuksesskriterieIndexForOppfyltFlyt}
                marginTop
                marginBottom
              />

              <KravSuksesskriterieFlytRadioField
                index={index}
                suksesskriterier={fieldArrayRenderProps.form.values.suksesskriterier}
                fieldArrayRenderProps={fieldArrayRenderProps}
                fieldName='ikkeOppfyltStatusFlyt'
                suksesskriterieStatus='Ikke oppfylt'
                value={ikkeOppfyltStatusFlyt}
                setValue={setIkkeOppflytStatusFlyt}
                hopperOverTilIndex={hopperOverTilSuksesskriterieIndexForIkkeOppfyltFlyt}
                setHopperOverTilIndex={setHopperOverTilSuksesskriterieIndexForIkkeOppfyltFlyt}
                marginTop
                marginBottom
              />

              <KravSuksesskriterieFlytRadioField
                index={index}
                suksesskriterier={fieldArrayRenderProps.form.values.suksesskriterier}
                fieldArrayRenderProps={fieldArrayRenderProps}
                fieldName='ikkeRelevantStatusFlyt'
                suksesskriterieStatus='Ikke relevant'
                value={ikkeRelevantStatusFlyt}
                setValue={setIkkeRelevantStatusFlyt}
                hopperOverTilIndex={hopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt}
                setHopperOverTilIndex={setHopperOverTilSuksesskriterieIndexForIkkeRelevantFlyt}
                marginTop
                marginBottom
              />
            </Accordion.Content>
          </AccordionItem>
        </Accordion>

        {(fieldArrayRenderProps.form.initialValues.status !== EKravStatus.AKTIV || newVersion) && (
          <Button
            variant='secondary'
            type={'button'}
            icon={<TrashIcon title='Fjern suksesskriterium' aria-hidden />}
            onClick={remove}
          >
            Fjern suksesskriterium
          </Button>
        )}
      </ExpansionCard.Content>
    </ExpansionCard>
  )
}
