import React from 'react'
import { IEtterlevelse, IKrav, ISuksesskriterie, ISuksesskriterieBegrunnelse, SuksesskriterieStatus } from '../../../constants'
import { mapEtterlevelseToFormValue, updateEtterlevelse } from '../../../api/EtterlevelseApi'
import { FieldArray, FieldArrayRenderProps, Form, Formik, FormikProps } from 'formik'
import { Card } from 'baseui/card'
import { Block } from 'baseui/block'
import { theme } from '../../../util'
import { ettlevColors } from '../../../util/theme'
import { getSuksesskriterieBegrunnelse } from './SuksesskriterieBegrunnelseEdit'
import * as yup from 'yup'
import { FieldWrapper } from '../../common/Inputs'
import { useDebouncedState } from '../../../util/hooks'
import { LabelSmall } from 'baseui/typography'
import { FormControl } from 'baseui/form-control'
import TextEditor from '../../common/TextEditor/TextEditor'
import { Error } from '../../common/ModalSchema'

type EditBegrunnelseProps = {
  etterlevelse: IEtterlevelse
  krav: IKrav
  close: (k?: IEtterlevelse) => void
  formRef?: React.Ref<any>
}

const etterlevelseSchema = () =>
  yup.object({
    suksesskriterieBegrunnelser: yup.array().of(
      yup.object({
        suksesskriterieId: yup.number().required('Begrunnelse må være knyttet til et suksesskriterie'),
        begrunnelse: yup.string().test({
          name: 'begrunnelseCheck',
          message: 'Suksesskriterium må ha en begrunnelse',
          test: function (begrunnelse) {
            const { parent } = this
            if (!parent.oppfylt || (parent.oppfylt && !!begrunnelse)) {
              return true
            }
            return false
          },
        }),
      }),
    ),
  })

const EditBegrunnelse = ({ krav, etterlevelse, close, formRef }: EditBegrunnelseProps) => {
  const submit = async (etterlevelse: IEtterlevelse) => {
    close(await updateEtterlevelse(etterlevelse))
  }

  return (
    <Formik
      onSubmit={submit}
      initialValues={mapEtterlevelseToFormValue(etterlevelse)}
      validationSchema={etterlevelseSchema()}
      innerRef={formRef}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, isSubmitting, submitForm }: FormikProps<IEtterlevelse>) => (
        <Form>
          <FieldWrapper>
            <FieldArray name={'suksesskriterieBegrunnelser'}>{(p) => <BegrunnelseList props={p} suksesskriterier={krav.suksesskriterier} />}</FieldArray>
          </FieldWrapper>
        </Form>
      )}
    </Formik>
  )
}

const BegrunnelseList = ({ props, suksesskriterier }: { props: FieldArrayRenderProps; suksesskriterier: ISuksesskriterie[] }) => {
  const suksesskriterieBegrunnelser = props.form.values.suksesskriterieBegrunnelser as ISuksesskriterieBegrunnelse[]

  return (
    <Block>
      {suksesskriterier.map((s, i) => {
        return (
          <Block key={s.navn + '_' + i}>
            <Begrunnelse
              suksesskriterie={s}
              index={i}
              kriterieLength={suksesskriterier.length}
              suksesskriterieBegrunnelser={suksesskriterieBegrunnelser}
              update={(updated) => props.replace(i, updated)}
            />
          </Block>
        )
      })}
    </Block>
  )
}

const Begrunnelse = ({
  suksesskriterie,
  index,
  suksesskriterieBegrunnelser,
  kriterieLength,
  update,
}: {
  suksesskriterie: ISuksesskriterie
  index: number
  kriterieLength: number
  suksesskriterieBegrunnelser: ISuksesskriterieBegrunnelse[]
  update: (s: ISuksesskriterieBegrunnelse) => void
}) => {
  const suksesskriterieBegrunnelse = getSuksesskriterieBegrunnelse(suksesskriterieBegrunnelser, suksesskriterie)
  const begrunnelseIndex = suksesskriterieBegrunnelser.findIndex((item) => {
    return item.suksesskriterieId === suksesskriterie.id
  })
  const debounceDelay = 400
  const [begrunnelse, setBegrunnelse] = useDebouncedState(suksesskriterieBegrunnelse.begrunnelse || '', debounceDelay)

  React.useEffect(() => {
    update({
      suksesskriterieId: suksesskriterie.id,
      begrunnelse: begrunnelse,
      behovForBegrunnelse: suksesskriterieBegrunnelse.behovForBegrunnelse,
      suksesskriterieStatus: suksesskriterieBegrunnelse.suksesskriterieStatus,
    })
  }, [begrunnelse])

  return (
    <Block marginBottom={theme.sizing.scale700}>
      <Card>
        <LabelSmall $style={{ color: ettlevColors.green600 }}>
          Suksesskriterium {index + 1} av {kriterieLength}
        </LabelSmall>
        <LabelSmall $style={{ fontSize: '21px', lineHeight: '30px' }}>{suksesskriterie.navn}</LabelSmall>
        <LabelSmall $style={{ lineHeight: '22px' }} marginTop="16px">
          Hvordan er kriteriet oppfylt?
        </LabelSmall>

        {suksesskriterieBegrunnelse.suksesskriterieStatus === SuksesskriterieStatus.OPPFYLT && (
          <Block>
            <FormControl>
              <TextEditor initialValue={begrunnelse} setValue={setBegrunnelse} height={'188px'} />
            </FormControl>
          </Block>
        )}

        <Error fieldName={`suksesskriterieBegrunnelser[${begrunnelseIndex}].begrunnelse`} fullWidth={true} />
      </Card>
    </Block>
  )
}

export default EditBegrunnelse
