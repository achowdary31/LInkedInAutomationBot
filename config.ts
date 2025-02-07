export default {
  // LOGIN DETAILS
  LINKEDIN_EMAIL: <emailId>,
  LINKEDIN_PASSWORD: <Password> ,

  // JOB SEARCH PARAMETERS
  KEYWORDS: "developer",
  LOCATION: "United States",
  WORKPLACE: {
    REMOTE: true,
    ON_SITE: true,
    HYBRID: true,
  },
  JOB_TITLE: "(?!.*w2)(?!.*\\.NET)(developer|engineer)?.*?(ui|java|angular|j2ee|react|javascript|nodejs|node|js|frontend|front[- ]?end|backend|back[- ]?end|full[- ]?stack).*?(developer|engineer)?",
  JOB_DESCRIPTION: "^((?!(primeit))(.|[\n\r]))*$",
  JOB_DESCRIPTION_LANGUAGES: ["english"], // replace value with ["any"] to accept all job description laguages

  // FORM DATA
  PHONE: <>,
  CV_PATH: "",
  COVER_LETTER_PATH: "",
  HOME_CITY: "",
  YEARS_OF_EXPERIENCE: {
    "angular": 6,
    "react.js": 6,
    ".net": 3,
    "php": 7,
    "spring": 8,
    "java": 9,
    "magento": 5,
    "node": 5,
    "javascript": 8,
    "mongodb": 5,
    "kubernetes": 6,
    "CI/CD": 6,
    "python": 5,
    "drupal": 5,
    "sass": 6,
    "html": 9,
    "google cloud": 5,
    "docker": 5,
    "terraform": 5,
    "css": 4,
    "typescript": 6,
    "webmethods": 5,
    "aws":6,
    "Microsoft Power BI" : 4,
    "analyst experience" : 8,
    "Mainframe" : 6,
    "COBOL" : 4,
    "kafka" : 6,
    "Hadoop" : 8,
    "DevOps" : 6,
    "OpenShift" : 5,
    "Amazon Web Services" : 6
  },
  LANGUAGE_PROFICIENCY: {
    "english": "professional",
  },
  REQUIRES_VISA_SPONSORSHIP: false,
  TEXT_FIELDS: {  "pay": "70" , "experience" : "5" },
  BOOLEANS: {
    "bachelor": true,
    "authorized": true,
  },

  // OTHER SETTINGS
  SINGLE_PAGE: false,
}
