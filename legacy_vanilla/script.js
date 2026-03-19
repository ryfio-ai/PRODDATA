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

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxUP8xkqPv3biGk4DWIYdsmXzN1bVuFwzylsAtcNJbUu_8_6SaUy5XqjF4ipUeJYMgG/exec";

let activityCount = 0;
let academicData = {}; // Store grades per semester
let currentSem = 1;

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initStudentSelectors();
    initMultiActivity();
    initAcademicGrades();
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
        }
    });
}

function initMultiActivity() {
    const addBtn = document.getElementById('addActivityBtn');
    const container = document.getElementById('activitiesContainer');
    addBtn.addEventListener('click', () => addActivityBlock());
    // Add one by default
    addActivityBlock();
}

function addActivityBlock() {
    const container = document.getElementById('activitiesContainer');
    activityCount++;
    const id = activityCount;
    
    const block = document.createElement('div');
    block.className = 'activity-card';
    block.id = `activity-${id}`;
    block.innerHTML = `
        <button type="button" class="remove-activity-btn" onclick="removeActivity(${id})">&times;</button>
        <div class="form-group">
            <label>Category</label>
            <select class="category-select" required onchange="handleCategoryChange(${id}, this.value)">
                <option value="" disabled selected>Select Category</option>
                <option value="Awards / Prize Won">Awards / Prize Won (Technical Events)</option>
                <option value="Course Completed">Course Completed</option>
                <option value="Sports Participation / Achievement">Sports Participation / Achievement</option>
                <option value="In-Plant Training">In-Plant Training</option>
                <option value="Internship">Internship</option>
            </select>
        </div>
        <div id="dynamicFields-${id}" class="dynamic-fields-container"></div>
        <div id="fileSection-${id}" class="form-group file-upload-group hidden">
            <label>Proof Upload (Max 5MB)</label>
            <div class="file-drop-area">
                <input type="file" class="file-input" multiple accept=".pdf,.jpg,.png" onchange="handleFiles(${id}, this.files)">
                <span class="file-msg">Choose files or drag here</span>
            </div>
            <div id="fileInfo-${id}" class="file-info"></div>
        </div>
    `;
    container.appendChild(block);
}

function removeActivity(id) {
    const block = document.getElementById(`activity-${id}`);
    if (block) block.remove();
}

window.removeActivity = removeActivity;

window.handleCategoryChange = function(id, category) {
    const container = document.getElementById(`dynamicFields-${id}`);
    const fileSection = document.getElementById(`fileSection-${id}`);
    container.innerHTML = '';
    fileSection.classList.remove('hidden');

    if (category === "Awards / Prize Won") {
        createInputField(container, "Name of Award", `awardName-${id}`, "text", true);
        createInputField(container, "Date of Award", `eventDate-${id}`, "date", true);
    } else if (category === "Course Completed") {
        createInputField(container, "Course Name", `courseName-${id}`, "text", true);
        createInputField(container, "Certificate Number", `certNo-${id}`, "text", true);
        createInputField(container, "Date of Completion", `eventDate-${id}`, "date", true);
    } else if (category === "Sports Participation / Achievement") {
        createInputField(container, "Event Name", `eventName-${id}`, "text", true);
        createInputField(container, "Date", `eventDate-${id}`, "date", true);
        createInputField(container, "Month (optional)", `month-${id}`, "text", false);
    } else if (category === "In-Plant Training" || category === "Internship") {
        createInputField(container, "Company Name", `companyName-${id}`, "text", true);
        createInputField(container, "Start Date", `startDate-${id}`, "date", true);
        createInputField(container, "End Date", `endDate-${id}`, "date", true);
    }
}

function createInputField(container, labelText, id, type, required) {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `<label>${labelText}</label><input type="${type}" id="${id}" name="${id}" ${required ? 'required' : ''}>`;
    container.appendChild(group);
}

window.handleFiles = function(id, files) {
    const info = document.getElementById(`fileInfo-${id}`);
    let totalSize = 0;
    for (let f of files) totalSize += f.size;
    if (totalSize > 5 * 1024 * 1024) {
        alert("Total size exceeds 5MB.");
        return;
    }
    info.textContent = `${files.length} file(s) selected (${(totalSize/1024/1024).toFixed(2)}MB)`;
}

// Academic Logic
function initAcademicGrades() {
    const prevBtn = document.getElementById('prevSemBtn');
    const nextBtn = document.getElementById('nextSemBtn');
    
    prevBtn.addEventListener('click', () => {
        if (currentSem > 1) {
            currentSem--;
            updateSemUI();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentSem < 8) {
            currentSem++;
            updateSemUI();
        }
    });

    // Initial render
    updateSemUI();
}

function updateSemUI() {
    document.getElementById('currentSemNum').textContent = currentSem;
    document.getElementById('prevSemBtn').disabled = (currentSem === 1);
    document.getElementById('nextSemBtn').disabled = (currentSem === 8);
    renderSubjects(currentSem);
}

function renderSubjects(sem) {
    const tbody = document.getElementById('subjectsTableBody');
    tbody.innerHTML = '';
    
    // Use stored data if available, otherwise use template
    const subjects = (academicData[sem] && academicData[sem].subjects) ? academicData[sem].subjects : SUBJECTS_DATA[sem];
    
    subjects.forEach((sub, index) => {
        const row = document.createElement('tr');
        const gradeValue = sub.grade || "";
        
        row.innerHTML = `
            <td>${sub.code}</td>
            <td>${sub.isElective ? `<input type="text" value="${sub.title || ''}" placeholder="Enter Course Name" onchange="updateElectiveName(${sem}, ${index}, this.value)">` : sub.title}</td>
            <td>${sub.isElective ? `<input type="number" value="${sub.credits}" style="width:50px" onchange="updateElectiveCredits(${sem}, ${index}, this.value)">` : sub.credits}</td>
            <td>
                <select onchange="updateGrade(${sem}, ${index}, this.value)">
                    <option value="" ${gradeValue === "" ? 'selected' : ''} disabled>-</option>
                    <option value="O" ${gradeValue === "O" ? 'selected' : ''}>O</option>
                    <option value="A+" ${gradeValue === "A+" ? 'selected' : ''}>A+</option>
                    <option value="A" ${gradeValue === "A" ? 'selected' : ''}>A</option>
                    <option value="B+" ${gradeValue === "B+" ? 'selected' : ''}>B+</option>
                    <option value="B" ${gradeValue === "B" ? 'selected' : ''}>B</option>
                    <option value="C" ${gradeValue === "C" ? 'selected' : ''}>C</option>
                    <option value="U" ${gradeValue === "U" ? 'selected' : ''}>U</option>
                </select>
            </td>
        `;
        tbody.appendChild(row);
    });
    calculateGPA(sem);
}

window.updateGrade = function(sem, index, grade) {
    if (!academicData[sem]) academicData[sem] = { subjects: JSON.parse(JSON.stringify(SUBJECTS_DATA[sem])) };
    academicData[sem].subjects[index].grade = grade;
    calculateGPA(sem);
};

window.updateElectiveName = function(sem, index, name) {
    if (!academicData[sem]) academicData[sem] = { subjects: JSON.parse(JSON.stringify(SUBJECTS_DATA[sem])) };
    academicData[sem].subjects[index].title = name;
};

window.updateElectiveCredits = function(sem, index, credits) {
    if (!academicData[sem]) academicData[sem] = { subjects: JSON.parse(JSON.stringify(SUBJECTS_DATA[sem])) };
    academicData[sem].subjects[index].credits = parseFloat(credits);
    calculateGPA(sem);
};

function calculateGPA(sem) {
    const data = academicData[sem];
    if (!data) return;
    
    let totalCredits = 0;
    let earnedPoints = 0;
    
    data.subjects.forEach(sub => {
        if (sub.grade && sub.credits > 0) {
            totalCredits += sub.credits;
            earnedPoints += sub.credits * GRADE_POINTS[sub.grade];
        }
    });
    
    const gpa = totalCredits > 0 ? (earnedPoints / totalCredits).toFixed(2) : "0.00";
    data.gpa = parseFloat(gpa);
    document.getElementById('semGPA').textContent = gpa;
    calculateCGPA();
}

function calculateCGPA() {
    let grandTotalPoints = 0;
    let grandTotalCredits = 0;
    
    Object.values(academicData).forEach(sem => {
        sem.subjects.forEach(sub => {
            if (sub.grade && sub.credits > 0) {
                grandTotalCredits += sub.credits;
                grandTotalPoints += sub.credits * GRADE_POINTS[sub.grade];
            }
        });
    });
    
    const cgpa = grandTotalCredits > 0 ? (grandTotalPoints / grandTotalCredits).toFixed(2) : "0.00";
    document.getElementById('overallCGPA').textContent = cgpa;
}

function initFormSubmission() {
    const form = document.getElementById('mainForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const loader = document.getElementById('loadingOverlay');
        loader.classList.remove('hidden');

        try {
            const payload = {
                student: {
                    rollNo: document.getElementById('studentSelect').value.split(' - ')[0],
                    name: document.getElementById('studentSelect').value.split(' - ')[1],
                    email: document.getElementById('studentEmail').value
                },
                activities: await collectActivities(),
                academic: academicData
            };

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

async function collectActivities() {
    const activities = [];
    const blocks = document.querySelectorAll('.activity-card');
    
    for (let block of blocks) {
        const id = block.id.split('-')[1];
        const category = block.querySelector('.category-select').value;
        if (!category) continue;
        
        const activity = {
            category: category,
            eventName: document.getElementById(`eventName-${id}`)?.value || 
                       document.getElementById(`awardName-${id}`)?.value || 
                       document.getElementById(`courseName-${id}`)?.value || 
                       document.getElementById(`companyName-${id}`)?.value || '',
            date: document.getElementById(`eventDate-${id}`)?.value || '',
            awardName: document.getElementById(`awardName-${id}`)?.value || '',
            courseName: document.getElementById(`courseName-${id}`)?.value || '',
            certNo: document.getElementById(`certNo-${id}`)?.value || '',
            companyName: document.getElementById(`companyName-${id}`)?.value || '',
            startDate: document.getElementById(`startDate-${id}`)?.value || '',
            endDate: document.getElementById(`endDate-${id}`)?.value || '',
            month: document.getElementById(`month-${id}`)?.value || '',
            files: []
        };
        
        const fileInput = block.querySelector('.file-input');
        for (let file of fileInput.files) {
            const base64 = await toBase64(file);
            activity.files.push({ base64, type: file.type, name: file.name });
        }
        activities.push(activity);
    }
    return activities;
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});
