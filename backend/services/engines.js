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

/**
 * Generates a 5-day learning plan based on previous performance.
 */
function generateLearningPlan(topic, lastScore) {
  // If the last score was low, the plan should include revision.
  const needsRevision = lastScore !== null && lastScore < 60;

  if (needsRevision) {
    return [
      { day: 1, activity: 'Concept Revision (Simplified)' },
      { day: 2, activity: `Practice Basics of ${topic.topic}` },
      { day: 3, activity: 'Interactive Activity / Game' },
      { day: 4, activity: 'Follow-up Quiz' },
      { day: 5, activity: 'Doubt Clearing Session' }
    ];
  } else {
    // Normal / Good performance plan
    return [
      { day: 1, activity: `New Concept: ${topic.topic}` },
      { day: 2, activity: 'Standard Practice Worksheet' },
      { day: 3, activity: 'Group Activity' },
      { day: 4, activity: 'Weekly Quiz' },
      { day: 5, activity: 'Revision & Peer Discussion' }
    ];
  }
}

/**
 * Advanced Matching Engine based on the formula:
 * Score = (Subject * 30) + (Time * 20) + (Language * 15) + (Style * 15) + (Effectiveness * 20)
 */
function calculateCompatibilityScore(student, mentor) {
  let score = 0;

  // 1. Subject (30 points) - Mentor should have student's subject in their list
  if (mentor.subjects && mentor.subjects.includes(student.subject)) {
    score += 30;
  }

  // 2. Time Slot (20 points) - Direct match
  if (mentor.timeSlotMentor === student.timeSlot) {
    score += 20;
  }

  // 3. Language (15 points) - Mentor should speak student's primary language
  if (mentor.languages && mentor.languages.includes(student.language)) {
    score += 15;
  }

  // 4. Teaching Style (15 points) - Student's preferred style vs Mentor's style
  if (mentor.teachingStyle === student.preferredStyle) {
    score += 15;
  }

  // 5. Effectiveness (20 points max) - Based on mentor.effectiveness (0.0 to 1.0)
  const eff = mentor.effectiveness || 0.7; // Default if not set
  score += (eff * 20);

  return Math.round(score);
}

/**
 * Generates top match suggestions for a student from a list of mentors.
 */
function getTopMatchesForStudent(student, mentors) {
  return mentors
    .map(mentor => ({
      mentorId: mentor._id,
      mentorName: mentor.name,
      score: calculateCompatibilityScore(student, mentor)
    }))
    .sort((a, b) => b.score - a.score) // Highest score first
    .slice(0, 3); // Get top 3
}

module.exports = {
  generateMentorSuggestion,
  generateLearningPlan,
  calculateCompatibilityScore,
  getTopMatchesForStudent
};
