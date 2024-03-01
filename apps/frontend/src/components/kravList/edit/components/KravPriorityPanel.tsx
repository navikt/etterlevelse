import { BodyShort, Box, Label } from '@navikt/ds-react'
import { FieldArrayRenderProps } from 'formik'
import moment from 'moment'
import { useState } from 'react'
import { IKrav } from '../../../../constants'
import { RearrangeButtons } from '../../../common/RearrangeButtons'
import StatusView from '../../../common/StatusTag'

interface IProps {
  krav: IKrav
  index: number
  arrayLength: number
  p: FieldArrayRenderProps
}

export const KravPriorityPanel = (props: IProps) => {
  const { krav, index, arrayLength, p } = props

  const [plassering, setPlassering] = useState<string>((index + 1).toString())

  const updateIndex = (newIndex: number) => {
    const suksesskriterieToMove = p.form.values.krav[index]
    p.remove(index)
    p.insert(newIndex, suksesskriterieToMove)
  }

  return (
    <div className="border-t border-icon-subtle">
      <Box className="w-full flex" padding="2">
        <div className="w-8 flex justify-center items-center border-r border-icon-subtle mr-1">
          <BodyShort>{index + 1}.</BodyShort>
        </div>
        <div className="max-w-lg w-full">
          <BodyShort>
            K{krav.kravNummer}.{krav.kravVersjon}
          </BodyShort>
          <Label>{krav.navn}</Label>
        </div>
        <div className="flex flex-col items-end w-full justify-center max-w-md">
          <div className="flex items-center">
            <StatusView status={krav.status} />
            <div className="w-44 ml-2.5">
              <BodyShort size="small">
                {`Sist endret: ${moment(krav.changeStamp.lastModifiedDate).format('ll')}`}
              </BodyShort>
            </div>
          </div>
        </div>
        <div className="flex flex-1 justify-end items-center ">
          <RearrangeButtons
            label="krav"
            plassering={plassering}
            setPlassering={setPlassering}
            index={index}
            arrayLength={arrayLength}
            updateIndex={updateIndex}
          />
        </div>
      </Box>
    </div>
  )
}
