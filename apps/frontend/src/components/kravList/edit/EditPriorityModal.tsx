import { faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Loader } from '@navikt/ds-react'
import { Block } from 'baseui/block'

/* TODO USIKKER */
import { List, arrayMove } from 'baseui/dnd-list'
import { HeadingXLarge, HeadingXXLarge, LabelSmall, ParagraphMedium } from 'baseui/typography'
import { FieldArray, Form, Formik } from 'formik'
import moment from 'moment'
import React, { ReactElement, useEffect } from 'react'
import {
  createKravPriority,
  kravMapToKravPrioriting,
  updateKravPriority,
} from '../../../api/KravPriorityApi'
import { IKrav } from '../../../constants'
import { ettlevColors, responsivePaddingSmall } from '../../../util/theme'
import AlertUnsavedPopup from '../../common/AlertUnsavedPopup'
import Button from '../../common/Button'
import { CustomPanelDivider } from '../../common/CustomizedAccordion'
import CustomizedModal from '../../common/CustomizedModal'
import { FieldWrapper } from '../../common/Inputs'
import { SimplePanel } from '../../common/PanelLink'
import StatusView from '../../common/StatusTag'
import { borderRadius, borderStyle, paddingZero } from '../../common/Style'

export const kravListPriorityModal = () => document.querySelector('#krav-list-edit-priority-modal')

interface IPropsEditPriorityModal {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  kravListe: IKrav[]
  tema: string
  refresh: () => void
}

export const EditPriorityModal = (props: IPropsEditPriorityModal) => {
  const { isOpen, setIsOpen, kravListe, tema, refresh } = props
  const [items, setItems] = React.useState<ReactElement[]>([])
  const [kravElements, setKravElements] = React.useState<IKrav[]>(kravListe)
  const [loading, setLoading] = React.useState(false)
  const [stickyFooterStyle, setStickyFooterStyle] = React.useState(false)

  const [isFormDirty, setIsFormDirty] = React.useState(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = React.useState(false)

  useEffect(() => {
    setItems(
      kravListe.map((k, i) => (
        <CustomPanelDivider key={k.kravNummer + '_' + i} fullWidth>
          <SimplePanel
            key={`${k.navn}_${k.kravNummer}`}
            hideChevron
            title={
              <ParagraphMedium
                $style={{
                  fontSize: '14px',
                  marginBottom: '0px',
                  marginTop: '0px',
                  lineHeight: '15px',
                }}
              >
                K{k.kravNummer}.{k.kravVersjon}
              </ParagraphMedium>
            }
            beskrivelse={
              <LabelSmall $style={{ fontSize: '18px', lineHeight: '28px' }}>{k.navn}</LabelSmall>
            }
            rightBeskrivelse={
              k.changeStamp.lastModifiedDate !== undefined && k.changeStamp.lastModifiedDate !== ''
                ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}`
                : ''
            }
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
      ))
    )
  }, [kravListe])

  useEffect(() => {
    if (!isOpen) {
      setStickyFooterStyle(false)
      return
    }

    const listener = (event: any) => {
      const buttonPosition =
        document.querySelector('.krav-list-button-container')?.clientHeight || 0
      if (
        event.target.scrollTop <=
        event.target.scrollHeight - event.target.clientHeight - buttonPosition
      ) {
        setStickyFooterStyle(true)
      } else {
        setStickyFooterStyle(false)
      }
    }

    setTimeout(() => kravListPriorityModal()?.addEventListener('scroll', listener), 200)
    return () => kravListPriorityModal()?.removeEventListener('scroll', listener)
  }, [isOpen])

  const setPriority = (kravListe: IKrav[]) => {
    const pattern = new RegExp(tema.substr(0, 3).toUpperCase() + '[0-9]+')

    return kravListe.map((k, i) => {
      const index: number = i + 1
      if (!k.prioriteringsId) {
        return {
          ...k,
          prioriteringsId: tema.substr(0, 3).toUpperCase() + index,
        }
      } else {
        if (k.prioriteringsId?.match(pattern)) {
          return {
            ...k,
            prioriteringsId: k.prioriteringsId.replace(
              pattern,
              tema.substr(0, 3).toUpperCase() + index
            ),
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

  const submit = () => {
    setLoading(true)
    setIsFormDirty(false)
    const updateKravPriorityPromise: Promise<any>[] = []
    const kravMedPrioriteting = setPriority([...kravElements])
    kravMedPrioriteting.forEach((kmp) => {
      if (kmp.kravPriorityUID) {
        updateKravPriorityPromise.push(
          (async () => await updateKravPriority(kravMapToKravPrioriting(kmp)))()
        )
      } else {
        updateKravPriorityPromise.push(
          (async () => await createKravPriority(kravMapToKravPrioriting(kmp)))()
        )
      }
    })
    try {
      Promise.all(updateKravPriorityPromise).then(() => {
        setLoading(false)
        refresh()
        setIsOpen(false)
      })
    } catch (error: any) {
      console.error(error)
    }
  }

  const close = () => {
    setIsFormDirty(false)
    setIsOpen(false)
  }

  return (
    <>
      <AlertUnsavedPopup
        isModalOpen={isAlertModalOpen}
        setIsModalOpen={setIsAlertModalOpen}
        onClose={() => close()}
        onSubmit={() => submit()}
      />
      <Formik
        initialValues={{
          krav: kravElements,
        }}
        onSubmit={() => submit()}
      >
        {(p) => (
          <CustomizedModal
            isOpen={isOpen}
            onClose={() => {
              if (isFormDirty) {
                setIsAlertModalOpen(true)
              } else {
                close()
              }
            }}
            size="auto"
            closeable
            closeIconColor={ettlevColors.white}
            overrides={{
              Root: {
                props: {
                  id: 'krav-list-edit-priority-modal',
                },
                style: {
                  zIndex: 5,
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
              className="mb-14 pt-6 pb-12"
              backgroundColor={ettlevColors.green800}
              paddingLeft={responsivePaddingSmall}
              paddingRight={responsivePaddingSmall}
            >
              <HeadingXXLarge $style={{ lineHeight: '48px', color: ettlevColors.white }}>
                Justere rekkefølgen på krav
              </HeadingXXLarge>
            </Block>
            <Block
              className="flex justify-center"
              paddingLeft={responsivePaddingSmall}
              paddingRight={responsivePaddingSmall}
            >
              <div className="flex justify-start flex-1">
                <HeadingXLarge
                  $style={{
                    lineHeight: '24px',
                    color: ettlevColors.green600,
                    marginTop: '0px',
                    marginBottom: '0px',
                  }}
                >
                  {tema}
                </HeadingXLarge>
              </div>
              <div className="flex justify-end flex-1">
                <ParagraphMedium
                  $style={{ marginTop: '0px', marginBottom: '0px', color: ettlevColors.green800 }}
                >
                  Klikk og dra kravene i ønsket rekkefølge
                </ParagraphMedium>
              </div>
            </Block>
            <div>
              {loading ? (
                <div className="flex justify-center">
                  <Loader size="large" />
                </div>
              ) : (
                <Form>
                  <FieldWrapper>
                    <FieldArray name="krav">
                      {() => (
                        <List
                          items={items}
                          onChange={({ oldIndex, newIndex }) => {
                            setItems(arrayMove(items, oldIndex, newIndex))
                            setKravElements(arrayMove(kravElements, oldIndex, newIndex))
                            setIsFormDirty(true)
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
                                zIndex: 10,
                              },
                            },
                          }}
                        />
                      )}
                    </FieldArray>
                  </FieldWrapper>
                </Form>
              )}
            </div>
            <Block
              position="sticky"
              paddingLeft={responsivePaddingSmall}
              paddingRight={responsivePaddingSmall}
              $style={{
                boxShadow: stickyFooterStyle ? '0px -4px 4px rgba(0, 0, 0, 0.12)' : '',
                zIndex: 3,
              }}
              className="flex justify-end bottom-0 pt-4 pb-6 krav-list-button-container bg-white"
            >
              <Button
                type="button"
                size="compact"
                kind="secondary"
                onClick={() => {
                  refresh()
                  close()
                }}
                disabled={loading}
              >
                Avbryt
              </Button>
              <Button
                type="button"
                size="compact"
                onClick={p.submitForm}
                disabled={loading}
                marginLeft
              >
                Lagre
              </Button>
            </Block>
          </CustomizedModal>
        )}
      </Formik>
    </>
  )
}

const CustomDragHandle = (isDragged: boolean) => (
  <div className="flex items-center mr-4">
    <FontAwesomeIcon
      icon={faGripVertical}
      aria-label="Dra og slipp håndtak"
      color={isDragged ? ettlevColors.green800 : ettlevColors.grey200}
    />
  </div>
)
