const propStoreData = {
}

PropertiesService = {
  getDocumentProperties : () => {
    return {
      getProperty: (k) => {
        return propStoreData[k]
      }
    }
  }
}


// SpreadsheetApp.getActiveSheet().getRange(cellRef).getValue();

const spreadSheetData = {
  'C3' : 34
}

class MockValue {
  constructor(v) {
    this.v = v
  }

  getValue() {
    return this.v
  } 
}

const MockActiveSheet = {
  getRange: (cellRef) => {
    return new MockValue(spreadSheetData[cellRef])
  }
}

const SpreadsheetApp = {
  getActiveSheet : () => MockActiveSheet
}

function test() {
  console.log(SpreadsheetApp.getActiveSheet().getRange('C33').getValue())
}

// test()