import { Block } from 'baseui/block'
import React from 'react'
import { LabelSmall } from 'baseui/typography'
import moment from 'moment'
import { Virkemiddel } from '../../constants'
import { ettlevColors } from '../../util/theme'
import { SkeletonPanel } from '../common/LoadingSkeleton'
import { PanelLink } from '../common/PanelLink'
import { borderWidth, borderColor, borderStyle, borderRadius } from '../common/Style'


type VirkmiddelPanelsProps = {
  virkemidler: Virkemiddel[]
  loading: boolean
}

const tabMarginBottom = '10px'

export const VirkemiddelPanels = ({ virkemidler, loading }: VirkmiddelPanelsProps) => {
  if (loading) return <SkeletonPanel count={5} />
  return (
    <Block
      marginBottom={tabMarginBottom}
      $style={{
        ...borderWidth('1px'),
        ...borderColor(ettlevColors.grey100),
        ...borderStyle('solid'),
        ...borderRadius('4px'),
        backgroundColor: 'white',
      }}
    >
      {virkemidler &&
        virkemidler.map((v, index) => {
          return (
            <Block key={v.id} marginBottom={'0px'}>
              {index !== 0 && (
                <Block width="100%" display="flex" justifyContent="center">
                  <Block display="flex" width="98%" height="1px" backgroundColor={ettlevColors.grey100} />
                </Block>
              )}
              <PanelLink
                useDescriptionUnderline
                href={`/virkemiddel/${v.id}`}
                title=""
                beskrivelse={<LabelSmall $style={{ fontSize: '18px', fontWeight: 600 }}>{v.navn}</LabelSmall>}
                rightBeskrivelse={!!v.changeStamp.lastModifiedDate ? `Sist endret: ${moment(v.changeStamp.lastModifiedDate).format('ll')}` : ''}
                overrides={{
                  Block: {
                    style: {
                      ':hover': { boxShadow: 'none' },
                      ...borderStyle('hidden'),
                    },
                  },
                }}
              />
            </Block>
          )
        })}
    </Block>
  )
}