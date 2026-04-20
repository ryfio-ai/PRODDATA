/* 
   PSG TECH STUDENT PORTAL - BACKEND CORE
   Sheet: https://docs.google.com/spreadsheets/d/1cx4wOKIx-NmnBXWbdSgcWnUsErJ24MU9iL8HP33kQ6o/
   Drive: https://drive.google.com/drive/folders/1A1Fxof5ZGjihyuR2G8SPEDrQitplo2L6
*/

const TARGET_SPREADSHEET_ID = "1cx4wOKIx-NmnBXWbdSgcWnUsErJ24MU9iL8HP33kQ6o";
const ROOT_DRIVE_FOLDER_ID = "1A1Fxof5ZGjihyuR2G8SPEDrQitplo2L6";

/**
 * RUN THIS FUNCTION ONCE in the Apps Script editor 
 * to create all sheets and headers instantly.
 */
function initializeProject() {
  const ss = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
  const sections = getSectionsConfig();
  
  // Create all data sheets
  sections.forEach(sec => {
    getOrCreateSheet(ss, sec.sheetName, sec.headers);
  });
  
  // Create submission tracker
  getOrCreateSheet(ss, "Submissions", ["Roll No", "Timestamp", "Name", "Personal Email", "Phone No", "Address"]);
  
  // Create log sheet
  getOrCreateSheet(ss, "System_Logs", ["Timestamp", "Status", "Details"]);
  
  Logger.log("✅ All sheets initialized successfully!");
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === "getSubmissions") {
    const ss = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "Submissions", ["Roll No", "Timestamp", "Name", "Personal Email", "Phone No", "Address"]);
    const data = sheet.getDataRange().getValues();
    const submittedRolls = data.slice(1).map(row => String(row[0]));
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: submittedRolls }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("✅ Backend Script Active").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const ss = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
  const logSheet = getOrCreateSheet(ss, "System_Logs", ["Timestamp", "Status", "Details"]);
  
  try {
    const data = JSON.parse(e.postData.contents);
    const student = data.student;
    const timestamp = new Date();
    const sections = getSectionsConfig(student, timestamp);

    logSheet.appendRow([new Date(), "INFO", "Submission start for: " + student.rollNo]);

    sections.forEach(sec => {
      const entries = data[sec.key];
      if (entries && entries.length) {
        const sheet = getOrCreateSheet(ss, sec.sheetName, sec.headers);
        entries.forEach(entry => {
          const entryTitle = sec.title(entry) || "Entry_" + Date.now();
          const semFolder = sec.sem(entry);
          const proofLink = uploadToDrive(entry.files, student, semFolder, sec.folder, entryTitle);
          sheet.appendRow(sec.builder(entry, proofLink));
        });
      }
    });

    // Record total submission
    const subSheet = getOrCreateSheet(ss, "Submissions", ["Roll No", "Timestamp", "Name", "Personal Email", "Phone No", "Address"]);
    subSheet.appendRow([student.rollNo, timestamp, student.name, student.personalEmail, student.phone, student.address]);

    logSheet.appendRow([new Date(), "SUCCESS", "Saved records for: " + student.rollNo]);
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    logSheet.appendRow([new Date(), "ERROR", err.toString()]);
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSectionsConfig(student, timestamp) {
  const std = student || {};
  const ts = timestamp || "";

  return [
    {
      key: "visitsAbroad",
      sheetName: "Visits_Abroad",
      headers: ["Timestamp", "Roll No", "Name", "Personal Email", "Phone No", "Address", "Place of Visit", "Period From", "Period To", "Purpose", "Drive Link"],
      builder: (e, p) => [ts, std.rollNo, std.name, std.personalEmail, std.phone, std.address, e.place, e.from, e.to, e.purpose, p],
      folder: "Visits Abroad",
      title: e => e.place,
      sem: e => "N/A"
    },
    {
      key: "activities",
      sheetName: "Activities",
      headers: ["Timestamp", "Roll No", "Name", "Personal Email", "Phone No", "Address", "Semester", "Nature", "Date", "Award", "Drive Link"],
      builder: (e, p) => [ts, std.rollNo, std.name, std.personalEmail, std.phone, std.address, e.semester, e.nature, e.date, e.award, p],
      folder: "Activities",
      title: e => e.nature,
      sem: e => e.semester
    },
    {
      key: "awards",
      sheetName: "Awards",
      headers: ["Timestamp", "Roll No", "Name", "Personal Email", "Phone No", "Address", "Semester", "Position", "Awarded By", "Date", "Drive Link"],
      builder: (e, p) => [ts, std.rollNo, std.name, std.personalEmail, std.phone, std.address, e.semester, e.pos, e.by, e.date, p],
      folder: "Awards",
      title: e => e.pos,
      sem: e => e.semester
    },
    {
      key: "exams",
      sheetName: "Competitive_Exams",
      headers: ["Timestamp", "Roll No", "Name", "Personal Email", "Phone No", "Address", "Exam", "Score", "Appeared", "Qualified", "Drive Link"],
      builder: (e, p) => [ts, std.rollNo, std.name, std.personalEmail, std.phone, std.address, e.name, e.score, e.appeared, e.qualified, p],
      folder: "Competitive Exams",
      title: e => e.name,
      sem: e => "N/A"
    },
    {
      key: "officialInternships",
      sheetName: "Official_Internships",
      headers: ["Timestamp", "Roll No", "Name", "Personal Email", "Phone No", "Address", "Semester", "Company", "From", "To", "Project", "Drive Link"],
      builder: (e, p) => [ts, std.rollNo, std.name, std.personalEmail, std.phone, std.address, e.semester, e.company, e.from, e.to, e.project, p],
      folder: "Official Internships",
      title: e => e.company,
      sem: e => e.semester
    },
    {
      key: "personalInternships",
      sheetName: "Personal_Internships",
      headers: ["Timestamp", "Roll No", "Name", "Personal Email", "Phone No", "Address", "Semester", "Company", "From", "To", "Project", "Drive Link"],
      builder: (e, p) => [ts, std.rollNo, std.name, std.personalEmail, std.phone, std.address, e.semester, e.company, e.from, e.to, e.project, p],
      folder: "Personal Internships",
      title: e => e.company,
      sem: e => e.semester
    },
    {
      key: "placementOffers",
      sheetName: "Placement_Offers",
      headers: ["Timestamp", "Roll No", "Name", "Personal Email", "Phone No", "Address", "Semester", "Company", "Role", "LPA", "Drive Link"],
      builder: (e, p) => [ts, std.rollNo, std.name, std.personalEmail, std.phone, std.address, e.semester, e.company, e.role, e.package, p],
      folder: "Placement Offers",
      title: e => e.company,
      sem: e => e.semester
    },
    {
      key: "higherStudies",
      sheetName: "Higher_Studies",
      headers: ["Timestamp", "Roll No", "Name", "Personal Email", "Phone No", "Address", "Institution", "Programme", "Drive Link"],
      builder: (e, p) => [ts, std.rollNo, std.name, std.personalEmail, std.phone, std.address, e.institution, e.programme, p],
      folder: "Higher Studies",
      title: e => e.institution,
      sem: e => "N/A"
    },
    {
      key: "publishedPapers",
      sheetName: "Research_Papers",
      headers: ["Timestamp", "Roll No", "Name", "Personal Email", "Phone No", "Address", "Semester", "Guide", "Title", "Venue", "Type", "Level", "Date", "ISBN", "DOI", "Drive Link"],
      builder: (e, p) => [ts, std.rollNo, std.name, std.personalEmail, std.phone, std.address, e.semester, e.guide, e.title, e.conf, e.type, e.level, e.date, e.isbn, e.doi, p],
      folder: "Research Papers",
      title: e => e.title,
      sem: e => e.semester
    }
  ];
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f4f6");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}

function uploadToDrive(files, student, semester, sectionName, entryLabel) {
  if (!files || !files.length) return "No Proof Linked";
  const path = ["PSGTech_Records", `${student.rollNo}_${student.name}`, semester, sectionName, entryLabel];
  let folder = DriveApp.getFolderById(ROOT_DRIVE_FOLDER_ID);
  
  path.forEach(segment => {
    if (!segment || segment === "N/A") return;
    const safeName = String(segment).replace(/[^\w\s-]/g, ' ').trim();
    const subFolders = folder.getFoldersByName(safeName);
    folder = subFolders.hasNext() ? subFolders.next() : folder.createFolder(safeName);
  });

  files.forEach(f => {
    try {
      const bytes = Utilities.base64Decode(f.base64.split(',')[1]);
      const blob = Utilities.newBlob(bytes, f.type, f.name);
      folder.createFile(blob).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {
      console.error("File upload failed", e);
    }
  });

  return folder.getUrl();
}
