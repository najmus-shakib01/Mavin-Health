import { useMutation } from "@tanstack/react-query";
import { apiKey, baseUrl } from "../../constants/env.constants";
import useMedicalValidation from "./useMedicalValidation";

const useApiMedicalValidation = () => {
  const validateMedicalQuestionMutation = useMutation({
    mutationFn: async (userMessage) => {
      const response = await fetch(`${baseUrl}/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "qwen/qwen2.5-vl-72b-instruct",
          // model: "mistralai/mistral-small-24b-instruct-2501",
          messages: [
            {
              role: "system",
              content: "Analyze if this is a medical question. Respond with ONLY: 'MEDICAL' or 'NON_MEDICAL'"
            },
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
  });

  const localValidation = useMedicalValidation();

  const validateMedicalQuestion = async (userMessage) => {
    try {
      return await validateMedicalQuestionMutation.mutateAsync(userMessage);
    } catch (error) {
      console.error("Validation failed, using fallback:", error);
      return localValidation.isMedicalQuestion(userMessage);
    }
  };

  return { validateMedicalQuestion, isValidationLoading: validateMedicalQuestionMutation.isPending };
};

export default useApiMedicalValidation;