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

export const SuksesskriterierBegrunnelseEdit = ({ suksesskriterie }: { suksesskriterie: Suksesskriterie[] }) => {
  return (
    <FieldWrapper>
      <FieldArray name={'suksesskriterieBegrunnelser'}>
        {p => <KriterieBegrunnelseList p={p} suksesskriterie={suksesskriterie} />}
      </FieldArray>
    </FieldWrapper>
  )
}

const KriterieBegrunnelseList = ({ p, suksesskriterie }: { p: FieldArrayRenderProps, suksesskriterie: Suksesskriterie[] }) => {
  const suksesskriterieBegrunnelser = p.form.values.suksesskriterieBegrunnelser as SuksesskriterieBegrunnelse[]

  return (
    <Block>
      {suksesskriterie.map((s, i) => {
        return (
          <KriterieBegrunnelse s={s} index={i} />
        )
      })}
    </Block>
  )
}

const KriterieBegrunnelse = ({ s, index }: { s: Suksesskriterie, index: number }) => {
  const [checked, setChecked] = React.useState(false)

  return (
    <Block key={s.navn + '_' + index} backgroundColor={ettlevColors.white} padding={theme.sizing.scale750} marginBottom={theme.sizing.scale600}>
      <Checkbox
        checked={checked}
        onChange={() => setChecked(!checked)}
      >
        <Paragraph2 margin='0px'>
          {s.navn}
        </Paragraph2>
      </Checkbox>

      {checked &&
        <Block paddingLeft='30px'>
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
                paddingLeft: '30px'
              }
            },
            Content: {
              style: {
                backgroundColor: 'transparent',
                borderBottom: 'none',
                paddingLeft: '30px'
              }
            },
          }}
        >
          <Markdown source={s.beskrivelse} />
        </CustomizedPanel>
      </CustomizedAccordion>

    </Block>
  )
}