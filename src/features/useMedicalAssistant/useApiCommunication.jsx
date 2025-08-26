import { useMutation } from "@tanstack/react-query";
import { marked } from "marked";
import { apiKey, baseUrl } from "../../constants/env.constants";
import { cornerCases } from "../../constants/env.cornercase";

const useApiCommunication = (setResponse, setMedicalHistory, saveHistoryToStorage, responseDivRef) => {
    const sendMessageMutation = useMutation({
        mutationFn: async (inputText) => {
            setResponse("🔄 Analyzing Symptoms With Medical Database...");

            // Detect language 
            const isArabic = /[\u0600-\u06FF]/.test(inputText);
            const detectedLanguage = isArabic ? "Arabic" : "English";

            // Enhanced prompt to ask AI to detect specialty
            const enhancedPrompt = `${cornerCases}`;
            const response = await fetch(`${baseUrl}/completions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1:free",
                    messages: [
                        { role: "system", content: enhancedPrompt },
                        { role: "user", content: inputText },
                    ],
                    temperature: 0,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return { stream: response.body, language: detectedLanguage, query: inputText };
        },
        onSuccess: (data) => {
            const { stream, language, query } = data;
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";
            let buffer = "";

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

                    // AI থেকে specialty extract করুন
                    let detectedSpecialty = null;
                    const specialtyMatch = fullResponse.match(/SPECIALTY RECOMMENDATION : \[(.*?)\]/);

                    if (specialtyMatch && specialtyMatch[1]) {
                        detectedSpecialty = specialtyMatch[1].trim();
                    }

                    let finalResponse = marked.parse(fullResponse);

                    // specialty recommendation যোগ করুন
                    if (detectedSpecialty) {
                        finalResponse = finalResponse.replace(/SPECIALTY RECOMMENDATION : \[.*?\]/, "");

                        const recommendationSection = `
                            <div class="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                                <div class="flex items-center gap-2 mb-4">
                                    <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h3 class="font-semibold text-blue-800">Specialist Recommendation</h3>
                                </div>
                                
                                <div class="mb-4 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
                                    <p class="text-sm text-gray-700 mb-2">Based on your symptoms, we recommend consulting with a:</p>
                                    <div class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 border border-blue-200">
                                        <span class="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                                        <span class="text-sm font-medium text-blue-700">${detectedSpecialty}</span>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-2">specialist for proper diagnosis and treatment.</p>
                                </div>
                                
                                <p class="text-sm text-gray-600 mb-4">
                                    As an AI assistant, I cannot prescribe medication, but I can guide you to the appropriate specialist.
                                </p>
                                
                                <div class="bg-white p-4 rounded-lg border border-blue-100 mb-4">
                                    <h4 class="font-medium text-blue-800 mb-2 flex items-center">
                                        <svg class="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                        Next Steps :
                                    </h4>
                                    <ul class="text-sm text-gray-700 list-disc list-inside space-y-1">
                                        <li>Search for <span class="font-medium text-blue-600">"${detectedSpecialty} specialist near me"</span> on Google</li>
                                        <li>Contact your local hospital or clinic for referrals</li>
                                        <li>Check with your insurance provider for covered specialists</li>
                                    </ul>
                                </div>
                                
                                <a href="/doctors" class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md">
                                    Find Medical Specialists 
                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            </div>
                        `;

                        finalResponse += recommendationSection;
                    } else {
                        // যদি specialty detect না হয়
                        const generalRecommendation = `
                              <div class="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                                <div class="flex items-center gap-2 mb-4">
                                    <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h3 class="font-semibold text-blue-800">Medical Consultation Recommended</h3>
                                </div>

                                <p class="text-sm text-gray-600 mb-4">
                                    Based on your symptoms, we recommend consulting with a healthcare professional for proper diagnosis and treatment.
                                    As an AI assistant, I cannot prescribe medication, but I can provide general information.
                                </p>
                                
                                <a href="/doctors" class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md">
                                    Find Healthcare Providers 
                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            </div>
                        `;

                        finalResponse += generalRecommendation;
                    }

                    // সম্পূর্ণ রেসপন্স সেট
                    setResponse(finalResponse);

                    // নতুন হিস্টোরি আইটেম তৈরি
                    const newHistoryItem = { query, response: finalResponse, language, time: new Date().toLocaleTimeString(), id: Date.now(), specialty: detectedSpecialty };

                    // হিস্টোরি আপডেট
                    setMedicalHistory((prevHistory) => {
                        const updatedHistory = [...prevHistory, newHistoryItem];
                        saveHistoryToStorage(updatedHistory);
                        return updatedHistory;
                    });
                } catch (error) {
                    setResponse(
                        `<span style="color: red">Stream Error : ${error.message}</span>`
                    );
                } finally {
                    reader.releaseLock();
                }
            };

            processStream();
        },
        onError: (error) => {
            setResponse(`<span style="color : red">Error : ${error.message}</span>`);
        },
    });

    return { sendMessageMutation };
};

export default useApiCommunication;
