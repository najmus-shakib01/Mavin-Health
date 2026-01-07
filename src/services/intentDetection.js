import { apiKey, baseUrl } from "../constants/env.constants";

export const detectMedicalIntent = async (userMessage) => {
    try {
    const systemPrompt = `You are a medical intent classifier. Your ONLY job is to determine if the user's query is related to medical/health topics.

    CRITICAL RULES:
    1. Medical topics include ANYTHING related to:
    - Symptoms (any physical or mental symptoms)
    - Diseases/conditions (acute or chronic, any type)
    - Medications/drugs
    - Medical procedures/tests
    - Healthcare advice
    - Body parts/organs
    - Health concerns/questions
    - Medical history
    - Treatment options
    - Preventive care
    - Mental health
    - Pregnancy/childbirth
    - Aging/geriatric care
    - Disability concerns
    - Medical emergencies
    - Healthcare systems
    - Medical education
    - Health insurance
    - Any medical terminology

    2. Non-medical topics include:
    - Cooking/recipes (unless diet-related for medical condition)
    - Sports/exercise (unless for rehabilitation/therapy)
    - Programming/coding
    - Movies/entertainment
    - Politics/news (unless health policy)
    - Shopping (unless medical equipment)
    - Travel (unless medical tourism)
    - Personal relationships (non-medical)
    - General knowledge
    - Business/finance
    - Education (non-medical)
    - Hobbies

    3. IMPORTANT: If ANY part of the query could be medical, classify as MEDICAL.
    4. Be INCLUSIVE, not restrictive.
    5. Chronic conditions (diabetes, hypertension, kidney disease, etc.) are ALWAYS medical.
    6. General health questions are ALWAYS medical.
    7. When in doubt, classify as MEDICAL.

    Examples:
    - "I have diabetes" → MEDICAL
    - "Kidney pain" → MEDICAL
    - "How to lower blood pressure" → MEDICAL
    - "Best treatment for migraine" → MEDICAL
    - "Mental health support" → MEDICAL
    - "Pregnancy symptoms" → MEDICAL
    - "How to cook rice" → NON_MEDICAL
    - "Football match results" → NON_MEDICAL
    - "Python programming" → NON_MEDICAL
    - "Movie recommendations" → NON_MEDICAL

    User Message: "${userMessage}"

    Respond with EXACTLY ONE WORD: "MEDICAL" or "NON_MEDICAL"`;

        const response = await fetch(`${baseUrl}/completions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "qwen/qwen2.5-vl-72b-instruct",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage },
                ],
                temperature: 0,
                max_tokens: 15,
            }),
        });

        if (!response.ok) {
            throw new Error(`Intent detection API error! status: ${response.status}`);
        }

        const data = await response.json();
        const intent = data.choices[0].message.content.trim().toUpperCase();
        const cleanIntent = intent.split(/\s+/)[0];
        return cleanIntent === "MEDICAL";
    } catch (error) {
        console.error("Intent detection API error:", error);
        return true;
    }
};
