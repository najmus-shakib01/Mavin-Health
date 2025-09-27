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

    const sourcesHeader = isArabic ? "📚 المراجع الطبية:" : "📚 Medical References:";
    const sourcesList = sources.map(source => {
        const [name, url] = source.split(' - ');
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">• ${name}</a>`;
    }).join('<br>');

    return `${cleanResponse}<br><br><strong>${sourcesHeader}</strong><br>${sourcesList}`;
};