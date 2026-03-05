export interface DiseaseDetail {
  name: string;
  symptoms: string[];
  treatment: string;
  prevention: string;
}

export const diseaseDatabase: Record<string, DiseaseDetail> = {
  "Apple Scab": {
    name: "Apple Scab",
    symptoms: ["Olive-green to brown spots on leaves", "Velvety appearance", "Distorted leaf shape"],
    treatment: "Apply fungicides such as captan or myclobutanil.",
    prevention: "Rake and destroy fallen leaves in autumn; choose resistant varieties."
  },
  "Apple Black Rot": {
    name: "Apple Black Rot",
    symptoms: ["Small purple spots on leaves", "Frog-eye leaf spot", "Sunken cankers on branches"],
    treatment: "Prune out infected branches; apply fungicides like mancozeb.",
    prevention: "Remove mummified fruit and dead wood; maintain tree health."
  },
  "Cedar Apple Rust": {
    name: "Cedar Apple Rust",
    symptoms: ["Bright orange-yellow spots on upper leaf surface", "Tiny black fruiting bodies", "Hair-like projections on lower surface"],
    treatment: "Apply protective fungicides in early spring.",
    prevention: "Remove nearby cedar/juniper trees; plant resistant cultivars."
  },
  "Corn Common Rust": {
    name: "Corn Common Rust",
    symptoms: ["Small, cinnamon-brown pustules on both leaf surfaces", "Pustules may turn black as the plant matures"],
    treatment: "Fungicides are rarely economical but can be used in severe cases.",
    prevention: "Plant resistant hybrids; rotate crops."
  },
  "Tomato Early Blight": {
    name: "Tomato Early Blight",
    symptoms: ["Dark spots with concentric rings (target-like)", "Yellowing around spots", "Lower leaves affected first"],
    treatment: "Apply copper-based fungicides or chlorothalonil.",
    prevention: "Rotate crops; avoid overhead watering; space plants for airflow."
  },
  "Tomato Late Blight": {
    name: "Tomato Late Blight",
    symptoms: ["Large, irregular water-soaked patches", "White fuzzy growth on underside in humid conditions", "Rapid leaf death"],
    treatment: "Destroy infected plants immediately; apply preventative fungicides.",
    prevention: "Avoid planting near potatoes; use resistant varieties."
  },
  "Powdery Mildew": {
    name: "Powdery Mildew",
    symptoms: ["White, powdery spots on leaves and stems", "Leaves may curl or turn yellow", "Stunted growth"],
    treatment: "Apply sulfur-based fungicides or neem oil.",
    prevention: "Increase air circulation; reduce humidity; avoid overhead watering."
  },
  "Healthy": {
    name: "Healthy Leaf",
    symptoms: ["Vibrant green color", "No visible spots or lesions", "Normal growth pattern"],
    treatment: "No treatment needed. Continue regular maintenance.",
    prevention: "Maintain consistent watering and fertilization."
  }
};
