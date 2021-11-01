import CustomizedModal from '../../common/CustomizedModal'
import {Krav} from '../../../constants'
import Button from '../../common/Button'
import React, {ReactElement, useEffect} from 'react'
import {FieldArray, Form, Formik} from 'formik'
import {FieldWrapper} from '../../common/Inputs'
import {arrayMove, List} from 'baseui/dnd-list'
import {CustomPanelDivider} from '../../common/CustomizedAccordion'
import {PanelLink} from '../../common/PanelLink'
import {H1, H2, Label3, Paragraph2} from 'baseui/typography'
import moment from 'moment'
import KravStatusView from '../KravStatusTag'
import {borderRadius, borderStyle, paddingZero} from '../../common/Style'
import {mapToFormVal, updateKrav} from "../../../api/KravApi";
import {Spinner} from '../../common/Spinner'
import {theme} from '../../../util'
import {Block} from 'baseui/block'
import {ettlevColors, responsivePaddingLarge} from '../../../util/theme'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGripVertical} from '@fortawesome/free-solid-svg-icons'

export const EditPriorityModal = (props: { isOpen: boolean; onClose: Function; kravListe: Krav[], tema: string, refresh: Function }) => {
  const {isOpen, onClose, kravListe, tema, refresh} = props
  const [items, setItems] = React.useState<ReactElement[]>([])
  const [kravElements, setKravElements] = React.useState<Krav[]>(kravListe)
  const [loading, setLoading] = React.useState(false)

  useEffect(() => {
    setItems(kravListe.map((k) => {
          return (
            <CustomPanelDivider key={`${k.navn}_${k.kravNummer}`}>
              <PanelLink
                hideChevron
                useDescriptionUnderline
                href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
                title={
                  <Paragraph2 $style={{fontSize: '14px', marginBottom: '0px', marginTop: '0px', lineHeight: '15px'}}>
                    K{k.kravNummer}.{k.kravVersjon}
                  </Paragraph2>
                }
                beskrivelse={<Label3 $style={{fontSize: '18px', lineHeight: '28px'}}>{k.navn}</Label3>}
                rightBeskrivelse={!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}
                statusText={<KravStatusView status={k.status}/>}
                overrides={{
                  Block: {
                    style: {
                      ':hover': {boxShadow: 'none'},
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
      const index = i + 1
      if (!k.prioriteringsId) {
        return {
          ...k,
          prioriteringsId: tema.substr(0, 3).toUpperCase() + index
        }
      } else {
        if (k.prioriteringsId?.match(pattern)) {
          return {
            ...k,
            prioriteringsId: k.prioriteringsId.replace(pattern, tema.substr(0, 3).toUpperCase() + index)
          }
        } else {
          return {
            ...k,
            prioriteringsId: k.prioriteringsId.concat(tema.substr(0, 3).toUpperCase() + index)
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
        setLoading(true)
        let updateKraver: Promise<any>[] = []
        const kravMedPrioriteting = setPriority([...kravElements])
        kravMedPrioriteting.forEach(kmp => {
          updateKraver.push((async () => (await updateKrav(mapToFormVal(kmp))))())
        })
        try {
          Promise.all(updateKraver).then(() => {
              setLoading(false)
              refresh()
              onClose()
            }
          )
        } catch (error: any) {
          console.log(error)
        }
      }
      }
    >
      {(p) => (
        <CustomizedModal isOpen={isOpen} size="auto" overrides={{
          Dialog: {
            style: {
              ...borderRadius('0px'),
              background: ettlevColors.white
            }
          }
        }}>
          <Block
            backgroundColor={ettlevColors.green800}
            paddingTop="23px"
            paddingBottom="48px"
            paddingLeft={responsivePaddingLarge}
            paddingRight={responsivePaddingLarge}
            maxHeight="55px"
            marginBottom="54px"
          >
            <H1 $style={{lineHeight: '48px', color: ettlevColors.white}}>
              Justere rekkefølgen på krav
            </H1>
          </Block>
          <Block
            display="flex"
            justifyContent="center"
            paddingLeft={responsivePaddingLarge}
            paddingRight={responsivePaddingLarge}
          >
            <Block display="flex" justifyContent="flex-start" flex="1">
              <H2 $style={{lineHeight: '24px', color: ettlevColors.green600, marginTop: '0px', marginBottom: '0px'}}>
                {tema}
              </H2>
            </Block>
            <Block display="flex" justifyContent="flex-end" flex="1">
              <Paragraph2 $style={{marginTop: '0px', marginBottom: '0px', color: ettlevColors.green800}}>
                Klikk og dra kravene i ønsket rekkefølge
              </Paragraph2>
            </Block>
          </Block>
          <Block
            paddingLeft={responsivePaddingLarge}
            paddingRight={responsivePaddingLarge}
          >
            {loading ?
              <Block display="flex" justifyContent="center">
                <Spinner size={theme.sizing.scale1200}/>
              </Block>
              :
              <Form>
                <FieldWrapper>
                  <FieldArray name={'krav'}>{(p) => (
                    <List
                      items={items}
                      onChange={({oldIndex, newIndex}) => {
                        setItems(arrayMove(items, oldIndex, newIndex))
                        setKravElements(arrayMove(kravElements, oldIndex, newIndex))
                      }}
                      overrides={{
                        DragHandle: CustomDragHandle,
                        Root: {
                          style: {
                            ...paddingZero
                          }
                        },
                        Item: {
                          style: {
                            ...paddingZero,
                            flexDirection: 'row-reverse'
                          }
                        },
                      }}
                    />
                  )}</FieldArray>
                </FieldWrapper>
              </Form>
            }
            <Block paddingBottom="23px" display="flex" justifyContent="flex-end">
              <Button onClick={() => onClose()}>Close</Button>
              <Button
                size="compact"
                kind="secondary"
                onClick={p.submitForm}
                marginLeft>
                Lagre
              </Button>
            </Block>
          </Block>
        </CustomizedModal>
      )}
    </Formik>)
}

const CustomDragHandle = () => {
  return (
    <Block
      $style={{
        display: 'flex',
        alignItems: 'cneter',
        marginRight: '1em'
      }}
    >
      <FontAwesomeIcon icon={faGripVertical} aria-label={'Dra og slipp håndtak'}/>
    </Block>
  )
}
