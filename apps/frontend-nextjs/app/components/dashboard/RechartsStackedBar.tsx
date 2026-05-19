import { BodyShort } from '@navikt/ds-react'
import { IBarSegment, formatPct, roundedPercentages } from './chartUtils'

export const RechartsStackedBar = ({
  data,
  showPercentage,
  percentageOnly,
}: {
  data: IBarSegment[]
  showPercentage?: boolean
  percentageOnly?: boolean
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) return <BodyShort className='text-gray-500 mt-2'>Ingen data</BodyShort>

  const pcts = roundedPercentages(data.map((d) => d.value))

  return (
    <div style={{ marginTop: '12px', maxWidth: '500px' }}>
      <div style={{ display: 'flex', height: 32, borderRadius: 4, overflow: 'hidden' }}>
        {data
          .filter((d) => d.value > 0)
          .map((d) => (
            <div
              key={d.name}
              style={{
                width: `${(d.value / total) * 100}%`,
                backgroundColor: d.color,
                transition: 'width 0.3s',
              }}
            />
          ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        {data.map((d, i) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: d.color,
                flexShrink: 0,
              }}
            />
            <BodyShort size='small'>
              {d.name}{' '}
              <strong>
                {percentageOnly
                  ? `${formatPct(pcts[i], d.value)}%`
                  : `${d.value}${showPercentage ? ` (${formatPct(pcts[i], d.value)}%)` : ''}`}
              </strong>
            </BodyShort>
          </div>
        ))}
      </div>
    </div>
  )
}
