const classGroup = (cls) => {
  const n = parseInt(cls);
  if (n <= 5)  return "primary";
  if (n <= 8)  return "middle";
  if (n <= 10) return "secondary";
  return "higher";
};

const courseData = {
  Math: {
    primary: {
      Beginner:     { title: "Basic Math for Kids",              thumb: "https://img.youtube.com/vi/WYzSg35XF6k/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PL4a6CLkPu58YGDpAe6MoMFGBFilo3IQHB" },
      Intermediate: { title: "Fractions & Decimals — Grade 4-5", thumb: "https://img.youtube.com/vi/AS48OJ_iIA4/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" },
      Advanced:     { title: "Primary Math — Word Problems",     thumb: "https://img.youtube.com/vi/ySws8A85pG0/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" },
    },
    middle: {
      Beginner:     { title: "Class 6 Math — Full Course",       thumb: "https://img.youtube.com/vi/NybHckSEQBI/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLpQh6nHzTvFBMFJBBkFBMFJBBkFBMFJBBk" },
      Intermediate: { title: "Algebra for Beginners",            thumb: "https://img.youtube.com/vi/NybHckSEQBI/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLpQh6nHzTvFBMFJBBkFBMFJBBkFBMFJBBk" },
      Advanced:     { title: "Algebra & Geometry — Class 8",     thumb: "https://img.youtube.com/vi/MqCPSoJ_DgI/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
    },
    secondary: {
      Beginner:     { title: "Class 9 Math — Full Course",       thumb: "https://img.youtube.com/vi/LwCRRUa8yTU/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Intermediate: { title: "Class 10 Math — CBSE",             thumb: "https://img.youtube.com/vi/LwCRRUa8yTU/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Advanced:     { title: "Class 10 Math — Advanced Problems", thumb: "https://img.youtube.com/vi/OmJ-4B-mS-Y/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
    },
    higher: {
      Beginner:     { title: "Class 11 Math — Basics",           thumb: "https://img.youtube.com/vi/OmJ-4B-mS-Y/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Intermediate: { title: "Calculus — Class 11-12",           thumb: "https://img.youtube.com/vi/WUvTyaaNkzM/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr" },
      Advanced:     { title: "Class 12 Math — Full Prep",        thumb: "https://img.youtube.com/vi/WUvTyaaNkzM/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr" },
    },
  },
  Science: {
    primary: {
      Beginner:     { title: "Science for Kids — Grade 1-3",     thumb: "https://img.youtube.com/vi/Qs8SuQoOB2s/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" },
      Intermediate: { title: "Basic Science — Grade 4-5",        thumb: "https://img.youtube.com/vi/Qs8SuQoOB2s/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" },
      Advanced:     { title: "Primary Science Experiments",      thumb: "https://img.youtube.com/vi/9D05ej8u-gU/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" },
    },
    middle: {
      Beginner:     { title: "Class 6 Science — Full Course",    thumb: "https://img.youtube.com/vi/9D05ej8u-gU/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Intermediate: { title: "Class 7-8 Science",                thumb: "https://img.youtube.com/vi/eVtCO84MDj8/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Advanced:     { title: "Physics, Chemistry & Bio — Class 8", thumb: "https://img.youtube.com/vi/eVtCO84MDj8/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
    },
    secondary: {
      Beginner:     { title: "Class 9 Science — CBSE",           thumb: "https://img.youtube.com/vi/0lkgrNuaFBU/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Intermediate: { title: "Class 10 Science — Full Course",   thumb: "https://img.youtube.com/vi/0lkgrNuaFBU/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Advanced:     { title: "Class 10 Science — Advanced",      thumb: "https://img.youtube.com/vi/0lkgrNuaFBU/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
    },
    higher: {
      Beginner:     { title: "Class 11 Physics Basics",          thumb: "https://img.youtube.com/vi/ZM8ECpBuQYE/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Intermediate: { title: "Class 11-12 Chemistry",            thumb: "https://img.youtube.com/vi/ZM8ECpBuQYE/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Advanced:     { title: "Class 12 Biology — Full Prep",     thumb: "https://img.youtube.com/vi/ZM8ECpBuQYE/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
    },
  },
  English: {
    primary: {
      Beginner:     { title: "English Phonics for Kids",         thumb: "https://img.youtube.com/vi/hq3yfQnllfQ/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" },
      Intermediate: { title: "Primary English Grammar",         thumb: "https://img.youtube.com/vi/hq3yfQnllfQ/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" },
      Advanced:     { title: "English Reading & Writing",       thumb: "https://img.youtube.com/vi/hq3yfQnllfQ/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" },
    },
    middle: {
      Beginner:     { title: "Class 6-8 English Grammar",       thumb: "https://img.youtube.com/vi/Mwt4TaNHhAA/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Intermediate: { title: "English Comprehension — Class 7", thumb: "https://img.youtube.com/vi/Mwt4TaNHhAA/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Advanced:     { title: "Essay Writing & Literature",      thumb: "https://img.youtube.com/vi/Mwt4TaNHhAA/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
    },
    secondary: {
      Beginner:     { title: "Class 9 English — CBSE",          thumb: "https://img.youtube.com/vi/Mwt4TaNHhAA/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Intermediate: { title: "Class 10 English — Full Course",  thumb: "https://img.youtube.com/vi/Mwt4TaNHhAA/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Advanced:     { title: "Class 10 English — Literature",   thumb: "https://img.youtube.com/vi/Mwt4TaNHhAA/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
    },
    higher: {
      Beginner:     { title: "Class 11 English Basics",         thumb: "https://img.youtube.com/vi/Mwt4TaNHhAA/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Intermediate: { title: "Class 11-12 English Literature",  thumb: "https://img.youtube.com/vi/Mwt4TaNHhAA/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
      Advanced:     { title: "Advanced English Writing Skills", thumb: "https://img.youtube.com/vi/Mwt4TaNHhAA/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HCLqA-rhMi_Z_WnBkD3wUka" },
    },
  },
  History: {
    primary:   { Beginner: { title: "World History for Kids",        thumb: "https://img.youtube.com/vi/Yocja_N5s1I/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9E9BcCODbTNw2xU4b2GMZKG" }, Intermediate: { title: "Ancient Civilizations",          thumb: "https://img.youtube.com/vi/Yocja_N5s1I/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9E9BcCODbTNw2xU4b2GMZKG" }, Advanced: { title: "History — Primary Level",           thumb: "https://img.youtube.com/vi/Yocja_N5s1I/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9E9BcCODbTNw2xU4b2GMZKG" } },
    middle:    { Beginner: { title: "Class 6-8 History — NCERT",     thumb: "https://img.youtube.com/vi/Yocja_N5s1I/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9E9BcCODbTNw2xU4b2GMZKG" }, Intermediate: { title: "Medieval History",                thumb: "https://img.youtube.com/vi/Yocja_N5s1I/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9E9BcCODbTNw2xU4b2GMZKG" }, Advanced: { title: "Modern Indian History",             thumb: "https://img.youtube.com/vi/Yocja_N5s1I/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9E9BcCODbTNw2xU4b2GMZKG" } },
    secondary: { Beginner: { title: "Class 9-10 History — CBSE",     thumb: "https://img.youtube.com/vi/Yocja_N5s1I/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9E9BcCODbTNw2xU4b2GMZKG" }, Intermediate: { title: "Class 10 History Full Course",    thumb: "https://img.youtube.com/vi/Yocja_N5s1I/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9E9BcCODbTNw2xU4b2GMZKG" }, Advanced: { title: "History — Advanced Revision",       thumb: "https://img.youtube.com/vi/Yocja_N5s1I/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9E9BcCODbTNw2xU4b2GMZKG" } },
    higher:    { Beginner: { title: "Class 11 History Basics",        thumb: "https://img.youtube.com/vi/Yocja_N5s1I/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9E9BcCODbTNw2xU4b2GMZKG" }, Intermediate: { title: "Class 12 History — Full Course",  thumb: "https://img.youtube.com/vi/Yocja_N5s1I/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9E9BcCODbTNw2xU4b2GMZKG" }, Advanced: { title: "History — Board Exam Prep",         thumb: "https://img.youtube.com/vi/Yocja_N5s1I/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLybg94GvOJ9E9BcCODbTNw2xU4b2GMZKG" } },
  },
  Geography: {
    primary:   { Beginner: { title: "Geography for Kids",             thumb: "https://img.youtube.com/vi/AS48OJ_iIA4/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" }, Intermediate: { title: "Maps & Continents",               thumb: "https://img.youtube.com/vi/AS48OJ_iIA4/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" }, Advanced: { title: "Physical Geography Basics",         thumb: "https://img.youtube.com/vi/AS48OJ_iIA4/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" } },
    middle:    { Beginner: { title: "Class 6-8 Geography — NCERT",    thumb: "https://img.youtube.com/vi/AS48OJ_iIA4/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" }, Intermediate: { title: "Climate & Natural Resources",    thumb: "https://img.youtube.com/vi/AS48OJ_iIA4/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" }, Advanced: { title: "Human Geography — Class 8",         thumb: "https://img.youtube.com/vi/AS48OJ_iIA4/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" } },
    secondary: { Beginner: { title: "Class 9-10 Geography — CBSE",    thumb: "https://img.youtube.com/vi/AS48OJ_iIA4/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" }, Intermediate: { title: "Class 10 Geography Full Course",  thumb: "https://img.youtube.com/vi/AS48OJ_iIA4/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" }, Advanced: { title: "Geography — Advanced Revision",     thumb: "https://img.youtube.com/vi/AS48OJ_iIA4/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" } },
    higher:    { Beginner: { title: "Class 11 Geography Basics",       thumb: "https://img.youtube.com/vi/AS48OJ_iIA4/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" }, Intermediate: { title: "Class 12 Geography Full Course",  thumb: "https://img.youtube.com/vi/AS48OJ_iIA4/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" }, Advanced: { title: "Geography — Board Exam Prep",       thumb: "https://img.youtube.com/vi/AS48OJ_iIA4/hqdefault.jpg", url: "https://www.youtube.com/playlist?list=PLDesMAoTplxzqJPMCGoXFRMEMiMcXlBKs" } },
  },
};

const getCourses = (subjects, cls, level) => {
  const group = classGroup(cls);
  const results = [];
  subjects.forEach((subject) => {
    const subjectData = courseData[subject];
    if (!subjectData) return;
    const groupData = subjectData[group];
    if (!groupData) return;
    const course = groupData[level] || groupData["Beginner"];
    if (course) results.push({ subject, level, class: cls, ...course });
  });
  return results;
};

module.exports = { getCourses };
