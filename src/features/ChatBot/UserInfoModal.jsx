/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { FaTimes, FaUser } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

const UserInfoModal = ({ isOpen, onClose, userInfo, onUpdate }) => {
    const [age, setAge] = useState(userInfo.age || "");
    const [gender, setGender] = useState(userInfo.gender || "");
    const [symptoms, setSymptoms] = useState(userInfo.symptoms || "");
    const { isEnglish } = useLanguage();

    useEffect(() => {
        if (isOpen) {
            setAge(userInfo.age || "");
            setGender(userInfo.gender || "");
            setSymptoms(userInfo.symptoms || "");
        }
    }, [isOpen, userInfo]);

    const handleSave = () => {
        const updatedInfo = {
            age: age.trim(),
            gender: gender.trim(),
            symptoms: symptoms.trim()
        };

        onUpdate(updatedInfo);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <FaUser className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">
                                {isEnglish ? "Patient Information" : "معلومات المريض"}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {isEnglish ? "Help us provide better medical advice" : "ساعدنا في تقديم نصائح طبية أفضل"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                        <FaTimes className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isEnglish ? "Age" : "العمر"} *
                        </label>
                        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-g rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder={isEnglish ? "Enter your age" : "أدخل عمرك"} min="1" max="120" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isEnglish ? "Gender" : "الجنس"} *
                        </label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                            <option value="">{isEnglish ? "Select gender" : "اختر الجنس"}</option>
                            <option value="male">{isEnglish ? "Male" : "ذكر"}</option>
                            <option value="female">{isEnglish ? "Female" : "أنثى"}</option>
                            <option value="other">{isEnglish ? "Other" : "آخر"}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isEnglish ? "Main Symptoms" : "الأعراض الرئيسية"}
                        </label>
                        <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows="3" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none" placeholder={isEnglish ? "Describe your main symptoms..." : "صف الأعراض الرئيسية..."} />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300">
                        {isEnglish ? "Cancel" : "إلغاء"}
                    </button>
                    <button onClick={handleSave} disabled={!age.trim() || !gender.trim()} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                        {isEnglish ? "Save Information" : "حفظ المعلومات"}
                    </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-blue-700 dark:text-blue-300 text-xs">
                        {isEnglish ? "Providing accurate information helps us give you better medical guidance." : "تقديم معلومات دقيقة يساعدنا في إعطائك توجيهات طبية أفضل."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserInfoModal;