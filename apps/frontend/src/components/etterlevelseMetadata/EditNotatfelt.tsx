import { Block } from "baseui/block"
import { Drawer } from "baseui/drawer"
import { FormControl } from "baseui/form-control"
import { HeadingXLarge, ParagraphMedium } from "baseui/typography"
import { Formik, FormikProps } from "formik"
import { EtterlevelseMetadata } from "../../constants"
import { useDebouncedState } from "../../util/hooks"
import LabelWithToolTip from "../common/LabelWithTooltip"
import TextEditor from "../common/TextEditor/TextEditor"
import { notesIcon } from "../Images"

type EditNotatfeltProps = {
  isOpen: boolean,
  onClose: Function,
  etterlevelseMetadata: EtterlevelseMetadata
  formRef?: React.RefObject<any>
}

export const EditNotatfelt = ({ isOpen, onClose, etterlevelseMetadata, formRef }: EditNotatfeltProps) => {

  const debounceDelay = 500
  const [notater, setNotater] = useDebouncedState(etterlevelseMetadata.notater || '', debounceDelay)

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => onClose()}
      onEscapeKeyDown={() => onClose()}
    >
      <Formik
        onSubmit={() => { }}
        innerRef={formRef}
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={etterlevelseMetadata}
      >
        {({ errors }: FormikProps<EtterlevelseMetadata>) => (
          <Block>
            <Block display="flex" alignItems="center" marginBottom="23px" marginTop="">
              <img src={notesIcon} alt="notat ikon" />
              <HeadingXLarge $style={{ lineHeight: '24px', marginLeft: '8px', marginTop: '0px', marginBottom: '0px' }}>Arbeidsnotat</HeadingXLarge>
            </Block>

            <Block marginBottom="24px">
              <ParagraphMedium $style={{ marginTop: '0px', marginBottom: '0px' }}>
                Notatet er kun for internt bruk, og ikke en del av dokumentasjonen
              </ParagraphMedium>
            </Block>

            <FormControl>
              <TextEditor initialValue={notater} setValue={setNotater} height={'610px'} errors={errors} simple />
            </FormControl>
          </Block>
        )}
      </Formik>
    </Drawer>
  )

}
export default EditNotatfelt