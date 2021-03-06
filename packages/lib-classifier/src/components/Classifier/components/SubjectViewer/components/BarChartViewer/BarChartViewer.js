import PropTypes from 'prop-types'
import React from 'react'
import { withTheme } from 'styled-components'
import { Group } from '@vx/group'
import { AxisBottom, AxisLeft } from '@vx/axis'
import { scaleBand, scaleLinear } from '@vx/scale'
import { withParentSize } from '@vx/responsive'
import Chart from '../SVGComponents/Chart'
import Background from '../SVGComponents/Background'
import Bars from './components/Bars'

const BarChartViewer = React.forwardRef(function BarChartViewer (props, ref) {
  const {
    barStyles: {
      padding
    },
    data,
    margin: {
      bottom,
      left,
      right,
      top
    },
    parentHeight,
    parentWidth,
    theme: { dark, global: { colors, font } },
    xAxisLabel,
    yAxisLabel,
  } = props

  let axisColor = (dark) ? colors.text.dark : colors.text.light
  // Should we put white into the theme?
  let backgroundColor = (dark) ? colors['dark-3'] : 'white'
  const xMax = parentWidth - left - right
  const yMax = parentHeight - bottom - top

  const xScale = scaleBand({
    domain: data.map(datum => datum.label),
    rangeRound: [0, xMax],
    padding
  })

  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map(datum => datum.value))],
    rangeRound: [yMax, 0]
  })

  const xScaleTicks = xScale.domain()
  const yScaleTicks = yScale.domain()

  return (
    <Chart height={parentHeight} ref={ref} width={parentWidth}>
      <Background fill={backgroundColor} />
      <Group
        aria-label='Bar chart'
        focusable
        left={left}
        role='list'
        tabIndex={0}
        top={top}
      >
        <Bars
          data={data}
          xAxisLabel={xAxisLabel}
          xScale={xScale}
          yAxisLabel={yAxisLabel}
          yScale={yScale}
          yMax={yMax}
        />
      </Group>
      <Group left={left} top={top}>
        <AxisLeft
          label={yAxisLabel}
          labelProps={{
            fill: axisColor,
            textAnchor: 'middle',
            fontSize: 12,
            fontFamily: font.family
          }}
          left={0}
          role='presentation'
          scale={yScale}
          stroke={axisColor}
          ticks={yScaleTicks.length}
          tickStroke={axisColor}
          tickLabelProps={(value, index) => ({
            fill: axisColor,
            textAnchor: 'end',
            fontSize: 10,
            fontFamily: font.family,
            dx: '-0.25em',
            dy: '0.25em'
          })}
          top={0}
        />
        <AxisBottom
          label={xAxisLabel}
          labelProps={{
            fill: axisColor,
            textAnchor: 'middle',
            fontSize: 12,
            fontFamily: font.family
          }}
          left={0}
          role='presentation'
          scale={xScale}
          stroke={axisColor}
          ticks={xScaleTicks.length}
          tickStroke={axisColor}
          tickLabelProps={(value, index) => ({
            fill: axisColor,
            textAnchor: 'middle',
            fontSize: 10,
            fontFamily: font.family
          })}
          top={yMax}
        />
      </Group>
    </Chart>
  )
})

BarChartViewer.defaultProps = {
  barStyles: {
    padding: 0.25
  },
  margin: {
    bottom: 40,
    left: 40,
    right: 0,
    top: 0
  },
  xAxisLabel: 'x-axis',
  yAxisLabel: 'y-axis',
  theme: {
    dark: false,
    global: {
      colors: {
        brand: '',
        text: {}
      },
      font: {
        family: ''
      }
    }
  }
}

BarChartViewer.propTypes = {
  barStyles: PropTypes.shape({
    padding: PropTypes.number
  }),
  data: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.string,
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired
  })).isRequired,
  margin: PropTypes.shape({
    bottom: PropTypes.number,
    left: PropTypes.number,
    right: PropTypes.number,
    top: PropTypes.number
  }),
  parentHeight: PropTypes.number.isRequired,
  parentWidth: PropTypes.number.isRequired,
  theme: PropTypes.object,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string
}

export default withTheme(withParentSize(BarChartViewer))
export { BarChartViewer }
