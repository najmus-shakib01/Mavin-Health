import { useState } from "react";
import { FaArrowLeft, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BookingModal from "../../components/BookingModal";
import SoloPractitionerCard from "./SoloPractitionerCard";
import { soloPractitioners } from "../../constants/practitioners.constants";
import Header from "../MedicalAssistant/Header";

const PractitionersPage = () => {
    const navigate = useNavigate();
    const [selectedPractitioner, setSelectedPractitioner] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const handleBookAppointment = (practitioner) => {
        setSelectedPractitioner(practitioner);
        setShowBookingModal(true);
    };

    const handleConfirmBooking = (bookingData) => {
        console.log("Booking confirmed:", bookingData);
        setShowBookingModal(false);
        setBookingSuccess(true);
        setTimeout(() => setBookingSuccess(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
            <Header />

            <div className="max-w-6xl mx-auto p-6">
                <button onClick={() => navigate("/")} className="flex items-center gap-2 text-blue-600 mb-6 font-medium dark:text-blue-400">
                    <FaArrowLeft className="h-4 w-4" /> Back to Medical Assistant
                </button>

                {bookingSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                        Appointment booked successfully! You will receive a confirmation shortly.
                    </div>
                )}

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Solo Practitioners</h1>
                    <p className="text-gray-600 mb-6 dark:text-gray-400">Book appointments with individual healthcare specialists</p>

                    <div className="space-y-6">
                        {soloPractitioners.map((practitioner) => (
                            <div key={practitioner.id} className="relative">
                                <SoloPractitionerCard practitioner={practitioner} onBookAppointment={handleBookAppointment}/>

                                <button onClick={() => navigate(`/practitioners/solo/${practitioner.id}`)} className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition opacity-90" title="View Details">
                                    <FaEye className="h-3 w-3" />
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {showBookingModal && (
                    <BookingModal practitioner={selectedPractitioner} onClose={() => setShowBookingModal(false)} onConfirm={handleConfirmBooking} />
                )}
            </div>
        </div>
    );
};

export default PractitionersPage;