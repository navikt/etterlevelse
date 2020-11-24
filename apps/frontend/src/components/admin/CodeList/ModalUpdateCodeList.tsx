import * as React from "react";
import {Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE} from "baseui/modal";

import {Field, FieldProps, Form, Formik,} from "formik";

import {Button, KIND} from "baseui/button";
import {Block, BlockProps} from "baseui/block";
import {Label2} from "baseui/typography";
import {Textarea} from "baseui/textarea";
import {Input, SIZE as InputSIZE} from "baseui/input";
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

type ModalUpdateProps = {
  title: string,
  initialValues: CodeListFormValues,
  isOpen: boolean,
  errorOnUpdate: any | undefined,
  onClose: () => void,
  submit: (process: CodeListFormValues) => Promise<void>,
};

const UpdateCodeListModal = ({title, initialValues, errorOnUpdate, isOpen, onClose, submit}: ModalUpdateProps) => {
  return (
    <Modal
      onClose={onClose}
      closeable
      isOpen={isOpen}
      animate
      autoFocus
      unstable_ModalBackdropScroll={true}
      size={SIZE.auto}
      role={ROLE.dialog}
    >
      <Block {...modalBlockProps}>
        <Formik
          onSubmit={(values) => {
            submit(values);
            onClose();
          }}
          initialValues={{...initialValues}}
          validationSchema={codeListSchema()}
          render={(formik) => (
            <Form>
              <ModalHeader>{title}</ModalHeader>
              <ModalBody>
                <Block {...rowBlockProps}>
                  <Label2 marginRight={"1rem"} width="25%">
                    Short name:
                  </Label2>
                  <Field
                    name="shortName"
                    render={({field}: FieldProps<CodeListFormValues>) => (
                      <Input
                        name="shortName"
                        value={formik.values.shortName}
                        onChange={formik.handleChange}
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
                    render={({field}: FieldProps<CodeListFormValues>) => (
                      <Textarea
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        type="input"
                      />
                    )}
                  />
                </Block>
                <Error fieldName="description"/>
              </ModalBody>
              <ModalFooter>
                <Block display="flex" justifyContent="flex-end">
                  <Block marginRight="auto">{errorOnUpdate && <p>{errorOnUpdate}</p>}</Block>
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

export default UpdateCodeListModal;
