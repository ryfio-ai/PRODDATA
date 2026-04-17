/* 
   PSG TECH STUDENT PORTAL - TECH BULLETIN BACKEND
   Target Sheets: Visits_Abroad, Activities, Awards, Competitive_Exams, 
                  Official_Internships, Personal_Internships, Placement_Offers, 
                  Higher_Studies, Published_Papers, Submissions
*/

const TARGET_SPREADSHEET_ID = "1XoPGKBUMrhIxXxUK028K0BtsT4YFL3TKu3JesrkHbJU";
const ROOT_DRIVE_FOLDER_ID = "1A1Fxof5ZGjihyuR2G8SPEDrQitplo2L6";

function doGet(e) {
  if (e.parameter.action === "getSubmissions") {
    const ss = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, "Submissions", ["Roll No", "Timestamp"]);
    const data = sheet.getDataRange().getValues();
    const submittedRolls = data.slice(1).map(row => String(row[0]));
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: submittedRolls }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("✅ Tech Bulletin Script Active").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
    const student = data.student;
    const timestamp = new Date();

    // 1. Visits Abroad
    writeSection(ss, "Visits_Abroad", ["Timestamp", "Roll No", "Name", "Place of Visit", "Period From", "Period To", "Purpose", "Proof Link"], 
      student, timestamp, data.visitsAbroad, (entry, proof) => [timestamp, student.rollNo, student.name, entry.place, entry.from, entry.to, entry.purpose, proof], 
      "Visits Abroad", e => e.place, e => "N/A");

    // 2. Activities
    writeSection(ss, "Activities", ["Timestamp", "Roll No", "Name", "Semester", "Nature of Activity", "Date", "Award/Achievement", "Proof Link"], 
      student, timestamp, data.activities, (entry, proof) => [timestamp, student.rollNo, student.name, entry.semester, entry.nature, entry.date, entry.award, proof], 
      "Activities", e => e.nature, e => e.semester);

    // 3. Awards
    writeSection(ss, "Awards", ["Timestamp", "Roll No", "Name", "Semester", "Event", "Award/Position", "Awarded By", "Date", "Proof Link"], 
      student, timestamp, data.awards, (entry, proof) => [timestamp, student.rollNo, student.name, entry.semester, entry.event, entry.pos, entry.by, entry.date, proof], 
      "Awards", e => e.event, e => e.semester);

    // 4. Exams
    writeSection(ss, "Competitive_Exams", ["Timestamp", "Roll No", "Name", "Exam", "Appeared", "Qualified", "Score", "Proof Link"], 
      student, timestamp, data.exams, (entry, proof) => [timestamp, student.rollNo, student.name, entry.name, entry.appeared, entry.qualified, entry.score, proof], 
      "Competitive Exams", e => e.name, e => "N/A");

    // 5. Official Internship
    writeSection(ss, "Official_Internships", ["Timestamp", "Roll No", "Name", "Semester", "Company", "Period From", "Period To", "Area/Project", "Proof Link"], 
      student, timestamp, data.officialInternships, (entry, proof) => [timestamp, student.rollNo, student.name, entry.semester, entry.company, entry.from, entry.to, entry.project, proof], 
      "Official Internship", e => e.company, e => e.semester);

    // 6. Personal Internship
    writeSection(ss, "Personal_Internships", ["Timestamp", "Roll No", "Name", "Semester", "Company", "Period From", "Period To", "Area/Project", "Proof Link"], 
      student, timestamp, data.personalInternships, (entry, proof) => [timestamp, student.rollNo, student.name, entry.semester, entry.company, entry.from, entry.to, entry.project, proof], 
      "Personal Internship", e => e.company, e => e.semester);

    // 7. Placement
    writeSection(ss, "Placement_Offers", ["Timestamp", "Roll No", "Name", "Semester", "Company", "Role", "Package (LPA)", "Proof Link"], 
      student, timestamp, data.placementOffers, (entry, proof) => [timestamp, student.rollNo, student.name, entry.semester, entry.company, entry.role, entry.package, proof], 
      "Placement", e => e.company, e => e.semester);

    // 8. Higher Studies
    writeSection(ss, "Higher_Studies", ["Timestamp", "Roll No", "Name", "Institution", "Programme", "Proof Link"], 
      student, timestamp, data.higherStudies, (entry, proof) => [timestamp, student.rollNo, student.name, entry.institution, entry.programme, proof], 
      "Higher Studies", e => e.institution, e => "N/A");

    // 9. Published Papers
    writeSection(ss, "Published_Papers", ["Timestamp", "Roll No", "Name", "Semester", "Guide", "Title", "Journal/Conf", "Type", "Level", "Month/Year", "ISBN", "DOI", "Proof Link"], 
      student, timestamp, data.publishedPapers, (entry, proof) => [timestamp, student.rollNo, student.name, entry.semester, entry.guide, entry.title, entry.conf, entry.type, entry.level, entry.date, entry.isbn, entry.doi, proof], 
      "Published Papers", e => e.title, e => e.semester);

    // Track submission completion for dynamic dropdown feature
    const subSheet = getOrCreateSheet(ss, "Submissions", ["Roll No", "Timestamp"]);
    subSheet.appendRow([student.rollNo, timestamp]);

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function writeSection(ss, sheetName, headers, student, timestamp, entries, rowBuilder, sectionFolderName, entryTitleBuilder, semesterFolderBuilder) {
  if (!entries || !entries.length) return;
  const sheet = getOrCreateSheet(ss, sheetName, headers);
  entries.forEach(entry => {
    const entryTitle = entryTitleBuilder(entry) || "Entry_" + Date.now();
    const semFolder = semesterFolderBuilder(entry);
    const proofLink = uploadProofFiles(entry.files, student, semFolder, sectionFolderName, entryTitle);
    sheet.appendRow(rowBuilder(entry, proofLink));
  });
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f8f9fa").setFrozenRows(1);
  }
  return sheet;
}

function uploadProofFiles(files, student, semester, sectionName, entryLabel) {
  if (!files || !files.length) return "No Proof";
  const path = ["PSGTech", `${student.rollNo}_${student.name}`, semester, sectionName, entryLabel];
  const folder = getFolderByPath(path);
  files.forEach(f => {
    try {
      const bytes = Utilities.base64Decode(f.base64.split(',')[1]);
      const blob = Utilities.newBlob(bytes, f.type, f.name);
      folder.createFile(blob).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) { console.error("Upload error", e); }
  });
  return folder.getUrl();
}

function getFolderByPath(pathArray) {
  let currentFolder = DriveApp.getFolderById(ROOT_DRIVE_FOLDER_ID);
  pathArray.forEach(name => {
    const safeName = String(name || "NA").replace(/[\/\\:*?"<>|]/g, " ").trim();
    const it = currentFolder.getFoldersByName(safeName);
    currentFolder = it.hasNext() ? it.next() : currentFolder.createFolder(safeName);
  });
  return currentFolder;
}

function fetchFromStudzone(rollNo, password) {
  var baseUrl = "https://ecampus.psgtech.ac.in/studzone2/";
  var response = UrlFetchApp.fetch(baseUrl, { "muteHttpExceptions": true });
  if (response.getResponseCode() !== 200) return null;
  var html = response.getContentText();
  var viewstate = html.match(/id="__VIEWSTATE" value="([^"]*)"/)[1];
  var generator = html.match(/id="__VIEWSTATEGENERATOR" value="([^"]*)"/)[1];
  var validation = html.match(/id="__EVENTVALIDATION" value="([^"]*)"/)[1];
  var abcd3 = html.match(/name="abcd3" value="([^"]*)"/)[1];
  var cookies = response.getAllHeaders()["Set-Cookie"];
  var payload = { "__VIEWSTATE": viewstate, "__VIEWSTATEGENERATOR": generator, "__EVENTVALIDATION": validation, "rdolst": "S", "txtusercheck": rollNo, "txtpwdcheck": password, "abcd3": abcd3 };
  var loginOptions = { "method": "post", "payload": payload, "headers": { "Cookie": Array.isArray(cookies) ? cookies.join("; ") : cookies }, "followRedirects": true, "muteHttpExceptions": true };
  var loginActionResponse = UrlFetchApp.fetch(baseUrl, loginOptions);
  return { success: true };
}
