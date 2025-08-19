import { FaStethoscope } from "react-icons/fa";

const Header = () => {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-6">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-white/20 rounded-full">
                    <FaStethoscope className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">MedAI Assistant</h1>
                    <p className="text-blue-100">AI-Powered Medical Symptom Analysis</p>
                </div>
            </div>
            <div className="flex gap-2 mt-4">
                <div className="bg-white/20 text-xs px-3 py-1 rounded-full">English</div>
                <div className="bg-white/20 text-xs px-3 py-1 rounded-full">Arabic</div>
                <div className="bg-white/20 text-xs px-3 py-1 rounded-full">HIPAA Compliant</div>
            </div>
        </div>
    );
};

export default Header;