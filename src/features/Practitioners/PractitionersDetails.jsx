import { useState } from "react";
import { FaArrowLeft, FaCalendarCheck, FaClock, FaMapMarkerAlt, FaPhone, FaStar, FaUserMd } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import BookingModal from "../../components/BookingModal";
import { soloPractitioners } from "../../constants/practitioners.constants";
import Header from "../../features/MedicalAssistant/Header";

const PractitionersDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const practitioner = soloPractitioners.find(p => p.id === parseInt(id));

    if (!practitioner) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
                <Header />
                <div className="max-w-4xl mx-auto p-6">
                    <button onClick={() => navigate("/practitioners")} className="flex items-center gap-2 text-blue-600 mb-6 font-medium dark:text-blue-400">
                        <FaArrowLeft className="h-4 w-4" /> Back to Practitioners
                    </button>
                    <div className="text-center py-12">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Practitioner not found</h2>
                        <p className="text-gray-600 mt-2 dark:text-gray-400">The requested healthcare provider could not be found.</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleBookAppointment = () => {
        setShowBookingModal(true);
    };

    const handleConfirmBooking = (bookingData) => {
        console.log("Booking confirmed:", bookingData);
        setShowBookingModal(false);
        setBookingSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => setBookingSuccess(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
            <Header />

            <div className="max-w-4xl mx-auto p-6">
                <button onClick={() => navigate("/practitioners")} className="flex items-center gap-2 text-blue-600 mb-6 font-medium dark:text-blue-400">
                    <FaArrowLeft className="h-4 w-4" /> Back to Practitioners
                </button>

                {bookingSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                        Appointment booked successfully! You will receive a confirmation shortly.
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-900">
                    <div className="md:flex">
                        <div className="md:flex-shrink-0">
                            <img className="h-64 w-full md:w-80 object-cover" src={practitioner.image} alt={practitioner.name} />
                        </div>

                        <div className="p-8 flex-1">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {practitioner.name}
                                </h1>
                                <div className="flex items-center">
                                    <FaStar className="h-5 w-5 text-yellow-400" />
                                    <span className="ml-1 text-gray-700 dark:text-gray-300">
                                        {practitioner.rating}
                                    </span>
                                    <span className="text-gray-500 ml-1 dark:text-gray-400">
                                        ({practitioner.reviews} reviews)
                                    </span>
                                </div>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    <FaUserMd className="h-3 w-3 mr-1" /> Solo Practitioner
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    {practitioner.specialty}
                                </span>
                            </div>

                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                {practitioner.experience}
                            </p>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <FaMapMarkerAlt className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>{practitioner.clinicName}</span>
                                </div>

                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <FaMapMarkerAlt className="h-4 w-4 mr-2 opacity-0" />
                                    <span>{practitioner.address}</span>
                                </div>

                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <FaPhone className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>{practitioner.contact}</span>
                                </div>

                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <FaClock className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>Availability : {practitioner.availability}</span>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between">
                                <div>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {practitioner.fee}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400"> consultation</span>
                                </div>

                           <button onClick={() => handleBookAppointment(practitioner)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition dark:bg-blue-700 dark:hover:bg-blue-800">
                            <FaCalendarCheck className="h-4 w-4" /> Book Appointment
                        </button>
                            </div>
                        </div>
                    </div>
                </div>

                {showBookingModal && (
                    <BookingModal practitioner={practitioner} onClose={() => setShowBookingModal(false)} onConfirm={handleConfirmBooking} />
                )}
            </div>
        </div>
    );
};

export default PractitionersDetails;