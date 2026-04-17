const SHEET_PERSONAL_INTERNSHIPS = "Personal_Internships";
const SHEET_OFFICIAL_INTERNSHIPS = "Official_Internships";
const SHEET_PLACEMENT_OFFERS = "Placement_Offers";
const SHEET_HIGHER_STUDIES = "Higher_Studies";
const SHEET_PUBLISHED_PAPERS = "Published_Papers";
const SHEET_AWARDS = "Awards";
const SHEET_EVENTS = "Events";
const SHEET_COMPETITIVE_EXAMS = "Competitive_Exams";
const SHEET_VISITS_ABROAD = "Visits_Abroad";
const SHEET_ACTIVITIES = "Activities"; // Legacy / Generic



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

function uploadProofFiles(files, student, sectionFolderName, entryLabel, semesterFolder) {
  if (!files || files.length === 0) return "";
  const folder = createEntryFolder(student, semesterFolder, sectionFolderName, entryLabel);
  files.forEach(f => saveToDrive(f, folder));
  return folder.getUrl();
}

function writeSection(ss, sheetName, headers, student, timestamp, entries, rowBuilder, sectionFolderName, entryTitleBuilder, semesterFolderBuilder) {
  if (!entries || entries.length === 0) return;
  const sheet = getOrCreateSheet(ss, sheetName, headers);
  entries.forEach((entry) => {
    const entryTitle = entryTitleBuilder(entry) || Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd_HHmmss");
    const semesterFolder = semesterFolderBuilder ? semesterFolderBuilder(entry) : "Semester NA";
    const proofLink = uploadProofFiles(entry.files, student, sectionFolderName, entryTitle, semesterFolder);
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

    // 1. Placement Offers
    writeSection(
      ss,
      SHEET_PLACEMENT_OFFERS,
      ["Timestamp", "Roll No", "Name", "Contact Details", "Company Name", "Role", "Pay Package (Lakhs/Annum)", "Proof Link"],
      student,
      timestamp,
      data.placementOffers || [],
      (entry, proofLink) => [timestamp, student.rollNo, student.name, entry.contactDetails || "", entry.companyName || "", entry.role || "", entry.payPackage || "", proofLink],
      "Placement",
      (entry) => `${entry.companyName || "Placement"}`,
      () => "Semester NA"
    );

    // 2. Higher Studies
    writeSection(
      ss,
      SHEET_HIGHER_STUDIES,
      ["Timestamp", "Roll No", "Name", "Institution Joined", "Programme Admitted To", "Proof Link"],
      student,
      timestamp,
      data.higherStudies || [],
      (entry, proofLink) => [timestamp, student.rollNo, student.name, entry.institutionJoined || "", entry.programmeAdmitted || "", proofLink],
      "Higher Studies",
      (entry) => `${entry.institutionJoined || "Higher Studies"}`,
      () => "Semester NA"
    );

    // 3. Internship Official
    writeSection(
      ss,
      SHEET_OFFICIAL_INTERNSHIPS,
      ["Timestamp", "Roll No", "Name", "Contact Details", "Company Name", "Location", "Duration", "Project Title", "Proof Link"],
      student,
      timestamp,
      data.officialInternships || [],
      (entry, proofLink) => [
        timestamp, student.rollNo, student.name, entry.contactDetails || "", entry.companyName || "", 
        entry.location || "", entry.duration || "", entry.projectTitle || "", proofLink
      ],
      "Official Internship",
      (entry) => `${entry.companyName || "Internship"}`,
      () => "Semester NA"
    );

    // 4. Internship Personal (Dual Proof)
    if (data.personalInternships && data.personalInternships.length > 0) {
      const sheet = getOrCreateSheet(ss, SHEET_PERSONAL_INTERNSHIPS, ["Timestamp", "Roll No", "Name", "Contact Details", "Company Name", "Location", "Duration", "Project Title", "Offer Letter Link", "Certificate Link"]);
      data.personalInternships.forEach(entry => {
        const offerLink = uploadProofFiles(entry.offerFiles || [], student, "Personal Internship", (entry.companyName || "Internship") + "_Offer", "Semester NA");
        const certLink = uploadProofFiles(entry.certFiles || [], student, "Personal Internship", (entry.companyName || "Internship") + "_Cert", "Semester NA");
        sheet.appendRow([
          timestamp, student.rollNo, student.name, entry.contactDetails || "", entry.companyName || "",
          entry.location || "", entry.duration || "", entry.projectTitle || "", offerLink, certLink
        ]);
      });
    }

    // 5. Published Journal Papers / Conference
    writeSection(
      ss,
      SHEET_PUBLISHED_PAPERS,
      ["Timestamp", "Roll No", "Author Name", "Teacher Name (Guidance)", "Book Title (Theme)", "Paper Title", "Proceedings Title", "National/International", "Year/Month", "ISBN", "DOI/Link", "Proof Link"],
      student,
      timestamp,
      data.publishedPapers || [],
      (entry, proofLink) => [
        timestamp, student.rollNo, student.name, entry.teacherName || "", entry.bookTitle || "",
        entry.paperTitle || "", entry.proceedingsTitle || "", entry.level || "", entry.date || "",
        entry.isbn || "", entry.doiLink || "", proofLink
      ],
      "Published Papers",
      (entry) => `${entry.paperTitle || "Paper"}`,
      () => "Semester NA"
    );

    // 6. Award Data
    writeSection(
      ss,
      SHEET_AWARDS,
      ["Timestamp", "Roll No", "Student Name", "Mentor Name", "Award Name", "Awarding Body", "Month/Year", "Proof Link"],
      student,
      timestamp,
      data.awards || [],
      (entry, proofLink) => [
        timestamp, student.rollNo, student.name, entry.mentorName || "", entry.awardName || "",
        entry.awardingBody || "", entry.date || "", proofLink
      ],
      "Awards",
      (entry) => `${entry.awardName || "Award"}`,
      () => "Semester NA"
    );

    // 7. Event Data
    writeSection(
      ss,
      SHEET_EVENTS,
      ["Timestamp", "Roll No", "Student Name", "Event Name", "Team/Individual", "Award/Medal", "Level", "Month/Year", "Proof Link"],
      student,
      timestamp,
      data.events || [],
      (entry, proofLink) => [
        timestamp, student.rollNo, student.name, entry.eventName || "", entry.participationType || "",
        entry.medal || "", entry.level || "", entry.date || "", proofLink
      ],
      "Events",
      (entry) => `${entry.eventName || "Event"}`,
      () => "Semester NA"
    );



    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
