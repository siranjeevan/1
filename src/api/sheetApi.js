/**
 * Google Sheets API Service
 * Handles all CRUD operations for Donations, Students, Volunteers, Feedback
 */

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

// Sheet names
export const SHEETS = {
  DONATIONS: 'Donations',
  STUDENTS: 'Students',
  VOLUNTEERS: 'Volunteers',
  FEEDBACK: 'Feedback'
};

/**
 * Generic API call handler for GET requests
 * Google Apps Script requires redirect: 'follow' and no custom headers to avoid CORS
 */
const apiCallGet = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Generic API call handler for POST requests
 * Using URL-encoded form data approach for reliable Google Apps Script communication
 */
const apiCallPost = async (url, body) => {
  try {
    // Create form data - Google Apps Script handles this more reliably
    const formData = new FormData();
    formData.append('payload', JSON.stringify(body));

    const response = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      body: formData
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ==================== READ OPERATIONS ====================

/**
 * Get all records from a sheet
 * @param {string} sheetName - Name of the sheet
 * @param {object} options - Optional pagination { page, limit }
 */
export const getAllRecords = async (sheetName, options = {}) => {
  const params = new URLSearchParams({
    action: 'read',
    sheet: sheetName,
    ...options
  });

  return apiCallGet(`${SCRIPT_URL}?${params}`);
};

/**
 * Get a single record by ID
 * @param {string} sheetName - Name of the sheet
 * @param {number} id - Row ID
 */
export const getRecordById = async (sheetName, id) => {
  const params = new URLSearchParams({
    action: 'readOne',
    sheet: sheetName,
    id: id.toString()
  });

  return apiCallGet(`${SCRIPT_URL}?${params}`);
};

/**
 * Search records by field and value
 * @param {string} sheetName - Name of the sheet
 * @param {string} field - Field/column name to search
 * @param {string} value - Value to search for
 */
export const searchRecords = async (sheetName, field, value) => {
  const params = new URLSearchParams({
    action: 'search',
    sheet: sheetName,
    field,
    value
  });

  return apiCallGet(`${SCRIPT_URL}?${params}`);
};

// ==================== CREATE OPERATIONS ====================

/**
 * Create a new record
 * @param {string} sheetName - Name of the sheet
 * @param {object} data - Record data
 */
export const createRecord = async (sheetName, data) => {
  return apiCallPost(SCRIPT_URL, {
    action: 'create',
    sheet: sheetName,
    data
  });
};

/**
 * Create multiple records at once
 * @param {string} sheetName - Name of the sheet
 * @param {array} records - Array of record objects
 */
export const bulkCreateRecords = async (sheetName, records) => {
  return apiCallPost(SCRIPT_URL, {
    action: 'bulkCreate',
    sheet: sheetName,
    data: records
  });
};

// ==================== UPDATE OPERATIONS ====================

/**
 * Update an existing record
 * @param {string} sheetName - Name of the sheet
 * @param {number} id - Row ID
 * @param {object} data - Updated data
 */
export const updateRecord = async (sheetName, id, data) => {
  return apiCallPost(SCRIPT_URL, {
    action: 'update',
    sheet: sheetName,
    id,
    data
  });
};

// ==================== DELETE OPERATIONS ====================

/**
 * Delete a record
 * @param {string} sheetName - Name of the sheet
 * @param {number} id - Row ID
 */
export const deleteRecord = async (sheetName, id) => {
  return apiCallPost(SCRIPT_URL, {
    action: 'delete',
    sheet: sheetName,
    id
  });
};

/**
 * Delete multiple records
 * @param {string} sheetName - Name of the sheet
 * @param {array} ids - Array of row IDs
 */
export const bulkDeleteRecords = async (sheetName, ids) => {
  return apiCallPost(SCRIPT_URL, {
    action: 'bulkDelete',
    sheet: sheetName,
    ids
  });
};

// ==================== INITIALIZATION ====================

/**
 * Initialize a sheet with headers
 * @param {string} sheetName - Name of the sheet
 */
export const initializeSheet = async (sheetName) => {
  const params = new URLSearchParams({
    action: 'initialize',
    sheet: sheetName
  });

  return apiCallGet(`${SCRIPT_URL}?${params}`);
};

/**
 * Initialize all sheets
 */
export const initializeAllSheets = async () => {
  const params = new URLSearchParams({
    action: 'initializeAll',
    sheet: 'Donations' // Required param, but initializes all
  });

  return apiCallGet(`${SCRIPT_URL}?${params}`);
};

/**
 * Setup - Auto-create all 4 sheets in Google Sheet
 * This is the easiest way to initialize everything with one call
 */
export const setupSheets = async () => {
  const params = new URLSearchParams({
    action: 'setup'
  });

  return apiCallGet(`${SCRIPT_URL}?${params}`);
};

// ==================== SHEET-SPECIFIC FUNCTIONS ====================

// --- DONATIONS ---
export const getDonations = (options) => getAllRecords(SHEETS.DONATIONS, options);
export const getDonation = (id) => getRecordById(SHEETS.DONATIONS, id);
export const createDonation = (data) => createRecord(SHEETS.DONATIONS, data);
export const updateDonation = (id, data) => updateRecord(SHEETS.DONATIONS, id, data);
export const deleteDonation = (id) => deleteRecord(SHEETS.DONATIONS, id);

// --- STUDENTS ---
export const getStudents = (options) => getAllRecords(SHEETS.STUDENTS, options);
export const getStudent = (id) => getRecordById(SHEETS.STUDENTS, id);
export const createStudent = (data) => createRecord(SHEETS.STUDENTS, data);
export const updateStudent = (id, data) => updateRecord(SHEETS.STUDENTS, id, data);
export const deleteStudent = (id) => deleteRecord(SHEETS.STUDENTS, id);

// --- VOLUNTEERS ---
export const getVolunteers = (options) => getAllRecords(SHEETS.VOLUNTEERS, options);
export const getVolunteer = (id) => getRecordById(SHEETS.VOLUNTEERS, id);
export const createVolunteer = (data) => createRecord(SHEETS.VOLUNTEERS, data);
export const updateVolunteer = (id, data) => updateRecord(SHEETS.VOLUNTEERS, id, data);
export const deleteVolunteer = (id) => deleteRecord(SHEETS.VOLUNTEERS, id);

// --- FEEDBACK ---
export const getFeedbacks = (options) => getAllRecords(SHEETS.FEEDBACK, options);
export const getFeedback = (id) => getRecordById(SHEETS.FEEDBACK, id);
export const createFeedback = (data) => createRecord(SHEETS.FEEDBACK, data);
export const updateFeedback = (id, data) => updateRecord(SHEETS.FEEDBACK, id, data);
export const deleteFeedback = (id) => deleteRecord(SHEETS.FEEDBACK, id);

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get donations summary (total, count, average)
 */
export const getDonationsSummary = async () => {
  const params = new URLSearchParams({
    action: 'donationsSummary',
    sheet: 'Donations'
  });

  return apiCallGet(`${SCRIPT_URL}?${params}`);
};

/**
 * Search students by school
 */
export const getStudentsBySchool = async (schoolName) => {
  return searchRecords(SHEETS.STUDENTS, 'School', schoolName);
};

/**
 * Search volunteers by role
 */
export const getVolunteersByRole = async (role) => {
  return searchRecords(SHEETS.VOLUNTEERS, 'Roles', role);
};

export default {
  // Generic
  getAllRecords,
  getRecordById,
  searchRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  bulkCreateRecords,
  bulkDeleteRecords,
  initializeSheet,
  initializeAllSheets,

  // Donations
  getDonations,
  getDonation,
  createDonation,
  updateDonation,
  deleteDonation,
  getDonationsSummary,

  // Students
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsBySchool,

  // Volunteers
  getVolunteers,
  getVolunteer,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  getVolunteersByRole,

  // Feedback
  getFeedbacks,
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,

  // Constants
  SHEETS
};
