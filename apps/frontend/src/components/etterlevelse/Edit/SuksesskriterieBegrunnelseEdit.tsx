import { Block } from "baseui/block"
import { Checkbox } from "baseui/checkbox"
import { Paragraph2 } from "baseui/typography"
import { FieldArray, FieldArrayRenderProps } from "formik"
import React from "react"
import { Suksesskriterie, SuksesskriterieBegrunnelse } from "../../../constants"
import { ettlevColors, theme } from "../../../util/theme"
import { CustomizedAccordion, CustomizedPanel } from "../../common/CustomizedAccordion"
import { FieldWrapper, TextAreaField } from "../../common/Inputs"
import { Markdown } from "../../common/Markdown"

const paddingLeft = '30px'

export const SuksesskriterierBegrunnelseEdit = ({ suksesskriterie }: { suksesskriterie: Suksesskriterie[] }) => {
  return (
    <FieldWrapper>
      <FieldArray name={'suksesskriterieBegrunnelser'}>
        {p => <KriterieBegrunnelseList props={p} suksesskriterie={suksesskriterie} />}
      </FieldArray>
    </FieldWrapper>
  )
}

const KriterieBegrunnelseList = ({ props, suksesskriterie }: { props: FieldArrayRenderProps, suksesskriterie: Suksesskriterie[] }) => {
  const suksesskriterieBegrunnelser = props.form.values.suksesskriterieBegrunnelser as SuksesskriterieBegrunnelse[]

  return (
    <Block>
      {suksesskriterie.map((s, i) => {
        return (
          <KriterieBegrunnelse suksesskriterie={s} index={i} />
        )
      })}
    </Block>
  )
}

const KriterieBegrunnelse = ({ suksesskriterie, index }: { suksesskriterie: Suksesskriterie, index: number }) => {
  const [checked, setChecked] = React.useState(false)

  return (
    <Block key={suksesskriterie.navn + '_' + index} backgroundColor={ettlevColors.white} padding={theme.sizing.scale750} marginBottom={theme.sizing.scale600}>
      <Checkbox
        checked={checked}
        onChange={() => setChecked(!checked)}
      >
        <Paragraph2 margin='0px'>
          {suksesskriterie.navn}
        </Paragraph2>
      </Checkbox>

      {checked &&
        <Block paddingLeft={paddingLeft} marginTop={theme.sizing.scale1000}>
          <TextAreaField label='Dokumentasjon' name='begrunnelse' markdown />
        </Block>
      }

      <CustomizedAccordion>
        <CustomizedPanel
          title="Utfyllende om kriteriet"
          overrides={{
            Header: {
              style: {
                backgroundColor: 'transparent',
                border: 'none',
                width: '250px',
                paddingLeft: paddingLeft
              }
            },
            Content: {
              style: {
                backgroundColor: 'transparent',
                borderBottom: 'none',
                paddingLeft: paddingLeft
              }
            },
          }}
        >
          <Markdown source={suksesskriterie.beskrivelse} />
        </CustomizedPanel>
      </CustomizedAccordion>

    </Block>
  )
}