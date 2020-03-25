import asyncStates from '@zooniverse/async-states'
import { inject, observer } from 'mobx-react'
import React from 'react'
import PropTypes from 'prop-types'

import SVGContext from '@plugins/drawingTools/shared/SVGContext'
import SubjectGroupViewer from './SubjectGroupViewer'
import locationValidator from '../../helpers/locationValidator'
import withKeyZoom from '../../../withKeyZoom'

function preventDefault (e) {
  e.preventDefault()
}

const DEFAULT_CELL_WIDTH = 1200
const DEFAULT_CELL_HEIGHT = 1000
const DEFAULT_CELL_STYLE = {
  stroke: '#fff',
  strokeWidth: '4',
  fill: '#000'
}
const DEFAULT_GRID_COLUMNS = 3
const DEFAULT_GRID_ROWS = 3

function storeMapper (stores) {
  const {
    setOnZoom,
    setOnPan
  } = stores.classifierStore.subjectViewer
  
  const {
    active: activeWorkflow
  } = stores.classifierStore.workflows
  
  const workflowConfig = activeWorkflow && activeWorkflow.configuration || {}
  
  const cellWidth = workflowConfig.cell_width || DEFAULT_CELL_WIDTH
  const cellHeight = workflowConfig.cell_height || DEFAULT_CELL_HEIGHT
  const cellStyle = workflowConfig.cell_style || DEFAULT_CELL_STYLE
  const gridColumns = workflowConfig.grid_columns || DEFAULT_GRID_COLUMNS
  const gridRows = workflowConfig.grid_rows || DEFAULT_GRID_ROWS

  return {
    cellHeight,
    cellWidth,
    cellStyle,
    gridColumns,
    gridRows,
    setOnZoom,
    setOnPan
  }
}

class SubjectGroupViewerContainer extends React.Component {
  constructor () {
    super()
    this.dragMove = this.dragMove.bind(this)
    this.imageViewer = React.createRef()
    this.scrollContainer = React.createRef()

    this.state = {
      images: [],
      panX: 0,
      panY: 0,
      zoom: 1,
    }
  }

  componentDidMount () {
    this.onLoad()

    // Listen for pan and zoom actions outside of this component.
    // i.e. zoom in/out actions from the iamge controls. 
    this.props.setOnPan(this.onPanViaExternalControls.bind(this))
    this.props.setOnZoom(this.onZoomViaExternalControls.bind(this))
    
    this.scrollContainer.current
    && this.scrollContainer.current.addEventListener('wheel', preventDefault)
  }
  
  componentWillUmount () {

    this.setOnPan(() => true)
    this.setOnZoom(() => true)
    
    this.scrollContainer.current
    && this.scrollContainer.current.removeEventListener('wheel', preventDefault)
  }

  fetchImage (url) {
    const { ImageObject } = this.props
    return new Promise((resolve, reject) => {
      const img = new ImageObject()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
      return img
    })
  }

  dragMove (event, difference) {
    this.onDrag && this.onDrag(event, difference)
  }

  async preload () {
    const { subject } = this.props
    if (subject && subject.locations) {
      // TODO: Validate for allowed image media mime types
      
      const imageUrls = subject.locations.map(obj => Object.values(obj)[0])
      const images = await Promise.all(
        imageUrls.map(url => this.fetchImage(url))
      )
      
      this.setState({ images })
      return images
    }
    return {}
  }

  async getImageSize () {
    const svg = this.imageViewer.current || {}
    const { width: clientWidth, height: clientHeight } = svg.getBoundingClientRect && svg.getBoundingClientRect() || {}
    const { gridRows, gridColumns, cellWidth, cellHeight } = this.props
    
    const naturalWidth = gridColumns * cellWidth
    const naturalHeight = gridRows * cellHeight
    
    return {
      clientHeight,
      clientWidth,
      naturalHeight,
      naturalWidth
    }
  }

  async onLoad () {
    const { onError, onReady } = this.props
    try {
      await this.preload()
      const { clientHeight, clientWidth, naturalHeight, naturalWidth } = await this.getImageSize()
      const target = { clientHeight, clientWidth, naturalHeight, naturalWidth }
      onReady({ target })
    } catch (error) {
      console.error(error)
      onError(error)
    }
  }
  
  onDrag (event, difference) {
    this.doPan(difference.x, difference.y)
  }

  onPanViaExternalControls (dx, dy) {
    const ARBITRARY_FACTOR = Math.min(this.props.cellWidth, this.props.cellHeight) / 20
    
    // TODO: uh, looks like left/right pan is flipped, but that's a separate PR
    
    this.doPan(dx * ARBITRARY_FACTOR, dy * ARBITRARY_FACTOR)
  }
  
  doPan (dx, dy) {
    const { panX, panY } = this.state
    this.setState({
      panX: panX + dx,
      panY: panY + dy,
    })
  }

  onZoomViaExternalControls (type) {
    this.doZoom(type)
  }
  
  doZoom (type) {
    const { zoom } = this.state
    
    const ARBITRARY_MIN_ZOOM = 0.5
    const ARBITRARY_MAX_ZOOM = 2
    
    switch (type) {
      case 'zoomin':
        this.setState({ zoom: Math.min(zoom + 0.1, ARBITRARY_MAX_ZOOM) })
        break;
      case 'zoomout':
        this.setState({ zoom: Math.max(zoom - 0.1, ARBITRARY_MIN_ZOOM) })
        break;
      case 'zoomto': {
        this.setState({
          zoom: 1,
          panX: 0,
          panY: 0,
        })
        break;
      }
    }
  }
  
  onWheel (event) {
    const { deltaY } = event
    if (deltaY < 0) {
      this.doZoom('zoomout', -1)
    } else {
      this.doZoom('zoomin', 1)
    }
  }

  render () {
    const {
      cellHeight,
      cellWidth,
      cellStyle,
      gridColumns,
      gridRows,
      loadingState,
      onKeyDown,
      setOnPan,
      setOnZoom
    } = this.props
    const { images, panX, panY, zoom } = this.state
    
    const naturalWidth = gridColumns * cellWidth
    const naturalHeight = gridRows * cellHeight

    if (loadingState === asyncStates.error) {
      return (
        <div>Something went wrong.</div>
      )
    }

    const svg = this.imageViewer.current
    
    if (!images
        || !images.length
        || !(cellHeight > 0)
        || !(cellWidth > 0)
        || !(gridColumns > 0)
        || !(gridRows > 0)
    ) {
      return null
    }

    return (
      <SVGContext.Provider value={{ svg }}>
        <div ref={this.scrollContainer} onWheel={this.onWheel.bind(this)}>
          <SubjectGroupViewer
            ref={this.imageViewer}
            
            images={images}
            
            dragMove={this.dragMove}
            onKeyDown={onKeyDown}
            
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            cellStyle={cellStyle}
            gridRows={gridRows}
            gridColumns={gridColumns}
            
            width={naturalWidth}
            height={naturalHeight}
            
            panX={panX}
            panY={panY}
            zoom={zoom}
          />
        </div>
      </SVGContext.Provider>
    )
  }
}

SubjectGroupViewerContainer.propTypes = {
  loadingState: PropTypes.string,
  onError: PropTypes.func,
  onReady: PropTypes.func,
  setOnPan: PropTypes.func,
  setOnZoom: PropTypes.func,
  subject: PropTypes.shape({
    locations: PropTypes.arrayOf(locationValidator)
  })
}

SubjectGroupViewerContainer.defaultProps = {
  ImageObject: window.Image,
  loadingState: asyncStates.initialized,
  onError: () => true,
  onReady: () => true,
  setOnPan: () => true,
  setOnZoom: () => true
}

@inject(storeMapper)
@withKeyZoom
@observer
class DecoratedSubjectGroupViewerContainer extends SubjectGroupViewerContainer { }

export default DecoratedSubjectGroupViewerContainer
export { SubjectGroupViewerContainer }
