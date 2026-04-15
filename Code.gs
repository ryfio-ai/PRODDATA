const SHEET_VISITS_ABROAD = "Visits_Abroad";
const SHEET_ACTIVITIES = "Activities";
const SHEET_AWARDS = "Awards";
const SHEET_COMPETITIVE_EXAMS = "Competitive_Exams";
const SHEET_INDUSTRIAL_VISITS = "Industrial_Visits";
const SHEET_TRAININGS = "Trainings";

// Target storage (explicit IDs so data goes to the right places)
const TARGET_SPREADSHEET_ID = "1XoPGKBUMrhIxXxUK028K0BtsT4YFL3TKu3JesrkHbJU";
const ROOT_DRIVE_FOLDER_ID = "1A1Fxof5ZGjihyuR2G8SPEDrQitplo2L6";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🛡️ Studzone Service')
    .addItem('1. Authorize Scraper & Sheets', 'authorizeNow')
    .addToUi();
}

function doGet(e) {
  authorizeNow();
  return ContentService.createTextOutput("✅ Authorization Check Complete. If you saw the Google prompt and clicked 'Allow', your portal is now ready!").setMimeType(ContentService.MimeType.TEXT);
}

function authorizeNow() {
  try {
     UrlFetchApp.fetch("https://google.com", { muteHttpExceptions: true });
     console.log("Authorization Successful");
  } catch(e) {
     console.log("Auth Error: " + e.message);
  }
}

function fetchFromStudzone(rollNo, password) {
  var baseUrl = "https://ecampus.psgtech.ac.in/studzone2/";
  
  // 1. Get Landing Page for Tokens
  var response = UrlFetchApp.fetch(baseUrl, { "muteHttpExceptions": true });
  if (response.getResponseCode() !== 200) {
    throw new Error("Failed to reach college portal landing page (status " + response.getResponseCode() + ").");
  }
  var html = response.getContentText();
  
  var viewstate = html.match(/id="__VIEWSTATE" value="([^"]*)"/)[1];
  var generator = html.match(/id="__VIEWSTATEGENERATOR" value="([^"]*)"/)[1];
  var validation = html.match(/id="__EVENTVALIDATION" value="([^"]*)"/)[1];
  var abcd3 = html.match(/name="abcd3" value="([^"]*)"/)[1];
  var cookies = response.getAllHeaders()["Set-Cookie"];

  // 2. Perform Login
  var payload = {
    "__EVENTTARGET": "",
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": viewstate,
    "__VIEWSTATEGENERATOR": generator,
    "__EVENTVALIDATION": validation,
    "rdolst": "S",
    "txtusercheck": rollNo,
    "txtpwdcheck": password,
    "abcd3": abcd3
  };

  var loginOptions = {
    "method": "post",
    "payload": payload,
    "headers": { "Cookie": Array.isArray(cookies) ? cookies.join("; ") : cookies },
    "followRedirects": true,
    "muteHttpExceptions": true
  };

  var loginActionResponse = UrlFetchApp.fetch(baseUrl, loginOptions);
  var loginCookies = loginActionResponse.getAllHeaders()["Set-Cookie"] || cookies;

  // 3. Get Course Data
  var courseUrl = "https://ecampus.psgtech.ac.in/studzone2/AttWfStudCourseSelection.aspx";
  var courseResponse = UrlFetchApp.fetch(courseUrl, {
    "headers": { "Cookie": Array.isArray(loginCookies) ? loginCookies.join("; ") : loginCookies },
    "muteHttpExceptions": true
  });
  
  var courseHtml = courseResponse.getContentText();
  if (courseResponse.getResponseCode() === 500) {
    if (courseHtml.indexOf("ORA-01403") !== -1 || courseHtml.indexOf("no data found") !== -1) {
      throw new Error("College portal returned 'No data found' (ORA-01403). Please verify the roll number / credentials, or the student may have no records.");
    }
    throw new Error("College portal is experiencing an internal error (status 500).");
  } else if (courseResponse.getResponseCode() !== 200) {
    throw new Error("Failed to fetch course data from college portal (status " + courseResponse.getResponseCode() + ").");
  }
  var gradesObj = {};
  
  const GRADE_MAP = { 'O': '10', 'A+': '9', 'A': '8', 'B+': '7', 'B': '6', 'C': '5', 'U': '0' };
  
  // Robustly find the table by ID (case insensitive)
  var tableMatch = courseHtml.match(/<table[^>]+id=["']PDGCourse["'][^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) {
     // Fallback: try finding any table with at least 9 columns as observed in the new layout
     tableMatch = courseHtml.match(/<table[^>]*>([\s\S]*?(?:<tr[^>]*>[\s\S]*?<\/tr>){3,}[\s\S]*?)<\/table>/i);
  }

  if (tableMatch) {
    var rawTable = tableMatch[1];
    // Split rows iteratively to avoid regex greediness issues
    var rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    var rowMatch;
    var isFirst = true;

    while ((rowMatch = rowRegex.exec(rawTable)) !== null) {
        if (isFirst) { isFirst = false; continue; } // Skip header
        
        var cols = [];
        var colRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        var colMatch;
        while ((colMatch = colRegex.exec(rowMatch[1])) !== null) {
            cols.push(colMatch[1].replace(/<[^>]*>/g, "").trim());
        }

        if (cols.length >= 9) {
          var code = cols[1];
          var title = cols[2];
          var sem = cols[4];
          var gradeLetter = cols[6];
          var credits = parseFloat(cols[7]);
          var grade = GRADE_MAP[gradeLetter] || gradeLetter;

          if (!isNaN(parseInt(sem)) && !isNaN(credits)) {
            if (!gradesObj[sem]) gradesObj[sem] = { subjects: [], pts: 0, cr: 0 };
            gradesObj[sem].subjects.push({ code: code, title: title, credits: credits, grade: grade });
            var gp = parseInt(grade) || 0;
            if (gp > 0) {
              gradesObj[sem].pts += credits * gp;
              gradesObj[sem].cr += credits;
            }
          }
        }
    }
  }

  // Finalize GPAs and check if data was found
  var semesters = Object.keys(gradesObj);
  if (semesters.length === 0) {
     throw new Error("Scraper failed to find course records. Check if the portal layout has changed.");
  }

  semesters.forEach(sem => {
     let s = gradesObj[sem];
     s.gpa = s.cr > 0 ? (s.pts / s.cr).toFixed(4) : "0.0000";
     delete s.pts; delete s.cr;
  });

  return gradesObj;
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f8f9fa").setBorder(true, true, true, true, true, true);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f8f9fa").setBorder(true, true, true, true, true, true);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getFolderByPath(pathArray) {
  let currentFolder = DriveApp.getFolderById(ROOT_DRIVE_FOLDER_ID);
  for (let folderName of pathArray) {
    let folders = currentFolder.getFoldersByName(folderName);
    if (folders.hasNext()) {
      currentFolder = folders.next();
    } else {
      currentFolder = currentFolder.createFolder(folderName);
    }
  }
  return currentFolder;
}

function safeFolderName(name) {
  const s = String(name || "").trim();
  if (!s) return "Untitled";
  // Remove characters that commonly break Drive folder paths
  return s.replace(/[\/\\:*?"<>|#%\u0000-\u001F]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

function ensureAnyoneWithLinkView(fileOrFolder) {
  try {
    fileOrFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    // Ignore if sharing fails due to domain policy
  }
}

function saveToDrive(fileObj, folder) {
  try {
    const contentType = fileObj.base64.substring(5, fileObj.base64.indexOf(';'));
    const bytes = Utilities.base64Decode(fileObj.base64.split(',')[1]);
    const blob = Utilities.newBlob(bytes, contentType, fileObj.name);
    const file = folder.createFile(blob);
    ensureAnyoneWithLinkView(file);
    return file.getUrl();
  } catch (e) {
    return "Error saving: " + e.message;
  }
}

function normalizeSemesterFolder(semesterValue) {
  const s = String(semesterValue || "").trim();
  return safeFolderName(s || "Semester NA");
}

function createEntryFolder(student, semesterFolder, sectionName, entryLabel) {
  const base = [
    `${safeFolderName(student.rollNo)}_${safeFolderName(student.name)}`,
    normalizeSemesterFolder(semesterFolder),
    safeFolderName(sectionName),
    safeFolderName(entryLabel)
  ];
  const folder = getFolderByPath(base);
  ensureAnyoneWithLinkView(folder);
  return folder;
}

function writeSection(ss, sheetName, headers, student, timestamp, entries, rowBuilder, sectionFolderName, entryTitleBuilder, semesterFolderBuilder) {
  if (!entries || entries.length === 0) return;
  const sheet = getOrCreateSheet(ss, sheetName, headers);
  entries.forEach((entry) => {
    const entryTitle = entryTitleBuilder(entry) || Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd_HHmmss");
    const semesterFolder = semesterFolderBuilder ? semesterFolderBuilder(entry) : "Semester NA";
    const entryFolder = createEntryFolder(student, semesterFolder, sectionFolderName, entryTitle);

    let proofLink = "";
    if (entry.files && entry.files.length > 0) {
      entry.files.forEach((f) => saveToDrive(f, entryFolder));
      proofLink = entryFolder.getUrl();
    }
    sheet.appendRow(rowBuilder(entry, proofLink));
  });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.action === "fetch") {
      var grades = fetchFromStudzone(data.rollNo, data.password);
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: grades }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Spreadsheet logic
    const ss = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
    const student = data.student;
    const timestamp = new Date();

    // Sheet 1: Visits_Abroad
    writeSection(
      ss,
      SHEET_VISITS_ABROAD,
      ["Timestamp", "Roll No", "Name", "Place of Visit", "Period From", "Period To", "Purpose", "Proof Link"],
      student,
      timestamp,
      data.visitsAbroad || [],
      (entry, proofLink) => [
        timestamp,
        student.rollNo,
        student.name,
        entry.place || "",
        entry.periodFrom || "",
        entry.periodTo || "",
        entry.purpose || "",
        proofLink
      ],
      "Visits Abroad",
      (entry) => `${entry.place || "Visit"} - ${entry.periodFrom || ""}`.trim(),
      () => "Semester NA"
    );

    // Sheet 2: Activities (with Semester enhancement)
    writeSection(
      ss,
      SHEET_ACTIVITIES,
      ["Timestamp", "Roll No", "Name", "Semester", "Nature of Activity", "Date", "Award/Achievement", "Proof Link"],
      student,
      timestamp,
      data.activities || [],
      (entry, proofLink) => [
        timestamp,
        student.rollNo,
        student.name,
        entry.semester || "",
        entry.nature || "",
        entry.date || "",
        entry.award || "",
        proofLink
      ],
      "Activities",
      (entry) => `${entry.nature || "Activity"} - ${entry.date || ""}`.trim(),
      (entry) => entry.semester || "Semester NA"
    );

    // Sheet 3: Awards (with Semester enhancement)
    writeSection(
      ss,
      SHEET_AWARDS,
      ["Timestamp", "Roll No", "Name", "Semester", "Event", "Award/Position", "Awarded By", "Date", "Proof Link"],
      student,
      timestamp,
      data.awards || [],
      (entry, proofLink) => [
        timestamp,
        student.rollNo,
        student.name,
        entry.semester || "",
        entry.event || "",
        entry.position || "",
        entry.awardedBy || "",
        entry.date || "",
        proofLink
      ],
      "Awards",
      (entry) => `${entry.event || "Award"} - ${entry.date || ""}`.trim(),
      (entry) => entry.semester || "Semester NA"
    );

    // Sheet 4: Competitive_Exams
    writeSection(
      ss,
      SHEET_COMPETITIVE_EXAMS,
      ["Timestamp", "Roll No", "Name", "Exam", "Appeared", "Qualified", "Score", "Proof Link"],
      student,
      timestamp,
      data.competitiveExams || [],
      (entry, proofLink) => [
        timestamp,
        student.rollNo,
        student.name,
        entry.exam || "",
        entry.appeared || "",
        entry.qualified || "",
        entry.score || "",
        proofLink
      ],
      "Competitive Exams",
      (entry) => `${entry.exam || "Exam"}`.trim(),
      () => "Semester NA"
    );

    // Sheet 5: Industrial_Visits
    writeSection(
      ss,
      SHEET_INDUSTRIAL_VISITS,
      ["Timestamp", "Roll No", "Name", "Company", "Period From", "Period To", "Area", "No. of Students", "Proof Link"],
      student,
      timestamp,
      data.industrialVisits || [],
      (entry, proofLink) => [
        timestamp,
        student.rollNo,
        student.name,
        entry.company || "",
        entry.periodFrom || "",
        entry.periodTo || "",
        entry.area || "",
        entry.noOfStudents || "",
        proofLink
      ],
      "Industrial Visit",
      (entry) => `${entry.company || "Industrial Visit"} - ${entry.periodFrom || ""}`.trim(),
      () => "Semester NA"
    );

    // Sheet 6: Trainings (with Semester enhancement)
    writeSection(
      ss,
      SHEET_TRAININGS,
      ["Timestamp", "Roll No", "Name", "Semester", "Company", "Period From", "Period To", "Area/Project Title", "Proof Link"],
      student,
      timestamp,
      data.trainings || [],
      (entry, proofLink) => [
        timestamp,
        student.rollNo,
        student.name,
        entry.semester || "",
        entry.company || "",
        entry.periodFrom || "",
        entry.periodTo || "",
        entry.areaOrTitle || "",
        proofLink
      ],
      "Training/Internship",
      (entry) => `${entry.company || "Training"} - ${entry.periodFrom || ""}`.trim(),
      (entry) => entry.semester || "Semester NA"
    );

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
