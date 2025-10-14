export const trustedMedicalDomains = ['who.int', 'cdc.gov', 'mayoclinic.org', 'nih.gov', 'nhlbi.nih.gov', 'niams.nih.gov', 'nimh.nih.gov', 'medlineplus.gov', 'heart.org', 'cancer.org', 'hopkinsmedicine.org', 'clevelandclinic.org', 'webmd.com', 'healthline.com', 'medicalnewstoday.com', 'nhs.uk', 'aafp.org', 'acog.org', 'apa.org', 'diabetes.org'
];

export const trustedArabicDomains = ['who.int/ar', 'mayoclinic.org/ar', 'webteb.com', 'altibbi.com', 'magltk.com', 'dailymedicalinfo.com'];

export const validateUrl = (url) => {
    try {
        const urlObj = new URL(url);

        const isTrustedDomain = trustedMedicalDomains.some(domain =>
            urlObj.hostname.includes(domain)
        ) || trustedArabicDomains.some(domain =>
            url.includes(domain)
        );

        if (!isTrustedDomain) {
            console.warn('URL from untrusted domain:', url);
            return false;
        }

        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (error) {
        console.warn('Invalid URL format:', url);
        console.error('error:', error);
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
        const parts = sourceText.split(' - ');

        if (parts.length >= 2) {
            const name = parts.slice(0, -1).join(' - ').trim();
            const url = parts[parts.length - 1].trim();

            if (validateUrl(url)) {
                sources.push({
                    name: name,
                    url: url,
                    valid: true
                });
            } else {
                console.warn('Invalid or untrusted URL:', url);
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(name + ' medical information')}`;
                sources.push({
                    name: name,
                    url: searchUrl,
                    valid: true,
                    isSearch: true
                });
            }
        }
    }

    return sources;
};

export const extractSpecialistFromResponse = (response) => {
    if (!response) return null;

    const specialistMatch = response.match(/SPECIALIST_RECOMMENDATION:\s*([^\n]+)/i);
    if (specialistMatch && specialistMatch[1]) {
        return specialistMatch[1].trim();
    }
    return null;
};

export const formatResponseWithSources = (response, isArabic = false) => {
    if (!response) return '';

    const sources = extractSourcesFromResponse(response);
    const specialist = extractSpecialistFromResponse(response);

    let cleanResponse = response
        .replace(/MEDICAL_SOURCE:\s*[^\n]+/gi, '')
        .replace(/SPECIALIST_RECOMMENDATION:\s*[^\n]+/i, '')
        .trim();

    let sourcesSection = '';
    if (sources.length > 0) {
        const sourcesHeader = isArabic ? "📚 المراجع الطبية:" : "📚 Medical References:";
        const verifiedText = isArabic ? "مصادر موثوقة" : "Verified sources";

        const sourcesList = sources.map(source => {
            if (source.isSearch) {
                return `<a href="${source.url}" target="_blank" rel="noopener noreferrer" 
                        class="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 underline transition-colors duration-200">
                    • ${source.name} (Search)
                </a>`;
            }
            return `<a href="${source.url}" target="_blank" rel="noopener noreferrer" 
                    class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors duration-200">
                • ${source.name}
            </a>`;
        }).join('<br>');

        sourcesSection = `
        <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <strong class="text-blue-800 dark:text-blue-300 text-sm">${sourcesHeader}</strong>
            <div class="mt-2 space-y-1 text-sm">${sourcesList}</div>
            <p class="text-xs text-blue-600 dark:text-blue-400 mt-2">${verifiedText}</p>
        </div>`;
    }

    let specialistSection = '';
    if (specialist) {
        const specialistHeader = isArabic ? "👨‍⚕️ الأخصائي الموصى به:" : "👨‍⚕️ Recommended Specialist:";
        specialistSection = `
        <div class="mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <strong class="text-green-800 dark:text-green-300 text-sm">${specialistHeader}</strong>
            <p class="text-green-700 dark:text-green-400 text-sm mt-1">${specialist}</p>
        </div>`;
    }

    return `${cleanResponse}${specialistSection}${sourcesSection}`;
};

export const cleanAIResponse = (response) => {
    if (!response) return '';

    const disclaimerPatterns = [
        /⚠️ This AI system may not always be accurate\. Do not take its responses as professional medical advice\./gi,
        /⚠️ هذا النظام الذكي قد لا يكون دقيقًا دائمًا\. لا تعتمد على ردوده كاستشارة طبية مهنية\./gi
    ];

    let cleanedResponse = response;
    disclaimerPatterns.forEach(pattern => {
        cleanedResponse = cleanedResponse.replace(pattern, '');
    });

    return cleanedResponse.trim();
};