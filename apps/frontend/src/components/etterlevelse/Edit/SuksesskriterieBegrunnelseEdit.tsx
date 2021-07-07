import { Block } from 'baseui/block'
import { Checkbox } from 'baseui/checkbox'
import { FormControl } from 'baseui/form-control'
import { Label3, Paragraph2 } from 'baseui/typography'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import React from 'react'
import { Suksesskriterie, SuksesskriterieBegrunnelse } from '../../../constants'
import { useDebouncedState } from '../../../util/hooks'
import { ettlevColors, theme } from '../../../util/theme'
import { CustomizedAccordion, CustomizedPanel } from '../../common/CustomizedAccordion'
import { FieldWrapper } from '../../common/Inputs'
import { Markdown } from '../../common/Markdown'
import TextEditor from '../../common/TextEditor/TextEditor'
import { Error } from '../../common/ModalSchema'
import LabelWithToolTip from '../../common/LabelWithTooltip'
import { borderColor, borderStyle, borderWidth } from '../../common/Style'

const paddingLeft = '30px'

export const getSuksesskriterieBegrunnelse = (suksesskriterieBegrunnelser: SuksesskriterieBegrunnelse[], suksessKriterie: Suksesskriterie) => {
  const sb = suksesskriterieBegrunnelser.find((item) => {
    return item.suksesskriterieId === suksessKriterie.id
  })
  if (!sb) {
    return { suksesskriterieId: suksessKriterie.id, begrunnelse: '', oppfylt: false }
  } else {
    return sb
  }
}

export const SuksesskriterierBegrunnelseEdit = ({ suksesskriterie }: { suksesskriterie: Suksesskriterie[] }) => {
  return (
    <FieldWrapper>
      <FieldArray name={'suksesskriterieBegrunnelser'}>{(p) => <KriterieBegrunnelseList props={p} suksesskriterie={suksesskriterie} />}</FieldArray>
    </FieldWrapper>
  )
}

const KriterieBegrunnelseList = ({ props, suksesskriterie }: { props: FieldArrayRenderProps; suksesskriterie: Suksesskriterie[] }) => {
  const suksesskriterieBegrunnelser = props.form.values.suksesskriterieBegrunnelser as SuksesskriterieBegrunnelse[]

  return (
    <Block>
      {suksesskriterie.map((s, i) => {
        return (
          <Block key={s.navn + '_' + i}>
            <KriterieBegrunnelse suksesskriterie={s} index={i} suksesskriterieBegrunnelser={suksesskriterieBegrunnelser} update={(updated) => props.replace(i, updated)} />
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
  update,
}: {
  suksesskriterie: Suksesskriterie
  index: number
  suksesskriterieBegrunnelser: SuksesskriterieBegrunnelse[]
  update: (s: SuksesskriterieBegrunnelse) => void
}) => {
  const suksesskriterieBegrunnelse = getSuksesskriterieBegrunnelse(suksesskriterieBegrunnelser, suksesskriterie)
  const debounceDelay = 500
  const [checked, setChecked] = React.useState(!!suksesskriterieBegrunnelse.oppfylt)
  const [textHover, setTextHover] = React.useState(false)
  const [begrunnelse, setBegrunnelse] = useDebouncedState(suksesskriterieBegrunnelse.begrunnelse || '', debounceDelay)

  React.useEffect(() => {
    update({ suksesskriterieId: suksesskriterie.id, begrunnelse: begrunnelse, oppfylt: checked })
  }, [begrunnelse, checked])

  return (
    <Block $style={{ border: '1px solid #C9C9C9' }} backgroundColor={ettlevColors.white} padding={theme.sizing.scale750} marginBottom={theme.sizing.scale600}>
      <Checkbox
        checked={checked}
        onChange={() => setChecked(!checked)}
        onMouseEnter={() => setTextHover(true)}
        onMouseLeave={() => setTextHover(false)}
        overrides={{
          Checkmark: {
            style: {
              ...borderWidth('1px'),
            },
          },
        }}
      >
        <Paragraph2 color={textHover ? ettlevColors.green600 : undefined} margin="0px" $style={{ textDecoration: textHover ? 'underline' : 'none' }}>
          {suksesskriterie.navn}
        </Paragraph2>
      </Checkbox>

      {checked && (
        <Block paddingLeft={paddingLeft} marginTop={theme.sizing.scale1000}>
          <FormControl label={<LabelWithToolTip label="Dokumentasjon" />}>
            <TextEditor initialValue={begrunnelse} setValue={setBegrunnelse} height={'188px'} />
          </FormControl>
          <Error fieldName={`suksesskriterieBegrunnelser[${index}].begrunnelse`} fullWidth={true} />
        </Block>
      )}

      <CustomizedAccordion>
        <CustomizedPanel
          title={<Label3 $style={{ color: ettlevColors.green600 }}>Utfyllende om kriteriet</Label3>}
          overrides={{
            Header: {
              style: {
                backgroundColor: 'transparent',
                ...borderStyle('none'),
                ...borderColor('none'),
                maxWidth: '210px',
                paddingLeft: paddingLeft,
              },
            },
            Content: {
              style: {
                backgroundColor: 'transparent',
                borderBottomWidth: 'none',
                borderBottomStyle: 'none',
                borderBottomColor: 'none',
                paddingLeft: paddingLeft,
              },
            },
          }}
        >
          <Markdown source={suksesskriterie.beskrivelse} />
        </CustomizedPanel>
      </CustomizedAccordion>
    </Block>
  )
}
