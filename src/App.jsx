import { useState, useEffect } from 'react'
import './App.css'
import { SUBJECTS_DATA, GRADE_POINTS, STUDENTS } from './constants/subjects'

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxKEn5V1R1MKyuH_Q76Ae_a3-1PX1WvFnt_35Azi4JOlCNfAEYuX605rHG1NIyzrumB/exec";

function App() {
  const [step, setStep] = useState(1); // 1: Info, 2: Academic, 3: Activities, 4: Review
  const [student, setStudent] = useState({ rollNo: '', name: '', email: '' });
  const [activities, setActivities] = useState([{ id: Date.now(), category: '', files: [] }]);
  const [academicData, setAcademicData] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loginError, setLoginError] = useState('');
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

  const nextStep = () => {
    if (step === 1 && !student.rollNo) return alert("Please select a student first.");
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(s => s - 1);
    window.scrollTo(0, 0);
  };

  // Academic Logic
  const handleStudzoneLogin = async () => {
    if (!studzoneCreds.password) return alert("Enter password");
    setLoading(true);
    setLoginError('');
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'fetch', rollNo: student.rollNo, password: studzoneCreds.password })
      });
      const result = await response.json();
      if (result.success && result.data) {
        setAcademicData(result.data);
      } else {
        setLoginError(result.error || "Could not fetch original data. Check credentials.");
      }
    } catch (err) {
      setLoginError("Connection Failed: Check your internet or Script URL.");
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = (sem, index, grade) => {
    const prevSemData = academicData[sem] || { subjects: JSON.parse(JSON.stringify(SUBJECTS_DATA[sem] || [])) };
    prevSemData.subjects[index].grade = grade;
    setAcademicData(prev => ({ ...prev, [sem]: { ...prevSemData, subjects: [...prevSemData.subjects] } }));
  };

  const updateSubjectField = (sem, index, field, value) => {
    const prevSemData = academicData[sem];
    if (!prevSemData) return;
    prevSemData.subjects[index][field] = field === 'credits' ? parseFloat(value) : value;
    setAcademicData(prev => ({ ...prev, [sem]: { ...prevSemData, subjects: [...prevSemData.subjects] } }));
  };

  const addManualSubject = (sem) => {
    const prevSemData = academicData[sem] || { subjects: JSON.parse(JSON.stringify(SUBJECTS_DATA[sem] || [])) };
    prevSemData.subjects.push({ code: '', title: '', credits: 1, grade: '0', isManual: true });
    setAcademicData(prev => ({ ...prev, [sem]: { ...prevSemData, subjects: [...prevSemData.subjects] } }));
  };

  const removeManualSubject = (sem, index) => {
    const prevSemData = academicData[sem];
    if (!prevSemData) return;
    const newSubs = [...prevSemData.subjects];
    newSubs.splice(index, 1);
    setAcademicData(prev => ({ ...prev, [sem]: { ...prevSemData, subjects: newSubs } }));
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

  // Activity Logic
  const addActivity = () => setActivities([...activities, { id: Date.now(), category: '', files: [] }]);
  const updateActivity = (id, field, value) => setActivities(activities.map(a => a.id === id ? { ...a, [field]: value } : a));
  const removeActivity = (id) => setActivities(activities.filter(a => a.id !== id));

  const handleFileUpload = async (id, files) => {
    const processedFiles = [];
    for (let file of files) {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;
      processedFiles.push({ base64, type: file.type, name: file.name });
    }
    updateActivity(id, 'files', processedFiles);
  };

  // Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const academicWithCalcs = JSON.parse(JSON.stringify(academicData));
      Object.keys(academicWithCalcs).forEach(sem => {
        academicWithCalcs[sem].gpa = calculateGPA(sem);
        academicWithCalcs[sem].cgpa = calculateProgressiveCGPA(sem);
      });
      const payload = { student, activities, academic: academicWithCalcs };
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) setSuccess(true);
      else alert("Submission Error: " + result.error);
    } catch (err) {
      alert("Submission failed! Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo-main"><h1>PSG Tech</h1><p>Student Comprehensive Portal</p></div>
        <div className="stepper">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`step-item ${step === s ? 'active' : step > s ? 'completed' : ''}`}>
              {step > s ? '✓' : s}
            </div>
          ))}
        </div>
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <section className="card-main">
              <div className="section-title">Student Information</div>
              <div className="form-group"><label>Roll Number & Name</label>
                <select required onChange={(e) => handleStudentChange(e.target.value)} value={student.rollNo ? `${student.rollNo} - ${student.name}` : ""}>
                  <option value="" disabled>Select Student from Registry</option>
                  {STUDENTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Portal Email ID</label><input type="email" value={student.email} readOnly placeholder="auto-generated@psgtech.ac.in" /></div>
            </section>
          )}

          {step === 2 && (
            <section className="card-main">
              <div className="section-title">Academic Verification</div>
              {Object.keys(academicData).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>To verify your academic records, please log in briefly to the college portal.</p>
                  <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                    <div className="form-group" style={{ textAlign: 'left' }}><label>Studzone Password</label><input type="password" required onChange={e => setStudzoneCreds({ ...studzoneCreds, password: e.target.value })} /></div>
                    {loginError && <p style={{ color: '#cf222e', fontSize: '0.85rem', marginBottom: '10px' }}>{loginError}</p>}
                    <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={handleStudzoneLogin} disabled={loading}>{loading ? 'Authenticating...' : 'Fetch My Records'}</button>
                  </div>
                </div>
              ) : (
                <div className="academic-list">
                  {[1, 2, 3, 4, 5, 6, 7].map(sem => (
                    <div key={sem} style={{ marginBottom: '40px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0 }}>Semester {sem} <button type="button" className="btn-secondary" onClick={() => addManualSubject(sem)}>+ Arrear</button></h3>
                        <div style={{ fontSize: '0.85rem' }}>GPA: <b>{calculateGPA(sem)}</b> | CGPA: <b>{calculateProgressiveCGPA(sem)}</b></div>
                      </div>
                      <table className="grades-table">
                        <thead><tr><th>Code</th><th>Subject</th><th>Cr</th><th>Grade</th></tr></thead>
                        <tbody>
                          {(academicData[sem]?.subjects || SUBJECTS_DATA[sem]).map((sub, i) => (
                            <tr key={sub.code + i}>
                              <td>{sub.isManual && <button type="button" className="remove-row-btn" onClick={() => removeManualSubject(sem, i)}>&times;</button>}{sub.code}</td>
                              <td>{sub.isManual ? <input type="text" className="inline-input" value={sub.title} onChange={e => updateSubjectField(sem, i, 'title', e.target.value)} /> : sub.title}</td>
                              <td>{sub.isManual ? <input type="number" className="inline-input" style={{ width: '45px' }} value={sub.credits} onChange={e => updateSubjectField(sem, i, 'credits', e.target.value)} /> : sub.credits}</td>
                              <td><select value={sub.grade || ''} onChange={(e) => updateGrade(sem, i, e.target.value)}><option value="">-</option>{['10', '9', '8', '7', '6', '5', '0'].map(g => <option key={g} value={g}>{g}</option>)}</select></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {step === 3 && (
            <section className="card-main">
              <div className="section-title">Activity Records <button type="button" className="btn-secondary" onClick={addActivity}>+ Add New</button></div>
              {activities.map((act) => (
                <div className="activity-item-card" key={act.id}>
                  {activities.length > 1 && <button type="button" className="remove-btn" onClick={() => removeActivity(act.id)}>&times;</button>}
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
          )}

          {step === 4 && (
            <section className="card-main">
              <div className="section-title">Review & Submit</div>
              <div className="review-grid">
                <div className="review-item"><label>Student</label><p>{student.name}</p></div>
                <div className="review-item"><label>Roll Number</label><p>{student.rollNo}</p></div>
                <div className="review-item"><label>Academic Records</label><p>{Object.keys(academicData).length} Semesters Verified</p></div>
                <div className="review-item"><label>Activities</label><p>{activities.filter(a => a.category).length} Records Added</p></div>
              </div>
              <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', marginBottom: '30px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', margin: 0 }}>
                  <input type="checkbox" style={{ width: '20px', height: '20px' }} checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
                  <span>I confirm that all details provided above are true to the best of my knowledge.</span>
                </label>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '18px' }} disabled={loading || !confirmed}>
                {loading ? 'Processing Submission...' : 'Final Submit to Registry'}
              </button>
            </section>
          )}

          <div className="nav-actions">
            {step > 1 && <button type="button" className="btn-secondary" onClick={prevStep}>← Back</button>}
            <div style={{ flex: 1 }}></div>
            {step < 4 && <button type="button" className="btn-primary" onClick={nextStep}>Continue Step {step + 1} →</button>}
          </div>
        </form>
      </main>

      {success && (
        <div className="overlay" onClick={() => window.location.reload()}>
          <div className="success-content">
            <div style={{ fontSize: '3rem', color: 'var(--success)', marginBottom: '10px' }}>✓</div>
            <h2>Successfully Saved</h2>
            <p style={{ margin: '15px 0', color: 'var(--text-muted)' }}>Your records and file attachments have been securely saved to the registry and Google Drive.</p>
            <button className="btn-primary" style={{ width: '100%' }}>Return to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  )
}

function DynamicFields({ activity, update, handleFile }) {
  const cat = activity.category;
  if (!cat) return <p style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>Provide details for this activity.</p>;
  return (
    <div className="dynamic-inputs">
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {cat === "Awards / Prize Won" && <>
          <div className="form-group"><label>Award Name</label><input required type="text" onChange={e => update('awardName', e.target.value)} /></div>
          <div className="form-group"><label>Date</label><input required type="date" onChange={e => update('date', e.target.value)} /></div>
        </>}
        {cat === "Course Completed" && <>
          <div className="form-group"><label>Course Name</label><input required type="text" onChange={e => update('courseName', e.target.value)} /></div>
          <div className="form-group"><label>Cert No</label><input required type="text" onChange={e => update('certificateNo', e.target.value)} /></div>
          <div className="form-group"><label>Date</label><input required type="date" onChange={e => update('date', e.target.value)} /></div>
        </>}
        {cat === "Sports Participation / Achievement" && <>
          <div className="form-group"><label>Event Name</label><input required type="text" onChange={e => update('eventName', e.target.value)} /></div>
          <div className="form-group"><label>Place</label><input required type="text" onChange={e => update('place', e.target.value)} /></div>
          <div className="form-group"><label>Level</label><select required onChange={e => update('level', e.target.value)}><option value="">-</option><option value="Intra">Intra</option><option value="Inter">Inter</option></select></div>
          <div className="form-group"><label>Cat</label><select required onChange={e => update('sportCategory', e.target.value)}><option value="">-</option><option value="Dist">District</option><option value="State">State</option><option value="Nat">National</option><option value="Intl">International</option></select></div>
        </>}
        {(cat === "In-Plant Training" || cat === "Internship") && <>
          <div className="form-group"><label>Company</label><input required type="text" onChange={e => update('companyName', e.target.value)} /></div>
          <div className="form-group"><label>Location</label><input required type="text" onChange={e => update('location', e.target.value)} /></div>
          <div className="form-group"><label>Start</label><input required type="date" onChange={e => update('startDate', e.target.value)} /></div>
          <div className="form-group"><label>End</label><input required type="date" onChange={e => update('endDate', e.target.value)} /></div>
        </>}
      </div>
      <div className="form-group"><label>Upload Proof (PDF/JPG)</label>
        <input type="file" multiple accept=".pdf,.jpg,.png" onChange={(e) => handleFile(e.target.files)} />
        {activity.files.length > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}> ✓ {activity.files.length} files attached</span>}
      </div>
    </div>
  )
}

export default App
