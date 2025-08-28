import { useState } from "react";
import { FaArrowLeft, FaClock } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import BookingModal from "../../components/BookingModal";
import { clinics } from "../../constants/clinics.constants";
import Header from "../MedicalAssistant/Header";

const ClinicDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedPractitioner] = useState(null);
    const [, setBookingSuccess] = useState(false);

    const clinic = clinics.find(c => c.id === parseInt(id));

    if (!clinic) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
                <Header />
                <div className="max-w-4xl mx-auto p-6">
                    <button onClick={() => navigate("/clinics")} className="flex items-center gap-2 text-blue-600 mb-6 font-medium dark:text-blue-400">
                        <FaArrowLeft className="h-4 w-4" /> Back to Clinics
                    </button>
                    <div className="text-center py-12">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Clinic not found</h2>
                        <p className="text-gray-600 mt-2 dark:text-gray-400">The requested clinic could not be found.</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleConfirmBooking = (bookingData) => {
        console.log("Booking confirmed:", bookingData);
        setShowBookingModal(false);
        setBookingSuccess(true);
        setTimeout(() => setBookingSuccess(false), 3000);
    };

    const handleViewPractitionerProfile = (practitioner) => {
        navigate(`/clinics/${clinic.id}/practitioners/${practitioner.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
            <Header />

            <div className="max-w-6xl mx-auto p-6">
                <button onClick={() => navigate("/clinics")} className="flex items-center gap-2 text-blue-600 mb-6 font-medium dark:text-blue-400">
                    <FaArrowLeft className="h-4 w-4" /> Back to Clinics
                </button>

                {/* Practitioners List */}
                <div className="bg-white rounded-xl shadow-md p-6 dark:bg-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 dark:text-white">Available Specialists</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        {clinic.practitioners.map((practitioner) => (
                            <div key={practitioner.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition dark:border-gray-700 dark:hover:shadow-gray-700">
                                <div className="flex items-start mb-4">
                                    <img className="h-16 w-16 object-cover rounded-lg mr-4" src={practitioner.image} alt={practitioner.name} />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{practitioner.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{practitioner.specialty}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{practitioner.experience}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">{practitioner.fee}</span>
                                        <span className="text-gray-600 text-sm dark:text-gray-400"> / consultation</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaClock className="h-4 w-4 text-gray-400 mr-1" />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{practitioner.availability}</span>
                                    </div>
                                </div>

                                <button onClick={() => handleViewPractitionerProfile(practitioner)} className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20">
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {showBookingModal && (
                    <BookingModal practitioner={selectedPractitioner} clinic={clinic} onClose={() => setShowBookingModal(false)} onConfirm={handleConfirmBooking} />
                )}
            </div>
        </div>
    );
};

export default ClinicDetailsPage;