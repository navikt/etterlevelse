import { Block } from 'baseui/block'
import { Drawer } from 'baseui/drawer'
import { FormControl } from 'baseui/form-control'
import { HeadingXLarge, ParagraphMedium } from 'baseui/typography'
import { Form, Formik, FormikProps } from 'formik'
import { EtterlevelseMetadata } from '../../constants'
import { useDebouncedState } from '../../util/hooks'
import TextEditor from '../common/TextEditor/TextEditor'
import { notesIcon } from '../Images'
import Button from '../common/Button'
import { ettlevColors } from '../../util/theme'
import { createEtterlevelseMetadata, updateEtterlevelseMetadata } from '../../api/EtterlevelseMetadataApi'
import React, { useEffect, useState } from 'react'
import AlertUnsavedPopup from '../common/AlertUnsavedPopup'

type EditNotatfeltProps = {
  isOpen: boolean
  setIsNotatfeltOpen: Function
  etterlevelseMetadata: EtterlevelseMetadata
  setEtterlevelseMetadata: React.Dispatch<React.SetStateAction<EtterlevelseMetadata>>
  formRef?: React.RefObject<any>
}

export const EditNotatfelt = ({ isOpen, setIsNotatfeltOpen, etterlevelseMetadata, setEtterlevelseMetadata, formRef }: EditNotatfeltProps) => {
  const debounceDelay = 500
  const [notater, setNotater] = useDebouncedState(etterlevelseMetadata.notater || '', debounceDelay)
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false)

  useEffect(() => {
    if (notater !== etterlevelseMetadata.notater) {
      setIsFormDirty(true)
    } else {
      setIsFormDirty(false)
    }
  }, [notater])

  const submit = (values: EtterlevelseMetadata) => {
    if (etterlevelseMetadata.id === 'ny') {
      createEtterlevelseMetadata({ ...values, notater: notater }).then((resp) => {
        setEtterlevelseMetadata(resp)
        setIsFormDirty(false)
      })
    } else {
      updateEtterlevelseMetadata({ ...values, notater: notater }).then((resp) => {
        setEtterlevelseMetadata(resp)
        setIsFormDirty(false)
      })
    }
    setIsNotatfeltOpen(false)
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => {
        if (!isFormDirty) {
          setNotater(etterlevelseMetadata.notater || '')
          setIsNotatfeltOpen(false)
        } else {
          setIsAlertModalOpen(true)
        }
      }}
      onEscapeKeyDown={() => {
        if (!isFormDirty) {
          setNotater(etterlevelseMetadata.notater || '')
          setIsNotatfeltOpen(false)
        } else {
          setIsAlertModalOpen(true)
        }
      }}
    >
      <Formik
        onSubmit={(values) => {
          submit(values)
        }}
        innerRef={formRef}
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={etterlevelseMetadata}
      >
        {({ values, errors }: FormikProps<EtterlevelseMetadata>) => (
          <Form>
            <AlertUnsavedPopup
              isActive={isFormDirty}
              isModalOpen={isAlertModalOpen}
              setIsModalOpen={setIsAlertModalOpen}
              onClose={() => {
                setIsFormDirty(false)
                setNotater(etterlevelseMetadata.notater || '')
                setIsNotatfeltOpen(false)
              }}
              onSubmit={() => submit(values)}
            />
            <Block>
              <Block display="flex" alignItems="center" marginBottom="23px" marginTop="">
                <img src={notesIcon} alt="notat ikon" />
                <HeadingXLarge $style={{ lineHeight: '24px', marginLeft: '8px', marginTop: '0px', marginBottom: '0px' }}>Arbeidsnotat</HeadingXLarge>
              </Block>

              <Block marginBottom="24px">
                <ParagraphMedium $style={{ marginTop: '0px', marginBottom: '0px' }}>Notatet er kun for internt bruk, og ikke en del av dokumentasjonen</ParagraphMedium>
              </Block>

              <FormControl>
                <TextEditor initialValue={notater} setValue={setNotater} height={'350px'} errors={errors} simple />
              </FormControl>
              <Button
                type={'button'}
                variant="tertiary"
                onClick={() => {
                  setIsFormDirty(false)
                  setNotater(etterlevelseMetadata.notater || '')
                  setIsNotatfeltOpen(false)
                }}
              >
                <ParagraphMedium margin={0} padding={0}>
                  Lukk uten å lagre
                </ParagraphMedium>
              </Button>
              <Button type={'submit'}>
                <ParagraphMedium margin={0} padding={0} color={ettlevColors.green50}>
                  Lagre og lukk
                </ParagraphMedium>
              </Button>
            </Block>
          </Form>
        )}
      </Formik>
    </Drawer>
  )
}
export default EditNotatfelt
