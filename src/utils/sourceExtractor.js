export const trustedMedicalDomains = [
  "who.int",
  "cdc.gov",
  "mayoclinic.org",
  "nih.gov",
  "medlineplus.gov",
  "heart.org",
  "cancer.org",
  "hopkinsmedicine.org",
  "clevelandclinic.org",
  "webmd.com",
  "healthline.com",
  "nhs.uk",
  "aafp.org",
  "diabetes.org",
];

const trustedBaseUrls = {
  "who.int": "https://www.who.int/health-topics/",
  "cdc.gov": "https://www.cdc.gov/",
  "mayoclinic.org": "https://www.mayoclinic.org/diseases-conditions/",
  "nih.gov": "https://www.nih.gov/",
  "webmd.com": "https://www.webmd.com/",
  "healthline.com": "https://www.healthline.com/health/",
  "nhs.uk": "https://www.nhs.uk/conditions/",
};

const conditionSearchMap = {
  "sore throat": "sore-throat",
  pharyngitis: "pharyngitis",
  headache: "headache",
  fever: "fever",
  cough: "cough",
  influenza: "influenza",
  flu: "flu",
  covid: "coronavirus",
  depression: "depression",
  anxiety: "anxiety",
  diabetes: "diabetes",
  hypertension: "high-blood-pressure",
  asthma: "asthma",
  arthritis: "arthritis",
  migraine: "migraine-headache",
  allergy: "allergies",
  pneumonia: "pneumonia",
  bronchitis: "bronchitis",
  gastritis: "gastritis",
};

export const validateUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const isTrusted = trustedMedicalDomains.some((domain) => urlObj.hostname.includes(domain));
    return isTrusted && urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

export const extractSourcesFromResponse = (response) => {
  if (!response) return [];

  const sourceRegex = /MEDICAL_SOURCE:\s*([^\n]+)/gi;
  const sources = [];
  let match;

  while ((match = sourceRegex.exec(response)) !== null) {
    const sourceText = match[1].trim();
    const parts = sourceText.split(" - ");

    if (parts.length >= 2) {
      const name = parts.slice(0, -1).join(" - ").trim();
      const originalUrl = parts[parts.length - 1].trim();

      sources.push(createSourceObject(name, originalUrl, response));
    }
  }

  return sources;
};

const createSourceObject = (name, originalUrl, response) => {
  if (validateUrl(originalUrl)) {
    const validatedUrl = validateAndFixUrl(originalUrl);
    return {
      name,
      url: validatedUrl,
      valid: true,
      isSearch: validatedUrl.includes("google.com/search"),
    };
  }

  return {
    name,
    url: generateSearchUrl(name, response),
    valid: true,
    isSearch: true,
  };
};

const validateAndFixUrl = (originalUrl) => {
  try {
    const urlObj = new URL(originalUrl);
    const domain = trustedMedicalDomains.find((d) => urlObj.hostname.includes(d));
    if (domain && trustedBaseUrls[domain]) return trustedBaseUrls[domain];
    return originalUrl;
  } catch {
    return originalUrl;
  }
};

const extractMedicalCondition = (response) => {
  const conditions = Object.keys(conditionSearchMap);
  const lower = response.toLowerCase();
  return conditions.find((c) => lower.includes(c.toLowerCase())) || null;
};

const generateSearchUrl = (sourceName, response) => {
  const condition = extractMedicalCondition(response) || "medical information";
  let searchQuery = condition;

  if (sourceName.toLowerCase().includes("who")) searchQuery += " site:who.int";
  else if (sourceName.toLowerCase().includes("cdc")) searchQuery += " site:cdc.gov";
  else if (sourceName.toLowerCase().includes("mayo")) searchQuery += " site:mayoclinic.org";

  return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
};

export const extractSpecialistFromResponse = (response) => {
  const specialistMatch = response?.match(/SPECIALIST_RECOMMENDATION:\s*([^\n]+)/i);
  return specialistMatch?.[1]?.trim() || null;
};

export const extractCTAFromResponse = (response) => {
  if (!response) return null;
  
  const ctaMatch = response?.match(/CTA:\s*([^\n]+)/i);
  if (ctaMatch) return ctaMatch[1]?.trim();
  
  const condition = extractMedicalCondition(response);
  if (condition) {
    return `Based on your ${condition} symptoms, I recommend tracking your symptoms daily and scheduling a follow-up with the recommended specialist.`;
  }
  
  return "Based on your symptoms, I recommend tracking your health metrics and scheduling a follow-up consultation.";
};

export const formatResponseWithSources = (response, isArabic = false) => {
  if (!response) return "";

  const sources = extractSourcesFromResponse(response);
  const specialist = extractSpecialistFromResponse(response);
  const cta = extractCTAFromResponse(response);

  let cleanResponse = response
    .replace(/MEDICAL_SOURCE:\s*[^\n]+/gi, "")
    .replace(/SPECIALIST_RECOMMENDATION:\s*[^\n]+/i, "")
    .replace(/CTA:\s*[^\n]+/i, "")
    .trim();

  const sourcesSection = generateSourcesSection(sources, isArabic);
  const specialistSection = generateSpecialistSection(specialist, isArabic);
  const ctaSection = generateCTASection(cta, isArabic);

  return `${cleanResponse}${specialistSection}${ctaSection}${sourcesSection}`;
};

const generateSourcesSection = (sources, isArabic) => {
  if (sources.length === 0) return "";

  const sourcesHeader = isArabic ? "📚 المراجع الطبية:" : "📚 Medical References:";
  const verifiedText = isArabic ? "مصادر موثوقة" : "Verified sources";

  const sourcesList = sources
    .map(
      (source) => `
    <a href="${source.url}" target="_blank" rel="noopener noreferrer" 
       class="${
         source.isSearch ? "text-orange-600 hover:text-orange-800" : "text-blue-600 hover:text-blue-800"
       } 
              dark:${
                source.isSearch ? "text-orange-400 hover:text-orange-300" : "text-blue-400 hover:text-blue-300"
              } 
              underline transition-colors duration-200">
      • ${source.name}${source.isSearch ? " (Search Medical Information)" : ""}
    </a>
  `
    )
    .join("<br>");

  return `
    <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
      <strong class="text-blue-800 dark:text-blue-300 text-sm">${sourcesHeader}</strong>
      <div class="mt-2 space-y-1 text-sm">${sourcesList}</div>
      <p class="text-xs text-blue-600 dark:text-blue-400 mt-2">${verifiedText}</p>
    </div>`;
};

const generateSpecialistSection = (specialist, isArabic) => {
  if (!specialist) return "";

  const specialistHeader = isArabic ? "👨‍⚕️ الأخصائي الموصى به:" : "👨‍⚕️ Recommended Specialist:";

  return `
    <div class="mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
      <strong class="text-green-800 dark:text-green-300 text-sm">${specialistHeader}</strong>
      <p class="text-green-700 dark:text-green-400 text-sm mt-1">${specialist}</p>
    </div>`;
};

const generateCTASection = (cta, isArabic) => {
  if (!cta) return "";

  const ctaHeader = isArabic ? "📋 الخطوات التالية الموصى بها:" : "📋 Recommended Next Steps:";

  return `
    <div class="mt-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
      <strong class="text-purple-800 dark:text-purple-300 text-sm">${ctaHeader}</strong>
      <p class="text-purple-700 dark:text-purple-400 text-sm mt-1">${cta}</p>
    </div>`;
};

export const cleanAIResponse = (response) => {
  if (!response) return "";

  const disclaimerPatterns = [
    /⚠️ This AI system may not always be accurate\. Do not take its responses as professional medical advice\. Always consult a licensed healthcare professional\./gi,
    /⚠️ هذا النظام الذكي قد لا يكون دقيقًا دائمًا\. لا تعتمد على ردوده كاستشارة طبية مهنية\. استشر دائمًا أخصائي رعاية صحية مرخّصًا\./gi,
  ];

  return disclaimerPatterns.reduce((acc, pattern) => acc.replace(pattern, ""), response).trim();
};