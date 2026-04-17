# PSG Tech Mechanical | Tech Bulletin Student Portal

An upgraded data collection portal designed to map student activities directly to the **Department Tech Bulletin** format. This portal streamlines the process of gathering structured data for institutional reporting.

## 🔗 Live Portals
- **Production (React)**: [https://proddata26.vercel.app/](https://proddata26.vercel.app/)
- **Fallback (Vanilla JS)**: [https://ryfio-ai.github.io/PRODDATA/](https://ryfio-ai.github.io/PRODDATA/)

---

## 📘 Guided User Workflow

### Step 1: Identity Selection
1.  Navigate to the portal.
2.  In the **Student Information** section, use the dropdown to select your **Roll Number & Name**.
3.  Your official PSG Tech email address and relevant document fields will be auto-generated.

### Step 2: Selecting a Section (Tabs)
The portal is divided into **6 key sections** matching the Tech Bulletin document. Use the horizontal navigation bar to switch between them:
- **Visits Abroad**: For international academic visits.
- **Activities**: For co-curricular and extra-curricular events (NCC, NSS, Quizzes, Sports).
- **Awards**: For achievements and positions won at various institutions.
- **Competitive Exams**: For tracking GATE, CAT, GRE, etc.
- **Internships**: Personal and Official internships.
- **Placement & Higher Studies**: Career progression tracking.
- **Research Papers**: Journal and Conference publications.


### Step 3: Adding Multiple Entries
1.  Inside any tab, click the **`+ Add Entry`** button to create a new record block.
2.  Fill in the specific fields for that entry (e.g., Company Name, Date, Award Name).
3.  You can add as many entries as needed within a single session.

### Step 4: Proof Verification (Mandatory)
For **every entry created**, you must upload a supporting document:
- **Max Size**: 5MB per file.
- **Formats**: PDF, JPG, JPEG, PNG.
- **Action**: Drag and drop your file into the dashed box or click to select.

### Step 5: Final Submission
Once all entries across all relevant tabs are filled and proofs are uploaded:
1.  Click the **Submit All Records** button at the bottom.
2.  Wait for the loader to finish. A success checkmark will appear once data is securely synced to the department database.

---

## 🛠 Project Architecture

### Frontend
- **React version**: Modern UI components located in `/src`.
- **Vanilla version**: Legacy-compatible version in `/docs` for GitHub Pages.
- **Styling**: PSG Tech Branding using `--primary-color: #004a99` and `--secondary-color: #f7941d`.

### Backend (Google Apps Script)
- **Data Routing**: The `doPost(e)` function in `Code.gs` routes data from different tabs into specific sheets.
- **Sheet Structure**: 6 dedicated sheets: `Visits_Abroad`, `Activities`, `Awards`, `Competitive_Exams`, `Industrial_Visits`, and `Trainings`.
- **Cloud Storage**: proofs are automatically sorted into a nested folder structure:
  `PSGTech / [RollNo]_[Name] / [Section] / [Entry Title]`

---

## 📋 Tech Bulletin Section Reference

| Section | Key Fields |
| :--- | :--- |
| **Visits Abroad** | Place, Purpose, Date Range, Proof |
| **Activities** | Nature, Date, Award, Semester, Proof |
| **Personal/Official Internships** | Company, Location, Date Range, Title, Proof |
| **Placement Offers** | Programme, Employer, Package, Appt Date, Proof |
| **Higher Studies** | Degree, Institution Joined, Programme Admitted, Proof |
| **Research Papers** | Title, Journal/Conference, ISSN/ISBN, Month/Year, Proof |


---

> [!NOTE]
> This portal is maintained for the **Mechanical Engineering Department (2022-2026 Batch)**. For technical issues, please contact the registry administrator.
