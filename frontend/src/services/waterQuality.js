// src/services/waterQuality.js

export const fetchWaterQuality = async () => {
  await new Promise((r) => setTimeout(r, 500)); // fake delay

  return {
    ph: 7.1,
    tds: 320,
    turbidity: 1.8,
    temperature: 27.4,

    status: "SAFE",
    aiOpinion:
      "Water quality is within acceptable limits. Safe for domestic use.",
    
    lastEvaluatedAt: new Date().toISOString(),
  };
};
