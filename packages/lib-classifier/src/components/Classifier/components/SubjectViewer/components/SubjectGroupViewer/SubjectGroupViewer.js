import PropTypes from 'prop-types'
import React, { createRef, forwardRef, useContext } from 'react'
import styled from 'styled-components'
import SVGContext from '@plugins/drawingTools/shared/SVGContext'
import SGVGridCell from './components/SGVGridCell'

const Container = styled.div`
  animation: fadein 1s 0s forwards;
  height: 100%;
  overflow: hidden;
  width: 100%;

  @keyframes fadein {
    from {
      opacity: 0;
    }

    to {
      opacity: 100%;
    }
  }
`

const SubjectGroupViewer = forwardRef(function SubjectGroupViewer(props, ref) {
  const {
    images,
    height,
    onKeyDown,
    dragMove,
    scale,
    width,
    cellWidth,
    cellHeight,
    gridRows,
    gridColumns,
    cellStyle,
    panX,
    panY,
    zoom,
  } = props

  const transformLayer = createRef()
  const { svg } = useContext(SVGContext)
  const getScreenCTM = () => transformLayer.current.getScreenCTM()

  return (
    <SVGContext.Provider value={{ svg, getScreenCTM }}>
      <Container>
        <svg
          ref={ref}
          focusable
          onKeyDown={onKeyDown}
          tabIndex={0}
          viewBox={`0 0 ${width}, ${height}`}
        >
          <g
            ref={transformLayer}
          >
            {images.map((image, index) => (
              <SGVGridCell
                key={`sgv-grid-cell-${index}`}
                image={image}
                index={index}
                dragMove={dragMove}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
                gridRows={gridRows}
                gridColumns={gridColumns}
                cellStyle={cellStyle}
                panX={panX}
                panY={panY}
                zoom={zoom}
              />
            ))}
          </g>
        </svg>
      </Container>
    </SVGContext.Provider>
  )
})

SubjectGroupViewer.propTypes = {
  height: PropTypes.number.isRequired,
  onKeyDown: PropTypes.func,
  scale: PropTypes.number,
  width: PropTypes.number.isRequired
}

SubjectGroupViewer.defaultProps = {
  onKeyDown: () => true,
  scale: 1
}

export default SubjectGroupViewer
