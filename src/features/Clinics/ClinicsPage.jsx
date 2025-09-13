import { useState } from "react";
import { FaArrowLeft, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { clinics } from "../../constants/clinics.constants";
import Header from "../MedicalAssistant/Header";
import ClinicCard from "./ClinicCard";

const ClinicsPage = () => {
    const navigate = useNavigate();
    const [, setSelectedClinic] = useState(null);

    const handleViewClinicDetails = (clinic) => {
        navigate(`/clinics/${clinic.id}`);
    };
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
            <Header />

            <div className="max-w-6xl mx-auto p-6">
                <button onClick={() => navigate("/")} className="flex items-center gap-2 text-blue-600 mb-6 font-medium dark:text-blue-400">
                    <FaArrowLeft className="h-4 w-4" /> Back to Medical Assistant
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Medical Clinics</h1>
                    <p className="text-gray-600 dark:text-gray-400">Choose from various specialized clinics with multiple practitioners</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {clinics.map((clinic) => (
                        <div key={clinic.id} className="relative">
                            <ClinicCard clinic={clinic} onViewPractitioners={() => setSelectedClinic(clinic)} />

                            <button onClick={() => handleViewClinicDetails(clinic)} className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition opacity-90" title="View Clinic Details">
                                <FaEye className="h-3 w-3" />
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClinicsPage;