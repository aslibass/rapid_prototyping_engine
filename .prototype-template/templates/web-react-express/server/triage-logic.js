// Hematology Triage Logic
// Determines urgency level based on symptom combinations

export const calculateTriage = (symptoms) => {
  if (!symptoms || symptoms.length === 0) {
    return {
      level: "GREEN",
      color: "#10b981",
      urgency: "Routine Follow-up",
      recommendation: "Monitor symptoms and schedule regular check-up as planned.",
      icon: "✓"
    };
  }

  // Count symptoms
  const count = symptoms.length;
  const hasFebruaryWarning = symptoms.some(s =>
    ["fever", "high_fever"].includes(s.toLowerCase())
  );
  const hasBleeding = symptoms.some(s =>
    ["bleeding", "severe_bleeding", "epistaxis", "hemoptysis"].includes(s.toLowerCase())
  );
  const hasSOB = symptoms.some(s =>
    ["shortness_of_breath", "dyspnea", "severe_dyspnea"].includes(s.toLowerCase())
  );
  const hasSevere = symptoms.some(s =>
    s.toLowerCase().includes("severe")
  );

  // RED (Urgent - needs immediate attention)
  if (hasSevere || (hasBleeding && hasFebruaryWarning) || (hasBleeding && hasSOB)) {
    return {
      level: "RED",
      color: "#ef4444",
      urgency: "URGENT - Seek Immediate Care",
      recommendation: "Contact emergency department or call 911 immediately. Bring medical records if available.",
      icon: "🚨",
      reasoning: "Combination of symptoms indicates potential hematologic emergency"
    };
  }

  // RED (Single severe symptom)
  if (hasBleeding || hasSOB || hasSevere) {
    return {
      level: "RED",
      color: "#ef4444",
      urgency: "URGENT - Same Day Evaluation Needed",
      recommendation: "Contact your hematologist or go to urgent care today. Do not wait.",
      icon: "⚠️",
      reasoning: "Symptom requires urgent medical evaluation"
    };
  }

  // YELLOW (Caution - needs monitoring)
  if (hasFebruaryWarning || count >= 3) {
    return {
      level: "YELLOW",
      color: "#f59e0b",
      urgency: "Caution - Contact Provider Within 24 Hours",
      recommendation: "Contact your hematologist within 24 hours. In the meantime, stay hydrated and rest. Seek immediate care if symptoms worsen.",
      icon: "⚡",
      reasoning: `${count} symptoms present - requires professional assessment`
    };
  }

  // YELLOW (2 symptoms that warrant monitoring)
  if (count === 2) {
    return {
      level: "YELLOW",
      color: "#f59e0b",
      urgency: "Caution - Contact Provider Within 48 Hours",
      recommendation: "Schedule an appointment with your hematologist within 48 hours. Monitor symptoms closely.",
      icon: "⚡",
      reasoning: "Multiple symptoms require professional evaluation"
    };
  }

  // GREEN (Single minor symptom or routine)
  return {
    level: "GREEN",
    color: "#10b981",
    urgency: "Routine Monitoring",
    recommendation: "Monitor this symptom. Contact your provider if it persists beyond a few days or worsens.",
    icon: "✓",
    reasoning: "Single symptom - likely manageable with standard care"
  };
};

export const getSymptomDefinitions = () => {
  return {
    fever: "Temperature above 100.4°F (38°C)",
    high_fever: "Temperature above 103°F (39.4°C)",
    fatigue: "Unusual tiredness or weakness",
    bleeding: "Uncontrolled or persistent bleeding from minor injuries",
    severe_bleeding: "Significant or uncontrolled bleeding",
    epistaxis: "Nosebleeds",
    hemoptysis: "Coughing up blood",
    shortness_of_breath: "Difficulty breathing with normal activity",
    dyspnea: "Mild shortness of breath",
    severe_dyspnea: "Severe difficulty breathing at rest",
    bruising: "Unexplained or persistent bruising",
    petechiae: "Red/purple pinpoint spots on skin",
    jaundice: "Yellowing of skin or eyes",
    joint_pain: "Pain in joints, especially knees or ankles",
    severe_headache: "Persistent or severe headache",
    confusion: "Mental confusion or difficulty concentrating",
    pale_skin: "Pale complexion beyond normal",
    swollen_lymph: "Swollen lymph nodes (neck, armpits, groin)"
  };
};

export const getAllSymptoms = () => {
  return Object.keys(getSymptomDefinitions());
};
