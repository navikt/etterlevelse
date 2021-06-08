import React from "react";
import {Etterlevelse, Krav} from "../../../constants";
import {mapEtterlevelseToFormValue, updateEtterlevelse} from "../../../api/EtterlevelseApi";
import {Form, Formik, FormikProps} from "formik";
import {Card} from "baseui/card";
import {Block} from "baseui/block";
import {theme} from "../../../util";
import {ettlevColors} from "../../../util/theme";
import {SuksesskriterierBegrunnelseEdit} from "./SuksesskriterieBegrunnelseEdit";
import * as yup from "yup";

type EditBegrunnelseProps = {
  etterlevelse: Etterlevelse
  krav: Krav
  close: (k?: Etterlevelse) => void
  formRef?: React.Ref<any>
}

const etterlevelseSchema = () => yup.object({
  suksesskriterieBegrunnelser: yup.array().of(yup.object({
    suksesskriterieId: yup.number().required("Begrunnelse må være knyttet til et suksesskriterie"),
    begrunnelse:yup.string().required("Suksesskriterie må ha en begrunnelse")
  })),
})


const EditBegrunnelse = ({ krav, etterlevelse, close, formRef}: EditBegrunnelseProps) => {

  const submit = async (etterlevelse: Etterlevelse) => {
      close(await updateEtterlevelse(etterlevelse))
  }

  return (
    <Formik
      onSubmit={submit}
      initialValues={mapEtterlevelseToFormValue(etterlevelse)}
      validationSchema={etterlevelseSchema()}
      innerRef={formRef}
    >{({ values, isSubmitting, submitForm }: FormikProps<Etterlevelse>) => (
      <Form>
        <Card>
          <Block backgroundColor={ettlevColors.green50}>
            <Block paddingTop={theme.sizing.scale1000} paddingBottom={theme.sizing.scale1600}>
              <SuksesskriterierBegrunnelseEdit suksesskriterie={krav.suksesskriterier}/>
            </Block>
          </Block>
        </Card>
      </Form>
    )
    }
    </Formik >
  )

}

export default EditBegrunnelse
