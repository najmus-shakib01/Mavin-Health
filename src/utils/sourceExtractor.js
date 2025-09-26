export const extractSourcesFromResponse = (response) => {
    const sourceRegex = /\[Source: ([^\]]+)\]/g;
    const sources = [];
    let match;

    while ((match = sourceRegex.exec(response)) !== null) {
        sources.push(match[1]);
    }

    return sources;
};

export const formatResponseWithSources = (response, isArabic = false) => {
    const sources = extractSourcesFromResponse(response);

    const cleanResponse = response.replace(/\[Source: [^\]]+\]/g, '').trim();

    if (sources.length === 0) {
        return cleanResponse;
    }

    const sourcesHeader = isArabic ? "📚 المراجع الطبية:" : "📚 Medical References : \n \n";
    const sourcesList = sources.map(source => `• ${source}`).join('\n \n');

    return `${cleanResponse}\n\n${sourcesHeader}\n${sourcesList}`;
};