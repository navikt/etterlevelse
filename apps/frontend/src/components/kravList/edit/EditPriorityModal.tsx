import CustomizedModal from '../../common/CustomizedModal'
import { Krav } from '../../../constants'
import Button from '../../common/Button'
import React, { ReactElement, useEffect } from 'react'
import { FieldArray, Form, Formik } from 'formik'
import { FieldWrapper } from '../../common/Inputs'
import { arrayMove, List } from 'baseui/dnd-list'
import { CustomPanelDivider } from '../../common/CustomizedAccordion'
import { SimplePanel } from '../../common/PanelLink'
import { H1, H2, Label3, Paragraph2 } from 'baseui/typography'
import moment from 'moment'
import StatusView from '../../common/StatusTag'
import { borderRadius, borderStyle, paddingZero } from '../../common/Style'
import { Spinner } from '../../common/Spinner'
import { theme } from '../../../util'
import { Block } from 'baseui/block'
import { ettlevColors, responsivePaddingSmall } from '../../../util/theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { updateKravPriority, kravMapToKravPrioriting, createKravPriority } from '../../../api/KravPriorityApi'

export const kravListPriorityModal = () => document.querySelector('#krav-list-edit-priority-modal')

export const EditPriorityModal = (props: { isOpen: boolean; onClose: Function; kravListe: Krav[]; tema: string; refresh: Function }) => {
  const { isOpen, onClose, kravListe, tema, refresh } = props
  const [items, setItems] = React.useState<ReactElement[]>([])
  const [kravElements, setKravElements] = React.useState<Krav[]>(kravListe)
  const [loading, setLoading] = React.useState(false)
  const [stickyFooterStyle, setStickyFooterStyle] = React.useState(false)

  useEffect(() => {
    setItems(
      kravListe.map((k) => {
        return (
          <CustomPanelDivider fullWidth>
            <SimplePanel
              key={`${k.navn}_${k.kravNummer}`}
              hideChevron
              title={
                <Paragraph2 $style={{ fontSize: '14px', marginBottom: '0px', marginTop: '0px', lineHeight: '15px' }}>
                  K{k.kravNummer}.{k.kravVersjon}
                </Paragraph2>
              }
              beskrivelse={<Label3 $style={{ fontSize: '18px', lineHeight: '28px' }}>{k.navn}</Label3>}
              rightBeskrivelse={!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}
              statusText={<StatusView status={k.status} />}
              overrides={{
                Block: {
                  style: {
                    width: '97%',
                    ':hover': { boxShadow: 'none', boxSizing: 'content-box' },
                    ...borderStyle('hidden'),
                  },
                },
              }}
            />
          </CustomPanelDivider>
        )
      }),
    )
  }, [kravListe])

  useEffect(() => {
    if (!isOpen) {
      setStickyFooterStyle(false)
      return
    }

    const listener = (event: any) => {
      const buttonPosition = document.querySelector('.krav-list-button-container')?.clientHeight || 0
      if (event.target.scrollTop <= event.target.scrollHeight - event.target.clientHeight - buttonPosition) {
        setStickyFooterStyle(true)
      } else {
        setStickyFooterStyle(false)
      }
    }

    setTimeout(() => kravListPriorityModal()?.addEventListener('scroll', listener), 200)
    return () => kravListPriorityModal()?.removeEventListener('scroll', listener)
  }, [isOpen])

  const setPriority = (kravListe: Krav[]) => {
    const pattern = new RegExp(tema.substr(0, 3).toUpperCase() + '[0-9]+')

    return kravListe.map((k, i) => {
      const index = i + 1
      if (!k.prioriteringsId) {
        return {
          ...k,
          prioriteringsId: tema.substr(0, 3).toUpperCase() + index,
        }
      } else {
        if (k.prioriteringsId?.match(pattern)) {
          return {
            ...k,
            prioriteringsId: k.prioriteringsId.replace(pattern, tema.substr(0, 3).toUpperCase() + index),
          }
        } else {
          return {
            ...k,
            prioriteringsId: k.prioriteringsId.concat(tema.substr(0, 3).toUpperCase() + index),
          }
        }
      }
    })
  }

  return (
    <Formik
      initialValues={{
        krav: kravElements,
      }}
      onSubmit={(value) => {
        setLoading(true)
        let updateKravPriorityPromise: Promise<any>[] = []
        const kravMedPrioriteting = setPriority([...kravElements])
        kravMedPrioriteting.forEach((kmp) => {
          if (kmp.kravPriorityUID) {
            updateKravPriorityPromise.push((async () => await updateKravPriority(kravMapToKravPrioriting(kmp)))())
          } else {
            updateKravPriorityPromise.push((async () => await createKravPriority(kravMapToKravPrioriting(kmp)))())
          }
        })
        try {
          Promise.all(updateKravPriorityPromise).then(() => {
            setLoading(false)
            refresh()
            onClose()
          })
        } catch (error: any) {
          console.log(error)
        }
      }}
    >
      {(p) => (
        <CustomizedModal
          isOpen={isOpen}
          size="auto"
          overrides={{
            Root: {
              props: {
                id: 'krav-list-edit-priority-modal',
              },
            },
            Dialog: {
              style: {
                ...borderRadius('0px'),
                backgroundColor: ettlevColors.white,
              },
            },
          }}
        >
          <Block
            backgroundColor={ettlevColors.green800}
            paddingTop="23px"
            paddingBottom="48px"
            paddingLeft={responsivePaddingSmall}
            paddingRight={responsivePaddingSmall}
            maxHeight="55px"
            marginBottom="54px"
          >
            <H1 $style={{ lineHeight: '48px', color: ettlevColors.white }}>Justere rekkefølgen på krav</H1>
          </Block>
          <Block display="flex" justifyContent="center" paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall}>
            <Block display="flex" justifyContent="flex-start" flex="1">
              <H2 $style={{ lineHeight: '24px', color: ettlevColors.green600, marginTop: '0px', marginBottom: '0px' }}>{tema}</H2>
            </Block>
            <Block display="flex" justifyContent="flex-end" flex="1">
              <Paragraph2 $style={{ marginTop: '0px', marginBottom: '0px', color: ettlevColors.green800 }}>Klikk og dra kravene i ønsket rekkefølge</Paragraph2>
            </Block>
          </Block>
          <Block>
            {loading ? (
              <Block display="flex" justifyContent="center">
                <Spinner size={theme.sizing.scale1200} />
              </Block>
            ) : (
              <Form>
                <FieldWrapper>
                  <FieldArray name={'krav'}>
                    {(p) => (
                      <List
                        items={items}
                        onChange={({ oldIndex, newIndex }) => {
                          setItems(arrayMove(items, oldIndex, newIndex))
                          setKravElements(arrayMove(kravElements, oldIndex, newIndex))
                        }}
                        overrides={{
                          DragHandle: ({ $isDragged }) => {
                            return CustomDragHandle($isDragged)
                          },
                          Root: {
                            style: {
                              ...paddingZero,
                            },
                          },
                          Item: {
                            style: {
                              ...paddingZero,
                              flexDirection: 'row-reverse',
                            },
                          },
                        }}
                      />
                    )}
                  </FieldArray>
                </FieldWrapper>
              </Form>
            )}
          </Block>
          <Block
            paddingBottom="23px"
            display="flex"
            justifyContent="flex-end"
            position="sticky"
            bottom={0}
            paddingTop="16px"
            paddingLeft={responsivePaddingSmall}
            paddingRight={responsivePaddingSmall}
            backgroundColor={ettlevColors.white}
            $style={{
              boxShadow: stickyFooterStyle ? '0px -4px 4px rgba(0, 0, 0, 0.12)' : '',
              zIndex: 3,
            }}
            className="krav-list-button-container"
          >
            <Button
              size="compact"
              kind="secondary"
              onClick={() => {
                refresh()
                onClose()
              }}
              disabled={loading}
            >
              Abryt
            </Button>
            <Button size="compact" onClick={p.submitForm} disabled={loading} marginLeft>
              Lagre
            </Button>
          </Block>
        </CustomizedModal>
      )}
    </Formik>
  )
}

const CustomDragHandle = (isDragged: boolean) => {
  return (
    <Block
      $style={{
        display: 'flex',
        alignItems: 'center',
        marginRight: '1em',
      }}
    >
      <FontAwesomeIcon icon={faGripVertical} aria-label={'Dra og slipp håndtak'} color={isDragged ? ettlevColors.green800 : ettlevColors.grey200} />
    </Block>
  )
}
