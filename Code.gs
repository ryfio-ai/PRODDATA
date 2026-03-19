const SHEET_ACTIVITIES = "Activities";
const SHEET_GRADES = "Grades";

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
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
    sheet.setFrozenRows(1);
  }
  return sheet;
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
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const student = data.student;
    const timestamp = new Date();

    if (data.activities && data.activities.length > 0) {
      const headers = ["Timestamp", "Roll Number", "Name", "Category", "Title", "Date/Period", "Details", "Proof Files"];
      const sheet = getOrCreateSheet(ss, SHEET_ACTIVITIES, headers);
      let isFirstActivity = true;
      data.activities.forEach(act => {
        let details = "";
        if (act.category === "Course Completed") details = `Cert No: ${act.certificateNo || "N/A"}`;
        else if (act.category === "Sports Participation / Achievement") details = `Place: ${act.place || "N/A"}, Level: ${act.level || "N/A"}, Cat: ${act.sportCategory || "N/A"}`;
        else if (act.category === "In-Plant Training" || act.category === "Internship") details = `Location: ${act.location || "N/A"}`;

        let datePeriod = act.date || "N/A";
        if (act.startDate && act.endDate) datePeriod = `${act.startDate} to ${act.endDate}`;
        else if (act.startDate) datePeriod = `Starts: ${act.startDate}`;

        sheet.appendRow([
          timestamp,
          isFirstActivity ? student.rollNo : "",
          isFirstActivity ? student.name : "",
          act.category,
          act.eventName || act.awardName || act.courseName || act.companyName || "N/A",
          datePeriod,
          details,
          act.files ? act.files.map(f => f.name).join(", ") : ""
        ]);
        isFirstActivity = false;
      });
    }

    if (data.academic) {
      const headers = ["Timestamp", "Roll Number", "Name", "Semester", "Course Code", "Course Title", "Credits", "Grade", "GPA", "CGPA"];
      const sheet = getOrCreateSheet(ss, SHEET_GRADES, headers);
      let isFirstOverall = true;
      
      Object.keys(data.academic).sort((a, b) => parseInt(a) - parseInt(b)).forEach(sem => {
        let isFirstInSem = true;
        const semData = data.academic[sem];
        if (!semData.subjects || semData.subjects.length === 0) return;

        semData.subjects.forEach(sub => {
          if (!sub.grade && sub.grade !== 0 && sub.grade !== "0") return;
          const row = [
            timestamp,
            isFirstOverall ? student.rollNo : "",
            isFirstOverall ? student.name : "",
            isFirstInSem ? sem : "",
            sub.code,
            sub.title,
            sub.credits,
            sub.grade,
            isFirstInSem ? semData.gpa : "",
            isFirstInSem ? semData.cgpa : ""
          ];
          sheet.appendRow(row);
          isFirstOverall = false;
          isFirstInSem = false;
        });
      });
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
