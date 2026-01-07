import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

// eslint-disable-next-line react/prop-types
const AgeGenderForm = ({ onSubmit }) => {
  const { isEnglish } = useLanguage();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!age.trim()) {
      newErrors.age = isEnglish ? "Age is required" : "العمر مطلوب";
    } else if (isNaN(age) || parseInt(age) <= 0 || parseInt(age) > 120) {
      newErrors.age = isEnglish
        ? "Please enter a valid age (1-120)"
        : "يرجى إدخال عمر صحيح (1-120)";
    }

    if (!gender.trim()) {
      newErrors.gender = isEnglish ? "Please select gender" : "يرجى اختيار الجنس";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) onSubmit(age, gender);
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3 items-start flex-wrap sm:flex-nowrap">
          <div className="min-w-[200px]">
            <input
              type="number"
              min="1"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 ${
                errors.age ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={isEnglish ? "Age (18+)" : "العمر (18+)"}
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.age}
              </p>
            )}
          </div>

          <div className="shrink-0">
            <div
              className={`p-1 rounded-xl border ${
                errors.gender ? "border-red-500" : "border-gray-200 dark:border-gray-700"
              } bg-gray-100 dark:bg-gray-800/60`}
            >
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    gender === "female"
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow"
                      : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-900/40"
                  }`}
                >
                  {isEnglish ? "Female" : "أنثى"}
                </button>

                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    gender === "male"
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow"
                      : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-900/40"
                  }`}
                >
                  {isEnglish ? "Male" : "ذكر"}
                </button>
              </div>
            </div>

            {errors.gender && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.gender}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!age || !gender}
        >
          {isEnglish ? "Submit" : "إرسال"}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          {isEnglish
            ? "Your information is private and confidential"
            : "معلوماتك خاصة وسرية"}
        </p>
      </form>
    </div>
  );
};

export default AgeGenderForm;
