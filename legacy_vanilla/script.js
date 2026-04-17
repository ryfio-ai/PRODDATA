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

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyozIZbbaGt2DfUzPdElI6RVSnjNOgguffht01315K-Ad5hH6h4rgqGvlkO3IuOU2jl/exec";

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
    placementOffers: { count: 0 },
    higherStudies: { count: 0 },
    officialInternships: { count: 0 },
    personalInternships: { count: 0 },
    publishedPapers: { count: 0 },
    awards: { count: 0 },
    events: { count: 0 }
};


document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initStudentSelectors();
    initDynamicSection('placementOffers', renderPlacementBlock, 'addPlacementOfferBtn', 'placementOffersContainer');
    initDynamicSection('higherStudies', renderHigherStudiesBlock, 'addHigherStudiesBtn', 'higherStudiesContainer');
    initDynamicSection('officialInternships', renderInternshipOfficialBlock, 'addOfficialInternshipBtn', 'officialInternshipsContainer');
    initDynamicSection('personalInternships', renderInternshipPersonalBlock, 'addPersonalInternshipBtn', 'personalInternshipsContainer');
    initDynamicSection('publishedPapers', renderPublishedPaperBlock, 'addPublishedPapersBtn', 'publishedPapersContainer');
    initDynamicSection('awards', renderAwardBlock, 'addAwardBtn', 'awardsContainer');
    initDynamicSection('events', renderEventBlock, 'addEventBtn', 'eventsContainer');

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
    
    // Custom handling for Personal Internship which needs dual proof
    let innerHTML = `<button type="button" class="remove-activity-btn" aria-label="Remove entry">&times;</button>${renderFn(id)}`;
    if (sectionKey !== 'personalInternships') {
        innerHTML += renderProofUpload(id);
    }
    block.innerHTML = innerHTML;

    const removeBtn = block.querySelector('.remove-activity-btn');
    removeBtn.addEventListener('click', () => block.remove());

    block.querySelectorAll('.file-input').forEach(input => {
        const infoEl = input.closest('.form-group').querySelector('.file-info');
        input.addEventListener('change', () => handleFiles(input.files, infoEl, input));
    });

    wireConditionalFields(block);
    container.appendChild(block);
    syncPrefilledStudentFields();
}

function renderProofUpload(id, label = "Proof Upload (Max 5MB)", klass = "file-input") {
    return `
        <div class="form-group file-upload-group">
            <label>${label}</label>
            <div class="file-drop-area">
                <input type="file" class="${klass}" multiple accept=".pdf,.jpg,.jpeg,.png">
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

// 1. Placement Offer
function renderPlacementBlock(id) {
    return `
        <div class="form-row">
            <div class="form-group"><label>Roll Number</label><input type="text" data-prefill="rollNo" readonly></div>
            <div class="form-group"><label>Student Name</label><input type="text" data-prefill="name" readonly></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Contact Details</label><input type="text" id="pcContact-${id}" required placeholder="Phone / Email"></div>
            <div class="form-group"><label>Company Name</label><input type="text" id="pcCompany-${id}" required></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Role</label><input type="text" id="pcRole-${id}" required placeholder="Designation"></div>
            <div class="form-group"><label>Pay Package (Lakhs per annum)</label><input type="number" id="pcPackage-${id}" required step="0.1"></div>
        </div>
    `;
}

// 2. Higher Studies
function renderHigherStudiesBlock(id) {
    return `
        <div class="form-row">
            <div class="form-group"><label>Roll Number</label><input type="text" data-prefill="rollNo" readonly></div>
            <div class="form-group"><label>Student Name</label><input type="text" data-prefill="name" readonly></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Institution Joined</label><input type="text" id="hsInst-${id}" required></div>
            <div class="form-group"><label>Programme Admitted To</label><input type="text" id="hsProg-${id}" required placeholder="e.g., MSc, MBA"></div>
        </div>
    `;
}

// 3. Internship Official
function renderInternshipOfficialBlock(id) {
    return `
        ${renderSemesterDropdown(id, 'ioSem')}
        <div class="form-row">
            <div class="form-group"><label>Contact Details</label><input type="text" id="ioContact-${id}" required></div>
            <div class="form-group"><label>Company Name</label><input type="text" id="ioCompany-${id}" required></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Location</label><input type="text" id="ioLoc-${id}" required></div>
            <div class="form-group"><label>Duration</label><input type="text" id="ioDur-${id}" required placeholder="e.g. 3 Months"></div>
        </div>
        <div class="form-group"><label>Project Title</label><input type="text" id="ioProj-${id}" required></div>
    `;
}

// 4. Internship Personal
function renderInternshipPersonalBlock(id) {
    return `
        ${renderSemesterDropdown(id, 'ipSem')}
        <div class="form-row">
            <div class="form-group"><label>Contact Details</label><input type="text" id="ipContact-${id}" required></div>
            <div class="form-group"><label>Company Name</label><input type="text" id="ipCompany-${id}" required></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Location</label><input type="text" id="ipLoc-${id}" required></div>
            <div class="form-group"><label>Duration</label><input type="text" id="ipDur-${id}" required placeholder="e.g. 3 Months"></div>
        </div>
        <div class="form-group"><label>Project Title</label><input type="text" id="ipProj-${id}" required></div>
        <div class="form-row">
            ${renderProofUpload(id, "Proof 1 (Offer Letter)", "offer-files")}
            ${renderProofUpload(id, "Proof 2 (Certificate)", "cert-files")}
        </div>
    `;
}

// 5. Papers Publication
function renderPublishedPaperBlock(id) {
    return `
        <div class="form-row">
            <div class="form-group"><label>Author Name (Student)</label><input type="text" data-prefill="name" readonly></div>
            <div class="form-group"><label>Name of the Teacher (Underguidance)</label><input type="text" id="ppGuide-${id}" required></div>
        </div>
        <div class="form-group"><label>Title of the Book Published (Theme)</label><input type="text" id="ppBook-${id}" required></div>
        <div class="form-group"><label>Title of the paper/chapter</label><input type="text" id="ppTitle-${id}" required></div>
        <div class="form-group"><label>Title of the Proceedings / Conference</label><input type="text" id="ppConf-${id}" required></div>
        <div class="form-row">
            <div class="form-group">
                <label>Level</label>
                <select id="ppLevel-${id}" required>
                    <option value="National">National</option>
                    <option value="International">International</option>
                </select>
            </div>
            <div class="form-group"><label>Year and Month (MM/YYYY)</label><input type="text" id="ppDate-${id}" required></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>ISBN of book/proceedings</label><input type="text" id="ppIsbn-${id}" required></div>
            <div class="form-group"><label>DOI / Link</label><input type="text" id="ppDoi-${id}"></div>
        </div>
    `;
}

// 6. Award Data
function renderAwardBlock(id) {
    return `
        <div class="form-row">
            <div class="form-group"><label>Mentor/Guide Name (optional)</label><input type="text" id="awMentor-${id}"></div>
            <div class="form-group"><label>Name of the award</label><input type="text" id="awName-${id}" required></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Awarding Body</label><input type="text" id="awBody-${id}" required placeholder="Govt / College"></div>
            <div class="form-group"><label>Month and Year</label><input type="text" id="awDate-${id}" required placeholder="MM/YYYY"></div>
        </div>
    `;
}

// 7. Event Data
function renderEventBlock(id) {
    return `
        <div class="form-row">
            <div class="form-group"><label>Name of the event</label><input type="text" id="evName-${id}" required></div>
            <div class="form-group">
                <label>Team/Individual</label>
                <select id="evType-${id}" required>
                    <option value="Individual">Individual</option>
                    <option value="Team">Team</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Award/medal</label><input type="text" id="evMedal-${id}" required></div>
            <div class="form-group">
               <label>Level</label>
               <select id="evLevel-${id}" required>
                   <option value="Intra-clg">Intra-college</option>
                   <option value="Inter-clg">Inter-college</option>
                   <option value="State">State</option>
                   <option value="National">National</option>
                   <option value="International">International</option>
               </select>
            </div>
        </div>
        <div class="form-group"><label>Month and Year</label><input type="text" id="evDate-${id}" required placeholder="MM/YYYY"></div>
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

            const response = await fetch(SCRIPT_URL, {
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
        placementOffers: await collectPlacement(),
        higherStudies: await collectHigherStudies(),
        officialInternships: await collectInternships('officialInternships'),
        personalInternships: await collectInternshipsPersonal(),
        publishedPapers: await collectPublishedPapers(),
        awards: await collectAwardsRefined(),
        events: await collectEvents()
    };

}


function getBlocks(sectionKey) {
    return Array.from(document.querySelectorAll(`.entry-card[data-section="${sectionKey}"]`));
}

async function collectPlacement() {
    const items = [];
    for (let block of getBlocks('placementOffers')) {
        const id = block.dataset.entryId;
        const contactDetails = document.getElementById(`pcContact-${id}`)?.value || "";
        const companyName = document.getElementById(`pcCompany-${id}`)?.value || "";
        const role = document.getElementById(`pcRole-${id}`)?.value || "";
        const payPackage = document.getElementById(`pcPackage-${id}`)?.value || "";
        const files = await collectFilesFromBlock(block);
        if (!companyName && files.length === 0) continue;
        items.push({ contactDetails, companyName, role, payPackage, files });
    }
    return items;
}

async function collectHigherStudies() {
    const items = [];
    for (let block of getBlocks('higherStudies')) {
        const id = block.dataset.entryId;
        const institutionJoined = document.getElementById(`hsInst-${id}`)?.value || "";
        const programmeAdmitted = document.getElementById(`hsProg-${id}`)?.value || "";
        const files = await collectFilesFromBlock(block);
        if (!institutionJoined && files.length === 0) continue;
        items.push({ institutionJoined, programmeAdmitted, files });
    }
    return items;
}

async function collectInternships(sectionKey) {
    const items = [];
    for (let block of getBlocks(sectionKey)) {
        const id = block.dataset.entryId;
        const semester = document.getElementById(`ioSem-${id}`)?.value || "";
        const contactDetails = document.getElementById(`ioContact-${id}`)?.value || "";
        const companyName = document.getElementById(`ioCompany-${id}`)?.value || "";
        const location = document.getElementById(`ioLoc-${id}`)?.value || "";
        const duration = document.getElementById(`ioDur-${id}`)?.value || "";
        const projectTitle = document.getElementById(`ioProj-${id}`)?.value || "";
        const files = await collectFilesFromBlock(block);
        if (!companyName && files.length === 0) continue;
        items.push({ semester, contactDetails, companyName, location, duration, projectTitle, files });
    }
    return items;
}

async function collectInternshipsPersonal() {
    const items = [];
    for (let block of getBlocks('personalInternships')) {
        const id = block.dataset.entryId;
        const semester = document.getElementById(`ipSem-${id}`)?.value || "";
        const contactDetails = document.getElementById(`ipContact-${id}`)	?.value || "";
        const companyName = document.getElementById(`ipCompany-${id}`)?.value || "";
        const location = document.getElementById(`ipLoc-${id}`)?.value || "";
        const duration = document.getElementById(`ipDur-${id}`)?.value || "";
        const projectTitle = document.getElementById(`ipProj-${id}`)?.value || "";
        
        const offerFiles = await collectFilesFromSelector(block, '.offer-files');
        const certFiles = await collectFilesFromSelector(block, '.cert-files');
        
        if (!companyName && offerFiles.length === 0) continue;
        items.push({ semester, contactDetails, companyName, location, duration, projectTitle, offerFiles, certFiles });
    }
    return items;
}

async function collectFilesFromSelector(block, selector) {
    const files = [];
    const input = block.querySelector(selector);
    if (!input) return files;
    for (let f of input.files) {
        const base64 = await toBase64(f);
        files.push({ base64, type: f.type, name: f.name });
    }
    return files;
}

async function collectPublishedPapers() {
    const items = [];
    for (let block of getBlocks('publishedPapers')) {
        const id = block.dataset.entryId;
        const teacherName = document.getElementById(`ppGuide-${id}`)?.value || "";
        const bookTitle = document.getElementById(`ppBook-${id}`)?.value || "";
        const paperTitle = document.getElementById(`ppTitle-${id}`)?.value || "";
        const proceedingsTitle = document.getElementById(`ppConf-${id}`)?.value || "";
        const level = document.getElementById(`ppLevel-${id}`)?.value || "";
        const date = document.getElementById(`ppDate-${id}`)?.value || "";
        const isbn = document.getElementById(`ppIsbn-${id}`)?.value || "";
        const doiLink = document.getElementById(`ppDoi-${id}`)?.value || "";
        const files = await collectFilesFromBlock(block);
        if (!paperTitle && files.length === 0) continue;
        items.push({ teacherName, bookTitle, paperTitle, proceedingsTitle, level, date, isbn, doiLink, files });
    }
    return items;
}

async function collectAwardsRefined() {
    const items = [];
    for (let block of getBlocks('awards')) {
        const id = block.dataset.entryId;
        const mentorName = document.getElementById(`awMentor-${id}`)?.value || "";
        const awardName = document.getElementById(`awName-${id}`)?.value || "";
        const awardingBody = document.getElementById(`awBody-${id}`)?.value || "";
        const date = document.getElementById(`awDate-${id}`)?.value || "";
        const files = await collectFilesFromBlock(block);
        if (!awardName && files.length === 0) continue;
        items.push({ mentorName, awardName, awardingBody, date, files });
    }
    return items;
}

async function collectEvents() {
    const items = [];
    for (let block of getBlocks('events')) {
        const id = block.dataset.entryId;
        const eventName = document.getElementById(`evName-${id}`)?.value || "";
        const participationType = document.getElementById(`evType-${id}`)?.value || "";
        const medal = document.getElementById(`evMedal-${id}`)?.value || "";
        const level = document.getElementById(`evLevel-${id}`)?.value || "";
        const date = document.getElementById(`evDate-${id}`)?.value || "";
        const files = await collectFilesFromBlock(block);
        if (!eventName && files.length === 0) continue;
        items.push({ eventName, participationType, medal, level, date, files });
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
    // minimal escape for IDs used in querySelector
    return String(str).replaceAll(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g, '\\$1');
}
