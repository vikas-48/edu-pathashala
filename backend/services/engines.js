// Rule-based Guidance & Learning Plan Engine

/**
 * Generates mentor guidance based on a student's recent progress entry.
 * MVP: Simple rule-based suggestion engine.
 */
function generateMentorSuggestion(progress) {
  const suggestions = [];

  // Low score → suggest revising basics
  if (progress.quizScore !== undefined && progress.quizScore < 50) {
    suggestions.push({
      type: "Academic",
      message: "Student scored low on the recent quiz. We suggest revising the fundamental concepts before moving forward.",
      action: "Review Basics"
    });
  } else if (progress.quizScore >= 80) {
    suggestions.push({
      type: "Academic",
      message: "Strong performance! Consider challenging the student with advanced problems.",
      action: "Advanced Problems"
    });
  }

  // Low engagement → suggest interactive methods
  if (progress.engagement !== undefined && progress.engagement <= 2) {
    suggestions.push({
      type: "Behavioral",
      message: "Engagement is low. Try incorporating interactive activities, gamified quizzes, or group interactions.",
      action: "Interactive Methods"
    });
  }

  // Low confidence -> build confidence
  if (progress.confidence !== undefined && progress.confidence <= 2) {
    suggestions.push({
      type: "Behavioral",
      message: "Student's confidence is low. Ensure to provide positive reinforcement and celebrate small wins.",
      action: "Praise & Support"
    });
  }

  // At risk
  if (progress.quizScore !== undefined && progress.quizScore < 40 && progress.attended === false) {
    suggestions.push({
      type: "Alert",
      message: "WARNING: Student is at risk of falling behind due to low attendance and scores. Inform Admin.",
      action: "Admin Follow-up"
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: "General",
      message: "Student is progressing well. Continue current teaching methods.",
      action: "Continue"
    });
  }

  return suggestions;
}

function generateLearningPlan(topic, lastScore, classGrade = 5) {
  const needsRevision = lastScore !== null && lastScore < 60;
  const t = topic.topic || 'General Studies';
  const rev = (act) => needsRevision ? `Revision: ${act}` : act;

  // Granular Class-Wise Curriculum (Class 1 to 12)
  if (classGrade === 1) {
    return [
      { day: 1, activity: rev(`Picture Discovery: ${t}`) },
      { day: 2, activity: rev(`Interactive Story: ${t}`) },
      { day: 3, activity: rev(`Rhymes & Rhythm of ${t}`) }
    ];
  }
  if (classGrade === 2) {
    return [
      { day: 1, activity: rev(`Drawing ${t} Concepts`) },
      { day: 2, activity: rev(`Matching Game: ${t}`) },
      { day: 3, activity: rev(`Basic Identification: ${t}`) }
    ];
  }
  if (classGrade === 3) {
    return [
      { day: 1, activity: rev(`${t}: Foundation Concepts`) },
      { day: 2, activity: rev(`Tracing & Writing ${t}`) },
      { day: 3, activity: rev(`Short Paragraph Practice`) },
      { day: 4, activity: rev(`Class 3 Level Quiz`) }
    ];
  }
  if (classGrade === 4) {
    return [
      { day: 1, activity: rev(`${t}: Intermediate Introduction`) },
      { day: 2, activity: rev(`Practical Examples of ${t}`) },
      { day: 3, activity: rev(`Collaborative Activity`) },
      { day: 4, activity: rev(`Class 4 Standard Quiz`) }
    ];
  }
  if (classGrade === 5) {
    return [
      { day: 1, activity: rev(`Exploring ${t}: Core Logic`) },
      { day: 2, activity: rev(`Practice Worksheet A`) },
      { day: 3, activity: rev(`Scientific Methods: ${t}`) },
      { day: 4, activity: rev(`Weekly 5th Grade Test`) },
      { day: 5, activity: rev(`Reflection & Summary`) }
    ];
  }
  if (classGrade === 6) {
    return [
      { day: 1, activity: rev(`${t}: Global Context`) },
      { day: 2, activity: rev(`Formula Applications`) },
      { day: 3, activity: rev(`Mini Project on ${t}`) },
      { day: 4, activity: rev(`Analytical Assessment`) },
      { day: 5, activity: rev(`Doubt Resolution Session`) }
    ];
  }
  if (classGrade === 7) {
    return [
      { day: 1, activity: rev(`${t}: Advanced Foundations`) },
      { day: 2, activity: rev(`Comparative Studies`) },
      { day: 3, activity: rev(`Lab Simulation/Demonstration`) },
      { day: 4, activity: rev(`Intensive Problem Set`) },
      { day: 5, activity: rev(`Peer Assessment Cycle`) }
    ];
  }
  if (classGrade === 8) {
    return [
      { day: 1, activity: rev(`${t}: Conceptual Depth`) },
      { day: 2, activity: rev(`Case Study Analysis`) },
      { day: 3, activity: rev(`Practical Experiments`) },
      { day: 4, activity: rev(`Logical Reasoning Quiz`) },
      { day: 5, activity: rev(`Curated Research Task`) },
      { day: 6, activity: rev(`Weekly Mastery Review`) }
    ];
  }
  if (classGrade === 9) {
    return [
      { day: 1, activity: rev(`${t}: Theoretical Mastery`) },
      { day: 2, activity: rev(`Industrial Application`) },
      { day: 3, activity: rev(`Abstract Problem Solving`) },
      { day: 4, activity: rev(`Board Pattern Questions`) },
      { day: 5, activity: rev(`Comprehensive Exam Prep`) },
      { day: 6, activity: rev(`Critical Refinement`) }
    ];
  }
  if (classGrade === 10) {
    return [
      { day: 1, activity: rev(`${t}: Syllabus Deep Dive`) },
      { day: 2, activity: rev(`Speed Execution Drill`) },
      { day: 3, activity: rev(`Complex Theoretical Scenarios`) },
      { day: 4, activity: rev(`Previous Year Analysis`) },
      { day: 5, activity: rev(`Mock Board Assessment`) },
      { day: 6, activity: rev(`Error Correction Lab`) },
      { day: 7, activity: rev(`Final Syllabus Checklist`) }
    ];
  }
  if (classGrade === 11) {
    return [
      { day: 1, activity: rev(`${t}: Specialization Entry`) },
      { day: 2, activity: rev(`Advanced Derivations`) },
      { day: 3, activity: rev(`Competitive Level Logic`) },
      { day: 4, activity: rev(`Scientific Reasoning Quiz`) },
      { day: 5, activity: rev(`Self-Study & Documentation`) },
      { day: 6, activity: rev(`Advanced Mastery Workshop`) },
      { day: 7, activity: rev(`Personal Goal Review`) }
    ];
  }
  if (classGrade === 12) {
    return [
      { day: 1, activity: rev(`${t}: Expert Perspective`) },
      { day: 2, activity: rev(`Edge Cases & Anomalies`) },
      { day: 3, activity: rev(`University Entrance Prep`) },
      { day: 4, activity: rev(`High-Stakes Timed Quiz`) },
      { day: 5, activity: rev(`Collaborative Research`) },
      { day: 6, activity: rev(`Subject Mastery Defense`) },
      { day: 7, activity: rev(`Final Academic Roadmap`) }
    ];
  }

  // Fallback for any other value (5 Days)
  return [
    { day: 1, activity: rev(`Basic Introduction: ${t}`) },
    { day: 2, activity: rev(`Standard Practice`) },
    { day: 3, activity: rev(`Interactive Session`) },
    { day: 4, activity: rev(`Standard Quiz`) },
    { day: 5, activity: rev(`Topic Summary`) }
  ];
}

/**
 * Advanced Matching Engine based on the formula:
 * Score = (Subject * 25) + (Time * 15) + (Language * 15) + (Style * 15) + (Effectiveness * 15) + (ClassRange * 15)
 * Total max = 100
 */
function calculateCompatibilityScore(student, mentor) {
  let score = 0;
  const factors = [];

  // 1. Subject (25 points)
  if (mentor.subjects && mentor.subjects.includes(student.subject)) {
    score += 25;
    factors.push('Subject Expertise');
  }

  // 2. Time Slot (15 points)
  if (mentor.timeSlotMentor === student.timeSlot) {
    score += 15;
    factors.push('Schedule Alignment');
  }

  // 3. Language (15 points)
  if (mentor.languages && mentor.languages.includes(student.language)) {
    score += 15;
    factors.push('Language Compatibility');
  }

  // 4. Teaching Style (15 points)
  if (mentor.teachingStyle === student.preferredStyle) {
    score += 15;
    factors.push('Style Preference');
  }

  // 5. Effectiveness (15 points max)
  const eff = mentor.effectiveness || 0.7;
  score += (eff * 15);
  if (eff >= 0.8) factors.push('High Mentor Effectiveness');

  // 6. Class Range (15 points)
  const studentClass = student.classGrade || 1;
  const minClass = mentor.classRangeMin || 1;
  const maxClass = mentor.classRangeMax || 12;
  if (studentClass >= minClass && studentClass <= maxClass) {
    score += 15;
    factors.push('Grade Level Match');
  }

  return { score: Math.round(score), factors };
}

/**
 * Generates top match suggestions for a student from a list of mentors.
 */
function getTopMatchesForStudent(student, mentors) {
  return mentors
    .map(mentor => {
      const { score, factors } = calculateCompatibilityScore(student, mentor);
      return {
        mentorId: mentor._id,
        mentorName: mentor.name,
        score,
        factors
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

module.exports = {
  generateMentorSuggestion,
  generateLearningPlan,
  calculateCompatibilityScore,
  getTopMatchesForStudent
};
