import { useState, useEffect } from 'react'
import './App.css'
import { SUBJECTS_DATA, GRADE_POINTS, STUDENTS } from './constants/subjects'

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyozIZbbaGt2DfUzPdElI6RVSnjNOgguffht01315K-Ad5hH6h4rgqGvlkO3IuOU2jl/exec";

function App() {
  const [step, setStep] = useState(1); // 1: Info, 2: Academic, 3: Activities, 4: Review
  const [student, setStudent] = useState({ rollNo: '', name: '', email: '' });
  const [activities, setActivities] = useState([{ id: Date.now(), category: '', semester: 1, files: [] }]);
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
  const addActivity = () => setActivities([...activities, { id: Date.now(), category: '', semester: 1, files: [] }]);
  const updateActivity = (id, field, value) => setActivities(activities.map(a => a.id === id ? { ...a, [field]: value } : a));
  const removeActivity = (id) => setActivities(activities.filter(a => a.id !== id));

  const handleFileUpload = async (id, files, field = 'files') => {
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
    updateActivity(id, field, processedFiles);
  };


  // Submission
      const groupedActivities = {
        placementOffers: activities.filter(a => a.category === "Placement Offer"),
        higherStudies: activities.filter(a => a.category === "Higher Studies"),
        officialInternships: activities.filter(a => a.category === "Internship Official"),
        personalInternships: activities.filter(a => a.category === "Internship Personal"),
        publishedPapers: activities.filter(a => a.category === "Published Journal Papers / Conference"),
        awards: activities.filter(a => a.category === "Award Data"),
        events: activities.filter(a => a.category === "Event Data"),
        activities: activities.filter(a => ["Awards / Prize Won", "Course Completed", "Sports Participation / Achievement"].includes(a.category)),
        visitsAbroad: activities.filter(a => a.category === "Visit Abroad"),
        competitiveExams: activities.filter(a => a.category === "Competitive Exam")
      };

      const payload = { student, ...groupedActivities, academic: academicWithCalcs };
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
                      <option value="Placement Offer">1. Placement Offer</option>
                      <option value="Higher Studies">2. Higher Studies</option>
                      <option value="Internship Official">3. Internship Official</option>
                      <option value="Internship Personal">4. Internship Personal</option>
                      <option value="Published Journal Papers / Conference">5. Published Journal Papers / Conference</option>
                      <option value="Award Data">6. Award Data</option>
                      <option value="Event Data">7. Event Data</option>
                      <option value="Competitive Exam">Competitive Exam</option>
                      <option value="Visit Abroad">Visit Abroad</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label>Activity Semester</label>
                    <select value={act.semester} onChange={(e) => updateActivity(act.id, 'semester', parseInt(e.target.value))}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                  <DynamicFields activity={act} student={student} update={(f, v) => updateActivity(act.id, f, v)} handleFile={(f, field) => handleFileUpload(act.id, f, field)} />


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
  );
}

function DynamicFields({ activity, student, update, handleFile }) {
  const cat = activity.category;
  if (!cat) return <p style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>Provide details for this activity.</p>;
  return (
    <div className="dynamic-inputs">
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
        <div className="form-group"><label>Roll Number</label><input type="text" value={student.rollNo} readOnly className="readonly-input" /></div>
        <div className="form-group"><label>Student Name</label><input type="text" value={student.name} readOnly className="readonly-input" /></div>
      </div>

      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {cat === "Placement Offer" && <>
          <div className="form-group"><label>Contact Details</label><input required type="text" placeholder="Phone / Personal Email" onChange={e => update('contactDetails', e.target.value)} /></div>
          <div className="form-group"><label>Company Name</label><input required type="text" onChange={e => update('companyName', e.target.value)} /></div>
          <div className="form-group"><label>Role</label><input required type="text" placeholder="Designation" onChange={e => update('role', e.target.value)} /></div>
          <div className="form-group"><label>Pay Package (Lakhs per annum)</label><input required type="number" step="0.1" onChange={e => update('payPackage', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Upload Proof (Offer Letter)</label>
            <input type="file" required accept=".pdf,.jpg,.png" onChange={(e) => handleFile(e.target.files)} />
            {activity.files?.length > 0 && <span className="success-tag">✓ Attached</span>}
          </div>
        </>}

        {cat === "Higher Studies" && <>
          <div className="form-group"><label>Institution Joined</label><input required type="text" onChange={e => update('institutionJoined', e.target.value)} /></div>
          <div className="form-group"><label>Programme Admitted To</label><input required type="text" placeholder="e.g., MSc, MBA" onChange={e => update('programmeAdmitted', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Upload Proof (Admission Letter/ID)</label>
            <input type="file" required accept=".pdf,.jpg,.png" onChange={(e) => handleFile(e.target.files)} />
          </div>
        </>}

        {(cat === "Internship Official" || cat === "Internship Personal") && <>
          <div className="form-group"><label>Contact Details</label><input required type="text" onChange={e => update('contactDetails', e.target.value)} /></div>
          <div className="form-group"><label>Company Name</label><input required type="text" onChange={e => update('companyName', e.target.value)} /></div>
          <div className="form-group"><label>Location</label><input required type="text" onChange={e => update('location', e.target.value)} /></div>
          <div className="form-group"><label>Duration</label><input required type="text" placeholder="e.g. 3 Months" onChange={e => update('duration', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Project Title</label><input required type="text" onChange={e => update('projectTitle', e.target.value)} /></div>
          
          {cat === "Internship Official" ? (
            <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Upload Proof (Certificate)</label>
              <input type="file" required accept=".pdf,.jpg,.png" onChange={(e) => handleFile(e.target.files)} />
            </div>
          ) : (
            <>
              <div className="form-group"><label>Proof 1 (Offer Letter)</label>
                <input type="file" required accept=".pdf,.jpg,.png" onChange={(e) => handleFile(e.target.files, 'offerFiles')} />
                {activity.offerFiles?.length > 0 && <span className="success-tag">✓</span>}
              </div>
              <div className="form-group"><label>Proof 2 (Certificate)</label>
                <input type="file" required accept=".pdf,.jpg,.png" onChange={(e) => handleFile(e.target.files, 'certFiles')} />
                {activity.certFiles?.length > 0 && <span className="success-tag">✓</span>}
              </div>
            </>
          )}
        </>}

        {cat === "Published Journal Papers / Conference" && <>
          <div className="form-group"><label>Author Name (Student)</label><input type="text" value={student.name} readOnly /></div>
          <div className="form-group"><label>Name of the Teacher (Underguidance)</label><input required type="text" onChange={e => update('teacherName', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Title of the Book Published (Theme)</label><input required type="text" onChange={e => update('bookTitle', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Title of the paper/chapter</label><input required type="text" onChange={e => update('paperTitle', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Title of the Proceedings / Conference</label><input required type="text" onChange={e => update('proceedingsTitle', e.target.value)} /></div>
          <div className="form-group"><label>Level</label><select required onChange={e => update('level', e.target.value)}><option value="">-</option><option value="National">National</option><option value="International">International</option></select></div>
          <div className="form-group"><label>Year and Month of publication</label><input required type="text" placeholder="MM/YYYY" onChange={e => update('date', e.target.value)} /></div>
          <div className="form-group"><label>ISBN of book/proceedings</label><input required type="text" onChange={e => update('isbn', e.target.value)} /></div>
          <div className="form-group"><label>DOI / Link</label><input type="text" onChange={e => update('doiLink', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Upload Proof (Paper PDF)</label>
            <input type="file" required accept=".pdf,.jpg,.png" onChange={(e) => handleFile(e.target.files)} />
          </div>
        </>}

        {cat === "Award Data" && <>
          <div className="form-group"><label>Name of the Mentor/Guide (optional)</label><input type="text" onChange={e => update('mentorName', e.target.value)} /></div>
          <div className="form-group"><label>Name of the award</label><input required type="text" onChange={e => update('awardName', e.target.value)} /></div>
          <div className="form-group"><label>Awarding Body</label><input required type="text" placeholder="Govt / Recognised / College" onChange={e => update('awardingBody', e.target.value)} /></div>
          <div className="form-group"><label>Month and Year</label><input required type="text" placeholder="MM/YYYY" onChange={e => update('date', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Upload Proof</label>
            <input type="file" required accept=".pdf" onChange={(e) => handleFile(e.target.files)} />
          </div>
        </>}

        {cat === "Event Data" && <>
          <div className="form-group"><label>Name of the event</label><input required type="text" onChange={e => update('eventName', e.target.value)} /></div>
          <div className="form-group"><label>Team/Individual</label><select required onChange={e => update('participationType', e.target.value)}><option value="Individual">Individual</option><option value="Team">Team</option></select></div>
          <div className="form-group"><label>Name of the Award/medal</label><input required type="text" onChange={e => update('medal', e.target.value)} /></div>
          <div className="form-group"><label>Level</label>
            <select required onChange={e => update('level', e.target.value)}>
              <option value="">-</option>
              <option value="Intra-clg">Intra-college</option>
              <option value="Inter-clg">Inter-college</option>
              <option value="State">State</option>
              <option value="National">National</option>
              <option value="International">International</option>
            </select>
          </div>
          <div className="form-group"><label>Month and Year</label><input required type="text" placeholder="MM/YYYY" onChange={e => update('date', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Upload Proof</label>
            <input type="file" required accept=".pdf" onChange={(e) => handleFile(e.target.files)} />
          </div>
        </>}

        {cat === "Competitive Exam" && <>
          <div className="form-group"><label>Exam Name</label><input required type="text" onChange={e => update('exam', e.target.value)} /></div>
          <div className="form-group"><label>Score</label><input required type="text" onChange={e => update('score', e.target.value)} /></div>
          <div className="form-group"><label>Appeared</label><select required onChange={e => update('appeared', e.target.value)}><option value="Yes">Yes</option><option value="No">No</option></select></div>
          <div className="form-group"><label>Qualified</label><select required onChange={e => update('qualified', e.target.value)}><option value="Yes">Yes</option><option value="No">No</option></select></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Upload Proof</label>
            <input type="file" multiple accept=".pdf,.jpg,.png" onChange={(e) => handleFile(e.target.files)} />
          </div>
        </>}

        {cat === "Visit Abroad" && <>
          <div className="form-group"><label>Place</label><input required type="text" onChange={e => update('place', e.target.value)} /></div>
          <div className="form-group"><label>Purpose</label><input required type="text" onChange={e => update('purpose', e.target.value)} /></div>
          <div className="form-group"><label>Start Date</label><input required type="date" onChange={e => update('periodFrom', e.target.value)} /></div>
          <div className="form-group"><label>End Date</label><input required type="date" onChange={e => update('periodTo', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Upload Proof</label>
            <input type="file" multiple accept=".pdf,.jpg,.png" onChange={(e) => handleFile(e.target.files)} />
          </div>
        </>}
      </div>
    </div>
  );
}

export default App;

