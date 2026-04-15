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

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhxCGTe8t8H17euWdi4MFes479grJw5cDXcEWX21M77Igf4NxQf6t-MO4wlV502Bn7/exec";

const ACTIVITY_TYPES = [
    "NCC",
    "General Quiz",
    "Marketing",
    "Engineering Quiz",
    "How Stuffs Works",
    "Paper Presentation",
    "Volleyball",
    "NSS",
    "Anna University Zonal",
    "Inter State Sepaktakraw",
    "Zonal Tournaments",
    "Inter Zonal Tournaments",
    "CDCA Knockout Tournament",
    "Tech Hockey League",
    "Prodigy – Logos and Captions",
    "Fruit Carving",
    "Football",
    "Kho Kho",
    "Other"
];

const EXAM_TYPES = ["GATE", "CAT", "GRE", "IELTS", "TOEFL", "AFCAT", "CDS", "HAL", "Other"];
const SEMESTERS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];

const sectionState = {
    visitsAbroad: { count: 0 },
    activities: { count: 0 },
    awards: { count: 0 },
    competitiveExams: { count: 0 },
    industrialVisits: { count: 0 },
    trainings: { count: 0 }
};

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initStudentSelectors();
    initDynamicSection('visitsAbroad', renderVisitAbroadBlock, 'addVisitAbroadBtn', 'visitsAbroadContainer');
    initDynamicSection('activities', renderActivityBlock, 'addActivityBtn', 'activitiesContainer');
    initDynamicSection('awards', renderAwardBlock, 'addAwardBtn', 'awardsContainer');
    initDynamicSection('competitiveExams', renderExamBlock, 'addExamBtn', 'competitiveExamsContainer');
    initDynamicSection('industrialVisits', renderIndustrialVisitBlock, 'addIndustrialVisitBtn', 'industrialVisitsContainer');
    initDynamicSection('trainings', renderTrainingBlock, 'addTrainingBtn', 'trainingsContainer');
    initFormSubmission();
});

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(tabId + 'Tab').classList.remove('hidden');
        });
    });
}

function initStudentSelectors() {
    const studentSelect = document.getElementById('studentSelect');
    const studentEmail = document.getElementById('studentEmail');
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.disabled = true;
    students.forEach(student => {
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

function getSelectedStudent() {
    const raw = document.getElementById('studentSelect').value;
    if (!raw) return null;
    const [rollNo, name] = raw.split(' - ');
    return { rollNo: (rollNo || '').trim(), name: (name || '').trim() };
}

function syncPrefilledStudentFields() {
    const s = getSelectedStudent();
    if (!s) return;
    document.querySelectorAll('[data-prefill="rollNo"]').forEach(el => (el.value = s.rollNo));
    document.querySelectorAll('[data-prefill="name"]').forEach(el => (el.value = s.name));
}

function initDynamicSection(sectionKey, renderFn, addBtnId, containerId) {
    const addBtn = document.getElementById(addBtnId);
    const container = document.getElementById(containerId);

    addBtn.addEventListener('click', () => addEntryBlock(sectionKey, container, renderFn));
    addEntryBlock(sectionKey, container, renderFn); // one by default
}

function addEntryBlock(sectionKey, container, renderFn) {
    const state = sectionState[sectionKey];
    state.count += 1;
    const id = state.count;

    const block = document.createElement('div');
    block.className = 'activity-card entry-card';
    block.dataset.section = sectionKey;
    block.dataset.entryId = String(id);
    block.id = `${sectionKey}-${id}`;
    block.innerHTML = `
        <button type="button" class="remove-activity-btn" aria-label="Remove entry">&times;</button>
        ${renderFn(id)}
        ${renderProofUpload(id)}
    `;

    const removeBtn = block.querySelector('.remove-activity-btn');
    removeBtn.addEventListener('click', () => block.remove());

    const fileInput = block.querySelector('.file-input');
    const fileInfo = block.querySelector('.file-info');
    fileInput.addEventListener('change', () => handleFiles(fileInput.files, fileInfo, fileInput));

    wireConditionalFields(block);
    container.appendChild(block);

    // Fill readonly roll/name if present
    syncPrefilledStudentFields();
}

function renderProofUpload(id) {
    return `
        <div class="form-group file-upload-group">
            <label>Proof Upload (Max 5MB)</label>
            <div class="file-drop-area">
                <input type="file" class="file-input" multiple accept=".pdf,.jpg,.jpeg,.png">
                <span class="file-msg">Choose files or drag here</span>
            </div>
            <div class="file-info" id="fileInfo-${id}"></div>
        </div>
    `;
}

function renderSemesterDropdown(id, fieldId) {
    const options = SEMESTERS.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    return `
        <div class="form-group">
            <label for="${fieldId}-${id}">Semester</label>
            <select id="${fieldId}-${id}" required>
                <option value="" disabled selected>Select Semester</option>
                ${options}
            </select>
        </div>
    `;
}

// Tab 1: Visits Abroad
function renderVisitAbroadBlock(id) {
    return `
        <div class="form-row">
            <div class="form-group">
                <label for="visitStudentName-${id}">Name of student</label>
                <input type="text" id="visitStudentName-${id}" data-prefill="name" readonly placeholder="Auto-filled from selection">
            </div>
            <div class="form-group">
                <label for="visitPlace-${id}">Place of visit</label>
                <input type="text" id="visitPlace-${id}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="visitFrom-${id}">Period (from)</label>
                <input type="date" id="visitFrom-${id}" required>
            </div>
            <div class="form-group">
                <label for="visitTo-${id}">Period (to)</label>
                <input type="date" id="visitTo-${id}" required>
            </div>
        </div>
        <div class="form-group">
            <label for="visitPurpose-${id}">Purpose</label>
            <input type="text" id="visitPurpose-${id}" required>
        </div>
    `;
}

// Tab 2: Co-curricular Activities
function renderActivityBlock(id) {
    const typeOptions = ACTIVITY_TYPES.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
    return `
        ${renderSemesterDropdown(id, 'activitySemester')}
        <div class="form-group">
            <label for="activityNature-${id}">Nature of Activity</label>
            <select id="activityNature-${id}" required data-other-toggle="activityNatureOther-${id}">
                <option value="" disabled selected>Select Activity</option>
                ${typeOptions}
            </select>
        </div>
        <div class="form-group hidden" id="activityNatureOtherWrap-${id}">
            <label for="activityNatureOther-${id}">Other (please specify)</label>
            <input type="text" id="activityNatureOther-${id}" placeholder="Enter activity name">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="activityDate-${id}">Date</label>
                <input type="date" id="activityDate-${id}" required>
            </div>
            <div class="form-group">
                <label for="activityAward-${id}">Award / Achievement (optional)</label>
                <input type="text" id="activityAward-${id}" placeholder="e.g., Winner / Participant / Merit">
            </div>
        </div>
    `;
}

// Tab 3: Awards Won
function renderAwardBlock(id) {
    return `
        ${renderSemesterDropdown(id, 'awardSemester')}
        <div class="form-row">
            <div class="form-group">
                <label for="awardRollNo-${id}">Roll No</label>
                <input type="text" id="awardRollNo-${id}" data-prefill="rollNo" readonly placeholder="Auto-filled from selection">
            </div>
            <div class="form-group">
                <label for="awardEvent-${id}">Event name</label>
                <input type="text" id="awardEvent-${id}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="awardPosition-${id}">Award / Position</label>
                <input type="text" id="awardPosition-${id}" required>
            </div>
            <div class="form-group">
                <label for="awardBy-${id}">Awarded by (institution name)</label>
                <input type="text" id="awardBy-${id}" required>
            </div>
        </div>
        <div class="form-group">
            <label for="awardDate-${id}">Date</label>
            <input type="date" id="awardDate-${id}" required>
        </div>
    `;
}

// Tab 4: Competitive Exams
function renderExamBlock(id) {
    const examOptions = EXAM_TYPES.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
    return `
        <div class="form-group">
            <label for="examName-${id}">Exam name</label>
            <select id="examName-${id}" required data-other-toggle="examOther-${id}">
                <option value="" disabled selected>Select Exam</option>
                ${examOptions}
            </select>
        </div>
        <div class="form-group hidden" id="examOtherWrap-${id}">
            <label for="examOther-${id}">Other (please specify)</label>
            <input type="text" id="examOther-${id}" placeholder="Enter exam name">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="examAppeared-${id}">Appeared</label>
                <select id="examAppeared-${id}" required>
                    <option value="" disabled selected>Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>
            <div class="form-group">
                <label for="examQualified-${id}">Qualified</label>
                <select id="examQualified-${id}" required>
                    <option value="" disabled selected>Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label for="examScore-${id}">Score (optional)</label>
            <input type="text" id="examScore-${id}" placeholder="e.g., 650 / 7.5 / AIR 1234">
        </div>
    `;
}

// Tab 5: Industrial Visit
function renderIndustrialVisitBlock(id) {
    return `
        <div class="form-group">
            <label for="indCompany-${id}">Company name</label>
            <input type="text" id="indCompany-${id}" required>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="indFrom-${id}">Period (from)</label>
                <input type="date" id="indFrom-${id}" required>
            </div>
            <div class="form-group">
                <label for="indTo-${id}">Period (to)</label>
                <input type="date" id="indTo-${id}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="indArea-${id}">Area / purpose of visit</label>
                <input type="text" id="indArea-${id}" required>
            </div>
            <div class="form-group">
                <label for="indCount-${id}">No. of students</label>
                <input type="number" id="indCount-${id}" required min="1" step="1" placeholder="e.g., 58">
            </div>
        </div>
    `;
}

// Tab 6: Training / Internship
function renderTrainingBlock(id) {
    return `
        ${renderSemesterDropdown(id, 'trainingSemester')}
        <div class="form-row">
            <div class="form-group">
                <label for="trainingCompany-${id}">Company name</label>
                <input type="text" id="trainingCompany-${id}" required>
            </div>
            <div class="form-group">
                <label for="trainingRollNo-${id}">Roll No</label>
                <input type="text" id="trainingRollNo-${id}" data-prefill="rollNo" readonly placeholder="Auto-filled from selection">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="trainingFrom-${id}">Period (from)</label>
                <input type="date" id="trainingFrom-${id}" required>
            </div>
            <div class="form-group">
                <label for="trainingTo-${id}">Period (to)</label>
                <input type="date" id="trainingTo-${id}" required>
            </div>
        </div>
        <div class="form-group">
            <label for="trainingArea-${id}">Area of training / project title</label>
            <input type="text" id="trainingArea-${id}" required>
        </div>
    `;
}

function wireConditionalFields(block) {
    // Show "Other" text box when select value is "Other"
    const selects = block.querySelectorAll('select[data-other-toggle]');
    selects.forEach(sel => {
        const otherInputId = sel.getAttribute('data-other-toggle');
        const otherWrapId = otherInputId.replace('Other', 'OtherWrap');
        const otherWrap = block.querySelector(`#${cssEscape(otherWrapId)}`);
        const otherInput = block.querySelector(`#${cssEscape(otherInputId)}`);
        if (!otherWrap || !otherInput) return;

        const refresh = () => {
            if (sel.value === 'Other') {
                otherWrap.classList.remove('hidden');
                otherInput.required = true;
            } else {
                otherWrap.classList.add('hidden');
                otherInput.required = false;
                otherInput.value = '';
            }
        };
        sel.addEventListener('change', refresh);
        refresh();
    });
}

function handleFiles(files, infoEl, fileInputEl) {
    let totalSize = 0;
    for (let f of files) totalSize += f.size;
    if (totalSize > 5 * 1024 * 1024) {
        alert("Total size exceeds 5MB.");
        fileInputEl.value = "";
        infoEl.textContent = "";
        return;
    }
    infoEl.textContent = `${files.length} file(s) selected (${(totalSize / 1024 / 1024).toFixed(2)}MB)`;
}

function initFormSubmission() {
    const form = document.getElementById('mainForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const loader = document.getElementById('loadingOverlay');
        loader.classList.remove('hidden');

        try {
            const payload = await collectAllData();

            await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                mode: 'no-cors'
            });

            setTimeout(() => {
                loader.classList.add('hidden');
                document.getElementById('successOverlay').classList.remove('hidden');
            }, 2000);

        } catch (err) {
            console.error(err);
            alert("Submission failed.");
            loader.classList.add('hidden');
        }
    });
}

async function collectAllData() {
    const selected = document.getElementById('studentSelect').value;
    if (!selected) {
        alert("Please select your Roll Number.");
        throw new Error("Student not selected");
    }
    const rollNo = selected.split(' - ')[0];
    const name = selected.split(' - ')[1];
    const email = document.getElementById('studentEmail').value;

    return {
        student: { rollNo, name, email },
        visitsAbroad: await collectVisitsAbroad(),
        activities: await collectActivities(),
        awards: await collectAwards(),
        competitiveExams: await collectCompetitiveExams(),
        industrialVisits: await collectIndustrialVisits(),
        trainings: await collectTrainings()
    };
}

function getBlocks(sectionKey) {
    return Array.from(document.querySelectorAll(`.entry-card[data-section="${sectionKey}"]`));
}

async function collectFilesFromBlock(block) {
    const files = [];
    const fileInput = block.querySelector('.file-input');
    if (!fileInput) return files;
    for (let file of fileInput.files) {
        const base64 = await toBase64(file);
        files.push({ base64, type: file.type, name: file.name });
    }
    return files;
}

async function collectVisitsAbroad() {
    const items = [];
    for (let block of getBlocks('visitsAbroad')) {
        const id = block.dataset.entryId;
        const place = document.getElementById(`visitPlace-${id}`)?.value?.trim() || "";
        const from = document.getElementById(`visitFrom-${id}`)?.value || "";
        const to = document.getElementById(`visitTo-${id}`)?.value || "";
        const purpose = document.getElementById(`visitPurpose-${id}`)?.value?.trim() || "";
        const files = await collectFilesFromBlock(block);
        if (!place && !from && !to && !purpose && files.length === 0) continue;
        items.push({ place, periodFrom: from, periodTo: to, purpose, files });
    }
    return items;
}

async function collectActivities() {
    const items = [];
    for (let block of getBlocks('activities')) {
        const id = block.dataset.entryId;
        const semester = document.getElementById(`activitySemester-${id}`)?.value || "";
        const nature = document.getElementById(`activityNature-${id}`)?.value || "";
        const natureOther = document.getElementById(`activityNatureOther-${id}`)?.value?.trim() || "";
        const date = document.getElementById(`activityDate-${id}`)?.value || "";
        const award = document.getElementById(`activityAward-${id}`)?.value?.trim() || "";
        const files = await collectFilesFromBlock(block);
        const finalNature = (nature === "Other" ? natureOther : nature);
        if (!semester && !finalNature && !date && !award && files.length === 0) continue;
        items.push({ semester, nature: finalNature, date, award, files });
    }
    return items;
}

async function collectAwards() {
    const items = [];
    for (let block of getBlocks('awards')) {
        const id = block.dataset.entryId;
        const semester = document.getElementById(`awardSemester-${id}`)?.value || "";
        const event = document.getElementById(`awardEvent-${id}`)?.value?.trim() || "";
        const position = document.getElementById(`awardPosition-${id}`)?.value?.trim() || "";
        const awardedBy = document.getElementById(`awardBy-${id}`)?.value?.trim() || "";
        const date = document.getElementById(`awardDate-${id}`)?.value || "";
        const files = await collectFilesFromBlock(block);
        if (!semester && !event && !position && !awardedBy && !date && files.length === 0) continue;
        items.push({ semester, event, position, awardedBy, date, files });
    }
    return items;
}

async function collectCompetitiveExams() {
    const items = [];
    for (let block of getBlocks('competitiveExams')) {
        const id = block.dataset.entryId;
        const exam = document.getElementById(`examName-${id}`)?.value || "";
        const examOther = document.getElementById(`examOther-${id}`)?.value?.trim() || "";
        const appeared = document.getElementById(`examAppeared-${id}`)?.value || "";
        const qualified = document.getElementById(`examQualified-${id}`)?.value || "";
        const score = document.getElementById(`examScore-${id}`)?.value?.trim() || "";
        const files = await collectFilesFromBlock(block);
        const finalExam = (exam === "Other" ? examOther : exam);
        if (!finalExam && !appeared && !qualified && !score && files.length === 0) continue;
        items.push({ exam: finalExam, appeared, qualified, score, files });
    }
    return items;
}

async function collectIndustrialVisits() {
    const items = [];
    for (let block of getBlocks('industrialVisits')) {
        const id = block.dataset.entryId;
        const company = document.getElementById(`indCompany-${id}`)?.value?.trim() || "";
        const from = document.getElementById(`indFrom-${id}`)?.value || "";
        const to = document.getElementById(`indTo-${id}`)?.value || "";
        const area = document.getElementById(`indArea-${id}`)?.value?.trim() || "";
        const noOfStudents = document.getElementById(`indCount-${id}`)?.value?.trim() || "";
        const files = await collectFilesFromBlock(block);
        if (!company && !from && !to && !area && !noOfStudents && files.length === 0) continue;
        items.push({ company, periodFrom: from, periodTo: to, area, noOfStudents, files });
    }
    return items;
}

async function collectTrainings() {
    const items = [];
    for (let block of getBlocks('trainings')) {
        const id = block.dataset.entryId;
        const semester = document.getElementById(`trainingSemester-${id}`)?.value || "";
        const company = document.getElementById(`trainingCompany-${id}`)?.value?.trim() || "";
        const from = document.getElementById(`trainingFrom-${id}`)?.value || "";
        const to = document.getElementById(`trainingTo-${id}`)?.value || "";
        const areaOrTitle = document.getElementById(`trainingArea-${id}`)?.value?.trim() || "";
        const files = await collectFilesFromBlock(block);
        if (!semester && !company && !from && !to && !areaOrTitle && files.length === 0) continue;
        items.push({ semester, company, periodFrom: from, periodTo: to, areaOrTitle, files });
    }
    return items;
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function cssEscape(str) {
    // Prefer standards-based escaping when available
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(str));
    // Fallback: minimal escape for IDs used in querySelector
    return String(str).replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g, '\\$1');
}

