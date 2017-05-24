const {extentForText, traverse, compare, format} = require('./point-helpers')

exports.copy = function (operation) {
  const newOperation = {
    type: operation.type,
    siteId: operation.siteId,
    sequenceNumber: operation.sequenceNumber,
    inverseCount: operation.inverseCount
  }
  if (operation.contextVector) newOperation.contextVector = operation.contextVector.copy()

  if (operation.type !== 'null') {
    newOperation.start = operation.start
    newOperation.text = operation.text
  }

  return newOperation
}

exports.invert = function (operation) {
  const newOperation = exports.copy(operation)
  if (newOperation.type === 'insert') {
    newOperation.type = 'delete'
  } else if (newOperation.type === 'delete') {
    newOperation.type = 'insert'
  }
  return newOperation
}

exports.areConcurrent = function (operation1, operation2) {
  return !dependsOn(operation1, operation2) && !dependsOn(operation2, operation1)
}

function dependsOn (operation1, operation2) {
  if (operation1.inverseCount === 0) {
    return operation1.sequenceNumber <= operation2.contextVector.sequenceNumberForSiteId(operation1.siteId)
  } else {
    const contextVectorInverseCount = operation2.contextVector.inverseCountForSiteIdAndSequenceNumber(
      operation1.siteId,
      operation1.sequenceNumber
    )
    return operation1.inverseCount <= contextVectorInverseCount
  }
}

exports.format = function (operation) {
  if (operation.type === 'null') {
    return `Operation: null operation`
  } else {
    let text = `${operation.type} at ${format(operation.start)}. `
    text += `Extent: ${format(extentForText(operation.text))}. `
    text += `Text: ${JSON.stringify(operation.text)}`
    return text
  }
}

exports.getEnd = function (operation) {
  if (!operation.end) {
    operation.end = traverse(operation.start, extentForText(operation.text))
  }

  return operation.end
}

exports.getId = function (operation) {
  if (!operation.id) {
    const {siteId, sequenceNumber, inverseCount} = operation
    operation.id = exports.buildId(siteId, sequenceNumber, inverseCount)
  }

  return operation.id
}

exports.buildId = function (siteId, sequenceNumber, inverseCount) {
  return `${siteId}-${sequenceNumber}-${inverseCount}`
}