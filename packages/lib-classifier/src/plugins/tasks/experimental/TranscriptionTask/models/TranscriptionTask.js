import cuid from 'cuid'
import { types } from 'mobx-state-tree'
import Task from '../../../models/Task'
import DrawingTask from '../../../DrawingTask/models/DrawingTask'
import { TranscriptionLineTool } from '@plugins/drawingTools/models/tools'
import { TranscriptionLine } from '@plugins/drawingTools/models/marks'
import TranscriptionAnnotation from './TranscriptionAnnotation'

// Similar to DrawingTask, but let's limit to only allowing 
// TranscriptionLine tool, marks, and TranscriptionAnnotation models
const Transcription = types.model('Transcription', {
  activeMark: types.safeReference(TranscriptionLine),
  annotation: types.safeReference(TranscriptionAnnotation),
  caesarKey: types.optional(types.literal('alice'), 'alice'),
  tools: types.array(TranscriptionLineTool),
  type: types.literal('transcription')
})
.views(self => ({
  get defaultAnnotation() {
    return TranscriptionAnnotation.create({
      id: cuid(),
      task: self.taskKey,
      taskType: self.type
    })
  },
}))

// We still want other functionality from DrawingTask, so let's compose them
const TranscriptionTask = types.compose('TranscriptionTask', DrawingTask, Transcription)

export default TranscriptionTask
