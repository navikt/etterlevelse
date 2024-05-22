import { Button } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik'
import { useState } from 'react'
import {
  etterlevelseDokumentasjonMapToFormVal,
  getEtterlevelseDokumentasjon,
  updateEtterlevelseDokumentasjon,
} from '../../api/EtterlevelseDokumentasjonApi'
import { IKravPriorityList, TEtterlevelseDokumentasjonQL, TKravQL } from '../../constants'
import { TTemaCode } from '../../services/Codelist'
import { AccordionList } from '../focusList/AccordionList'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (e: TEtterlevelseDokumentasjonQL) => void
  allKravPriority: IKravPriorityList[]
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  temaListe: TTemaCode[]
}

export const FocusList = (props: IProps) => {
  const {
    etterlevelseDokumentasjon,
    setEtterlevelseDokumentasjon,
    relevanteStats,
    temaListe,
    utgaattStats,
    allKravPriority,
  } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false)

  const submit = async (value: TEtterlevelseDokumentasjonQL) => {
    await getEtterlevelseDokumentasjon(value.id)
      .then((resp) => {
        const etterlevelseDokumentasjonWithFocusList: TEtterlevelseDokumentasjonQL = {
          ...resp,
          prioritertKravNummer: value.prioritertKravNummer,
        }
        updateEtterlevelseDokumentasjon(etterlevelseDokumentasjonWithFocusList).then((resp) =>
          setEtterlevelseDokumentasjon(resp)
        )
      })
      .catch((e) => console.debug(e))
  }

  return (
    <div>
      {!isEditMode && (
        <div>
          <Button type="button" onClick={() => setIsEditMode(true)}>
            Velg krav
          </Button>
          Fokus liste
        </div>
      )}
      {isEditMode && (
        <Formik
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={(values) => {
            submit(values)
            setIsEditMode(false)
          }}
          initialValues={etterlevelseDokumentasjonMapToFormVal(etterlevelseDokumentasjon)}
        >
          {({ submitForm }) => (
            <Form>
              <div className="mt-4">
                <FieldArray name="prioritertKravNummer">
                  {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                    <AccordionList
                      fieldArrayRenderProps={fieldArrayRenderProps}
                      allKravPriority={allKravPriority}
                      temaListe={temaListe}
                      kravliste={relevanteStats}
                      utgattKravliste={utgaattStats}
                    />
                  )}
                </FieldArray>
              </div>
              <div className="border-border-subtle flex -mt-1 items-center gap-2 sticky bottom-0 border-black border-t-2 bg-bg-default z-10 py-4">
                <Button type="button" onClick={submitForm}>
                  Lagre
                </Button>

                <Button type="button" variant="secondary" onClick={() => setIsEditMode(false)}>
                  Avbryt
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  )
}

export default FocusList
