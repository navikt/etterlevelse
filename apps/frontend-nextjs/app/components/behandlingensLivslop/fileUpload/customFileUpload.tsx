'use client'

import {
  FileObject,
  FileRejected,
  FileRejectionReason,
  FileUpload,
  Heading,
  LocalAlert,
  VStack,
} from '@navikt/ds-react'
import { Dispatch, SetStateAction, useEffect, useId, useRef, useState } from 'react'

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

const CustomFileUpload = (props: IProps) => {
  const fileSelectButtonId = useId()
  const restoreFocus = useRef(false)
  const { initialValues, rejectedFiles, setRejectedFiles, setFilesToUpload } = props
  const [files, setFiles] = useState<FileObject[]>([])
  const acceptedFiles = files.filter((file) => !file.error)
  const [fileAlert, setFileAlert] = useState<{ message: string; isError: boolean }>()
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (initialValues) {
      const initialFiles: FileObject[] = []
      initialValues.forEach((initialFile) => {
        initialFiles.push({ file: initialFile, error: false })
      })
      setFiles(initialFiles)
      setFilesToUpload(initialValues)
    }
  }, [initialValues])

  useEffect(() => {
    setRejectedFiles(files.filter((f): f is FileRejected => f.error))
  }, [files])

  useEffect(() => {
    const timeout = setTimeout(() => setAnnouncement(fileAlert?.message ?? ''), 100)
    return () => clearTimeout(timeout)
  }, [fileAlert])

  const removeFile = (fileToRemove: FileObject, button: HTMLButtonElement) => {
    restoreFocus.current = button === document.activeElement
    const remainingFiles = files.filter((file) => file !== fileToRemove)
    setFiles(remainingFiles)
    setFilesToUpload(remainingFiles.map((file) => file.file))
    setAnnouncement('')
    setFileAlert({ message: 'Filen er fjernet fra listen.', isError: false })
  }

  const getErrorMessage = (message: string): string => {
    if (message === 'fileType' || message === 'fileSize') {
      return errors[message]
    } else {
      return message
    }
  }

  useEffect(() => {
    if (restoreFocus.current) {
      document.getElementById(fileSelectButtonId)?.focus()
      restoreFocus.current = false
    }
  }, [files, fileSelectButtonId])

  return (
    <VStack gap='space-6'>
      <FileUpload.Dropzone
        id={fileSelectButtonId}
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
          if (newFiles.length === 0) {
            return
          }
          const isError = newFiles.some((file) => file.error)
          const message = isError
            ? 'Filopplasting har feilet.'
            : 'Valgte filer er lagt til. Velg Lagre for å lagre endringene.'

          setFiles([...files, ...newFiles])
          setFilesToUpload([
            ...files.map((file) => file.file),
            ...newFiles.map((newFile) => newFile.file),
          ])
          setAnnouncement('')
          setFileAlert({ isError, message })
        }}
      />

      {fileAlert && (
        <LocalAlert
          status={fileAlert.isError ? 'error' : 'success'}
          role='region'
          aria-label='Filvedlegg'
        >
          <LocalAlert.Header>
            <LocalAlert.Title>{fileAlert.message}</LocalAlert.Title>
            <LocalAlert.CloseButton
              onClick={() => {
                setAnnouncement('')
                setFileAlert(undefined)
              }}
            />
          </LocalAlert.Header>
        </LocalAlert>
      )}

      <div role='alert' aria-atomic='true' className='sr-only'>
        {fileAlert?.isError ? announcement : ''}
      </div>
      <div role='status' aria-atomic='true' className='sr-only'>
        {fileAlert && !fileAlert.isError ? announcement : ''}
      </div>

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
                  onClick: (event) => {
                    removeFile(file, event.currentTarget)
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
                  onClick: (event) => {
                    removeFile(rejected, event.currentTarget)
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
