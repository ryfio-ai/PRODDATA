const students = [
    "22P102 - ABIN S", "22P103 - ARAVIND KAARTHIC PS", "22P104 - BHAGIRATHI SENTHILKUMAR",
    "22P105 - DEEPAK SARAN M", "22P106 - DEVISRI J", "22P107 - DHAKSHANESH",
    "22P109 - FAZIL RAHMAN D", "22P110 - HARIHARAN S", "22P111 - J S HEMACHANDRAN",
    "22P112 - JAYASADHA S", "22P113 - KANISHKA S", "22P114 - KARTHIKEYAN M",
    "22P115 - KARTHIKRAJA K", "22P116 - KAVIYA R", "22P117 - KRISHNA PRASATH U M",
    "22P118 - LAKSHMI PRIYA S", "22P119 - V B LATCHEESH", "22P120 - MIDHUNAA SREE S",
    "22P121 - MURALITHARAN", "22P122 - NIMALESHWAR DK", "22P123 - NITIN SRIRAM",
    "22P124 - PRIYANKA R", "22P125 - SANTHOSHKUMAR J", "22P126 - SATHISH KUMAR P",
    "22P127 - SOORYANIVASH JS", "22P128 - SRIADHIKESAVAN R", "22P129 - SUBIRAMANIAN VJ",
    "22P130 - SUDARSAN R", "22P131 - SWETHAA K S", "22P132 - V JAYASENTHILNATHAN",
    "22P133 - VINISHA S", "22P201 - ABDUL RAHMAN P", "22P202 - AKSHAYA SHREE G",
    "22P203 - ASHWIN PRABHU K", "22P204 - BALAJI C", "22P205 - DANYAA R",
    "22P206 - DEEPSHEELA V", "22P207 - DHARSHINI PU", "22P208 - DIYA VISALI R S",
    "22P209 - GOKUL RAMANA V", "22P210 - GURPREET PAUL", "22P212 - JAI SURYA U",
    "22P213 - JEEVANYA S", "22P214 - JEYA SURIYA", "22P215 - KAVIN K",
    "22P216 - KOWSHIKA D", "22P217 - KRISHNAVARUN S", "22P218 - NAVINA I G",
    "22P219 - P NETHRA NITHYA SREE", "22P221 - RAHUL BM", "22P222 - SANJAI PS",
    "22P223 - SHANMUGAM S", "22P224 - V SHRI KUMAR", "23P401 - DHARANESHWARAN R",
    "23P402 - HARIHARAN M", "23P403 - M MOHANA KRISHNAN", "23P404 - PRAVEEN",
    "23P405 - SASIDHARAN K", "23P431 - ANANDHA VIGNESH A", "23P432 - ARSHAK",
    "23P433 - KALIYAPPAN S", "23P434 - SARAN S", "23P436 - VIGNESHWARAN M",
    "23P437 - RANJITH KUMAR K", "23P438 - AHAMED YASHICK M", "23P439 - KARTHIK A S"
];

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyc8JJHZJBjyz0_oPL6fFu53ZBnRuH7eJ6DwtiODmg73BDWnEGZlhnIMfDC_Rsjfu3E/exec";

const ACTIVITY_TYPES = [
    "NCC", "General Quiz", "Marketing", "Engineering Quiz", "How Stuffs Works", 
    "Paper Presentation", "Volleyball", "NSS", "Anna University Zonal", 
    "Inter State Sepaktakraw", "Zonal Tournaments", "Inter Zonal Tournaments", 
    "CDCA Knockout Tournament", "Tech Hockey League", "Prodigy – Logos and Captions", 
    "Fruit Carving", "Football", "Kho Kho", "Other"
];

const EXAM_TYPES = ["GATE", "CAT", "GRE", "IELTS", "TOEFL", "AFCAT", "CDS", "HAL", "Other"];
const SEMESTERS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];

const TAB_TITLES = {
    studentProfile: "Student Profile",
    visitsAbroad: "Visits Abroad",
    activities: "Activities (Co-curricular & Extra)",
    awards: "Awards & Recognition",
    exams: "Competitive Examinations",
    officialInternships: "Official Internships",
    personalInternships: "Personal Internships",
    placementOffers: "Placement Offers",
    higherStudies: "Higher Studies",
    publishedPapers: "Research Papers & Conferences"
};

const sectionState = {
    visitsAbroad: { count: 0 },
    activities: { count: 0 },
    awards: { count: 0 },
    exams: { count: 0 },
    officialInternships: { count: 0 },
    personalInternships: { count: 0 },
    placementOffers: { count: 0 },
    higherStudies: { count: 0 },
    publishedPapers: { count: 0 }
};

document.addEventListener('DOMContentLoaded', () => {
    initDynamicDropdown();
    initTabs();
    initFlowNavigation();
    
    initDynamicSection('visitsAbroad', renderVisitAbroadBlock, 'addVisitsAbroadBtn', 'visitsAbroadContainer');
    initDynamicSection('activities', renderActivityBlock, 'addActivitiesBtn', 'activitiesContainer');
    initDynamicSection('awards', renderAwardBlock, 'addAwardsBtn', 'awardsContainer');
    initDynamicSection('exams', renderExamBlock, 'addExamsBtn', 'examsContainer');
    initDynamicSection('officialInternships', renderInternshipBlock, 'addOfficialInternshipsBtn', 'officialInternshipsContainer');
    initDynamicSection('personalInternships', renderInternshipBlock, 'addPersonalInternshipsBtn', 'personalInternshipsContainer');
    initDynamicSection('placementOffers', renderPlacementBlock, 'addPlacementOffersBtn', 'placementOffersContainer');
    initDynamicSection('higherStudies', renderHigherStudiesBlock, 'addHigherStudiesBtn', 'higherStudiesContainer');
    initDynamicSection('publishedPapers', renderPublishedPaperBlock, 'addPublishedPapersBtn', 'publishedPapersContainer');

    initFormSubmission();
});

async function initDynamicDropdown() {
    const studentSelect = document.getElementById('studentSelect');
    const studentEmail = document.getElementById('studentEmail');
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.disabled = true;

    let submittedRolls = [];
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getSubmissions`);
        const result = await response.json();
        if (result.success) submittedRolls = result.data;
    } catch (e) {
        console.error("Could not fetch submissions", e);
    }

    const availableStudents = students.filter(s => !submittedRolls.includes(s.split(' - ')[0]));

    availableStudents.forEach(student => {
        const option = document.createElement('option');
        option.value = student;
        option.textContent = student;
        studentSelect.appendChild(option);
    });

    studentSelect.addEventListener('change', () => {
        const selected = studentSelect.value;
        if (selected) {
            const rollNo = selected.split(' - ')[0];
            studentEmail.value = rollNo.toLowerCase() + "@psgtech.ac.in";
            syncPrefilledStudentFields();
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

function initTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    const navItems = document.querySelectorAll('.nav-item');
    const titleEl = document.getElementById('currentTabTitle');
    
    // Update Sidebar
    navItems.forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-item[data-tab="${tabId}"]`)?.classList.add('active');
    
    // Update Header
    titleEl.textContent = TAB_TITLES[tabId] || "Dashboard";
    
    // Switch Content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    document.getElementById(tabId + 'Tab').classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initFlowNavigation() {
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const nextTab = btn.getAttribute('data-next');
            switchTab(nextTab);
        });
    });

    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const prevTab = btn.getAttribute('data-prev');
            switchTab(prevTab);
        });
    });
}

function syncPrefilledStudentFields() {
    const raw = document.getElementById('studentSelect').value;
    if (!raw) return;
    const [rollNo, name] = raw.split(' - ');
    document.querySelectorAll('[data-prefill="rollNo"]').forEach(el => (el.value = (rollNo || '').trim()));
    document.querySelectorAll('[data-prefill="name"]').forEach(el => (el.value = (name || '').trim()));
}

function initDynamicSection(sectionKey, renderFn, addBtnId, containerId) {
    const addBtn = document.getElementById(addBtnId);
    const container = document.getElementById(containerId);
    addBtn.addEventListener('click', () => addEntryBlock(sectionKey, container, renderFn));
    addEntryBlock(sectionKey, container, renderFn);
}

function addEntryBlock(sectionKey, container, renderFn) {
    const state = sectionState[sectionKey];
    state.count += 1;
    const id = state.count;

    const block = document.createElement('div');
    block.className = 'entry-card';
    block.dataset.section = sectionKey;
    block.dataset.entryId = id;
    block.id = `${sectionKey}-${id}`;
    
    const isInternship = sectionKey.toLowerCase().includes('internship');
    const proofHtml = isInternship ? renderInternshipProofUpload(id) : renderProofUpload(id);
    
    block.innerHTML = `
        <button type="button" class="remove-btn" title="Remove Entry"><i class="fas fa-times"></i></button>
        ${renderFn(id)} 
        ${proofHtml}
    `;

    block.querySelector('.remove-btn').addEventListener('click', () => block.remove());
    
    block.querySelectorAll('.file-input-hidden').forEach(input => {
        const infoEl = input.closest('.file-drop-zone').querySelector('.file-info-text');
        input.addEventListener('change', () => handleFiles(input.files, infoEl, input));
    });

    container.appendChild(block);
    syncPrefilledStudentFields();
}

function renderProofUpload(id) {
    return `
        <div class="form-group mt-8">
            <label>Support Documentation (Max 5MB)</label>
            <div class="file-drop-zone">
                <input type="file" class="file-input-hidden" multiple accept=".pdf,.jpg,.jpeg,.png">
                <div class="file-label">
                    <i class="fas fa-cloud-arrow-up" style="font-size: 1.5rem; color: var(--primary); margin-bottom: 8px;"></i><br>
                    <span>Click to upload or drag & drop</span>
                </div>
                <div class="file-info-text"></div>
            </div>
        </div>`;
}

function renderInternshipProofUpload(id) {
    return `
        <div class="form-grid mt-8">
            <div class="form-group">
                <label>Offer Letter</label>
                <div class="file-drop-zone">
                    <input type="file" class="file-input-hidden" data-label="Offer" accept=".pdf,.jpg,.jpeg,.png">
                    <div class="file-label">
                        <i class="fas fa-file-contract"></i><br>
                        <span>Attach Offer</span>
                    </div>
                    <div class="file-info-text"></div>
                </div>
            </div>
            <div class="form-group">
                <label>Completion Certificate</label>
                <div class="file-drop-zone">
                    <input type="file" class="file-input-hidden" data-label="Certificate" accept=".pdf,.jpg,.jpeg,.png">
                    <div class="file-label">
                        <i class="fas fa-certificate"></i><br>
                        <span>Attach Certificate</span>
                    </div>
                    <div class="file-info-text"></div>
                </div>
            </div>
        </div>`;
}

function renderSemesterDropdown(id, fieldId) {
    const options = SEMESTERS.map(s => `<option value="${s}">${s}</option>`).join('');
    return `
        <div class="form-group">
            <label>Semester</label>
            <select id="${fieldId}-${id}" class="form-control">
                <option value="" disabled selected>Select Semester</option>
                ${options}
            </select>
        </div>`;
}

// 1. Visits Abroad
function renderVisitAbroadBlock(id) {
    return `
        <div class="form-grid">
            <div class="form-group"><label>Name of Student</label><input type="text" class="form-control" data-prefill="name" readonly></div>
            <div class="form-group"><label>Place of Visit</label><input type="text" class="form-control" id="vaPlace-${id}"></div>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Period From</label><input type="date" class="form-control" id="vaFrom-${id}"></div>
            <div class="form-group"><label>Period To</label><input type="date" class="form-control" id="vaTo-${id}"></div>
        </div>
        <div class="form-group"><label>Purpose</label><input type="text" class="form-control" id="vaPurpose-${id}" placeholder="e.g. Academic Summit, Research Project"></div>`;
}

// 2. Activities
function renderActivityBlock(id) {
    const options = ACTIVITY_TYPES.map(a => `<option value="${a}">${a}</option>`).join('');
    return `
        <div class="form-grid">
            ${renderSemesterDropdown(id, 'actSem')}
            <div class="form-group"><label>Nature of Activity</label>
                <select id="actType-${id}" class="form-control" onchange="this.nextElementSibling.classList.toggle('hidden', this.value !== 'Other')">
                    <option value="" disabled selected>Select Activity</option>
                    ${options}
                </select>
                <input type="text" id="actTypeOther-${id}" class="form-control hidden mt-4" placeholder="Specify other activity">
            </div>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Date of Event</label><input type="date" class="form-control" id="actDate-${id}"></div>
            <div class="form-group"><label>Award (if any)</label><input type="text" class="form-control" id="actAward-${id}" placeholder="e.g. Winner, Runner-up"></div>
        </div>`;
}

// 3. Awards
function renderAwardBlock(id) {
    return `
        <div class="form-grid">
            ${renderSemesterDropdown(id, 'awSem')}
            <div class="form-group"><label>Award/Position</label><input type="text" class="form-control" id="awPos-${id}"></div>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Awarded By</label><input type="text" class="form-control" id="awBy-${id}" placeholder="Institution/Organization Name"></div>
            <div class="form-group"><label>Date</label><input type="date" class="form-control" id="awDate-${id}"></div>
        </div>`;
}

// 4. Exams
function renderExamBlock(id) {
    const options = EXAM_TYPES.map(e => `<option value="${e}">${e}</option>`).join('');
    return `
        <div class="form-grid">
            <div class="form-group"><label>Exam Name</label>
                <select id="exName-${id}" class="form-control" onchange="this.nextElementSibling.classList.toggle('hidden', this.value !== 'Other')">
                    <option value="" disabled selected>Select Exam</option>
                    ${options}
                </select>
                <input type="text" id="exNameOther-${id}" class="form-control hidden mt-4" placeholder="Specify other exam">
            </div>
            <div class="form-group"><label>Score (Optional)</label><input type="text" class="form-control" id="exScore-${id}" placeholder="Rank/Percentile"></div>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Appeared</label><select id="exApp-${id}" class="form-control"><option value="Yes">Yes</option><option value="No">No</option></select></div>
            <div class="form-group"><label>Qualified</label><select id="exQual-${id}" class="form-control"><option value="Yes">Yes</option><option value="No">No</option></select></div>
        </div>`;
}

// 5 & 6. Internship
function renderInternshipBlock(id) {
    return `
        <div class="form-grid">
            ${renderSemesterDropdown(id, 'intSem')}
            <div class="form-group"><label>Company Name</label><input type="text" class="form-control" id="intComp-${id}"></div>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Period From</label><input type="date" class="form-control" id="intFrom-${id}"></div>
            <div class="form-group"><label>Period To</label><input type="date" class="form-control" id="intTo-${id}"></div>
        </div>
        <div class="form-group"><label>Title / Deliverables</label><input type="text" class="form-control" id="intProj-${id}" placeholder="Area of training or project title"></div>`;
}

// 7. Placement
function renderPlacementBlock(id) {
    return `
        <div class="form-grid">
            ${renderSemesterDropdown(id, 'plSem')}
            <div class="form-group"><label>Company Name</label><input type="text" class="form-control" id="plComp-${id}"></div>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Assigned Role</label><input type="text" class="form-control" id="plRole-${id}" placeholder="e.g. Graduate Engineer Trainee"></div>
            <div class="form-group"><label>Pay Package (LPA)</label><input type="number" class="form-control" id="plPack-${id}" step="0.1"></div>
        </div>`;
}

// 8. Higher Studies
function renderHigherStudiesBlock(id) {
    return `
        <div class="form-grid">
            <div class="form-group"><label>Institution Name</label><input type="text" class="form-control" id="hsInst-${id}"></div>
            <div class="form-group"><label>Programme Name</label><input type="text" class="form-control" id="hsProg-${id}" placeholder="e.g. M.S. in Data Science"></div>
        </div>`;
}

// 9. Published Papers
function renderPublishedPaperBlock(id) {
    return `
        <div class="form-grid">
            ${renderSemesterDropdown(id, 'ppSem')}
            <div class="form-group"><label>Guide Name</label><input type="text" class="form-control" id="ppGuide-${id}"></div>
        </div>
        <div class="form-group"><label>Title of Paper</label><input type="text" class="form-control" id="ppTitle-${id}"></div>
        <div class="form-grid">
            <div class="form-group"><label>Journal / Forum</label><input type="text" class="form-control" id="ppConf-${id}" placeholder="Venue name"></div>
            <div class="form-group"><label>Type</label><select id="ppType-${id}" class="form-control"><option value="Journal">Journal</option><option value="Conference">Conference</option></select></div>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Level</label><select id="ppLevel-${id}" class="form-control"><option value="National">National</option><option value="International">International</option></select></div>
            <div class="form-group"><label>Date (MM/YYYY)</label><input type="text" class="form-control" id="ppDate-${id}" placeholder="04/2026"></div>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>ISBN/ISSN</label><input type="text" class="form-control" id="ppIsbn-${id}"></div>
            <div class="form-group"><label>DOI / Reference Link</label><input type="text" class="form-control" id="ppDoi-${id}"></div>
        </div>`;
}

function handleFiles(files, infoEl, input) {
    let size = 0; for(let f of files) size += f.size;
    if (size > 5*1024*1024) { alert("Total file size exceeds 5MB limit."); input.value=""; infoEl.textContent=""; return; }
    infoEl.textContent = `${files.length} file(s) selected (${(size/1024/1024).toFixed(2)}MB)`;
}

function initFormSubmission() {
    const form = document.getElementById('mainForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Comprehensive Manual Validation
        const validation = validateAllData();
        if (!validation.success) {
            switchTab(validation.tab);
            const target = document.getElementById(validation.field);
            if (target) {
                target.classList.add('error-pulse');
                setTimeout(() => target.classList.remove('error-pulse'), 2000);
                target.focus();
                alert(`Please fill the required field: ${validation.label}`);
            }
            return;
        }

        const loader = document.getElementById('loadingOverlay');
        const statusEl = document.getElementById('saveStatus');
        
        loader.classList.remove('hidden');
        statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        try {
            const payload = await collectAllData();
            console.log("Proceeding with payload:", payload);
            
            const response = await fetch(SCRIPT_URL, { 
                method: 'POST', 
                body: JSON.stringify(payload)
            }).catch(err => {
                // Fallback for CORS issues in some environments
                return fetch(SCRIPT_URL, { 
                    method: 'POST', 
                    body: JSON.stringify(payload), 
                    mode: 'no-cors' 
                });
            });

            console.log("Server Response Received");
            statusEl.innerHTML = '<i class="fas fa-check-circle" style="color: var(--success)"></i> Submitted';
            
            setTimeout(() => { 
                loader.classList.add('hidden'); 
                document.getElementById('successOverlay').classList.remove('hidden'); 
            }, 1000);
        } catch (err) { 
            console.error("Submission error:", err);
            statusEl.innerHTML = '<i class="fas fa-times-circle" style="color: var(--error)"></i> Failed';
            alert("Submission failed. Please check your internet connection."); 
            loader.classList.add('hidden'); 
        }
    });
}

const val = id => document.getElementById(id)?.value || "";

async function collectAllData() {
    const sel = document.getElementById('studentSelect').value;
    const [rollNo, name] = sel.split(' - ');
    const email = document.getElementById('studentEmail').value;
    const personalEmail = document.getElementById('personalEmail').value;
    const phone = document.getElementById('studentPhone').value;
    const address = document.getElementById('studentAddress').value;

    return {
        student: { rollNo, name, email, personalEmail, phone, address },
        visitsAbroad: await collectSection('visitsAbroad', id => ({ place: val(`vaPlace-${id}`), from: val(`vaFrom-${id}`), to: val(`vaTo-${id}`), purpose: val(`vaPurpose-${id}`) })),
        activities: await collectSection('activities', id => ({ semester: val(`actSem-${id}`), nature: val(`actType-${id}`) === 'Other' ? val(`actTypeOther-${id}`) : val(`actType-${id}`), date: val(`actDate-${id}`), award: val(`actAward-${id}`) })),
        awards: await collectSection('awards', id => ({ semester: val(`awSem-${id}`), pos: val(`awPos-${id}`), by: val(`awBy-${id}`), date: val(`awDate-${id}`) })),
        exams: await collectSection('exams', id => ({ name: val(`exName-${id}`) === 'Other' ? val(`exNameOther-${id}`) : val(`exName-${id}`), score: val(`exScore-${id}`), appeared: val(`exApp-${id}`), qualified: val(`exQual-${id}`) })),
        officialInternships: await collectSection('officialInternships', id => ({ semester: val(`intSem-${id}`), company: val(`intComp-${id}`), from: val(`intFrom-${id}`), to: val(`intTo-${id}`), project: val(`intProj-${id}`) })),
        personalInternships: await collectSection('personalInternships', id => ({ semester: val(`intSem-${id}`), company: val(`intComp-${id}`), from: val(`intFrom-${id}`), to: val(`intTo-${id}`), project: val(`intProj-${id}`) })),
        placementOffers: await collectSection('placementOffers', id => ({ semester: val(`plSem-${id}`), company: val(`plComp-${id}`), role: val(`plRole-${id}`), package: val(`plPack-${id}`) })),
        higherStudies: await collectSection('higherStudies', id => ({ institution: val(`hsInst-${id}`), programme: val(`hsProg-${id}`) })),
        publishedPapers: await collectSection('publishedPapers', id => ({ semester: val(`ppSem-${id}`), guide: val(`ppGuide-${id}`), title: val(`ppTitle-${id}`), conf: val(`ppConf-${id}`), type: val(`ppType-${id}`), level: val(`ppLevel-${id}`), date: val(`ppDate-${id}`), isbn: val(`ppIsbn-${id}`), doi: val(`ppDoi-${id}`) }))
    };
}

async function collectSection(key, mapFn) {
    const blocks = Array.from(document.querySelectorAll(`.entry-card[data-section="${key}"]`));
    const data = [];
    for (let b of blocks) {
        const id = b.dataset.entryId;
        const entry = mapFn(id);
        
        // Define which keys denote actual content vs default dropdowns
        const meaningfulKeys = Object.keys(entry).filter(k => 
             !['appeared', 'qualified', 'type', 'level', 'semester'].includes(k)
        );
        
        // Check if all meaningful fields are empty, 'na', 'nil', '-', etc.
        const isEntryEmpty = meaningfulKeys.every(k => {
            const v = entry[k];
            if (!v) return true;
            const str = String(v).trim().toLowerCase();
            return str === '' || str === 'na' || str === 'n/a' || str === 'nil' || str === 'none' || str === '-';
        });

        // Also ensure no files were uploaded
        let hasFiles = false;
        for (let input of b.querySelectorAll('.file-input-hidden')) {
            if (input.files.length > 0) hasFiles = true;
        }

        // If the section is practically empty, do not send it to the backend
        if (isEntryEmpty && !hasFiles) {
            continue; 
        }

        const files = [];
        for (let input of b.querySelectorAll('.file-input-hidden')) {
            const label = input.dataset.label ? `${input.dataset.label}_` : "";
            for (let f of input.files) {
                files.push({ 
                    base64: await toBase64(f), 
                    type: f.type, 
                    name: label + f.name 
                });
            }
        }
        data.push({...entry, files});
    }
    return data;
}

function validateAllData() {
    // 1. Mandatory Profile Validation
    if (!val('studentSelect')) return { success: false, tab: 'studentProfile', field: 'studentSelect', label: 'Roll Number' };
    if (!val('personalEmail')) return { success: false, tab: 'studentProfile', field: 'personalEmail', label: 'Personal Email' };
    if (!val('studentPhone')) return { success: false, tab: 'studentProfile', field: 'studentPhone', label: 'Contact Number' };
    if (!val('studentAddress')) return { success: false, tab: 'studentProfile', field: 'studentAddress', label: 'Current Address' };

    // All other sections are now optional!
    return { success: true };
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result); reader.onerror = e => reject(e);
});
