import { ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import CustomizedModal from '../../common/CustomizedModal'
import { Krav } from '../../../constants'
import Button from '../../common/Button'
import React, { ReactElement, useEffect } from 'react'
import { FieldArray, Form, Formik } from 'formik'
import { FieldWrapper } from '../../common/Inputs'
import { arrayMove, List } from 'baseui/dnd-list'
import { CustomPanelDivider } from '../../common/CustomizedAccordion'
import { PanelLink } from '../../common/PanelLink'
import { Label3, Paragraph2 } from 'baseui/typography'
import moment from 'moment'
import KravStatusView from '../KravStatusTag'
import { borderStyle } from '../../common/Style'

export const EditPriorityModal = (props: { isOpen: boolean; onClose: Function; kravListe: Krav[], tema: string }) => {
  const { isOpen, onClose, kravListe, tema } = props

  const [items, setItems] = React.useState<ReactElement[]>([])
  const [kravElements, setKravElements] = React.useState<Krav[]>(kravListe)

  useEffect(() => {
    setItems(kravListe.map((k) => {
      return (
        <CustomPanelDivider key={`${k.navn}_${k.kravNummer}`}>
          <PanelLink
            hideChevron
            useDescriptionUnderline
            href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
            title={
              <Paragraph2 $style={{ fontSize: '14px', marginBottom: '0px', marginTop: '0px', lineHeight: '15px' }}>
                K{k.kravNummer}.{k.kravVersjon}
              </Paragraph2>
            }
            beskrivelse={<Label3 $style={{ fontSize: '18px', lineHeight: '28px' }}>{k.navn}</Label3>}
            rightBeskrivelse={!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}
            statusText={<KravStatusView status={k.status} />}
            overrides={{
              Block: {
                style: {
                  ':hover': { boxShadow: 'none' },
                  ...borderStyle('hidden'),
                },
              },
            }}
          />
        </CustomPanelDivider>
      )
    }
    )
    )
  }, []);


  const setPriority = (kravListe: Krav[]) => {

    const pattern = new RegExp(tema.substr(0, 3).toUpperCase() + '[0-9]+')

    return kravListe.map((k, i) => {
      if (!k.prioriteringsId) {
        return {
          ...k,
          prioriteringsId: tema.substr(0, 3).toUpperCase() + i
        }
      } else {
        if (k.prioriteringsId?.match(pattern)) {
          return {
            ...k,
            prioriteringsId: k.prioriteringsId.replace(pattern, tema.substr(0, 3).toUpperCase() + i)
          }
        } else {
          return {
            ...k,
            prioriteringsId: k.prioriteringsId.concat(tema.substr(0, 3).toUpperCase() + i)
          }
        }
      }
    })
  }

  return (
    <Formik
      initialValues={{
        krav: kravElements
      }}
      onSubmit={(value) => {
        const temp = setPriority([...kravElements])
        console.log(temp)
      }
      }
    >
      {
        (p) => (
          <CustomizedModal isOpen={isOpen}>
            <ModalHeader>

            </ModalHeader>
            <ModalBody>

              <Form>
                <FieldWrapper>
                  <FieldArray name={'krav'}>{(p) => (
                    <List
                      items={items}
                      onChange={({ oldIndex, newIndex }) => {
                        setItems(arrayMove(items, oldIndex, newIndex))
                        setKravElements(arrayMove(kravElements, oldIndex, newIndex))
                      }
                      }
                    />
                  )}</FieldArray>
                </FieldWrapper>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => onClose()}>Close</Button>
              <Button
                size="compact"
                kind="secondary"
                onClick={p.submitForm}
                marginLeft>
                Lagre
              </Button>
            </ModalFooter>
          </CustomizedModal>
        )
      }
    </Formik>)
}
