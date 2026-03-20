'use client'

import {
  Alert,
  FileObject,
  FileRejected,
  FileRejectionReason,
  FileUpload,
  Heading,
  VStack,
} from '@navikt/ds-react'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

const MAX_FILES = 10
const MAX_SIZE_MB = 5
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024

const errors: Record<FileRejectionReason, string> = {
  fileType: 'Filformatet støttes ikke',
  fileSize: `Filen er større enn ${MAX_SIZE_MB} MB`,
}

interface IProps {
  initialValues: File[]
  rejectedFiles: FileRejected[]
  setRejectedFiles: Dispatch<SetStateAction<FileRejected[]>>
  setFilesToUpload: Dispatch<SetStateAction<File[]>>
}

export const CustomFileUpload = (props: IProps) => {
  const ref = useRef<HTMLInputElement>(null)
  const { initialValues, rejectedFiles, setRejectedFiles, setFilesToUpload } = props
  const [files, setFiles] = useState<FileObject[]>(() =>
    initialValues.map((initialFile) => ({ file: initialFile, error: false }))
  )
  const acceptedFiles = files.filter((file) => !file.error)
  const [fileUploadAlert, setFileUploadAlert] = useState<boolean>(false)
  const [fileUploadError, setFileUploadError] = useState<boolean>(false)
  const [fileDeleteAlert, setFileDeleteAlert] = useState<boolean>(false)

  const syncRejectedFiles = (nextFiles: FileObject[]) => {
    const rejected = nextFiles.filter((f): f is FileRejected => f.error)
    setRejectedFiles(rejected)
    setFileUploadError(rejected.length !== 0)
  }

  const removeFile = (fileToRemove: FileObject) => {
    const nextFiles = files.filter((file) => file !== fileToRemove)
    setFiles(nextFiles)
    setFilesToUpload(nextFiles.map((file) => file.file))
    syncRejectedFiles(nextFiles)
    setFileDeleteAlert(true)
  }

  const getErrorMessage = (message: string): string => {
    if (message === 'fileType' || message === 'fileSize') {
      return errors[message as FileRejectionReason]
    } else {
      return message
    }
  }

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.focus()
    }
  }, [files])

  return (
    <VStack gap='space-6'>
      <FileUpload.Dropzone
        ref={ref}
        label='Last opp behandlingens livsløp'
        description={`Følgende filformater er tillatt: PDF, PNG, JPG og JPEG. Du kan laste opp maks 4 filer. Filstørrelse pr. fil må være mindre enn ${MAX_SIZE_MB} MB.`}
        accept='.png,.jpeg,.pdf,.jpg'
        maxSizeInBytes={MAX_SIZE}
        fileLimit={{ max: MAX_FILES, current: acceptedFiles.length }}
        validator={(file: File) => {
          if (files.map((file) => file.file.name).includes(file.name)) {
            return 'Filen er allerede lastet opp'
          }
          if (file.size === 0) {
            return 'Ugyldig filestørrelse: 0 MB'
          }
          return true
        }}
        onSelect={(newFiles: FileObject[]) => {
          setFileUploadAlert(false)
          const nextFiles = [...files, ...newFiles]
          setFiles(nextFiles)
          setFilesToUpload(nextFiles.map((file) => file.file))
          syncRejectedFiles(nextFiles)
          setFileUploadAlert(true)
        }}
      />

      {fileUploadAlert && (
        <Alert
          role='status'
          variant={fileUploadError ? 'error' : 'success'}
          closeButton
          onClose={() => {
            setFileUploadAlert(false)
            setFileUploadError(false)
          }}
        >
          {fileUploadError
            ? 'Filopplasting har feilet. Sjekk at du har riktig filformat og prøv igjen. Passende filformater er PNG, PDF, JPG eller JPG.'
            : 'Filen din er lastet opp.'}
        </Alert>
      )}

      {fileDeleteAlert && (
        <Alert
          role='status'
          variant='success'
          closeButton
          onClose={() => {
            setFileDeleteAlert(false)
          }}
        >
          Filen din ble slettet.
        </Alert>
      )}

      {acceptedFiles.length > 0 && (
        <VStack gap='space-2'>
          <Heading level='3' size='xsmall'>
            {`Vedlegg (${acceptedFiles.length})`}
          </Heading>
          <VStack as='ul' gap='space-4'>
            {acceptedFiles.map((file, index) => (
              <FileUpload.Item
                as='li'
                key={file.file.name + '_' + index}
                file={file.file}
                button={{
                  action: 'delete',
                  onClick: () => {
                    removeFile(file)
                  },
                }}
              />
            ))}
          </VStack>
        </VStack>
      )}
      {rejectedFiles.length > 0 && (
        <VStack gap='space-2'>
          <Heading level='3' size='xsmall' id='vedleggMedFeil'>
            Vedlegg med feil
          </Heading>
          <VStack as='ul' gap='space-4'>
            {rejectedFiles.map((rejected, index) => (
              <FileUpload.Item
                as='li'
                key={index}
                file={rejected.file}
                button={{
                  action: 'delete',
                  onClick: () => {
                    removeFile(rejected)
                  },
                }}
                error={getErrorMessage(rejected.reasons[0])}
              />
            ))}
          </VStack>
        </VStack>
      )}
    </VStack>
  )
}

export default CustomFileUpload
