export const medicalSources = {
    "WHO": "https://www.who.int/health-topics/",
    "CDC": "https://www.cdc.gov/diseasesconditions/",
    "Mayo Clinic": "https://www.mayoclinic.org/diseases-conditions/",
    "NIH": "https://www.nih.gov/health-information",
    "PubMed": "https://pubmed.ncbi.nlm.nih.gov/",
    "MedlinePlus": "https://medlineplus.gov/",
    "American Heart Association": "https://www.heart.org/en/health-topics",
    "American Cancer Society": "https://www.cancer.org/cancer/types.html",
    "Johns Hopkins Medicine": "https://www.hopkinsmedicine.org/health",
    "Cleveland Clinic": "https://my.clevelandclinic.org/health/diseases"
};

export const arabicMedicalSources = {
    "منظمة الصحة العالمية": "https://www.who.int/ar/health-topics/",
    "المركز الأمريكي لمكافحة الأمراض": "https://www.cdc.gov/arabic/index.html",
    "مايو كلينك": "https://www.mayoclinic.org/ar",
    "المعاهد الوطنية للصحة": "https://www.nih.gov/ar",
    "المكتبة الوطنية للطب": "https://medlineplus.gov/languages/arabic.html",
    "الجمعية الأمريكية للقلب": "https://www.heart.org/ar",
    "الجمعية الأمريكية للسرطان": "https://www.cancer.org/ar.html"
};

export const getRandomSources = (count = 3, isArabic = false) => {
    const sources = isArabic ? arabicMedicalSources : medicalSources;
    const sourceKeys = Object.keys(sources);
    const selectedSources = [];
    
    for (let i = 0; i < count && i < sourceKeys.length; i++) {
        const randomKey = sourceKeys[Math.floor(Math.random() * sourceKeys.length)];
        if (!selectedSources.includes(randomKey)) {
            selectedSources.push(randomKey);
        }
    }
    
    return selectedSources.map(key => `[Source: ${key} - ${sources[key]}]`);
};