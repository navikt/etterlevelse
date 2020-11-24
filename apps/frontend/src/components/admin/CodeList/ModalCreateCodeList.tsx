import * as React from "react";
import {Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE} from "baseui/modal";
import {Block, BlockProps} from "baseui/block";
import {Label2} from "baseui/typography";
import {Field, FieldProps, Form, Formik} from "formik";
import {Input, SIZE as InputSIZE} from "baseui/input";
import {Textarea} from "baseui/textarea";
import {Button, KIND} from "baseui/button";
import {CodeListFormValues, codeListSchema} from '../../../services/Codelist'
import {Error} from '../../common/ModalSchema'

const modalBlockProps: BlockProps = {
  width: '700px',
  paddingRight: '2rem',
  paddingLeft: '2rem'
};

const rowBlockProps: BlockProps = {
  display: 'flex',
  width: '100%',
  marginTop: '1rem',
  alignItems: 'center',
};

type ModalCreateProps = {
  title: string,
  list: string,
  isOpen: boolean,
  errorOnCreate: any | undefined,
  submit: (code: CodeListFormValues) => Promise<void>,
  onClose: () => void,
};

const CreateCodeListModal = ({isOpen, title, list, errorOnCreate, onClose, submit}: ModalCreateProps) => {
  return (
    <Modal
      closeable
      animate
      autoFocus
      size={SIZE.auto}
      role={ROLE.dialog}
      isOpen={isOpen}
      unstable_ModalBackdropScroll={true}
      onClose={() => onClose()}
    >
      <Block {...modalBlockProps}>
        <Formik
          onSubmit={(values) => {
            submit(values);
            onClose();
          }}
          initialValues={
            {
              list: list,
              code: "",
              shortName: "",
              description: "",
            }
          }
          validationSchema={codeListSchema()}
          render={(formik) => (
            <Form>
              <ModalHeader>{title}</ModalHeader>
              <ModalBody>
                <Block {...rowBlockProps}>
                  <Label2 marginRight={"1rem"} width="25%">
                    Code:
                  </Label2>
                  <Field
                    name="code"
                    render={({field}: FieldProps) => (
                      <Input
                        {...field}
                        type="input"
                        size={InputSIZE.default}
                      />
                    )}
                  />
                </Block>
                <Error fieldName="code"/>

                <Block {...rowBlockProps}>
                  <Label2 marginRight={"1rem"} width="25%">
                    Short name:
                  </Label2>
                  <Field
                    name="shortName"
                    render={({field}: FieldProps) => (
                      <Input
                        {...field}
                        type="input"
                        size={InputSIZE.default}
                      />
                    )}
                  />
                </Block>
                <Error fieldName="shortName"/>

                <Block {...rowBlockProps}>
                  <Label2 marginRight={"1rem"} width="25%">
                    Description:
                  </Label2>
                  <Field
                    name="description"
                    render={({field}: FieldProps) => (
                      <Textarea
                        {...field}
                        type="input"
                      />
                    )}
                  />
                </Block>
                <Error fieldName="description"/>

              </ModalBody>
              <ModalFooter>
                <Block display="flex" justifyContent="flex-end">
                  <Block marginRight="auto">{errorOnCreate && <p>{errorOnCreate}</p>}</Block>
                  <Button
                    type="button"
                    kind={KIND.secondary}
                    onClick={() => onClose()}
                  >
                    Avbryt
                  </Button>
                  <ModalButton type="submit">
                    Lagre
                  </ModalButton>
                </Block>
              </ModalFooter>
            </Form>
          )}
        />
      </Block>
    </Modal>
  );
};

export default CreateCodeListModal;
