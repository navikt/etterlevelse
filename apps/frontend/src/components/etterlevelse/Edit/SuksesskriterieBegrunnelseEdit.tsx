import { Block } from "baseui/block"
import { Paragraph2 } from "baseui/typography"
import { FieldArray, FieldArrayRenderProps } from "formik"
import React from "react"
import { Suksesskriterie, SuksesskriterieBegrunnelse } from "../../../constants"
import { ettlevColors, theme } from "../../../util/theme"
import { FieldWrapper, TextAreaField } from "../../common/Inputs"

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
          <Block key={s.navn + '_' + i} backgroundColor={ettlevColors.white} padding={theme.sizing.scale750} marginBottom={theme.sizing.scale600}>
            <Paragraph2>
              {s.navn}
            </Paragraph2>

            <TextAreaField label='' name='begrunnelse' markdown />

          </Block>
        )
      })}
    </Block>
  )
}