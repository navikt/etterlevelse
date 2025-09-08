import { RearrangeButtons } from '@/components/common/rearrangeButtons/rearrangeButtons'
import StatusView from '@/components/common/statusTag/StatusTag'
import { IKrav } from '@/constants/krav/kravConstants'
import { BodyShort, Box, Label } from '@navikt/ds-react'
import { FieldArrayRenderProps } from 'formik'
import moment from 'moment'
import { FunctionComponent } from 'react'

type TProps = {
  krav: IKrav
  index: number
  arrayLength: number
  fieldArrayRenderProps: FieldArrayRenderProps
}

export const KravPriorityPanel: FunctionComponent<TProps> = ({
  krav,
  index,
  arrayLength,
  fieldArrayRenderProps,
}) => {
  const updateIndex = (newIndex: number) => {
    const suksesskriterieToMove = fieldArrayRenderProps.form.values.krav[index]
    fieldArrayRenderProps.remove(index)
    fieldArrayRenderProps.insert(newIndex, suksesskriterieToMove)
  }

  return (
    <div className='border-t border-icon-subtle'>
      <Box className='w-full flex' padding='2'>
        <div className='w-8 flex justify-center items-center border-r border-icon-subtle mr-1'>
          <BodyShort>{index + 1}.</BodyShort>
        </div>
        <div className='max-w-lg w-full'>
          <BodyShort>
            K{krav.kravNummer}.{krav.kravVersjon}
          </BodyShort>
          <Label>{krav.navn}</Label>
        </div>
        <div className='flex flex-col items-end w-full justify-center max-w-md'>
          <div className='flex items-center'>
            <StatusView status={krav.status} />
            <div className='w-44 ml-2.5'>
              <BodyShort size='small'>
                {`Sist endret: ${moment(krav.changeStamp.lastModifiedDate).format('LL')}`}
              </BodyShort>
            </div>
          </div>
        </div>
        <div className='flex flex-1 justify-end items-center '>
          <RearrangeButtons
            label='krav'
            index={index}
            arrayLength={arrayLength}
            updateIndex={updateIndex}
          />
        </div>
      </Box>
    </div>
  )
}
