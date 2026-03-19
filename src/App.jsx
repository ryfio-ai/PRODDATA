import { useState, useEffect } from 'react'
import './App.css'
import { SUBJECTS_DATA, GRADE_POINTS, STUDENTS } from './constants/subjects'

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxKEn5V1R1MKyuH_Q76Ae_a3-1PX1WvFnt_35Azi4JOlCNfAEYuX605rHG1NIyzrumB/exec";

function App() {
  const [activeTab, setActiveTab] = useState('activities');
  const [student, setStudent] = useState({ rollNo: '', name: '', email: '' });
  const [activities, setActivities] = useState([{ id: Date.now(), category: '', files: [] }]);
  const [academicData, setAcademicData] = useState({});
  const [currentSem, setCurrentSem] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Studzone specific state
  const [academicStep, setAcademicStep] = useState('login'); // 'login' or 'dashboard'
  const [academicSubTab, setAcademicSubTab] = useState('summary'); // 'summary', 'courseList', 'target'
  const [studzoneCreds, setStudzoneCreds] = useState({ rollNo: '', password: '' });

  useEffect(() => {
    if (student.rollNo) {
      setStudent(prev => ({ ...prev, email: student.rollNo.toLowerCase() + "@psgtech.ac.in" }));
      setStudzoneCreds(prev => ({ ...prev, rollNo: student.rollNo }));
    }
  }, [student.rollNo]);

  const handleStudentChange = (val) => {
    const [rollNo, name] = val.split(' - ');
    setStudent({ rollNo, name, email: '' });
  };

  const addActivity = () => {
    setActivities([...activities, { id: Date.now(), category: '', files: [] }]);
  };

  const updateActivity = (id, field, value) => {
    setActivities(activities.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleFileUpload = async (id, files) => {
    const processedFiles = [];
    for (let file of files) {
      const base64 = await toBase64(file);
      processedFiles.push({ base64, type: file.type, name: file.name });
    }
    updateActivity(id, 'files', processedFiles);
  };

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const updateGrade = (sem, index, grade) => {
    const prevSemData = academicData[sem] || { subjects: JSON.parse(JSON.stringify(SUBJECTS_DATA[sem] || [])) };
    prevSemData.subjects[index].grade = grade;
    setAcademicData(prev => ({ ...prev, [sem]: prevSemData }));
  };

  const updateSubjectField = (sem, index, field, value) => {
    const prevSemData = academicData[sem];
    prevSemData.subjects[index][field] = field === 'credits' ? parseFloat(value) : value;
    setAcademicData(prev => ({ ...prev, [sem]: prevSemData }));
  };

  const addManualSubject = (sem) => {
    const prevSemData = academicData[sem] || { subjects: JSON.parse(JSON.stringify(SUBJECTS_DATA[sem] || [])) };
    prevSemData.subjects.push({ code: '', title: '', credits: 1, grade: '0', isManual: true });
    setAcademicData(prev => ({ ...prev, [sem]: prevSemData }));
  };

  const removeManualSubject = (sem, index) => {
    const prevSemData = academicData[sem];
    if (!prevSemData) return;
    const newSubjects = [...prevSemData.subjects];
    newSubjects.splice(index, 1);
    setAcademicData(prev => ({ ...prev, [sem]: { ...prevSemData, subjects: newSubjects } }));
  };

  const calculateGPA = (sem) => {
    const data = academicData[sem];
    if (!data) return "0.0000";
    let pts = 0, credits = 0, hasArrear = false;
    data.subjects.forEach(sub => {
      if (sub.grade === '0') hasArrear = true;
      if (sub.grade && sub.credits > 0) {
        credits += sub.credits;
        pts += sub.credits * GRADE_POINTS[sub.grade];
      }
    });
    return hasArrear ? "Arrear" : (credits > 0 ? (pts / credits).toFixed(4) : "0.0000");
  };

  const calculateProgressiveCGPA = (uptoSem) => {
    let pts = 0, credits = 0, hasArrear = false;
    for (let s = 1; s <= uptoSem; s++) {
      const semData = academicData[s];
      if (!semData) continue;
      semData.subjects.forEach(sub => {
        if (sub.grade === '0') hasArrear = true;
        if (sub.grade && sub.credits > 0) {
          credits += sub.credits;
          pts += sub.credits * GRADE_POINTS[sub.grade];
        }
      });
    }
    return hasArrear ? "Arrear" : (credits > 0 ? (pts / credits).toFixed(4) : "0.0000");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student.rollNo) return alert("Select student first!");
    setLoading(true);

    try {
      const academicWithCalcs = JSON.parse(JSON.stringify(academicData));
      Object.keys(academicWithCalcs).forEach(sem => {
        academicWithCalcs[sem].gpa = calculateGPA(sem);
        academicWithCalcs[sem].cgpa = calculateProgressiveCGPA(sem);
      });

      const payload = { student, activities, academic: academicWithCalcs };
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });
      setSuccess(true);
    } catch (err) {
      alert("Submission failed!");
    } finally {
      setLoading(false);
    }
  };

  const [loginError, setLoginError] = useState('');

  const handleStudzoneLogin = async () => {
    if (!studzoneCreds.password) return alert("Enter password");

    setLoading(true);
    setLoginError('');
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'fetch',
          rollNo: student.rollNo,
          password: studzoneCreds.password
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        setAcademicData(result.data);
        setAcademicStep('dashboard');
      } else {
        setLoginError(result.error || "Could not fetch original data. Check credentials.");
      }
    } catch (err) {
      setLoginError("Connection Failed: Ensure your Google Apps Script is deployed as 'Anyone', the URL is correct, and you have authorized the script once in the editor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo-main"><h1>PSG Tech</h1><p>Student Comprehensive Portal</p></div>
        <div className="nav-tabs">
          <button type="button" className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`} onClick={() => setActiveTab('activities')}>Activities</button>
          <button type="button" className={`tab-btn ${activeTab === 'academic' ? 'active' : ''}`} onClick={() => setActiveTab('academic')}>Academic</button>
        </div>
      </header>

      <main className="card-main">
        <form onSubmit={handleSubmit}>
          <section className="form-section">
            <div className="section-title">Student Information</div>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group"><label>Roll Number & Name</label>
                <select required onChange={(e) => handleStudentChange(e.target.value)} value={student.rollNo ? `${student.rollNo} - ${student.name}` : ""}>
                  <option value="" disabled>Select Student</option>
                  {STUDENTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Email ID</label><input type="email" value={student.email} readOnly placeholder="Auto-email" /></div>
            </div>
          </section>

          {activeTab === 'activities' ? (
            <section className="form-section">
              <div className="section-title">Activity Records <button type="button" className="btn-secondary" onClick={addActivity}>+ Add Record</button></div>
              {activities.map((act) => (
                <div className="activity-block" key={act.id}>
                  {activities.length > 1 && <button type="button" className="remove-btn" onClick={() => setActivities(activities.filter(a => a.id !== act.id))}>&times;</button>}
                  <div className="form-group"><label>Category</label>
                    <select required value={act.category} onChange={(e) => updateActivity(act.id, 'category', e.target.value)}>
                      <option value="" disabled>Select Category</option>
                      <option value="Awards / Prize Won">Awards / Prize Won</option>
                      <option value="Course Completed">Course Completed</option>
                      <option value="Sports Participation / Achievement">Sports Participation / Achievement</option>
                      <option value="In-Plant Training">In-Plant Training</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <DynamicFields activity={act} update={(f, v) => updateActivity(act.id, f, v)} handleFile={(f) => handleFileUpload(act.id, f)} />
                </div>
              ))}
            </section>
          ) : (
            academicStep === 'login' ? (
              <div className="login-card">
                <div className="form-group"><label>RollNo:</label><input type="text" value={studzoneCreds.rollNo} readOnly /></div>
                <div className="form-group"><label>Password:</label><input type="password" placeholder="Studzone Password" required onChange={e => setStudzoneCreds({ ...studzoneCreds, password: e.target.value })} /></div>
                {loginError && <p style={{ color: '#ff4444', fontSize: '0.85rem', marginBottom: '15px' }}>{loginError}</p>}
                <button type="button" className="btn-primary" onClick={handleStudzoneLogin} disabled={loading}>
                  {loading ? 'Connecting...' : 'Submit'}
                </button>
                <div className="login-footer">🛡️ Your credentials and data are not stored!</div>
              </div>
            ) : (
              <section className="form-section">
                <div className="sub-tabs">
                  {['summary', 'courseList', 'target'].map(t => (
                    <button type="button" key={t} className={`sub-tab-btn ${academicSubTab === t ? 'active' : ''}`} onClick={() => setAcademicSubTab(t)}>
                      {t === 'summary' ? 'CGPA' : t === 'courseList' ? 'Course List' : 'Target'}
                    </button>
                  ))}
                </div>
                {academicSubTab === 'summary' && (
                  <div className="summary-view">
                    <div className="toggle-container">
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                      <span>Marksheet Values</span>
                    </div>
                    <table className="grades-table">
                      <thead><tr><th>SEMESTER</th><th>GPA</th><th>CGPA</th></tr></thead>
                      <tbody>
                        {[1, 2, 3, 4, 5, 6, 7].map(s => (
                          <tr key={s}><td>{s}</td><td>{calculateGPA(s)}</td><td>{calculateProgressiveCGPA(s)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {academicSubTab === 'courseList' && (
                  <div className="course-list-view">
                    <p style={{ marginBottom: '15px', fontSize: '0.9rem', opacity: 0.8 }}>Swipe left on table if you're on mobile to see credits and grade columns</p>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <div key={sem} style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid var(--secondary)', paddingBottom: '5px', marginBottom: '15px' }}>
                          <h3 style={{ margin: 0, color: '#fff' }}>Semester {sem} <button type="button" className="btn-secondary arrear-badge" onClick={() => addManualSubject(sem)}>+ Add Arrear</button></h3>
                          {sem < 8 && <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                            GPA: <span style={{ color: 'var(--secondary)' }}>{calculateGPA(sem)}</span> | 
                            CGPA: <span style={{ color: 'var(--secondary)' }}>{calculateProgressiveCGPA(sem)}</span>
                          </div>}
                        </div>
                        <table className="grades-table">
                          <thead><tr><th>S.No</th><th>COURSE CODE</th><th>COURSE TITLE</th><th>CREDITS</th><th>GRADE</th></tr></thead>
                          <tbody>
                            {(academicData[sem]?.subjects || SUBJECTS_DATA[sem]).map((sub, i) => (
                              <tr key={sub.code + i}>
                                <td style={{ position: 'relative' }}>
                                  {i + 1}
                                  {sub.isManual && (
                                    <button type="button" className="remove-row-btn" onClick={() => removeManualSubject(sem, i)} title="Remove Arrear">&times;</button>
                                  )}
                                </td>
                                <td>{sub.isManual ? <input type="text" className="inline-input" value={sub.code} onChange={e => updateSubjectField(sem, i, 'code', e.target.value)} /> : sub.code}</td>
                                <td>{sub.isManual ? <input type="text" className="inline-input" value={sub.title} onChange={e => updateSubjectField(sem, i, 'title', e.target.value)} /> : sub.title}</td>
                                <td>{sub.isManual ? <input type="number" className="inline-input" style={{ width: '40px' }} value={sub.credits} onChange={e => updateSubjectField(sem, i, 'credits', e.target.value)} /> : sub.credits}</td>
                                <td>
                                  <select value={sub.grade || ''} onChange={(e) => updateGrade(sem, i, e.target.value)}>
                                    <option value="">-</option>
                                    {['10', '9', '8', '7', '6', '5', '0'].map(g => <option key={g} value={g}>{g}</option>)}
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}
                {academicSubTab === 'target' && (
                  <div className="target-view">
                    <div className="info-banner">
                      Edit the expected grades for your current courses and submit to compute expected CGPA.
                    </div>
                    <table className="grades-table">
                      <thead><tr><th>COURSE</th><th>CREDITS</th><th>GRADE</th></tr></thead>
                      <tbody>
                        {(academicData[8]?.subjects || SUBJECTS_DATA[8]).map((sub, i) => (
                          <tr key={sub.code + i}><td>{sub.title}</td><td>{sub.credits}</td>
                            <td><select value={sub.grade || ''} onChange={(e) => updateGrade(8, i, e.target.value)}>
                              <option value="">-</option>
                              {['10', '9', '8', '7', '6', '5', '0'].map(g => <option key={g} value={g}>{g}</option>)}
                            </select></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="total-credits-label">
                      Total credits for 8th semester: 10
                    </div>
                    <div className="gpa-bar" style={{ marginTop: '20px' }}>
                      <div><span className="gpa-label">Target CGPA:</span> <span className="gpa-value" style={{ color: 'var(--secondary)' }}>{calculateProgressiveCGPA(8)}</span></div>
                    </div>
                  </div>
                )}
              </section>
            )
          )}

          <div className="form-footer-unified" style={{ marginTop: '40px' }}>
            <div className="confirmation-row">
              <label className="confirm-label">
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
                <span>I hereby confirm that all the information provided above is true and accurate.</span>
              </label>
            </div>
            <button type="submit" className="btn-primary btn-unified" disabled={loading || !confirmed}>
              {loading ? 'Submitting...' : 'Submit All Data'}
            </button>
          </div>
        </form>
      </main>

      {success && (
        <div className="overlay" onClick={() => window.location.reload()}>
          <div className="success-content">
            <h2 style={{ color: 'var(--success)', fontSize: '2rem' }}>✓ Success!</h2>
            <p style={{ margin: '16px 0' }}>Records saved to Google Sheets.</p>
            <button className="btn-primary">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

function DynamicFields({ activity, update, handleFile }) {
  const cat = activity.category;
  if (!cat) return <p style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>Select a category to add details.</p>;
  
  return (
    <div className="dynamic-inputs">
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {cat === "Awards / Prize Won" && <>
          <div className="form-group"><label>Name of Award</label><input required type="text" onChange={e => update('awardName', e.target.value)} /></div>
          <div className="form-group"><label>Date of Award</label><input required type="date" onChange={e => update('date', e.target.value)} /></div>
        </>}
        
        {cat === "Course Completed" && <>
          <div className="form-group"><label>Course Name</label><input required type="text" onChange={e => update('courseName', e.target.value)} /></div>
          <div className="form-group"><label>Certificate Number</label><input required type="text" onChange={e => update('certificateNo', e.target.value)} /></div>
          <div className="form-group"><label>Date of Completion</label><input required type="date" onChange={e => update('date', e.target.value)} /></div>
        </>}
        
        {cat === "Sports Participation / Achievement" && <>
          <div className="form-group"><label>Event Name</label><input required type="text" onChange={e => update('eventName', e.target.value)} /></div>
          <div className="form-group"><label>Place</label><input required type="text" onChange={e => update('place', e.target.value)} /></div>
          <div className="form-group"><label>Intra / Inter College</label>
            <select required onChange={e => update('level', e.target.value)}>
              <option value="">Select Level</option>
              <option value="Intra College">Intra College</option>
              <option value="Inter College">Inter College</option>
            </select>
          </div>
          <div className="form-group"><label>Category Level</label>
            <select required onChange={e => update('sportCategory', e.target.value)}>
              <option value="">Select Category</option>
              <option value="District">District</option>
              <option value="State">State</option>
              <option value="National">National</option>
              <option value="International">International</option>
            </select>
          </div>
          <div className="form-group"><label>Date</label><input required type="date" onChange={e => update('date', e.target.value)} /></div>
        </>}
        
        {(cat === "In-Plant Training" || cat === "Internship") && <>
          <div className="form-group"><label>Company Name</label><input required type="text" onChange={e => update('companyName', e.target.value)} /></div>
          <div className="form-group"><label>Location</label><input required type="text" onChange={e => update('location', e.target.value)} /></div>
          <div className="form-group"><label>Start Date</label><input required type="date" onChange={e => update('startDate', e.target.value)} /></div>
          <div className="form-group"><label>End Date</label><input required type="date" onChange={e => update('endDate', e.target.value)} /></div>
        </>}
      </div>
      <div className="form-group" style={{ marginTop: '15px' }}><label>File Upload (Proof)</label>
        <input type="file" multiple accept=".pdf,.jpg,.png" onChange={(e) => handleFile(e.target.files)} />
        {activity.files.length > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}> {activity.files.length} files attached</span>}
      </div>
    </div>
  )
}

export default App
