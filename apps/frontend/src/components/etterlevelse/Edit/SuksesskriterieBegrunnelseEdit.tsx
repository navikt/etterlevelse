import { Block } from 'baseui/block'
import { FormControl } from 'baseui/form-control'
import { ParagraphMedium } from 'baseui/typography'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import React from 'react'
import { EtterlevelseStatus, Suksesskriterie, SuksesskriterieBegrunnelse, SuksesskriterieStatus } from '../../../constants'
import { useDebouncedState } from '../../../util/hooks'
import { ettlevColors, theme } from '../../../util/theme'
import { FieldWrapper } from '../../common/Inputs'
import TextEditor from '../../common/TextEditor/TextEditor'
import { Error } from '../../common/ModalSchema'
import LabelWithToolTip from '../../common/LabelWithTooltip'
import { borderColor, borderRadius, borderStyle, borderWidth } from '../../common/Style'
import { LabelAboveContent } from '../../common/PropertyLabel'
import { buttonContentStyle } from '../../common/Button'
import { Markdown } from '../../common/Markdown'
import { ALIGN, Radio, RadioGroup, RadioGroupOverrides, RadioOverrides } from 'baseui/radio'
import { Heading, ReadMore } from '@navikt/ds-react'

const radioButtonOverrides: RadioOverrides & RadioGroupOverrides = {
  Root: {
    style: ({ $isFocused, $checked }) => ({
      ...borderColor($checked ? ettlevColors.green400 : ettlevColors.green100),
      ...borderStyle('solid'),
      ...borderWidth('1px'),
      ...borderRadius('4px'),
      ...buttonContentStyle,
      backgroundColor: $checked ? ettlevColors.green100 : ettlevColors.white,
      marginRight: '16px',
      display: 'flex',
      flex: 1,
      minWidth: '140px',
      textUnderlineOffset: '3px',
      ':hover': { backgroundColor: ettlevColors.green50, textDecoration: 'underline 1px' },
      outlineWidth: $isFocused ? '3px' : undefined,
      outlineColor: $isFocused ? ettlevColors.focusOutline : undefined,
      outlineStyle: $isFocused ? 'solid' : undefined,
    }),
  },
  RadioMarkInner: {
    style: {
      backgroundColor: ettlevColors.white,
      ':hover': { backgroundColor: ettlevColors.white },
      ':active': { backgroundColor: ettlevColors.green600, ...borderColor() },
    },
  },
  RadioMarkOuter: {
    style: {
      backgroundColor: ettlevColors.green600,
      ':hover': { backgroundColor: ettlevColors.green600, borderWidth: '2px' },
      ':active': { backgroundColor: ettlevColors.green600, borderWidth: '2px' },
    },
  },
}

export const getSuksesskriterieBegrunnelse = (suksesskriterieBegrunnelser: SuksesskriterieBegrunnelse[], suksessKriterie: Suksesskriterie) => {
  const sb = suksesskriterieBegrunnelser.find((item) => {
    return item.suksesskriterieId === suksessKriterie.id
  })
  if (!sb) {
    return {
      suksesskriterieId: suksessKriterie.id,
      begrunnelse: '',
      behovForBegrunnelse: suksessKriterie.behovForBegrunnelse,
      suksesskriterieStatus: SuksesskriterieStatus.UNDER_ARBEID,
    }
  } else {
    return sb
  }
}

export const SuksesskriterierBegrunnelseEdit = ({ suksesskriterie, disableEdit, viewMode }: { suksesskriterie: Suksesskriterie[]; disableEdit: boolean; viewMode: boolean }) => {
  return (
    <FieldWrapper>
      <FieldArray name={'suksesskriterieBegrunnelser'}>
        {(p) => <KriterieBegrunnelseList props={p} disableEdit={disableEdit} suksesskriterie={suksesskriterie} viewMode={viewMode} />}
      </FieldArray>
    </FieldWrapper>
  )
}

const KriterieBegrunnelseList = ({
  props,
  suksesskriterie,
  disableEdit,
  viewMode,
  setIsFormDirty,
}: {
  props: FieldArrayRenderProps
  suksesskriterie: Suksesskriterie[]
  disableEdit: boolean
  viewMode: boolean
  setIsFormDirty?: (v: boolean) => void
}) => {
  const suksesskriterieBegrunnelser = props.form.values.suksesskriterieBegrunnelser as SuksesskriterieBegrunnelse[]

  return (
    <Block>
      {suksesskriterie.map((s, i) => {
        return (
          <Block key={s.navn + '_' + i}>
            <KriterieBegrunnelse
              status={props.form.values.status}
              disableEdit={disableEdit}
              suksesskriterie={s}
              index={i}
              suksesskriterieBegrunnelser={suksesskriterieBegrunnelser}
              update={(updated) => props.replace(i, updated)}
              props={props}
              viewMode={viewMode}
              totalSuksesskriterie={suksesskriterie.length}
            />
          </Block>
        )
      })}
    </Block>
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
  viewMode,
  totalSuksesskriterie,
}: {
  suksesskriterie: Suksesskriterie
  index: number
  suksesskriterieBegrunnelser: SuksesskriterieBegrunnelse[]
  disableEdit: boolean
  update: (s: SuksesskriterieBegrunnelse) => void
  status: string
  props: FieldArrayRenderProps
  viewMode: boolean
  totalSuksesskriterie: number
}) => {
  const suksesskriterieBegrunnelse = getSuksesskriterieBegrunnelse(suksesskriterieBegrunnelser, suksesskriterie)
  const debounceDelay = 500
  const [begrunnelse, setBegrunnelse] = useDebouncedState(suksesskriterieBegrunnelse.begrunnelse || '', debounceDelay)
  const [suksessKriterieStatus, setSuksessKriterieStatus] = React.useState<SuksesskriterieStatus>(
    suksesskriterieBegrunnelse.suksesskriterieStatus || SuksesskriterieStatus.UNDER_ARBEID,
  )

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
        return {
          ...borderWidth('1px'),
          ...borderStyle('solid'),
          ...borderColor('#C9C9C9'),
          outlineWidth: '2px',
          outlineStyle: 'solid',
          outlineColor: '#842D08',
        }
      } else {
        return {
          ...borderWidth('1px'),
          ...borderStyle('solid'),
          ...borderColor('#C9C9C9'),
          outlineWidth: undefined,
          outlineStyle: undefined,
          outlineColor: undefined,
        }
      }
    } else {
      return {
        ...borderWidth('1px'),
        ...borderStyle('solid'),
        ...borderColor('#C9C9C9'),
        outlineWidth: undefined,
        outlineStyle: undefined,
        outlineColor: undefined,
      }
    }
  }
  const getBackgroundColor = () => {
    if (viewMode === true) {
      return ettlevColors.grey50
    } else {
      return ettlevColors.white
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
    <Block $style={getBorderColor()} backgroundColor={getBackgroundColor()} padding={theme.sizing.scale750} marginBottom={theme.sizing.scale600}>
      <Block display="flex" justifyContent="space-between" width="100%" alignItems="center">
        <Block>
          <ParagraphMedium
            $style={{
              fontSize: '16px',
              lineHeight: '18,75',
              marginTop: '3px',
              marginBottom: '5px',
              font: 'roboto',
              color: ettlevColors.grey600,
            }}
          >
            Suksesskriterium {index + 1} av {totalSuksesskriterie}
          </ParagraphMedium>
        </Block>
        {viewMode === true && (
          <Block alignSelf="flex-end">
            <ParagraphMedium
              $style={{
                marginTop: '0px',
                marginBottom: '0px',
                color: ettlevColors.red600,
                fontStyle: 'italic',
              }}
            >
              Bortfiltert
            </ParagraphMedium>
          </Block>
        )}
      </Block>

      <div className="flex flex-col gap-4">
        <Heading size="medium" level="3">{suksesskriterie.navn}</Heading>

        <ReadMore header="Utfyllende om kriteriet">
          <Markdown source={suksesskriterie.beskrivelse} />
        </ReadMore>
      </div>

      <Block width="100%" height="1px" backgroundColor={ettlevColors.grey100} marginTop="24px" marginBottom="24px" />

      {viewMode === false && (
        <>
          <Block>
            <RadioGroup
              value={suksessKriterieStatus}
              onChange={(e) => {
                setSuksessKriterieStatus(e.currentTarget.value as SuksesskriterieStatus)
              }}
              name={'suksesskriterieStatus' + suksesskriterie.id}
              align={ALIGN.horizontal}
            >
              <Radio value={SuksesskriterieStatus.UNDER_ARBEID} overrides={{ ...radioButtonOverrides }}>
                <ParagraphMedium margin={0}>Under arbeid</ParagraphMedium>
              </Radio>
              <Radio value={SuksesskriterieStatus.OPPFYLT} overrides={{ ...radioButtonOverrides }}>
                <ParagraphMedium margin={0}> Oppfylt</ParagraphMedium>
              </Radio>
              <Radio value={SuksesskriterieStatus.IKKE_OPPFYLT} overrides={{ ...radioButtonOverrides }}>
                <ParagraphMedium margin={0}> Ikke oppfylt</ParagraphMedium>
              </Radio>
              <Radio value={SuksesskriterieStatus.IKKE_RELEVANT} overrides={{ ...radioButtonOverrides }}>
                <ParagraphMedium margin={0}>Ikke relevant</ParagraphMedium>
              </Radio>
            </RadioGroup>
          </Block>
          <Error fieldName={`suksesskriterieBegrunnelser[${index}].suksesskriterieStatus`} fullWidth={true} />
        </>
      )}

      {(!disableEdit || !viewMode) && suksesskriterie.behovForBegrunnelse && (
        <Block marginTop={theme.sizing.scale1000}>
          <FormControl label={<LabelWithToolTip label={getLabelForSuksessKriterie()} />}>
            <TextEditor initialValue={begrunnelse} setValue={setBegrunnelse} height={'188px'} errors={props.form.errors} simple width="100%" />
          </FormControl>
          <Error fieldName={`suksesskriterieBegrunnelser[${index}].begrunnelse`} fullWidth={true} />
        </Block>
      )}

      {(disableEdit || viewMode) && (
        <Block marginTop={theme.sizing.scale1000}>
          <LabelAboveContent title={getLabelForSuksessKriterie()} markdown={begrunnelse} labelWidth={'24rem'} />
        </Block>
      )}

      <Block marginTop={'8px'}>{suksesskriterieBegrunnelse.behovForBegrunnelse && begrunnelse.length > 0 && <Error fieldName={'status'} fullWidth={true} />}</Block>
    </Block>
  )
}
