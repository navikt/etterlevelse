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
import { padding } from '../common/Style'
import { createEtterlevelseMetadata, updateEtterlevelseMetadata } from '../../api/EtterlevelseMetadataApi'

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

  return (
    <Drawer isOpen={isOpen} onClose={() => setIsNotatfeltOpen(false)} onEscapeKeyDown={() => setIsNotatfeltOpen(false)}>
      <Formik
        onSubmit={(values) => {
          if (etterlevelseMetadata.id === 'ny') {
            createEtterlevelseMetadata({ ...values, notater: notater }).then((resp) => {
              setEtterlevelseMetadata(resp)
            })
          } else {
            updateEtterlevelseMetadata({ ...values, notater: notater }).then((resp) => {
              setEtterlevelseMetadata(resp)
            })
          }
          setIsNotatfeltOpen(false)
        }}
        innerRef={formRef}
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={etterlevelseMetadata}
      >
        {({ errors }: FormikProps<EtterlevelseMetadata>) => (
          <Form>
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
                kind={'underline-hover'}
                onClick={() => setIsNotatfeltOpen(false)}
                $style={{
                  ':hover': { backgroundColor: ettlevColors.green50 },
                  ...padding('8px', '16px'),
                  fontWeight: '600',
                  marginRight: '35px',
                }}
              >
                <ParagraphMedium margin={0} padding={0}>
                  Lukk uten å lagre
                </ParagraphMedium>
              </Button>
              <Button
                type={'submit'}
                $style={{
                  ...padding('8px', '16px'),
                  fontWeight: '700',
                  fontStyle: 'bold',
                }}
              >
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
