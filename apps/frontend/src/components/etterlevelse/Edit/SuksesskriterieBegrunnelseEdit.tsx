import { Block } from 'baseui/block'
import { FormControl } from 'baseui/form-control'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import React from 'react'
import { EtterlevelseStatus, Suksesskriterie, SuksesskriterieBegrunnelse, SuksesskriterieStatus } from '../../../constants'
import { useDebouncedState } from '../../../util/hooks'
import { theme } from '../../../util/theme'
import { FieldWrapper } from '../../common/Inputs'
import TextEditor from '../../common/TextEditor/TextEditor'
import { Error } from '../../common/ModalSchema'
import LabelWithToolTip from '../../common/LabelWithTooltip'
import { LabelAboveContent } from '../../common/PropertyLabel'
import { Markdown } from '../../common/Markdown'
import { BodyShort, Box, Heading, Label, Radio, RadioGroup, ReadMore } from '@navikt/ds-react'

export const getSuksesskriterieBegrunnelse = (suksesskriterieBegrunnelser: SuksesskriterieBegrunnelse[], suksessKriterie: Suksesskriterie) => {
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

export const SuksesskriterierBegrunnelseEdit = ({ suksesskriterie, disableEdit }: { suksesskriterie: Suksesskriterie[]; disableEdit: boolean }) => {
  return (
    <FieldWrapper>
      <FieldArray name={'suksesskriterieBegrunnelser'}>{(p) => <KriterieBegrunnelseList props={p} disableEdit={disableEdit} suksesskriterie={suksesskriterie} />}</FieldArray>
    </FieldWrapper>
  )
}

const KriterieBegrunnelseList = ({ props, suksesskriterie, disableEdit }: { props: FieldArrayRenderProps; suksesskriterie: Suksesskriterie[]; disableEdit: boolean }) => {
  const suksesskriterieBegrunnelser = props.form.values.suksesskriterieBegrunnelser as SuksesskriterieBegrunnelse[]

  return (
    <div>
      {suksesskriterie.map((s, i) => {
        return (
          <div key={s.navn + '_' + i}>
            <KriterieBegrunnelse
              status={props.form.values.status}
              disableEdit={disableEdit}
              suksesskriterie={s}
              index={i}
              suksesskriterieBegrunnelser={suksesskriterieBegrunnelser}
              update={(updated) => props.replace(i, updated)}
              props={props}
              totalSuksesskriterie={suksesskriterie.length}
            />
          </div>
        )
      })}
    </div>
  )
}

const KriterieBegrunnelse = ({
  suksesskriterie,
  index,
  suksesskriterieBegrunnelser,
  disableEdit,
  update,
  status,
  props,
  totalSuksesskriterie,
}: {
  suksesskriterie: Suksesskriterie
  index: number
  suksesskriterieBegrunnelser: SuksesskriterieBegrunnelse[]
  disableEdit: boolean
  update: (s: SuksesskriterieBegrunnelse) => void
  status: string
  props: FieldArrayRenderProps
  totalSuksesskriterie: number
}) => {
  const suksesskriterieBegrunnelse = getSuksesskriterieBegrunnelse(suksesskriterieBegrunnelser, suksesskriterie)
  const debounceDelay = 500
  const [begrunnelse, setBegrunnelse] = useDebouncedState(suksesskriterieBegrunnelse.begrunnelse || '', debounceDelay)
  const [suksessKriterieStatus, setSuksessKriterieStatus] = React.useState<SuksesskriterieStatus | undefined>(suksesskriterieBegrunnelse.suksesskriterieStatus)

  React.useEffect(() => {
    update({
      suksesskriterieId: suksesskriterie.id,
      begrunnelse: begrunnelse,
      behovForBegrunnelse: suksesskriterie.behovForBegrunnelse,
      suksesskriterieStatus: suksessKriterieStatus,
    })
  }, [begrunnelse, suksessKriterieStatus])

  const getBorderColor = () => {
    if (status === EtterlevelseStatus.FERDIG || status === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
      if (!begrunnelse && suksesskriterie.behovForBegrunnelse) {
        return 'border-danger'
      } else {
        return 'border-alt-1'
      }
    } else {
      return 'border-alt-1'
    }
  }

  const getLabelForSuksessKriterie = () => {
    if (suksessKriterieStatus === SuksesskriterieStatus.UNDER_ARBEID) {
      return 'Hva er oppfylt og hva er under arbeid?'
    } else if (suksessKriterieStatus === SuksesskriterieStatus.OPPFYLT) {
      return 'Hvordan oppfylles kriteriet?'
    } else if (suksessKriterieStatus === SuksesskriterieStatus.IKKE_OPPFYLT) {
      return 'Hvorfor er ikke kriteriet oppfylt?'
    } else {
      return 'Hvorfor er ikke kriteriet relevant?'
    }
  }

  return (
    <Box className="mb-4" borderColor={getBorderColor()} padding="8" borderWidth="3" borderRadius="medium">
      <BodyShort>
        Suksesskriterium {index + 1} av {totalSuksesskriterie}
      </BodyShort>

      <div className="flex flex-col gap-4">
        <Heading size="xsmall" level="3">
          {suksesskriterie.navn}
        </Heading>

        <ReadMore header="Utfyllende om kriteriet">
          <Markdown source={suksesskriterie.beskrivelse} />
        </ReadMore>
      </div>

      <div className="flex w-full">
        <div className="min-w-fit">
          <RadioGroup
            value={suksessKriterieStatus}
            legend="Oppgi status på suksesskriteriet"
            onChange={(val) => setSuksessKriterieStatus(val as SuksesskriterieStatus)}
            name={'suksesskriterieStatus' + suksesskriterie.id}
          >
            <Radio value={SuksesskriterieStatus.UNDER_ARBEID}>Under arbeid</Radio>
            <Radio value={SuksesskriterieStatus.OPPFYLT}>Oppfylt</Radio>
            <Radio value={SuksesskriterieStatus.IKKE_OPPFYLT}>Ikke oppfylt</Radio>
            <Radio value={SuksesskriterieStatus.IKKE_RELEVANT}>Ikke relevant</Radio>
          </RadioGroup>
        </div>
        {!disableEdit && suksesskriterie.behovForBegrunnelse && (
          <div className="w-full ml-20 mt-12 ">
            <Label>{getLabelForSuksessKriterie()}</Label>
            <TextEditor initialValue={begrunnelse} setValue={setBegrunnelse} height={'188px'} errors={props.form.errors} simple width="100%" />
            <Error fieldName={`suksesskriterieBegrunnelser[${index}].begrunnelse`} fullWidth={true} />
          </div>
        )}

        {!disableEdit && !suksesskriterie.behovForBegrunnelse && (
          <div className="w-full ml-20 mt-12 ">
            <Label>Sukseskriteriet har ikke behov for begrunnelse.</Label>
          </div>
        )}
        {disableEdit && (
          <div className="w-full ml-20 mt-12 ">
            <LabelAboveContent fullWidth title={getLabelForSuksessKriterie()} markdown={begrunnelse} />
          </div>
        )}
      </div>
      <Error fieldName={`suksesskriterieBegrunnelser[${index}].suksesskriterieStatus`} fullWidth={true} />

      <div className="mt-2">{suksesskriterieBegrunnelse.behovForBegrunnelse && begrunnelse.length > 0 && <Error fieldName={'status'} fullWidth={true} />}</div>
    </Box>
  )
}
