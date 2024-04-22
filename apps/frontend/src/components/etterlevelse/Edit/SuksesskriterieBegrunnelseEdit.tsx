import { BodyShort, Box, Heading, Label, Radio, RadioGroup, ReadMore } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { useEffect, useState } from 'react'
import {
  EEtterlevelseStatus,
  ESuksesskriterieStatus,
  ISuksesskriterie,
  ISuksesskriterieBegrunnelse,
} from '../../../constants'
import { ampli } from '../../../services/Amplitude'
import { useDebouncedState } from '../../../util/hooks/customHooks'
import { FieldWrapper } from '../../common/Inputs'
import { Markdown } from '../../common/Markdown'
import { FormError } from '../../common/ModalSchema'
import { LabelAboveContent } from '../../common/PropertyLabel'
import TextEditor from '../../common/TextEditor/TextEditor'

export const getSuksesskriterieBegrunnelse = (
  suksesskriterieBegrunnelser: ISuksesskriterieBegrunnelse[],
  suksessKriterie: ISuksesskriterie
) => {
  const sb = suksesskriterieBegrunnelser.find((item) => {
    return item.suksesskriterieId === suksessKriterie.id
  })
  if (!sb) {
    return {
      suksesskriterieId: suksessKriterie.id,
      begrunnelse: '',
      behovForBegrunnelse: suksessKriterie.behovForBegrunnelse,
      suksesskriterieStatus: undefined,
    }
  } else {
    return sb
  }
}

export const getLabelForSuksessKriterie = (suksessKriterieStatus?: ESuksesskriterieStatus) => {
  if (suksessKriterieStatus === ESuksesskriterieStatus.UNDER_ARBEID) {
    return 'Hva er oppfylt og hva er under arbeid?'
  } else if (suksessKriterieStatus === ESuksesskriterieStatus.OPPFYLT) {
    return 'Hvordan oppfylles kriteriet?'
  } else if (suksessKriterieStatus === ESuksesskriterieStatus.IKKE_OPPFYLT) {
    return 'Hvorfor er ikke kriteriet oppfylt?'
  } else {
    return 'Hvorfor er ikke kriteriet relevant?'
  }
}

interface IPropsSuksesskriterierBegrunnelseEdit {
  suksesskriterie: ISuksesskriterie[]
  disableEdit: boolean
}

export const SuksesskriterierBegrunnelseEdit = ({
  suksesskriterie,
  disableEdit,
}: IPropsSuksesskriterierBegrunnelseEdit) => (
  <FieldWrapper>
    <FieldArray name={'suksesskriterieBegrunnelser'}>
      {(feildArrayRenderProps: FieldArrayRenderProps) => (
        <KriterieBegrunnelseList
          fieldArrayRenderProps={feildArrayRenderProps}
          disableEdit={disableEdit}
          suksesskriterier={suksesskriterie}
        />
      )}
    </FieldArray>
  </FieldWrapper>
)

interface IPropsKriterieBegrunnelseList {
  fieldArrayRenderProps: FieldArrayRenderProps
  suksesskriterier: ISuksesskriterie[]
  disableEdit: boolean
}

const KriterieBegrunnelseList = ({
  fieldArrayRenderProps,
  suksesskriterier,
  disableEdit,
}: IPropsKriterieBegrunnelseList) => {
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
            index={index}
            suksesskriterieBegrunnelser={suksesskriterieBegrunnelser}
            update={(updated) => fieldArrayRenderProps.replace(index, updated)}
            feildArrayRenderProps={fieldArrayRenderProps}
            totalSuksesskriterie={suksesskriterier.length}
          />
        </div>
      ))}
    </div>
  )
}

interface IPropsKriterieBegrunnelse {
  suksesskriterie: ISuksesskriterie
  index: number
  suksesskriterieBegrunnelser: ISuksesskriterieBegrunnelse[]
  disableEdit: boolean
  update: (suksesskriterium: ISuksesskriterieBegrunnelse) => void
  status: string
  feildArrayRenderProps: FieldArrayRenderProps
  totalSuksesskriterie: number
}

const KriterieBegrunnelse = ({
  suksesskriterie,
  index,
  suksesskriterieBegrunnelser,
  disableEdit,
  update,
  status,
  feildArrayRenderProps,
  totalSuksesskriterie,
}: IPropsKriterieBegrunnelse) => {
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

  useEffect(() => {
    update({
      suksesskriterieId: suksesskriterie.id,
      begrunnelse: begrunnelse,
      behovForBegrunnelse: suksesskriterie.behovForBegrunnelse,
      suksesskriterieStatus: suksessKriterieStatus,
    })
  }, [begrunnelse, suksessKriterieStatus])

  const getBorderColor = () => {
    if (
      status === EEtterlevelseStatus.FERDIG ||
      status === EEtterlevelseStatus.FERDIG_DOKUMENTERT
    ) {
      if (!begrunnelse && suksesskriterie.behovForBegrunnelse) {
        return 'border-danger'
      } else {
        return 'border-alt-1'
      }
    } else {
      return 'border-alt-1'
    }
  }

  return (
    <Box
      className="mb-4"
      borderColor={getBorderColor()}
      padding="8"
      borderWidth="3"
      borderRadius="medium"
    >
      <BodyShort>
        Suksesskriterium {index + 1} av {totalSuksesskriterie}
      </BodyShort>

      <div className="flex flex-col gap-4 mb-4">
        <Heading size="xsmall" level="3">
          {suksesskriterie.navn}
        </Heading>

        <ReadMore
          onOpenChange={(isOpen) => {
            if (isOpen) {
              ampli.logEvent('knapp klikket', {
                tekst: `Utfyllende om kriteriet ${index + 1} av ${totalSuksesskriterie}`,
                pagePath: location.pathname,
              })
            }
          }}
          header="Utfyllende om kriteriet"
        >
          <Markdown source={suksesskriterie.beskrivelse} />
        </ReadMore>
      </div>

      <div className="w-full">
        <div className="min-w-fit">
          <RadioGroup
            value={suksessKriterieStatus}
            legend="Oppgi status på suksesskriteriet"
            onChange={(val) => setSuksessKriterieStatus(val as ESuksesskriterieStatus)}
            name={'suksesskriterieStatus' + suksesskriterie.id}
          >
            <Radio value={ESuksesskriterieStatus.UNDER_ARBEID}>Under arbeid</Radio>
            <Radio value={ESuksesskriterieStatus.OPPFYLT}>Oppfylt</Radio>
            <Radio value={ESuksesskriterieStatus.IKKE_OPPFYLT}>Ikke oppfylt</Radio>
            <Radio value={ESuksesskriterieStatus.IKKE_RELEVANT}>Ikke relevant</Radio>
          </RadioGroup>
        </div>
        {!disableEdit && suksesskriterie.behovForBegrunnelse && suksessKriterieStatus && (
          <div className="w-full mt-4">
            <Label>{getLabelForSuksessKriterie(suksessKriterieStatus)}</Label>
            <TextEditor
              initialValue={begrunnelse}
              setValue={setBegrunnelse}
              height="11.75rem"
              errors={feildArrayRenderProps.form.errors}
              simple
              maxWidth="49.375rem"
              width="100%"
            />

            <div className="mt-1">
              <FormError
                fieldName={`suksesskriterieBegrunnelser[${index}].begrunnelse`}
                akselStyling
              />
            </div>
          </div>
        )}

        {!disableEdit && !suksesskriterie.behovForBegrunnelse && suksessKriterieStatus && (
          <div className="w-full mt-4">
            <Label>Sukseskriteriet har ikke behov for begrunnelse.</Label>
          </div>
        )}
        {disableEdit && (
          <div className="w-full mt-4">
            <LabelAboveContent
              fullWidth
              title={getLabelForSuksessKriterie()}
              markdown={begrunnelse}
            />
          </div>
        )}
      </div>
      <FormError
        fieldName={`suksesskriterieBegrunnelser[${index}].suksesskriterieStatus`}
        akselStyling
      />

      <div className="mt-2">
        {suksesskriterieBegrunnelse.behovForBegrunnelse && begrunnelse.length > 0 && (
          <FormError fieldName={'status'} akselStyling />
        )}
      </div>
    </Box>
  )
}
