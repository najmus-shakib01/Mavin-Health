import { useMutation } from "@tanstack/react-query";
import { apiKey, baseUrl } from "../../constants/env.constants";

const useApiMedicalValidation = () => {
    const validateMedicalQuestionMutation = useMutation({
        mutationFn: async (userMessage) => {
            const validationPrompt = `
        Analyze this user message and determine if it's medical-related.
        MEDICAL: symptoms, diseases, treatments, health concerns.
        NON_MEDICAL: other topics.
        User Message: "${userMessage}"
        Respond with ONLY: "MEDICAL" or "NON_MEDICAL"
      `.trim();

            const response = await fetch(`${baseUrl}/completions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "qwen/qwen2.5-vl-72b-instruct",
                    // model: "mistralai/mistral-small-24b-instruct-2501",
                    messages: [
                        { role: "system", content: validationPrompt },
                        { role: "user", content: userMessage }
                    ],
                    temperature: 0,
                    stream: true,
                    max_tokens: 1500,
                }),
            });

            if (!response.ok) throw new Error(`Validation API error! status: ${response.status}`);

            const data = await response.json();
            return data.choices[0].message.content.trim().toUpperCase() === "MEDICAL";
        },
        onError: (error) => {
            console.error("Medical validation error:", error);
            return true;
        }
    });

    const validateMedicalQuestion = async (userMessage) => {
        try {
            return await validateMedicalQuestionMutation.mutateAsync(userMessage);
        } catch (error) {
            console.error("Validation failed:", error);
            const lowerMessage = userMessage.toLowerCase();
            return lowerMessage.includes('pain') || lowerMessage.includes('fever') ||
                lowerMessage.includes('headache') || lowerMessage.includes('symptom') ||
                lowerMessage.includes('ألم') || lowerMessage.includes('حمى') ||
                lowerMessage.includes('صداع') || lowerMessage.includes('طبيب');
        }
    };

    return { validateMedicalQuestion, isValidationLoading: validateMedicalQuestionMutation.isPending };
};

export default useApiMedicalValidation;