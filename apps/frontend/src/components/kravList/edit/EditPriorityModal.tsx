import {Krav} from '../../../constants'
import React, {ReactElement, useEffect} from 'react'
import {FieldArray, Form, Formik} from 'formik'
import {FieldWrapper} from '../../common/Inputs'
import {arrayMove, List} from 'baseui/dnd-list'
import moment from 'moment'
import StatusView from '../../common/StatusTag'
import {paddingZero} from '../../common/Style'
import {Block} from 'baseui/block'
import {ettlevColors} from '../../../util/theme'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGripVertical} from '@fortawesome/free-solid-svg-icons'
import {createKravPriority, kravMapToKravPrioriting, updateKravPriority} from '../../../api/KravPriorityApi'
import AlertUnsavedPopup from '../../common/AlertUnsavedPopup'
import {BodyLong, BodyShort, Box, Button, Heading, Label, Loader, Modal, Spacer} from '@navikt/ds-react'

export const kravListPriorityModal = () => document.querySelector('#krav-list-edit-priority-modal')

export const EditPriorityModal = (props: { isOpen: boolean; setIsOpen: React.Dispatch<React.SetStateAction<boolean>>; kravListe: Krav[]; tema: string; refresh: Function }) => {
  const {isOpen, setIsOpen, kravListe, tema, refresh} = props
  const [items, setItems] = React.useState<ReactElement[]>([])
  const [kravElements, setKravElements] = React.useState<Krav[]>(kravListe)
  const [loading, setLoading] = React.useState(false)
  const [stickyFooterStyle, setStickyFooterStyle] = React.useState(false)

  const [isFormDirty, setIsFormDirty] = React.useState(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = React.useState(false)

  useEffect(() => {
    setItems(
      kravListe.map((k) => {
        return (
          <div className={"w-full"}>
            <Box key={`${k.navn}_${k.kravNummer}`} className={"w-full flex items-center"}>
              <div className="max-w-xl">
                <BodyShort size="small">
                  K{k.kravNummer}.{k.kravVersjon}
                </BodyShort>
                <BodyLong><Label>{k.navn}</Label></BodyLong>
              </div>
              <Spacer/>
              <div className="mr-5">
                <StatusView status={k.status}/>
              </div>
              <div className="w-44">
                <BodyShort size="small">{!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}</BodyShort>
              </div>
            </Box>
          </div>
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

  const submit = () => {
    setLoading(true)
    setIsFormDirty(false)
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
        setIsOpen(false)
      })
    } catch (error: any) {
      console.log(error)
    }
  }

  const close = () => {
    setIsFormDirty(false)
    setIsOpen(false)
  }

  return (
    <>
      <AlertUnsavedPopup isActive={isFormDirty} isModalOpen={isAlertModalOpen} setIsModalOpen={setIsAlertModalOpen} onClose={() => close()} onSubmit={() => submit()}/>
      <Formik
        initialValues={{
          krav: kravElements,
        }}
        onSubmit={() => submit()}
      >
        {(p) => (
          <Modal
            open={isOpen}
            onClose={() => {
              if (isFormDirty) {
                setIsAlertModalOpen(true)
              } else {
                close()
              }
            }}
            width={1196}
          >
              <Modal.Header>
                <Heading level="1" size="large" id="modal-heading">
                  Justere rekkefølgen på krav
                </Heading>
                <div className={"flex justify-center"}>
                  <div className={"flex justify-start flex-1"}>
                    <Heading size={"medium"}>{tema}</Heading>
                  </div>
                  <div className={"flex justify-end flex-1"}>
                    <BodyShort size={"medium"}>Klikk og dra kravene i ønsket rekkefølge</BodyShort>
                  </div>
                </div>
              </Modal.Header>
            <Modal.Body>
              {loading ? (
                <div className={"flex justify-center"}>
                  <Loader size="large"/>
                </div>
              ) : (
                <Form>
                  <FieldWrapper>
                    <FieldArray name={'krav'}>
                      {(p) => (
                        <List
                          items={items}
                          onChange={({oldIndex, newIndex}) => {
                            setItems(arrayMove(items, oldIndex, newIndex))
                            setKravElements(arrayMove(kravElements, oldIndex, newIndex))
                            setIsFormDirty(true)
                          }}
                          overrides={{
                            DragHandle: ({$isDragged}) => {
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
            </Modal.Body>
            <Modal.Footer className="krav-list-button-container flex justify-end sticky">
              <Button
                size={"medium"}
                variant="secondary"
                onClick={() => {
                  refresh()
                  close()
                }}
                disabled={loading}
              >
                Avbryt
              </Button>
              <Button size={"medium"} onClick={p.submitForm} disabled={loading}>
                Lagre
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Formik>
    </>
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
      <FontAwesomeIcon icon={faGripVertical} aria-label={'Dra og slipp håndtak'} color={isDragged ? ettlevColors.green800 : ettlevColors.grey200}/>
    </Block>
  )
}
