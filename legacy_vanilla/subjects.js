const SUBJECTS_DATA = {
    1: [
        { code: "19P101", title: "Calculus and its Applications", credits: 4 },
        { code: "19P102", title: "Physics", credits: 3 },
        { code: "19P103", title: "Chemistry", credits: 3 },
        { code: "19P104", title: "Professional Ethics", credits: 2 },
        { code: "19G105", title: "English Language Proficiency", credits: 3 },
        { code: "19P110", title: "Engineering Graphics", credits: 2 },
        { code: "19P111", title: "Basic Sciences Laboratory", credits: 2 },
        { code: "19P112", title: "Engineering Practices", credits: 1 },
        { code: "19IP15", title: "Induction Programme", credits: 0 }
    ],
    2: [
        { code: "19P201", title: "Complex Variables and Transforms", credits: 4 },
        { code: "19P202", title: "Materials Science", credits: 3 },
        { code: "19P203", title: "Chemistry of Engineering Materials", credits: 2 },
        { code: "19P204", title: "Engineering Mechanics", credits: 4 },
        { code: "19P205", title: "Basics of Electrical and Electronics Engineering", credits: 3 },
        { code: "19____", title: "Language Elective", credits: 2, isElective: true },
        { code: "19P210", title: "Electrical and Electronics Engineering Laboratory", credits: 1 },
        { code: "19P211", title: "C Programming Laboratory", credits: 2 },
        { code: "19P215", title: "Activity Point Programme", credits: 0 },
        { code: "19A212", title: "Internship", credits: 2 }
    ],
    3: [
        { code: "19P301", title: "Numerical Methods", credits: 3 },
        { code: "19P302", title: "Engineering Metallurgy", credits: 3 },
        { code: "19P303", title: "Strength of Materials", credits: 4 },
        { code: "19P304", title: "Fluid Mechanics and Machinery", credits: 4 },
        { code: "19P305", title: "Welding Technology", credits: 3 },
        { code: "19O306", title: "Economics for Engineers", credits: 3 },
        { code: "19P310", title: "Machine Drawing", credits: 2 },
        { code: "19P311", title: "Metallurgy and Strength of Materials Laboratory", credits: 1 },
        { code: "19K312", title: "Environmental Science", credits: 0 },
        { code: "19P315", title: "Activity Point Programme", credits: 0 }
    ],
    4: [
        { code: "19P401", title: "Probability and Statistics", credits: 3 },
        { code: "19P402", title: "Thermal Systems and Heat Transfer", credits: 4 },
        { code: "19P403", title: "Metal Forming Processes", credits: 3 },
        { code: "19P404", title: "Foundry Technology", credits: 3 },
        { code: "19P405", title: "Mechanics of Machines", credits: 4 },
        { code: "19P406", title: "Machining Technology", credits: 3 },
        { code: "19P410", title: "Thermal Engineering and Fluid Machinery Laboratory", credits: 1 },
        { code: "19P411", title: "Machining Technology Laboratory", credits: 1 },
        { code: "19Q413", title: "Soft Skills Development", credits: 1 },
        { code: "19O412", title: "Indian Constitution", credits: 0 },
        { code: "19P415", title: "Activity Point Programme", credits: 0 }
    ],
    5: [
        { code: "19P501", title: "Computer Numerical Control Machines", credits: 3 },
        { code: "19P502", title: "Process Planning and Cost Estimation", credits: 3 },
        { code: "19P503", title: "Manufacturing Metrology", credits: 3 },
        { code: "19P504", title: "Design of Machine Elements", credits: 4 },
        { code: "19P505", title: "Applied Hydraulics and Pneumatics", credits: 3 },
        { code: "19P___", title: "Professional Elective I", credits: 3, isElective: true },
        { code: "19P510", title: "Manufacturing Technology Laboratory", credits: 2 },
        { code: "19P511", title: "Metrology and Computer Aided Inspection Laboratory", credits: 2 },
        { code: "19Q513", title: "Business and Managerial Communications", credits: 1 },
        { code: "19P515", title: "Activity Point Programme", credits: 0 }
    ],
    6: [
        { code: "19P601", title: "Quantitative Methods In Management", credits: 3 },
        { code: "19P602", title: "Jigs, Fixtures and Die Design", credits: 3 },
        { code: "19P603", title: "Design for Manufacture and Assembly", credits: 3 },
        { code: "19P604", title: "Automation and Robotics", credits: 3 },
        { code: "19P___", title: "Professional Elective II", credits: 3, isElective: true },
        { code: "19P___", title: "Professional Elective III", credits: 3, isElective: true },
        { code: "19P610", title: "Fluid Power Laboratory", credits: 1 },
        { code: "19P611", title: "CAD, CAM and CAE Laboratory", credits: 2 },
        { code: "19Q613", title: "Quantitative and Reasoning Skills", credits: 1 },
        { code: "19P615", title: "Activity Point Programme", credits: 0 }
    ],
    7: [
        { code: "19P701", title: "Environment Conscious Manufacturing", credits: 2 },
        { code: "19P702", title: "Production and Operations Management", credits: 3 },
        { code: "19P___", title: "Professional Elective IV", credits: 3, isElective: true },
        { code: "19P___", title: "Professional Elective V", credits: 3, isElective: true },
        { code: "19____", title: "Open Elective I", credits: 3, isElective: true },
        { code: "19P710", title: "Industrial Engineering and Lean Practices Laboratory", credits: 2 },
        { code: "19P711", title: "Innovation Practices", credits: 2 },
        { code: "19P720", Project: "Work I", credits: 2 }
    ],
    8: [
        { code: "19P___", title: "Professional Elective VI", credits: 3, isElective: true },
        { code: "19____", title: "Open Elective II", credits: 3, isElective: true },
        { code: "19P820", title: "Project Work II", credits: 4 }
    ]
};

const GRADE_POINTS = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'U': 0
};
