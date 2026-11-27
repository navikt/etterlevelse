'use client'

import { InformationSquareIcon } from '@navikt/aksel-icons'
import {
  BodyShort,
  Box,
  Checkbox,
  CheckboxGroup,
  Heading,
  InfoCard,
  InlineMessage,
  Label,
  List,
  Radio,
  RadioGroup,
  ReadMore,
  ToggleGroup,
} from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { FunctionComponent, useEffect, useRef, useState } from 'react'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWithDescription } from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { Markdown } from '@/components/common/markdown/markdown'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import TextEditor from '@/components/common/textEditor/TextEditor'
import {
  EEtterlevelseStatus,
  ESuksesskriterieStatus,
  IEtterlevelse,
  ISuksesskriterieBegrunnelse,
  suksesskriterieStatusOptions,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { ISuksesskriterie } from '@/constants/krav/kravConstants'
import {
  getLabelForSuksessKriterie,
  getSkipUpperBound,
  getSuksesskriterieBegrunnelse,
} from '@/util/etterlevelseUtil/etterlevelseUtil'
import { useDebouncedState } from '@/util/hooks/customHooks/customHooks'
import SuksesskriterieEndringTag from '../../suksesskriterieEndringTag'

type TPropsSuksesskriterierBegrunnelseEdit = {
  suksesskriterie: ISuksesskriterie[]
  disableEdit: boolean
  forGjenbruk?: boolean
  morEtterlevelse?: IEtterlevelse
  forrigeSuksesskriterier?: ISuksesskriterie[]
}

export const SuksesskriterierBegrunnelseEdit: FunctionComponent<
  TPropsSuksesskriterierBegrunnelseEdit
> = ({ suksesskriterie, disableEdit, forGjenbruk, morEtterlevelse, forrigeSuksesskriterier }) => (
  <FieldWrapper>
    <FieldArray name={'suksesskriterieBegrunnelser'}>
      {(feildArrayRenderProps: FieldArrayRenderProps) => (
        <KriterieBegrunnelseList
          fieldArrayRenderProps={feildArrayRenderProps}
          disableEdit={disableEdit}
          suksesskriterier={suksesskriterie}
          forGjenbruk={forGjenbruk}
          morEtterlevelse={morEtterlevelse}
          forrigeSuksesskriterier={forrigeSuksesskriterier}
        />
      )}
    </FieldArray>
  </FieldWrapper>
)

type TPropsKriterieBegrunnelseList = {
  fieldArrayRenderProps: FieldArrayRenderProps
  suksesskriterier: ISuksesskriterie[]
  disableEdit: boolean
  forGjenbruk?: boolean
  morEtterlevelse?: IEtterlevelse
  forrigeSuksesskriterier?: ISuksesskriterie[]
}

const KriterieBegrunnelseList: FunctionComponent<TPropsKriterieBegrunnelseList> = ({
  fieldArrayRenderProps,
  suksesskriterier,
  disableEdit,
  forGjenbruk,
  morEtterlevelse,
  forrigeSuksesskriterier,
}) => {
  const suksesskriterieBegrunnelser = fieldArrayRenderProps.form.values
    .suksesskriterieBegrunnelser as ISuksesskriterieBegrunnelse[]

  return (
    <div>
      {suksesskriterier.map((suksesskriterium, index) => (
        <div key={suksesskriterium.navn + '_' + index}>
          <KriterieBegrunnelse
            status={fieldArrayRenderProps.form.values.status}
            disableEdit={disableEdit}
            suksesskriterie={suksesskriterium}
            suksesskriterier={suksesskriterier}
            index={index}
            suksesskriterieBegrunnelser={suksesskriterieBegrunnelser}
            update={(updated) => fieldArrayRenderProps.replace(index, updated)}
            feildArrayRenderProps={fieldArrayRenderProps}
            totalSuksesskriterie={suksesskriterier.length}
            forGjenbruk={forGjenbruk}
            morEtterlevelse={morEtterlevelse}
            forrigeSuksesskriterier={forrigeSuksesskriterier}
          />
        </div>
      ))}
    </div>
  )
}

type TPropsKriterieBegrunnelse = {
  suksesskriterie: ISuksesskriterie
  suksesskriterier: ISuksesskriterie[]
  index: number
  suksesskriterieBegrunnelser: ISuksesskriterieBegrunnelse[]
  disableEdit: boolean
  update: (suksesskriterium: ISuksesskriterieBegrunnelse) => void
  status: string
  feildArrayRenderProps: FieldArrayRenderProps
  totalSuksesskriterie: number
  forGjenbruk?: boolean
  morEtterlevelse?: IEtterlevelse
  forrigeSuksesskriterier?: ISuksesskriterie[]
}

const KriterieBegrunnelse: FunctionComponent<TPropsKriterieBegrunnelse> = ({
  suksesskriterie,
  suksesskriterier,
  index,
  suksesskriterieBegrunnelser,
  disableEdit,
  update,
  status,
  feildArrayRenderProps,
  totalSuksesskriterie,
  forGjenbruk,
  morEtterlevelse,
  forrigeSuksesskriterier,
}) => {
  const suksesskriterieBegrunnelse = getSuksesskriterieBegrunnelse(
    suksesskriterieBegrunnelser,
    suksesskriterie
  )
  const debounceDelay = 500
  const [begrunnelse, setBegrunnelse] = useDebouncedState(
    suksesskriterieBegrunnelse.begrunnelse || '',
    debounceDelay
  )
  const [suksessKriterieStatus, setSuksessKriterieStatus] = useState<
    ESuksesskriterieStatus | undefined
  >(suksesskriterieBegrunnelse.suksesskriterieStatus)

  const [veiledning, setVeiledning] = useState(suksesskriterieBegrunnelse.veiledning)
  const [veiledningTekst, setVeiledningTekst] = useState(
    suksesskriterieBegrunnelse.veiledningsTekst
  )
  const [veiledningTekst2, setVeiledningTekst2] = useState(
    suksesskriterieBegrunnelse.veiledningsTekst2
  )

  const [mode, setMode] = useState('edit')

  const [veiledningsTekstMode, setVeiledningsTekstMode] = useState('edit')
  const [veiledningsTekst2Mode, setVeiledningsTekst2Mode] = useState('edit')
  const hoppetOverPgaKontrollertFlylt =
    !!feildArrayRenderProps.form.values.suksesskriterieBegrunnelser[index]
      ?.hoppetOverPgaKontrollertFlylt
  const [isUtfyllendeReadMoreOpen, setIsUtfyllendeReadMoreOpen] = useState<boolean>(
    !hoppetOverPgaKontrollertFlylt
  )
  const [prevHoppetOverPgaKontrollertFlylt, setPrevHoppetOverPgaKontrollertFlylt] = useState(
    hoppetOverPgaKontrollertFlylt
  )

  if (prevHoppetOverPgaKontrollertFlylt !== hoppetOverPgaKontrollertFlylt) {
    setPrevHoppetOverPgaKontrollertFlylt(hoppetOverPgaKontrollertFlylt)
    setIsUtfyllendeReadMoreOpen(!hoppetOverPgaKontrollertFlylt)
  }

  const getVeiledningsTekstFromMorEtterlevelse = (
    morEtterlevelse: IEtterlevelse,
    suksessKriterieId: number
  ): string => {
    return morEtterlevelse.suksesskriterieBegrunnelser.filter(
      (suksesskriterieBegrunnelse) =>
        suksesskriterieBegrunnelse.suksesskriterieId === suksessKriterieId
    )[0].veiledningsTekst
  }

  const getVeiledningsTekst2FromMorEtterlevelse = (
    morEtterlevelse: IEtterlevelse,
    suksessKriterieId: number
  ): string => {
    return morEtterlevelse.suksesskriterieBegrunnelser.filter(
      (suksesskriterieBegrunnelse) =>
        suksesskriterieBegrunnelse.suksesskriterieId === suksessKriterieId
    )[0].veiledningsTekst2
  }

  const hasVeildningTekstFromMorEtterlevelse = (
    morEtterlevelse: IEtterlevelse,
    suksessKriterieId: number
  ): boolean => {
    const suksesskriteriet = morEtterlevelse.suksesskriterieBegrunnelser.filter(
      (suksesskriterieBegrunnelse) =>
        suksesskriterieBegrunnelse.suksesskriterieId === suksessKriterieId
    )[0]
    return (
      suksesskriteriet.veiledning &&
      suksesskriteriet.veiledningsTekst !== null &&
      suksesskriteriet.veiledningsTekst !== ''
    )
  }

  const hasVeildningTekst2FromMorEtterlevelse = (
    morEtterlevelse: IEtterlevelse,
    suksessKriterieId: number
  ): boolean => {
    const suksesskriteriet = morEtterlevelse.suksesskriterieBegrunnelser.filter(
      (suksesskriterieBegrunnelse) =>
        suksesskriterieBegrunnelse.suksesskriterieId === suksessKriterieId
    )[0]

    return (
      suksesskriteriet.veiledning &&
      suksesskriteriet.veiledningsTekst2 !== null &&
      suksesskriteriet.veiledningsTekst2 !== ''
    )
  }

  const hasUserChanged = useRef(false)
  const initialSyncValues = useRef({
    begrunnelse,
    suksessKriterieStatus,
    veiledning,
    veiledningTekst,
    veiledningTekst2,
  })

  useEffect(() => {
    if (!hasUserChanged.current) {
      const initial = initialSyncValues.current
      const unchanged =
        begrunnelse === initial.begrunnelse &&
        suksessKriterieStatus === initial.suksessKriterieStatus &&
        veiledning === initial.veiledning &&
        veiledningTekst === initial.veiledningTekst &&
        veiledningTekst2 === initial.veiledningTekst2
      if (unchanged) {
        return
      }
      hasUserChanged.current = true
    }
    update({
      suksesskriterieId: suksesskriterie.id,
      begrunnelse: begrunnelse,
      behovForBegrunnelse: suksesskriterie.behovForBegrunnelse,
      suksesskriterieStatus: suksessKriterieStatus,
      veiledning: veiledning,
      veiledningsTekst: veiledningTekst,
      veiledningsTekst2: veiledningTekst2,
    })
  }, [begrunnelse, suksessKriterieStatus, veiledning, veiledningTekst, veiledningTekst2])

  const getBorderColor = () => {
    if (
      status === EEtterlevelseStatus.FERDIG ||
      status === EEtterlevelseStatus.FERDIG_DOKUMENTERT
    ) {
      if (!begrunnelse && suksesskriterie.behovForBegrunnelse) {
        return 'danger-strong'
      } else {
        return 'neutral-subtle'
      }
    } else {
      return 'neutral-subtle'
    }
  }

  const begrunnelser = feildArrayRenderProps.form.values
    .suksesskriterieBegrunnelser as ISuksesskriterieBegrunnelse[]

  const hoppetOverAvIndex = begrunnelser[index]?.hoppetOverPgaKontrollertFlylt
    ? begrunnelser.findLastIndex(
        (begrunnelse, begrunnelseIndex) =>
          begrunnelseIndex < index &&
          (getSkipUpperBound(
            suksesskriterier[begrunnelseIndex],
            begrunnelse.suksesskriterieStatus
          ) ?? 0) > index
      )
    : -1

  const hoppetOverAvStatusLabel =
    hoppetOverAvIndex !== -1
      ? suksesskriterieStatusOptions
          .find((option) => option.value === begrunnelser[hoppetOverAvIndex].suksesskriterieStatus)
          ?.label.toLowerCase()
      : undefined

  const checkForKontrollertFlyt = (newStatus: ESuksesskriterieStatus) => {
    const previousUpperBound =
      getSkipUpperBound(suksesskriterie, suksessKriterieStatus) ?? index + 1
    const newUpperBound = getSkipUpperBound(suksesskriterie, newStatus) ?? index + 1

    if (previousUpperBound === newUpperBound) return

    feildArrayRenderProps.form.setFieldValue(
      'suksesskriterieBegrunnelser',
      begrunnelser.map((begrunnelse, begrunnelseIndex) => {
        if (begrunnelseIndex <= index) return begrunnelse
        if (begrunnelseIndex < newUpperBound) {
          return { ...begrunnelse, hoppetOverPgaKontrollertFlylt: true }
        }
        if (begrunnelseIndex < previousUpperBound) {
          return { ...begrunnelse, hoppetOverPgaKontrollertFlylt: false }
        }
        return begrunnelse
      })
    )
  }

  return (
    <Box
      className='mb-4'
      background={hoppetOverPgaKontrollertFlylt ? 'neutral-soft' : undefined}
      borderColor={getBorderColor()}
      padding='space-8'
      borderWidth='3'
      borderRadius='8'
    >
      <div className='flex flex-col gap-4 mb-4'>
        <Heading size='xsmall' level='3'>
          <span className='flex flex-wrap items-center gap-3 mb-4'>
            <BodyShort as='span'>
              Suksesskriterium {index + 1} av {totalSuksesskriterie}
            </BodyShort>

            <SuksesskriterieEndringTag
              suksesskriterie={suksesskriterie}
              sammenlignMed={forrigeSuksesskriterier}
              versjon='gjeldende'
            />
          </span>
          {suksesskriterie.navn}
        </Heading>

        {hoppetOverAvIndex !== -1 && (
          <InlineMessage status='info' className='my-5'>
            Fordi suksesskriterium {hoppetOverAvIndex + 1} av {totalSuksesskriterie} er vurdert som{' '}
            {hoppetOverAvStatusLabel}, trenger dere ikke dokumentere dette suksesskriteriet.
          </InlineMessage>
        )}

        <ReadMore
          open={isUtfyllendeReadMoreOpen}
          onOpenChange={setIsUtfyllendeReadMoreOpen}
          header='Utfyllende om kriteriet'
        >
          <Markdown source={suksesskriterie.beskrivelse} />
        </ReadMore>
      </div>

      {forGjenbruk && (
        <div className='my-5 flex flex-col'>
          <CheckboxGroup
            legend='Skriv veiledning for gjenbruk'
            hideLegend
            value={veiledning ? [true] : []}
            onChange={(value: boolean[]) => setVeiledning(value.length !== 0 ? true : false)}
          >
            <Checkbox
              value={true}
              description='De som gjenbruker vurderingen din må ta stilling til kravet.'
            >
              Skriv veiledning til hvordan kravet oppfylles i denne konteksten
            </Checkbox>
          </CheckboxGroup>
          {veiledning && (
            <div>
              <div className='ml-8'>
                <div className='w-full flex mb-1 mt-3.5'>
                  <LabelWithDescription
                    label='Beskriv relevante, sentrale vurderinger.'
                    description='Dette kan inkludere blant annet tolkning av lov, forskrift og besluttede praksiser.'
                  />
                </div>
                {veiledningsTekstMode === 'edit' && (
                  <TextEditor
                    initialValue={veiledningTekst}
                    setValue={setVeiledningTekst}
                    height='11.75rem'
                    simple
                    maxWidth='49.375rem'
                    width='100%'
                  />
                )}

                {veiledningsTekstMode === 'view' && (
                  <InfoCard data-color='info' className='mb-5'>
                    <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                      <Label>
                        Navs tolkning av loven og besluttede praksiser i denne konteksten:
                      </Label>
                      <Markdown source={veiledningTekst} />
                    </InfoCard.Message>
                  </InfoCard>
                )}
                <div className='flex-col flex items-end justify-end -mt-px'>
                  <ToggleGroup defaultValue='edit' onChange={setVeiledningsTekstMode} size='small'>
                    <ToggleGroup.Item value='edit'>Redigering</ToggleGroup.Item>
                    <ToggleGroup.Item value='view'>Forhåndsvisning</ToggleGroup.Item>
                  </ToggleGroup>
                </div>
              </div>
              <div className='ml-8'>
                <div className='w-full flex mb-1 mt-2.5'>
                  <Label className='mt-2.5'>
                    Skriv en praktisk veiledning om hvordan kravet kan etterleves
                  </Label>
                </div>
                {veiledningsTekst2Mode === 'edit' && (
                  <TextEditor
                    initialValue={veiledningTekst2}
                    setValue={setVeiledningTekst2}
                    height='11.75rem'
                    simple
                    maxWidth='49.375rem'
                    width='100%'
                  />
                )}

                {veiledningsTekst2Mode === 'view' && (
                  <InfoCard data-color='info' className='mb-5'>
                    <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                      <Label>Slik kan suksesskriteriet etterleves:</Label>
                      <Markdown source={veiledningTekst2} />
                    </InfoCard.Message>
                  </InfoCard>
                )}
                <div className='flex-col flex items-end justify-end -mt-px'>
                  <ToggleGroup defaultValue='edit' onChange={setVeiledningsTekst2Mode} size='small'>
                    <ToggleGroup.Item value='edit'>Redigering</ToggleGroup.Item>
                    <ToggleGroup.Item value='view'>Forhåndsvisning</ToggleGroup.Item>
                  </ToggleGroup>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {morEtterlevelse &&
        hasVeildningTekstFromMorEtterlevelse(morEtterlevelse, suksesskriterie.id) && (
          <InfoCard data-color='info' className='mb-5'>
            <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
              <Label>
                Følgende veiledning er skrevet av{' '}
                {morEtterlevelse.changeStamp.lastModifiedBy.split(' - ')[1]}
              </Label>
              <br />
              <Label>Navs tolkning av loven og besluttede praksiser i denne konteksten:</Label>
              <Markdown
                source={getVeiledningsTekstFromMorEtterlevelse(morEtterlevelse, suksesskriterie.id)}
              />
            </InfoCard.Message>
          </InfoCard>
        )}

      {morEtterlevelse &&
        hasVeildningTekst2FromMorEtterlevelse(morEtterlevelse, suksesskriterie.id) && (
          <InfoCard data-color='info' className='mb-5'>
            <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
              <Label>
                Følgende veiledning er skrevet av{' '}
                {morEtterlevelse.changeStamp.lastModifiedBy.split(' - ')[1]}
              </Label>
              <br />
              <Label>Slik kan suksesskriteriet etterleves:</Label>
              <Markdown
                source={getVeiledningsTekst2FromMorEtterlevelse(
                  morEtterlevelse,
                  suksesskriterie.id
                )}
              />
            </InfoCard.Message>
          </InfoCard>
        )}

      {feildArrayRenderProps.form.values.suksesskriterieBegrunnelser[index]
        .hoppetOverPgaKontrollertFlylt !== true && (
        <div className='w-full mt-5 bg-blue-50 rounded-lg p-4'>
          <div>
            <RadioGroup
              id={'suksesskriterieStatus_' + index}
              value={suksessKriterieStatus}
              legend='Oppgi status på suksesskriteriet'
              onChange={(val) => {
                setSuksessKriterieStatus(val as ESuksesskriterieStatus)
                checkForKontrollertFlyt(val as ESuksesskriterieStatus)
              }}
              name={'suksesskriterieStatus' + suksesskriterie.id}
            >
              <div>
                <div>
                  {veiledning && (
                    <ReadMore
                      size='medium'
                      header='Skal jeg som har skrevet veiledning endre på status?'
                    >
                      Når noen gjenbruker etterlevelsesdokumentet ditt, vil de arve statusen du
                      setter her.
                      <List>
                        <List.Item>
                          Som hovedregel burde statusen settes til “Ikke oppfylt” fram til
                          etterleveren har gjort sin egen vurdering.
                        </List.Item>
                        <List.Item>
                          Hvis kravet er svart ut sentralt, kan det være aktuelt å sette status til
                          “Oppfylt” eller “Ikke relevant”.
                        </List.Item>
                      </List>
                    </ReadMore>
                  )}
                </div>
                <div className='block lg:flex lg:flex-wrap lg:gap-x-4 [&_label]:whitespace-nowrap'>
                  {suksesskriterieStatusOptions
                    .filter(
                      (option) =>
                        !suksesskriterie.deaktiverteSuksesskriterieStatus?.includes(option.value)
                    )
                    .map((option) => (
                      <Radio key={option.value} value={option.value}>
                        {option.label}
                      </Radio>
                    ))}
                </div>
              </div>
            </RadioGroup>
          </div>
          {!disableEdit && suksesskriterie.behovForBegrunnelse && suksessKriterieStatus && (
            <div id={'begrunnelse_' + index} className='w-full mt-8'>
              <div className='flex w-full justify-between items-center mb-1'>
                <Label>{getLabelForSuksessKriterie(suksessKriterieStatus)}</Label>
              </div>
              <div className='mb-3'>
                {veiledning && (
                  <ReadMore size='medium' header='Skal jeg som har skrevet veiledning svare her?'>
                    De som gjenbruker vurderingen din skal svare i fritekstfeltet under. I noen
                    tilfeller kan det likevel være aktuelt for deg å skrive i feltet, for eksempel
                    hvis du skal forklare hvorfor du har satt status til “Ikke relevant”. Du kan
                    også velge å skrive i feltet dersom du vil kladde et svar som etterleveren kan
                    bygge på selv. Ikke skriv veiledning i denne boksen.
                  </ReadMore>
                )}
              </div>
              {mode === 'edit' && (
                <TextEditor
                  initialValue={begrunnelse}
                  setValue={setBegrunnelse}
                  height='11.75rem'
                  errors={feildArrayRenderProps.form.errors}
                  simple
                  maxWidth='49.375rem'
                  width='100%'
                />
              )}

              {mode === 'view' && (
                <div className='p-8 border-border-subtle-hover border border-solid rounded-md'>
                  <Markdown source={begrunnelse} />
                </div>
              )}
              <div className='flex justify-end -mt-px'>
                <ToggleGroup defaultValue='edit' onChange={setMode} size='small'>
                  <ToggleGroup.Item value='edit'>Redigering</ToggleGroup.Item>
                  <ToggleGroup.Item value='view'>Forhåndsvisning</ToggleGroup.Item>
                </ToggleGroup>
              </div>

              <div className='mt-1'>
                <FormError
                  fieldName={`suksesskriterieBegrunnelser[${index}].begrunnelse`}
                  akselStyling
                />
              </div>
            </div>
          )}

          {!disableEdit && !suksesskriterie.behovForBegrunnelse && suksessKriterieStatus && (
            <div className='w-full mt-4'>
              <Label>Suksesskriteriet har ikke behov for begrunnelse.</Label>
            </div>
          )}
          {disableEdit && (
            <div className='w-full mt-4'>
              <LabelAboveContent
                fullWidth
                title={getLabelForSuksessKriterie()}
                markdown={begrunnelse}
              />
            </div>
          )}
        </div>
      )}
      <FormError
        fieldName={`suksesskriterieBegrunnelser[${index}].suksesskriterieStatus`}
        akselStyling
      />

      <div className='mt-2'>
        {suksesskriterieBegrunnelse.behovForBegrunnelse && begrunnelse.length > 0 && (
          <FormError fieldName={'status'} akselStyling />
        )}
      </div>
    </Box>
  )
}
