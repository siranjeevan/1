import { useState, useEffect } from 'react';
import './SheetTester.css';
import {
    getDonations, createDonation, updateDonation, deleteDonation,
    getStudents, createStudent, updateStudent, deleteStudent,
    getVolunteers, createVolunteer, updateVolunteer, deleteVolunteer,
    getFeedbacks, createFeedback, updateFeedback, deleteFeedback,
    initializeSheet, initializeAllSheets, setupSheets, SHEETS
} from '../api/sheetApi';

// Sheet field configurations
const SHEET_FIELDS = {
    Donations: [
        { name: 'Amount', type: 'number', placeholder: 'Enter amount' },
        { name: 'First Name', type: 'text', placeholder: 'Enter first name' },
        { name: 'Last Name', type: 'text', placeholder: 'Enter last name' },
        { name: 'Phone', type: 'tel', placeholder: 'Enter phone number' },
        { name: 'Email', type: 'email', placeholder: 'Enter email' },
        { name: 'Address 1', type: 'text', placeholder: 'Enter address line 1' },
        { name: 'Address 2', type: 'text', placeholder: 'Enter address line 2' },
        { name: 'City', type: 'text', placeholder: 'Enter city' },
        { name: 'State', type: 'text', placeholder: 'Enter state' },
        { name: 'ZIP', type: 'text', placeholder: 'Enter ZIP code' }
    ],
    Students: [
        { name: 'Student Name', type: 'text', placeholder: 'Enter student name' },
        { name: 'Father Name', type: 'text', placeholder: 'Enter father name' },
        { name: 'Mother Name', type: 'text', placeholder: 'Enter mother name' },
        { name: 'Mobile', type: 'tel', placeholder: 'Enter mobile number' },
        { name: 'DOB', type: 'date', placeholder: 'Select date of birth' },
        { name: 'School', type: 'text', placeholder: 'Enter school name' },
        { name: 'Medium', type: 'text', placeholder: 'Enter medium (English/Hindi)' },
        { name: 'City', type: 'text', placeholder: 'Enter city' },
        { name: 'District', type: 'text', placeholder: 'Enter district' },
        { name: 'Pincode', type: 'text', placeholder: 'Enter pincode' },
        { name: '10th Score', type: 'text', placeholder: 'Enter 10th score' },
        { name: '12th Score', type: 'text', placeholder: 'Enter 12th score' }
    ],
    Volunteers: [
        { name: 'Name', type: 'text', placeholder: 'Enter name' },
        { name: 'DOB', type: 'date', placeholder: 'Select date of birth' },
        { name: 'Mobile', type: 'tel', placeholder: 'Enter mobile number' },
        { name: 'Language 1', type: 'text', placeholder: 'Enter primary language' },
        { name: 'Language 2', type: 'text', placeholder: 'Enter secondary language' },
        { name: 'City', type: 'text', placeholder: 'Enter city' },
        { name: 'District', type: 'text', placeholder: 'Enter district' },
        { name: 'Pincode', type: 'text', placeholder: 'Enter pincode' },
        { name: 'Roles', type: 'text', placeholder: 'Enter roles (comma separated)' }
    ],
    Feedback: [
        { name: 'Name', type: 'text', placeholder: 'Enter name' },
        { name: 'Mobile', type: 'tel', placeholder: 'Enter mobile number' },
        { name: 'Email', type: 'email', placeholder: 'Enter email' },
        { name: 'Message', type: 'textarea', placeholder: 'Enter feedback message' }
    ]
};

// API functions mapping
const API_FUNCTIONS = {
    Donations: { get: getDonations, create: createDonation, update: updateDonation, delete: deleteDonation },
    Students: { get: getStudents, create: createStudent, update: updateStudent, delete: deleteStudent },
    Volunteers: { get: getVolunteers, create: createVolunteer, update: updateVolunteer, delete: deleteVolunteer },
    Feedback: { get: getFeedbacks, create: createFeedback, update: updateFeedback, delete: deleteFeedback }
};

// Sample test data for each sheet
const TEST_DATA = {
    Donations: {
        'Amount': 5000,
        'First Name': 'Rahul',
        'Last Name': 'Sharma',
        'Phone': '9876543210',
        'Email': 'rahul.sharma@example.com',
        'Address 1': '123 MG Road',
        'Address 2': 'Apt 4B',
        'City': 'Mumbai',
        'State': 'Maharashtra',
        'ZIP': '400001'
    },
    Students: {
        'Student Name': 'Priya Patel',
        'Father Name': 'Rajesh Patel',
        'Mother Name': 'Sunita Patel',
        'Mobile': '9123456789',
        'DOB': '2005-05-15',
        'School': 'Kendriya Vidyalaya',
        'Medium': 'English',
        'City': 'Ahmedabad',
        'District': 'Ahmedabad',
        'Pincode': '380001',
        '10th Score': '92%',
        '12th Score': '88%'
    },
    Volunteers: {
        'Name': 'Amit Kumar',
        'DOB': '1995-08-20',
        'Mobile': '9988776655',
        'Language 1': 'Hindi',
        'Language 2': 'English',
        'City': 'Delhi',
        'District': 'Central Delhi',
        'Pincode': '110001',
        'Roles': 'Teaching, Event Management'
    },
    Feedback: {
        'Name': 'Sneha Gupta',
        'Mobile': '9876512345',
        'Email': 'sneha.gupta@example.com',
        'Message': 'Great initiative! The organization is doing wonderful work for education.'
    }
};

function SheetTester() {
    const [activeSheet, setActiveSheet] = useState('Donations');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Clear messages after 5 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccess(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    // Fetch records when sheet changes
    useEffect(() => {
        fetchRecords();
        resetForm();
    }, [activeSheet]);

    const fetchRecords = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await API_FUNCTIONS[activeSheet].get();
            setRecords(response.data?.records || []);
            setSuccess(`Loaded ${response.data?.records?.length || 0} records from ${activeSheet}`);
        } catch (err) {
            setError(`Failed to fetch ${activeSheet}: ${err.message}`);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({});
        setEditingId(null);
        setShowForm(false);
    };

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingId) {
                await API_FUNCTIONS[activeSheet].update(editingId, formData);
                setSuccess(`Record #${editingId} updated successfully!`);
            } else {
                await API_FUNCTIONS[activeSheet].create(formData);
                setSuccess('New record created successfully!');
            }
            resetForm();
            fetchRecords();
        } catch (err) {
            setError(`Failed to ${editingId ? 'update' : 'create'} record: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record) => {
        setFormData(record);
        setEditingId(record.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm(`Are you sure you want to delete record #${id}?`)) return;

        setLoading(true);
        setError(null);
        try {
            await API_FUNCTIONS[activeSheet].delete(id);
            setSuccess(`Record #${id} deleted successfully!`);
            fetchRecords();
        } catch (err) {
            setError(`Failed to delete record: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInitialize = async (sheetName) => {
        setLoading(true);
        setError(null);
        try {
            if (sheetName === 'all') {
                await initializeAllSheets();
                setSuccess('All sheets initialized successfully!');
            } else {
                await initializeSheet(sheetName);
                setSuccess(`${sheetName} sheet initialized successfully!`);
            }
        } catch (err) {
            setError(`Failed to initialize: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoSetup = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await setupSheets();
            const data = response.data;
            if (data.newlyCreated?.length > 0) {
                setSuccess(`✅ Created ${data.newlyCreated.length} sheet(s): ${data.newlyCreated.join(', ')}`);
            } else {
                setSuccess('✅ All sheets already exist! Ready to use.');
            }
            fetchRecords();
        } catch (err) {
            setError(`Failed to setup sheets: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Add test data for quick testing
    const handleAddTestData = async () => {
        setLoading(true);
        setError(null);
        try {
            const testData = TEST_DATA[activeSheet];
            await API_FUNCTIONS[activeSheet].create(testData);
            setSuccess(`🧪 Test ${activeSheet.slice(0, -1)} added successfully!`);
            fetchRecords();
        } catch (err) {
            setError(`Failed to add test data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fields = SHEET_FIELDS[activeSheet];

    return (
        <div className="sheet-tester">
            {/* Messages */}
            {error && (
                <div className="message error animate-slide-in">
                    <span className="message-icon">❌</span>
                    <span>{error}</span>
                    <button className="message-close" onClick={() => setError(null)}>×</button>
                </div>
            )}
            {success && (
                <div className="message success animate-slide-in">
                    <span className="message-icon">✅</span>
                    <span>{success}</span>
                    <button className="message-close" onClick={() => setSuccess(null)}>×</button>
                </div>
            )}

            {/* Sheet Tabs */}
            <div className="sheet-tabs">
                {Object.keys(SHEETS).map(key => (
                    <button
                        key={key}
                        className={`tab ${activeSheet === SHEETS[key] ? 'active' : ''}`}
                        onClick={() => setActiveSheet(SHEETS[key])}
                    >
                        <span className="tab-icon">
                            {key === 'DONATIONS' && '💰'}
                            {key === 'STUDENTS' && '🎓'}
                            {key === 'VOLUNTEERS' && '🤝'}
                            {key === 'FEEDBACK' && '💬'}
                        </span>
                        {SHEETS[key]}
                    </button>
                ))}
            </div>

            {/* Action Bar */}
            <div className="action-bar">
                <div className="action-left">
                    <button
                        className="btn-primary"
                        onClick={() => { resetForm(); setShowForm(true); }}
                        disabled={loading}
                    >
                        ➕ Add New {activeSheet.slice(0, -1)}
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={fetchRecords}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                    <button
                        className="btn-test"
                        onClick={handleAddTestData}
                        disabled={loading}
                    >
                        🧪 Add Test Data
                    </button>
                </div>
                <div className="action-right">
                    <button
                        className="btn-success"
                        onClick={handleAutoSetup}
                        disabled={loading}
                    >
                        🚀 Auto Setup All Sheets
                    </button>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="form-container animate-fade-in">
                    <div className="form-header">
                        <h3>{editingId ? `Edit Record #${editingId}` : `Add New ${activeSheet.slice(0, -1)}`}</h3>
                        <button className="btn-icon btn-secondary" onClick={resetForm}>✕</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            {fields.map(field => (
                                <div key={field.name} className={`form-group ${field.type === 'textarea' ? 'full-width' : ''}`}>
                                    <label>{field.name}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            rows={4}
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-success" disabled={loading}>
                                {loading ? '⏳ Saving...' : (editingId ? '💾 Update' : '➕ Create')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Records Table */}
            <div className="records-container">
                <div className="records-header">
                    <h3>📋 {activeSheet} Records</h3>
                    <span className="record-count">{records.length} records</span>
                </div>

                {loading && !records.length ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading records...</p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📭</span>
                        <h4>No records found</h4>
                        <p>Click "Add New" to create your first {activeSheet.slice(0, -1).toLowerCase()}</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="records-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Timestamp</th>
                                    {fields.slice(0, 4).map(field => (
                                        <th key={field.name}>{field.name}</th>
                                    ))}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record, index) => (
                                    <tr key={record.id || index} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                                        <td className="id-cell">{record.id}</td>
                                        <td className="timestamp-cell">
                                            {record.Timestamp ? new Date(record.Timestamp).toLocaleDateString() : '-'}
                                        </td>
                                        {fields.slice(0, 4).map(field => (
                                            <td key={field.name}>
                                                {field.type === 'number' && record[field.name]
                                                    ? `₹${Number(record[field.name]).toLocaleString()}`
                                                    : record[field.name] || '-'}
                                            </td>
                                        ))}
                                        <td className="actions-cell">
                                            <button
                                                className="btn-icon btn-secondary"
                                                onClick={() => handleEdit(record)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon btn-danger"
                                                onClick={() => handleDelete(record.id)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* API Info */}
            <div className="api-info">
                <h4>🔗 API Endpoints</h4>
                <div className="endpoint-grid">
                    <div className="endpoint highlight">
                        <span className="method get">GET</span>
                        <code>?action=setup</code>
                        <span className="endpoint-desc">Auto-creates all 4 sheets!</span>
                    </div>
                    <div className="endpoint">
                        <span className="method get">GET</span>
                        <code>?action=read&sheet={activeSheet}</code>
                    </div>
                    <div className="endpoint">
                        <span className="method post">POST</span>
                        <code>action: create, sheet: {activeSheet}</code>
                    </div>
                    <div className="endpoint">
                        <span className="method put">POST</span>
                        <code>action: update, sheet: {activeSheet}, id: [rowId]</code>
                    </div>
                    <div className="endpoint">
                        <span className="method delete">POST</span>
                        <code>action: delete, sheet: {activeSheet}, id: [rowId]</code>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SheetTester;
