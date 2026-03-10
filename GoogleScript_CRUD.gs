/**
 * Google Apps Script - Full CRUD Operations
 * Handles: Donations, Students, Volunteers, Feedback sheets
 * 
 * ✅ AUTO-SETUP: All 4 sheets are created automatically!
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet (or open existing)
 * 2. Go to Extensions > Apps Script
 * 3. Copy and paste this entire code
 * 4. Click "Run" > Select "onOpen" > Click Run (authorize when prompted)
 * 5. Deploy > New Deployment > Web App
 *    - Execute as: Me
 *    - Access: Anyone
 * 6. Copy the Web App URL and use in your app
 * 
 * SHEETS CREATED AUTOMATICALLY:
 * - Donations (11 columns)
 * - Students (13 columns)
 * - Volunteers (10 columns)
 * - Feedback (5 columns)
 */

// ==================== CONFIGURATION ====================
const SHEET_CONFIG = {
  Donations: {
    columns: ['Timestamp', 'Amount', 'First Name', 'Last Name', 'Phone', 'Email', 'Address 1', 'Address 2', 'City', 'State', 'ZIP'],
    dataStartRow: 2,
    color: '#4285F4'  // Blue
  },
  Students: {
    columns: ['Timestamp', 'Student Name', 'Father Name', 'Mother Name', 'Mobile', 'DOB', 'School', 'Medium', 'City', 'District', 'Pincode', '10th Score', '12th Score'],
    dataStartRow: 2,
    color: '#34A853'  // Green
  },
  Volunteers: {
    columns: ['Timestamp', 'Name', 'DOB', 'Mobile', 'Language 1', 'Language 2', 'City', 'District', 'Pincode', 'Roles'],
    dataStartRow: 2,
    color: '#FBBC04'  // Yellow
  },
  Feedback: {
    columns: ['Timestamp', 'Name', 'Mobile', 'Email', 'Message'],
    dataStartRow: 2,
    color: '#EA4335'  // Red
  }
};

// ==================== TRIGGERS & MENU ====================

/**
 * Runs when the Google Sheet is opened
 * Creates custom menu and auto-initializes sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  // Create custom menu
  ui.createMenu('📊 Sheet API')
    .addItem('🔧 Setup All Sheets', 'setupAllSheetsManual')
    .addItem('🔄 Refresh Headers', 'refreshAllHeaders')
    .addSeparator()
    .addItem('📋 View API Info', 'showApiInfo')
    .addToUi();
  
  // Auto-create sheets if they don't exist
  ensureAllSheetsExist();
}

/**
 * Manual setup function - can be run from menu
 */
function setupAllSheetsManual() {
  const created = ensureAllSheetsExist();
  const ui = SpreadsheetApp.getUi();
  
  if (created.length > 0) {
    ui.alert('✅ Setup Complete', `Created ${created.length} sheet(s):\n${created.join(', ')}`, ui.ButtonSet.OK);
  } else {
    ui.alert('✅ All Ready', 'All sheets already exist!', ui.ButtonSet.OK);
  }
}

/**
 * Refresh headers on all sheets
 */
function refreshAllHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Object.keys(SHEET_CONFIG).forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      const config = SHEET_CONFIG[sheetName];
      const headerRange = sheet.getRange(1, 1, 1, config.columns.length);
      headerRange.setValues([config.columns]);
      headerRange.setFontWeight('bold');
    }
  });
  
  SpreadsheetApp.getUi().alert('✅ Headers Refreshed', 'All sheet headers have been updated!', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Show API information dialog
 */
function showApiInfo() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 16px; }
      h3 { color: #4285F4; }
      code { background: #f1f3f4; padding: 2px 6px; border-radius: 4px; }
      .endpoint { margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 6px; }
      .method { font-weight: bold; color: #34A853; }
    </style>
    <h3>📊 API Endpoints</h3>
    <div class="endpoint">
      <span class="method">GET</span> <code>?action=read&sheet=Donations</code>
    </div>
    <div class="endpoint">
      <span class="method">GET</span> <code>?action=setup</code> (Creates all sheets)
    </div>
    <div class="endpoint">
      <span class="method">POST</span> <code>action: create, sheet: Students, data: {...}</code>
    </div>
    <div class="endpoint">
      <span class="method">POST</span> <code>action: update, sheet: Volunteers, id: 2, data: {...}</code>
    </div>
    <div class="endpoint">
      <span class="method">POST</span> <code>action: delete, sheet: Feedback, id: 3</code>
    </div>
    <h3>📋 Available Sheets</h3>
    <ul>
      <li>Donations (11 columns)</li>
      <li>Students (13 columns)</li>
      <li>Volunteers (10 columns)</li>
      <li>Feedback (5 columns)</li>
    </ul>
  `)
  .setWidth(450)
  .setHeight(400);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'API Information');
}

// ==================== MAIN HANDLERS ====================

/**
 * AUTO-INITIALIZE: Ensures all sheets exist on first access
 * This runs automatically when the script is accessed
 */
function ensureAllSheetsExist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheetsCreated = [];
  
  Object.keys(SHEET_CONFIG).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      // Create the sheet
      sheet = ss.insertSheet(sheetName);
      const config = SHEET_CONFIG[sheetName];
      
      // Set headers
      const headerRange = sheet.getRange(1, 1, 1, config.columns.length);
      headerRange.setValues([config.columns]);
      
      // Style headers - simple formatting
      headerRange.setFontWeight('bold');
      headerRange.setFontSize(11);
      headerRange.setHorizontalAlignment('center');
      headerRange.setVerticalAlignment('middle');
      
      // Set row height for header
      sheet.setRowHeight(1, 30);
      
      // Auto-resize columns
      for (let i = 1; i <= config.columns.length; i++) {
        sheet.autoResizeColumn(i);
        // Set minimum width
        if (sheet.getColumnWidth(i) < 100) {
          sheet.setColumnWidth(i, 100);
        }
      }
      
      // Freeze header row
      sheet.setFrozenRows(1);
      
      // Add alternating row colors (data validation styling)
      if (sheet.getMaxRows() > 1) {
        const dataRange = sheet.getRange(2, 1, sheet.getMaxRows() - 1, config.columns.length);
        dataRange.setBackground('#FFFFFF');
      }
      
      sheetsCreated.push(sheetName);
    }
  });
  
  // Remove default "Sheet1" if it exists and is empty
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    const lastRow = defaultSheet.getLastRow();
    if (lastRow === 0) {
      ss.deleteSheet(defaultSheet);
    }
  }
  
  return sheetsCreated;
}

/**
 * Handle GET requests - Read operations
 * AUTO-CREATES all sheets on first access
 */
function doGet(e) {
  try {
    // Auto-initialize all sheets on every request
    const createdSheets = ensureAllSheetsExist();
    
    const params = e.parameter;
    const action = params.action || 'read';
    const sheetName = params.sheet;
    
    // Special case: setup action to just create sheets
    if (action === 'setup') {
      return createResponse(true, 'All sheets are ready!', {
        sheets: Object.keys(SHEET_CONFIG),
        newlyCreated: createdSheets,
        message: createdSheets.length > 0 
          ? `Created ${createdSheets.length} new sheet(s): ${createdSheets.join(', ')}` 
          : 'All sheets already exist'
      });
    }
    
    if (!sheetName) {
      return createResponse(false, 'Sheet name is required', null);
    }
    
    if (!SHEET_CONFIG[sheetName]) {
      return createResponse(false, `Invalid sheet name: ${sheetName}. Valid sheets: ${Object.keys(SHEET_CONFIG).join(', ')}`, null);
    }
    
    switch (action) {
      case 'read':
        return readData(sheetName, params);
      case 'readOne':
        return readOneRecord(sheetName, params.id);
      case 'initialize':
        return initializeSheet(sheetName);
      case 'initializeAll':
        return initializeAllSheets();
      case 'search':
        return searchRecords(sheetName, params.field, params.value);
      case 'donationsSummary':
        return getDonationsSummary();
      default:
        return createResponse(false, `Unknown action: ${action}`, null);
    }
  } catch (error) {
    return createResponse(false, error.message, null);
  }
}

/**
 * Handle POST requests - Create, Update, Delete operations
 * AUTO-CREATES all sheets on first access
 */
function doPost(e) {
  try {
    // Auto-initialize all sheets on every request
    ensureAllSheetsExist();
    
    let params;
    
    // Priority 1: Check for FormData payload (most reliable for CORS)
    if (e.parameter && e.parameter.payload) {
      try {
        params = JSON.parse(e.parameter.payload);
      } catch (parseError) {
        params = e.parameter;
      }
    }
    // Priority 2: Try to parse postData.contents as JSON
    else if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (parseError) {
        params = e.parameter;
      }
    }
    // Priority 3: Fall back to URL parameters
    else {
      params = e.parameter;
    }
    
    const action = params.action;
    const sheetName = params.sheet;
    
    if (!sheetName) {
      return createResponse(false, 'Sheet name is required', null);
    }
    
    if (!SHEET_CONFIG[sheetName]) {
      return createResponse(false, `Invalid sheet name: ${sheetName}. Valid sheets: ${Object.keys(SHEET_CONFIG).join(', ')}`, null);
    }
    
    switch (action) {
      case 'create':
        return createRecord(sheetName, params.data);
      case 'update':
        return updateRecord(sheetName, params.id, params.data);
      case 'delete':
        return deleteRecord(sheetName, params.id);
      case 'bulkCreate':
        return bulkCreateRecords(sheetName, params.data);
      case 'bulkDelete':
        return bulkDeleteRecords(sheetName, params.ids);
      default:
        return createResponse(false, `Unknown action: ${action}`, null);
    }
  } catch (error) {
    return createResponse(false, error.message, null);
  }
}

// ==================== CRUD OPERATIONS ====================

/**
 * READ - Get all records from a sheet
 */
function readData(sheetName, params) {
  const sheet = getSheet(sheetName);
  const config = SHEET_CONFIG[sheetName];
  const lastRow = sheet.getLastRow();
  
  if (lastRow < config.dataStartRow) {
    return createResponse(true, 'No data found', { records: [], total: 0 });
  }
  
  const lastColumn = config.columns.length;
  const dataRange = sheet.getRange(config.dataStartRow, 1, lastRow - config.dataStartRow + 1, lastColumn);
  const data = dataRange.getValues();
  
  // Convert to array of objects with row IDs
  const records = data.map((row, index) => {
    const record = { id: config.dataStartRow + index };
    config.columns.forEach((col, colIndex) => {
      record[col] = row[colIndex];
    });
    return record;
  }).filter(record => {
    // Filter out empty rows
    return Object.values(record).some(val => val !== '' && val !== null && val !== undefined);
  });
  
  // Apply pagination if provided
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || records.length;
  const startIndex = (page - 1) * limit;
  const paginatedRecords = limit ? records.slice(startIndex, startIndex + limit) : records;
  
  return createResponse(true, 'Data retrieved successfully', {
    records: paginatedRecords,
    total: records.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(records.length / limit)
  });
}

/**
 * READ ONE - Get a single record by row ID
 */
function readOneRecord(sheetName, rowId) {
  if (!rowId) {
    return createResponse(false, 'Row ID is required', null);
  }
  
  const sheet = getSheet(sheetName);
  const config = SHEET_CONFIG[sheetName];
  const id = parseInt(rowId);
  
  if (id < config.dataStartRow || id > sheet.getLastRow()) {
    return createResponse(false, 'Record not found', null);
  }
  
  const rowData = sheet.getRange(id, 1, 1, config.columns.length).getValues()[0];
  
  const record = { id: id };
  config.columns.forEach((col, index) => {
    record[col] = rowData[index];
  });
  
  return createResponse(true, 'Record retrieved successfully', record);
}

/**
 * CREATE - Add a new record
 */
function createRecord(sheetName, data) {
  if (!data) {
    return createResponse(false, 'Data is required', null);
  }
  
  const sheet = getSheet(sheetName);
  const config = SHEET_CONFIG[sheetName];
  
  // Parse data if it's a string
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }
  
  // Add timestamp if not provided
  if (!data.Timestamp) {
    data.Timestamp = new Date().toISOString();
  }
  
  // Build row data in correct column order
  const rowData = config.columns.map(col => data[col] || '');
  
  // Append to sheet
  sheet.appendRow(rowData);
  const newRowId = sheet.getLastRow();
  
  return createResponse(true, 'Record created successfully', {
    id: newRowId,
    data: data
  });
}

/**
 * UPDATE - Update an existing record
 */
function updateRecord(sheetName, rowId, data) {
  if (!rowId) {
    return createResponse(false, 'Row ID is required', null);
  }
  
  if (!data) {
    return createResponse(false, 'Data is required', null);
  }
  
  const sheet = getSheet(sheetName);
  const config = SHEET_CONFIG[sheetName];
  const id = parseInt(rowId);
  
  if (id < config.dataStartRow || id > sheet.getLastRow()) {
    return createResponse(false, 'Record not found', null);
  }
  
  // Parse data if it's a string
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }
  
  // Get existing row data
  const existingData = sheet.getRange(id, 1, 1, config.columns.length).getValues()[0];
  
  // Build updated row data (merge existing with new)
  const rowData = config.columns.map((col, index) => {
    return data.hasOwnProperty(col) ? data[col] : existingData[index];
  });
  
  // Update the row
  sheet.getRange(id, 1, 1, config.columns.length).setValues([rowData]);
  
  return createResponse(true, 'Record updated successfully', {
    id: id,
    data: data
  });
}

/**
 * DELETE - Delete a record
 */
function deleteRecord(sheetName, rowId) {
  if (!rowId) {
    return createResponse(false, 'Row ID is required', null);
  }
  
  const sheet = getSheet(sheetName);
  const config = SHEET_CONFIG[sheetName];
  const id = parseInt(rowId);
  
  if (id < config.dataStartRow || id > sheet.getLastRow()) {
    return createResponse(false, 'Record not found', null);
  }
  
  // Delete the row
  sheet.deleteRow(id);
  
  return createResponse(true, 'Record deleted successfully', { id: id });
}

/**
 * BULK CREATE - Add multiple records at once
 */
function bulkCreateRecords(sheetName, dataArray) {
  if (!dataArray || !Array.isArray(dataArray)) {
    return createResponse(false, 'Data array is required', null);
  }
  
  // Parse data if it's a string
  if (typeof dataArray === 'string') {
    dataArray = JSON.parse(dataArray);
  }
  
  const sheet = getSheet(sheetName);
  const config = SHEET_CONFIG[sheetName];
  const startRow = sheet.getLastRow() + 1;
  
  // Build rows data
  const rows = dataArray.map(data => {
    if (!data.Timestamp) {
      data.Timestamp = new Date().toISOString();
    }
    return config.columns.map(col => data[col] || '');
  });
  
  // Append all rows at once
  if (rows.length > 0) {
    sheet.getRange(startRow, 1, rows.length, config.columns.length).setValues(rows);
  }
  
  return createResponse(true, `${rows.length} records created successfully`, {
    count: rows.length,
    startId: startRow,
    endId: startRow + rows.length - 1
  });
}

/**
 * BULK DELETE - Delete multiple records
 */
function bulkDeleteRecords(sheetName, ids) {
  if (!ids || !Array.isArray(ids)) {
    return createResponse(false, 'IDs array is required', null);
  }
  
  // Parse ids if it's a string
  if (typeof ids === 'string') {
    ids = JSON.parse(ids);
  }
  
  const sheet = getSheet(sheetName);
  
  // Sort IDs in descending order to delete from bottom up
  const sortedIds = ids.map(id => parseInt(id)).sort((a, b) => b - a);
  
  let deletedCount = 0;
  sortedIds.forEach(id => {
    if (id >= SHEET_CONFIG[sheetName].dataStartRow && id <= sheet.getLastRow()) {
      sheet.deleteRow(id);
      deletedCount++;
    }
  });
  
  return createResponse(true, `${deletedCount} records deleted successfully`, {
    deletedCount: deletedCount
  });
}

// ==================== INITIALIZATION ====================

/**
 * Initialize a single sheet with headers
 */
function initializeSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  const config = SHEET_CONFIG[sheetName];
  
  // Set headers
  const headerRange = sheet.getRange(1, 1, 1, config.columns.length);
  headerRange.setValues([config.columns]);
  
  // Style headers - simple formatting
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // Auto-resize columns
  for (let i = 1; i <= config.columns.length; i++) {
    sheet.autoResizeColumn(i);
  }
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  return createResponse(true, `Sheet "${sheetName}" initialized successfully`, {
    sheetName: sheetName,
    columns: config.columns
  });
}

/**
 * Initialize all sheets
 */
function initializeAllSheets() {
  const results = {};
  
  Object.keys(SHEET_CONFIG).forEach(sheetName => {
    const result = initializeSheet(sheetName);
    const parsedResult = JSON.parse(result.getContent());
    results[sheetName] = parsedResult;
  });
  
  return createResponse(true, 'All sheets initialized successfully', results);
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get sheet by name
 */
function getSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found. Use action=initialize to create it.`);
  }
  
  return sheet;
}

/**
 * Create JSON response
 */
function createResponse(success, message, data) {
  const response = {
    success: success,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== SEARCH & FILTER ====================

/**
 * Search records in a sheet
 * Usage: ?action=search&sheet=Students&field=Mobile&value=9876543210
 */
function searchRecords(sheetName, field, value) {
  const sheet = getSheet(sheetName);
  const config = SHEET_CONFIG[sheetName];
  const lastRow = sheet.getLastRow();
  
  if (lastRow < config.dataStartRow) {
    return createResponse(true, 'No data found', { records: [], total: 0 });
  }
  
  const fieldIndex = config.columns.indexOf(field);
  if (fieldIndex === -1) {
    return createResponse(false, `Invalid field: ${field}`, null);
  }
  
  const dataRange = sheet.getRange(config.dataStartRow, 1, lastRow - config.dataStartRow + 1, config.columns.length);
  const data = dataRange.getValues();
  
  const records = data
    .map((row, index) => {
      const record = { id: config.dataStartRow + index };
      config.columns.forEach((col, colIndex) => {
        record[col] = row[colIndex];
      });
      return record;
    })
    .filter(record => {
      const recordValue = String(record[field]).toLowerCase();
      return recordValue.includes(String(value).toLowerCase());
    });
  
  return createResponse(true, `Found ${records.length} matching records`, {
    records: records,
    total: records.length
  });
}

// ==================== SHEET-SPECIFIC HELPERS ====================

/**
 * Get Donations Summary
 */
function getDonationsSummary() {
  const sheet = getSheet('Donations');
  const config = SHEET_CONFIG['Donations'];
  const lastRow = sheet.getLastRow();
  
  if (lastRow < config.dataStartRow) {
    return createResponse(true, 'No donations found', { 
      totalAmount: 0, 
      count: 0, 
      averageAmount: 0 
    });
  }
  
  const amountIndex = config.columns.indexOf('Amount') + 1;
  const amounts = sheet.getRange(config.dataStartRow, amountIndex, lastRow - config.dataStartRow + 1, 1).getValues();
  
  const validAmounts = amounts.flat().filter(a => !isNaN(parseFloat(a)) && a !== '');
  const totalAmount = validAmounts.reduce((sum, a) => sum + parseFloat(a), 0);
  
  return createResponse(true, 'Donations summary retrieved', {
    totalAmount: totalAmount,
    count: validAmounts.length,
    averageAmount: validAmounts.length > 0 ? totalAmount / validAmounts.length : 0
  });
}

/**
 * Get Students by School
 */
function getStudentsBySchool(schoolName) {
  return searchRecords('Students', 'School', schoolName);
}

/**
 * Get Volunteers by Role
 */
function getVolunteersByRole(role) {
  return searchRecords('Volunteers', 'Roles', role);
}

// ==================== EXTENDED GET HANDLER ====================

// Add to doGet function for additional actions
function doGetExtended(e) {
  const params = e.parameter;
  const action = params.action;
  const sheetName = params.sheet;
  
  switch (action) {
    case 'search':
      return searchRecords(sheetName, params.field, params.value);
    case 'donationsSummary':
      return getDonationsSummary();
    case 'studentsBySchool':
      return getStudentsBySchool(params.school);
    case 'volunteersByRole':
      return getVolunteersByRole(params.role);
    default:
      return doGet(e);
  }
}
