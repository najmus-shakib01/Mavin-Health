import { useMutation } from "@tanstack/react-query";
import { apiKey, baseUrl } from "../../constants/env.constants";
import useMedicalValidation from "./useMedicalValidation";

const useApiMedicalValidation = () => {
    const validateMedicalQuestionMutation = useMutation({
        mutationFn: async (userMessage) => {
            const validationPrompt = `
                Analyze the following user message and determine if it is a medical-related question.
                
                MEDICAL QUESTIONS INCLUDE:
                - Symptoms description (pain, fever, cough, headache, etc.)
                - Disease or condition inquiries
                - Medication or treatment questions
                - Health concerns or medical advice
                - Medical test or diagnosis questions
                - Emergency medical situations
                
                NON-MEDICAL QUESTIONS INCLUDE:
                - General knowledge questions
                - Weather, sports, entertainment
                - Technical or programming questions
                - Personal opinions or philosophical questions
                - Business or financial advice
                - Any topic not related to health or medicine
                
                User Message: "${userMessage}"
                
                Respond with ONLY one word: "MEDICAL" or "NON_MEDICAL"
            `.trim();

            const response = await fetch(`${baseUrl}/completions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "mistralai/mistral-small-24b-instruct-2501:free",
                    messages: [
                        { role: "system", content: validationPrompt },
                        { role: "user", content: userMessage }
                    ],
                    temperature: 0,
                    max_tokens: 10,
                }),
            });

            if (!response.ok) {
                throw new Error(`Validation API error! status: ${response.status}`);
            }

            const data = await response.json();
            const validationResult = data.choices[0].message.content.trim().toUpperCase();

            return validationResult === "MEDICAL";
        },
        onError: (error) => {
            console.error("Medical validation error:", error);
            return true;
        }
    });

    const localValidation = useMedicalValidation();

    const validateMedicalQuestion = async (userMessage) => {
        try {
            const result = await validateMedicalQuestionMutation.mutateAsync(userMessage);
            return result;
        } catch (error) {
            console.error("Validation failed, using fallback:", error);
            return localValidation.isMedicalQuestion(userMessage);
        }
    };

    return {
        validateMedicalQuestion,
        isValidationLoading: validateMedicalQuestionMutation.isLoading || validateMedicalQuestionMutation.isPending
    };
};

export default useApiMedicalValidation;