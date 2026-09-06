# NEET PG 2025 Cutoffs Dashboard & Explorer

A static React web application for analyzing, filtering, and visualizing over 60,000+ NEET PG and DNB admission records. Built to help medical candidates make informed decisions about their counseling choices.

## Features
* Lightning Fast Search: Filter tens of thousands of records entirely on the client side.
* Deep Filtering: Filter by All India Rank (AIR), Domicile State, Degree Type, Round, College, and Specialty.
* Safe Zone Scatter Plot: A dynamic, percentile-scaled visualization plotting available seats against average closing ranks to spot hidden opportunities.
* Grouped vs Individual Views: See row-by-row candidate admissions or aggregate them to find the true "Closing Rank" for any course.
* CSV Export: Download your filtered datasets instantly.

## Data Sources
All data in this repository is sourced from public domains:
* **NMC (National Medical Commission)**: [Details of students admitted to PGMEB (MD/MS/Diploma - Broad Specialities) for the Academic Year 2025_26](https://nmc.org.in/wp-content/themes/twentyfourteen/pdf/PG_one_page_2025-26_compressed.pdf) | [List of College Teaching PG Courses](https://www.nmc.org.in/information-desk/list-of-college-teaching-pg-courses/)
* **MCC (Medical Counselling Committee)**: [Admitted/Joined Candidates List upto Round 3 of PG Counselling 2025](https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2026/02/20260216441858119.pdf)
* **NBEMS (National Board of Examinations in Medical Sciences)**: [Result of NEET-PG 2025 for All India 50% Quota Seats Counseling](https://natboard.edu.in/viewNotice.php?NBE=cVI4V2hHQWt3UWkxaGlpcW5jcTdTQT09)

## Project Structure
This project is built using React and Vite.

```txt
├── public/                         # Static assets & Data (Not processed by Vite)
│   ├── admissions_2025_26.json     # Main NMC seat allocation dataset
│   ├── admissions_dnb_2025_26.json # DNB seat allocation dataset
│   ├── candidates_2025_26.json     # Unfiltered candidate list
│   └── colleges.json               # Master list mapping college codes to states/management
├── src/                            # React Source Code
│   ├── App.jsx                     # Main application logic, state management, and table views
│   ├── Dashboard.jsx               # Visual analytics, charts, and scatter plots
│   └── main.jsx                    # React mounting entry point
└── package.json                    # Project dependencies and run scripts
```

## How to Run Locally

1. Install Dependencies
```bash
npm install
```

2. Start Development Server
```bash
npm run dev
```

3. Build for Production
```bash
npm run build
```
*(This generates a highly optimized `dist/` folder ready for deployment to platforms like Vercel or Netlify)*

## Privacy & Data Notice
All datasets provided in the `public/` directory have been strictly vetted and processed to remove any Personally Identifiable Information (PII), such as candidate names and application IDs, to protect candidate privacy.

## Legal & Copyright Disclaimer
This project is an independent tool created for educational and informational purposes only. It is not affiliated with, endorsed by, or sponsored by the National Medical Commission (NMC), the Medical Counselling Committee (MCC), the National Board of Examinations in Medical Sciences (NBEMS), or any government entity. All datasets utilized in this application are derived from publicly available documents provided by the respective organizations. The creators of this application make no guarantees regarding the absolute accuracy, completeness, or timeliness of the data presented. Users are strongly advised to cross-reference all information with official notices and counseling guidelines before making any decisions.
