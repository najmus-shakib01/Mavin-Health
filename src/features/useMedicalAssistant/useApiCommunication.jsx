import { useMutation } from "@tanstack/react-query";
import { marked } from "marked";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { cornerCases } from "../../constants/env.cornercase";

const specialtyTranslations = {
    "Cardiology": "أمراض القلب",
    "Gastrology": "أمراض الجهاز الهضمي",
    "Dermatology": "الأمراض الجلدية",
    "Dentistry": "طب الأسنان",
    "Gynecology": "طب النساء والتوليد",
    "Nephrology": "أمراض الكلى",
    "Neurology": "الأمراض العصبية",
    "Endocrinology": "الغدد الصماء",
    "Urology": "مسالك بولية",
    "Orthopedics": "العظام",
    "Pediatrics": "طب الأطفال",
    "Psychiatry": "الطب النفسي",
    "Ophthalmology": "طب العيون",
    "ENT": "أنف وأذن وحنجرة",
    "Pulmonology": "أمراض الرئة"
};

const useApiCommunication = (setResponse, setMedicalHistory, saveHistoryToStorage, responseDivRef, selectedLanguage) => {
    const sendMessageMutation = useMutation({
        mutationFn: async (inputText) => {
            setResponse(selectedLanguage === 'english'
                ? "🔄 Analyzing Symptoms With Medical Database..."
                : "🔄 جاري تحليل الأعراض مع قاعدة البيانات الطبية...");

            const languageSpecificPrompt = selectedLanguage === 'english'
                ? `${cornerCases}\n\nPlease respond in English only and include SPECIALTY_RECOMMENDATION : [specialty name] in your response.`
                : `${cornerCases}\n\nيرجى الرد باللغة العربية فقط وتضمين SPECIALTY_RECOMMENDATION : [specialty name] في ردك.`;

            const response = await fetch(`${baseUrl}/completions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1:free",
                    messages: [
                        { role: "system", content: languageSpecificPrompt },
                        { role: "user", content: inputText },
                    ],
                    temperature: 0,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return {
                stream: response.body,
                language: selectedLanguage,
                query: inputText
            };
        },
        onSuccess: (data) => {
            const { stream, language, query } = data;
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";
            let buffer = "";
            const isArabic = language === 'arabic';

            const processStream = async () => {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        buffer += chunk;

                        const lines = buffer.split("\n");
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            if (line.startsWith("data:") && line !== "data: [DONE]") {
                                try {
                                    const data = JSON.parse(line.substring(5));
                                    const token = data.choices?.[0]?.delta?.content;

                                    if (token) {
                                        fullResponse += token;
                                        if (
                                            fullResponse.length % 10 === 0 ||
                                            token.includes("\n")
                                        ) {
                                            setResponse(marked.parse(fullResponse));
                                        }
                                    }
                                } catch (e) {
                                    console.error("Error parsing JSON:", e, "Line:", line);
                                }
                            }
                        }

                        if (responseDivRef.current) {
                            responseDivRef.current.scrollTop = responseDivRef.current.scrollHeight;
                        }
                    }

                    let detectedSpecialty = null;
                    const specialtyMatch = fullResponse.match(/SPECIALTY_RECOMMENDATION : \[(.*?)\]/);

                    if (specialtyMatch && specialtyMatch[1]) {
                        detectedSpecialty = specialtyMatch[1].trim();

                        if (isArabic && specialtyTranslations[detectedSpecialty]) {
                            detectedSpecialty = specialtyTranslations[detectedSpecialty];
                        }
                    }

                    let finalResponse = marked.parse(fullResponse);

                    finalResponse = finalResponse.replace(/SPECIALTY_RECOMMENDATION : \[.*?\]/, "");

                    if (detectedSpecialty) {
                        const recommendationSection = isArabic ? `
                            <div class="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm dark:bg-gradient-to-r dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700" style="direction: rtl;">
                                <div class="flex items-center gap-2 mb-4">
                                    <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h3 class="font-semibold text-blue-800 dark:text-blue-300">توصية أخصائي</h3>
                                </div>
                                
                                <div class="mb-4 p-3 bg-white rounded-lg border border-blue-100 shadow-sm dark:bg-gray-800 dark:border-blue-800" style="text-align: right;">
                                    <p class="text-sm text-gray-700 mb-2 dark:text-gray-300">بناءً على الأعراض الخاصة بك، نوصي باستشارة:</p>
                                    <div class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
                                        <span class="h-2 w-2 rounded-full bg-blue-500 ml-2"></span>
                                        <span class="text-sm font-medium text-blue-700 dark:text-blue-300">${detectedSpecialty}</span>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-2 dark:text-gray-400">أخصائي للتشخيص والعلاج المناسبين.</p>
                                </div>
                                
                                <p class="text-sm text-gray-600 mb-4 dark:text-gray-300" style="text-align: right;">
                                    كمساعد ذكي، لا يمكنني وصف الأدوية، لكن يمكنني توجيهك إلى الأخصائي المناسب.
                                </p>
                                
                                <div class="bg-white p-4 rounded-lg border border-blue-100 mb-4 dark:bg-gray-800 dark:border-blue-800" style="text-align: right;">
                                    <h4 class="font-medium text-blue-800 mb-2 flex items-center justify-end dark:text-blue-300">
                                        الخطوات التالية :
                                        <svg class="h-4 w-4 ml-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </h4>
                                    <ul class="text-sm text-gray-700 list-disc list-inside space-y-1 dark:text-gray-300" style="text-align: right; direction: rtl;">
                                        <li>ابحث عن <span class="font-medium text-blue-600 dark:text-blue-400">"أخصائي ${detectedSpecialty} قريب مني"</span> على Google</li>
                                        <li>اتصل بالمستشفى أو العيادة المحلية للحصول على الإحالات</li>
                                        <li>تحقق من مزود التأمين الخاص بك regarding الأخصائيين المشمولين</li>
                                    </ul>
                                </div>
                                
                                <a href="/practitioners" class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800" style="direction: rtl;">
                                    البحث عن أخصائيين طبيين
                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            </div>
                        ` : `
                            <div class="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm dark:bg-gradient-to-r dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700">
                                <div class="flex items-center gap-2 mb-4">
                                    <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h3 class="font-semibold text-blue-800 dark:text-blue-300">Specialist Recommendation</h3>
                                </div>
                                
                                <div class="mb-4 p-3 bg-white rounded-lg border border-blue-100 shadow-sm dark:bg-gray-800 dark:border-blue-800">
                                    <p class="text-sm text-gray-700 mb-2 dark:text-gray-300">Based on your symptoms, we recommend consulting with a:</p>
                                    <div class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
                                        <span class="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                                        <span class="text-sm font-medium text-blue-700 dark:text-blue-300">${detectedSpecialty}</span>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-2 dark:text-gray-400">specialist for proper diagnosis and treatment.</p>
                                </div>
                                
                                <p class="text-sm text-gray-600 mb-4 dark:text-gray-300">
                                    As an AI assistant, I cannot prescribe medication, but I can guide you to the appropriate specialist.
                                </p>
                                
                                <div class="bg-white p-4 rounded-lg border border-blue-100 mb-4 dark:bg-gray-800 dark:border-blue-800">
                                    <h4 class="font-medium text-blue-800 mb-2 flex items-center dark:text-blue-300">
                                        <svg class="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                        Next Steps :
                                    </h4>
                                    <ul class="text-sm text-gray-700 list-disc list-inside space-y-1 dark:text-gray-300">
                                        <li>Search for <span class="font-medium text-blue-600 dark:text-blue-400">"${detectedSpecialty} specialist near me"</span> on Google</li>
                                        <li>Contact your local hospital or clinic for referrals</li>
                                        <li>Check with your insurance provider for covered specialists</li>
                                    </ul>
                                </div>
                                
                                <a href="/practitioners" class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800">
                                    Find Medical Specialists 
                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            </div>
                        `;

                        finalResponse += recommendationSection;
                    } else {
                        const generalRecommendation = isArabic ? `
                            <div class="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm dark:bg-gradient-to-r dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700" style="direction: rtl;">
                                <div class="flex items-center gap-2 mb-4">
                                    <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h3 class="font-semibold text-blue-800 dark:text-blue-300">نوصي باستشارة طبية</h3>
                                </div>

                                <p class="text-sm text-gray-600 mb-4 dark:text-gray-300" style="text-align: right;">
                                    بناءً على الأعراض الخاصة بك، نوصي باستشارة أخصائي رعاية صحية للتشخيص والعلاج المناسبين.
                                    كمساعد ذكي، لا يمكنني وصف الأدوية، لكن يمكنني تقديم معلومات عامة.
                                </p>
                                
                                <a href="/practitioners" class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800" style="direction: rtl;">
                                    البحث عن مقدمي الرعاية الصحية
                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            </div>
                        ` : `
                            <div class="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm dark:bg-gradient-to-r dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700">
                                <div class="flex items-center gap-2 mb-4">
                                    <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h3 class="font-semibold text-blue-800 dark:text-blue-300">Medical Consultation Recommended</h3>
                                </div>

                                <p class="text-sm text-gray-600 mb-4 dark:text-gray-300">
                                    Based on your symptoms, we recommend consulting with a healthcare professional for proper diagnosis and treatment.
                                    As an AI assistant, I cannot prescribe medication, but I can provide general information.
                                </p>
                                
                                <a href="/practitioners" class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800">
                                    Find Healthcare Providers 
                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            </div>
                        `;

                        finalResponse += generalRecommendation;
                    }

                    setResponse(finalResponse);

                    const newHistoryItem = {
                        query,
                        response: finalResponse,
                        language: isArabic ? 'Arabic' : 'English',
                        time: new Date().toLocaleTimeString(),
                        id: Date.now(),
                        specialty: detectedSpecialty
                    };

                    setMedicalHistory((prevHistory) => {
                        const updatedHistory = [...prevHistory, newHistoryItem];
                        saveHistoryToStorage(updatedHistory);
                        return updatedHistory;
                    });
                } catch (error) {
                    setResponse(isArabic
                        ? `<span style="color: red">خطأ في البث: ${error.message}</span>`
                        : `<span style="color: red">Stream Error: ${error.message}</span>`
                    );
                } finally {
                    reader.releaseLock();
                }
            };

            processStream();
        },
        onError: (error) => {
            const isArabic = selectedLanguage === 'arabic';
            setResponse(isArabic
                ? `<span style="color:red">خطأ: ${error.message}</span>`
                : `<span style="color:red">Error: ${error.message}</span>`
            );
        },
    });

    return { sendMessageMutation };
};

export default useApiCommunication;