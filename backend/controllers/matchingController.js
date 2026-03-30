const { db } = require("../config/firebase");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// GET /api/matching/students
const getStudentsForMatching = async (req, res) => {
  try {
    const studentsSnapshot = await db
      .collection("users")
      .where("role", "==", "student")
      .get();

    const students = [];
    for (const doc of studentsSnapshot.docs) {
      const student = doc.data();
      
      // Get student's progress data to identify weak areas
      const progressDoc = await db.collection("students").doc(doc.id).get();
      const progressData = progressDoc.data();
      
      // Get subjects needed (from preferences or progress)
      const subjectsNeeded = student.subjectsNeeded || ['Math', 'Science', 'English'];
      
      // Get weak areas from analysis
      const weakAreas = progressData?.lastAnalysis?.weakSubjects || [];
      
      // Determine learning level based on performance
      const overallAvg = progressData?.lastAnalysis?.overallAvg || 0;
      let learningLevel = 'Beginner';
      if (overallAvg >= 70) learningLevel = 'Advanced';
      else if (overallAvg >= 50) learningLevel = 'Intermediate';

      students.push({
        id: doc.id,
        name: student.name,
        email: student.email,
        class: student.class || 'Not specified',
        subjectsNeeded,
        weakAreas,
        learningLevel,
        currentMentor: student.assignedMentorId || null,
        riskLevel: progressData?.lastAnalysis?.riskLevel || 'low'
      });
    }

    res.json({ students, total: students.length });
  } catch (error) {
    console.error("Students matching error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/matching/mentors
const getMentorsForMatching = async (req, res) => {
  try {
    const mentorsSnapshot = await db
      .collection("users")
      .where("role", "==", "mentor")
      .get();

    const mentors = [];
    for (const doc of mentorsSnapshot.docs) {
      const mentor = doc.data();
      
      // Get assigned students count
      const assignedStudentsSnapshot = await db
        .collection("users")
        .where("assignedMentorId", "==", doc.id)
        .get();

      mentors.push({
        id: doc.id,
        name: mentor.name,
        email: mentor.email,
        expertiseSubjects: mentor.expertise || ['General'],
        experienceLevel: mentor.experienceLevel || 'Intermediate',
        availability: mentor.availability || {
          weekdays: ['Evening'],
          weekends: ['Morning', 'Afternoon']
        },
        maxStudents: mentor.maxStudents || 10,
        currentStudents: assignedStudentsSnapshot.size,
        specialization: mentor.specialization || 'General Education',
        rating: mentor.rating || 4.5
      });
    }

    res.json({ mentors, total: mentors.length });
  } catch (error) {
    console.error("Mentors matching error:", error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/matching/ai-match
const performAIMatching = async (req, res) => {
  try {
    const { students, mentors } = req.body;

    if (!students || !mentors) {
      return res.status(400).json({ error: "Students and mentors data required" });
    }

    // Prepare data for AI
    const studentsData = students.map(s => ({
      name: s.name,
      class: s.class,
      subjectsNeeded: s.subjectsNeeded.join(', '),
      weakAreas: s.weakAreas.join(', '),
      learningLevel: s.learningLevel,
      riskLevel: s.riskLevel
    }));

    const mentorsData = mentors.map(m => ({
      name: m.name,
      expertiseSubjects: m.expertiseSubjects.join(', '),
      experienceLevel: m.experienceLevel,
      availability: `${Object.entries(m.availability).map(([day, times]) => `${day}: ${times.join(', ')}`).join(' | ')}`,
      currentLoad: `${m.currentStudents}/${m.maxStudents}`,
      specialization: m.specialization,
      rating: m.rating
    }));

    const prompt = `You are an AI educational matching specialist. Your task is to match students with the most suitable mentors based on multiple factors.

STUDENTS DATA:
${studentsData.map((s, i) => `${i + 1}. ${s.name} (Class: ${s.class})
   Subjects needed: ${s.subjectsNeeded}
   Weak areas: ${s.weakAreas}
   Learning level: ${s.learningLevel}
   Risk level: ${s.riskLevel}`).join('\n\n')}

MENTORS DATA:
${mentorsData.map((m, i) => `${i + 1}. ${m.name}
   Expertise: ${m.expertiseSubjects}
   Experience: ${m.experienceLevel}
   Availability: ${m.availability}
   Current load: ${m.currentLoad}
   Specialization: ${m.specialization}
   Rating: ${m.rating}/5`).join('\n\n')}

MATCHING CRITERIA:
1. Subject expertise alignment (40% weight)
2. Student weak areas coverage (25% weight)
3. Learning level compatibility (15% weight)
4. Mentor availability (10% weight)
5. Current workload (10% weight)

For each student, provide the best mentor match with:
- Student name
- Matched mentor name
- Matching score (0-100)
- Detailed reason for match (2-3 sentences explaining why this mentor is suitable)

Format your response as a valid JSON array with this exact structure:
[
  {
    "studentName": "Student Name",
    "matchedMentor": "Mentor Name",
    "score": 85,
    "reason": "Expert in Math and Science, available evenings, experienced with intermediate students"
  }
]

Only return the JSON array, no additional text or explanations.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim();
    
    // Parse AI response
    let matches = [];
    try {
      matches = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("AI response parsing error:", parseError);
      console.error("Raw AI response:", aiResponse);
      
      // Fallback: create simple matches
      matches = students.map(student => {
        const bestMentor = mentors.find(m => 
          m.expertiseSubjects.some(subject => 
            student.subjectsNeeded.includes(subject)
          )
        ) || mentors[0];
        
        return {
          studentName: student.name,
          matchedMentor: bestMentor?.name || 'No suitable mentor',
          score: 75,
          reason: 'Basic subject expertise match'
        };
      });
    }

    // Enhance matches with IDs and additional data
    const enhancedMatches = matches.map(match => {
      const student = students.find(s => s.name === match.studentName);
      const mentor = mentors.find(m => m.name === match.matchedMentor);
      
      return {
        studentId: student?.id,
        studentName: match.studentName,
        mentorId: mentor?.id,
        matchedMentor: match.matchedMentor,
        score: match.score,
        reason: match.reason,
        studentClass: student?.class,
        studentSubjects: student?.subjectsNeeded,
        mentorExpertise: mentor?.expertiseSubjects,
        mentorAvailability: mentor?.availability,
        isHighRisk: student?.riskLevel === 'high',
        currentMentor: student?.currentMentor
      };
    });

    res.json({ matches: enhancedMatches, total: enhancedMatches.length });
  } catch (error) {
    console.error("AI matching error:", error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/matching/assign-mentor
const assignMentorToStudent = async (req, res) => {
  try {
    const { studentId, mentorId } = req.body;

    if (!studentId || !mentorId) {
      return res.status(400).json({ error: "Student ID and Mentor ID required" });
    }

    // Update student with assigned mentor
    await db.collection("users").doc(studentId).update({
      assignedMentorId: mentorId,
      mentorAssignedAt: new Date().toISOString()
    });

    // Get mentor details for response
    const mentorDoc = await db.collection("users").doc(mentorId).get();
    const mentor = mentorDoc.data();

    res.json({ 
      success: true, 
      message: "Mentor assigned successfully",
      mentor: {
        id: mentorId,
        name: mentor.name,
        email: mentor.email
      }
    });
  } catch (error) {
    console.error("Mentor assignment error:", error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/matching/bulk-assign
const bulkAssignMentors = async (req, res) => {
  try {
    const { matches } = req.body;

    if (!matches || !Array.isArray(matches)) {
      return res.status(400).json({ error: "Valid matches array required" });
    }

    const batch = db.batch();
    const results = [];

    for (const match of matches) {
      const { studentId, mentorId } = match;
      
      if (studentId && mentorId) {
        const studentRef = db.collection("users").doc(studentId);
        batch.update(studentRef, {
          assignedMentorId: mentorId,
          mentorAssignedAt: new Date().toISOString()
        });
        
        results.push({
          studentId,
          mentorId,
          status: "assigned"
        });
      }
    }

    await batch.commit();

    res.json({ 
      success: true, 
      message: "Bulk assignment completed",
      assigned: results.length,
      results
    });
  } catch (error) {
    console.error("Bulk assignment error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getStudentsForMatching,
  getMentorsForMatching,
  performAIMatching,
  assignMentorToStudent,
  bulkAssignMentors
};
