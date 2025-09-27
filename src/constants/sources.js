export const medicalSources = {
    "WHO - Diabetes": "https://www.who.int/health-topics/diabetes",
    "CDC - Diabetes": "https://www.cdc.gov/diabetes/basics/diabetes.html",
    "Mayo Clinic - Fever": "https://www.mayoclinic.org/diseases-conditions/fever/symptoms-causes/syc-20352759",
    "NIH - Common Cold": "https://www.niaid.nih.gov/diseases-conditions/common-cold",
    "PubMed - COVID-19": "https://pubmed.ncbi.nlm.nih.gov/?term=covid-19",
    "MedlinePlus - Fever": "https://medlineplus.gov/fever.html",
    "American Heart Association - Chest Pain": "https://www.heart.org/en/health-topics/heart-attack/angina-chest-pain",
    "Johns Hopkins - Headache": "https://www.hopkinsmedicine.org/health/conditions-and-diseases/headache",
    "Cleveland Clinic - Cough": "https://my.clevelandclinic.org/health/symptoms/17755-cough"
};

export const arabicMedicalSources = {
    "منظمة الصحة العالمية - السكري": "https://www.who.int/ar/health-topics/diabetes",
    "مايو كلينك - الحمى": "https://www.mayoclinic.org/ar/diseases-conditions/fever/symptoms-causes/syc-20352759",
    "المعاهد الوطنية للصحة - نزلات البرد": "https://www.niaid.nih.gov/ar/diseases-conditions/common-cold",
    "المكتبة الوطنية للطب - الحمى": "https://medlineplus.gov/languages/arabic/fever.html",
    "الجمعية الأمريكية للقلب - ألم الصدر": "https://www.heart.org/ar/health-topics/heart-attack/angina-chest-pain"
};

export const getRandomSources = (symptom = "", count = 3, isArabic = false) => {
    const sources = isArabic ? arabicMedicalSources : medicalSources;
    const sourceKeys = Object.keys(sources);

    const symptomKeywords = {
        'fever': ['fever', 'حمى', 'temperature'],
        'cough': ['cough', 'سعال', 'كحة'],
        'headache': ['headache', 'صداع'],
        'diabetes': ['diabetes', 'سكري'],
        'chest pain': ['chest pain', 'ألم الصدر']
    };

    let matchedSources = [];

    const lowerSymptom = symptom.toLowerCase();
    for (const [keywords] of Object.entries(symptomKeywords)) {
        if (keywords.some(kw => lowerSymptom.includes(kw))) {
            matchedSources = sourceKeys.filter(sourceKey =>
                keywords.some(kw => sourceKey.toLowerCase().includes(kw))
            );
            break;
        }
    }

    if (matchedSources.length === 0) {
        matchedSources = [...sourceKeys];
    }

    const selectedSources = [];
    const shuffled = [...matchedSources].sort(() => 0.5 - Math.random());

    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        if (!selectedSources.includes(shuffled[i])) {
            selectedSources.push(shuffled[i]);
        }
    }

    return selectedSources.map(key => `[Source: ${key} - ${sources[key]}]`);
};