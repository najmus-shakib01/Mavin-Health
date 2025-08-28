import { useState } from "react";
import { FaArrowLeft, FaCalendarCheck, FaClock, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import BookingModal from "../../components/BookingModal";
import { clinics } from "../../constants/clinics.constants";
import Header from "../MedicalAssistant/Header";

const PractitionerDetailsPage = () => {
    const { clinicId, practitionerId } = useParams();
    const navigate = useNavigate();
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Find clinic and practitioner based on IDs
    const clinic = clinics.find(c => c.id === parseInt(clinicId));
    const practitioner = clinic?.practitioners.find(p => p.id === parseInt(practitionerId));

    if (!clinic || !practitioner) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
                <Header />
                <div className="max-w-4xl mx-auto p-6">
                    <button onClick={() => navigate("/clinics")} className="flex items-center gap-2 text-blue-600 mb-6 font-medium dark:text-blue-400">
                        <FaArrowLeft className="h-4 w-4" /> Back to Clinics
                    </button>
                    <div className="text-center py-12">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Practitioner not found</h2>
                        <p className="text-gray-600 mt-2 dark:text-gray-400">The requested practitioner could not be found.</p>
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
        setTimeout(() => setBookingSuccess(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
            <Header />

            <div className="max-w-4xl mx-auto p-6">
                <button onClick={() => navigate(`/clinics/${clinic.id}`)} className="flex items-center gap-2 text-blue-600 mb-6 font-medium dark:text-blue-400">
                    <FaArrowLeft className="h-4 w-4" /> Back to Clinic
                </button>

                {bookingSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                        Appointment booked successfully! You will receive a confirmation shortly.
                    </div>
                )}

                {/* Practitioner Details */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-900 mb-8">
                    <div className="md:flex">
                        <div className="md:flex-shrink-0">
                            <img className="h-64 w-full md:w-80 object-cover" src={practitioner.image} alt={practitioner.name} />
                        </div>

                        <div className="p-8 flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{practitioner.name}</h1>
                                    <p className="text-gray-600 dark:text-gray-400">{practitioner.specialty}</p>
                                    <p className="text-gray-500 text-sm dark:text-gray-400">{practitioner.experience} experience</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <FaMapMarkerAlt className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>{clinic.name} - {clinic.address}</span>
                                </div>

                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <FaClock className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>Available: {practitioner.availability}</span>
                                </div>

                                <div className="flex items-center text-gray-600 dark:text-gray-300">
                                    <span className="font-semibold mr-2">Consultation Fee:</span>
                                    <span>{practitioner.fee}</span>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button onClick={handleBookAppointment} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition dark:bg-blue-700 dark:hover:bg-blue-800">
                                    <FaCalendarCheck className="h-4 w-4" /> Book Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About the Clinic */}
                <div className="bg-white rounded-xl shadow-md p-6 dark:bg-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 dark:text-white">About {clinic.name}</h2>
                    <div className="flex items-center text-gray-600 mb-4 dark:text-gray-300">
                        <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                        <span>{clinic.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-4 dark:text-gray-300">
                        <FaStar className="h-4 w-4 mr-2 text-yellow-400" />
                        <span>{clinic.rating} ({clinic.reviews} reviews)</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        {clinic.name} is a specialized {clinic.specialty.toLowerCase()} clinic with {clinic.practitionersCount} experienced practitioners.
                    </p>
                </div>

                {showBookingModal && (
                    <BookingModal practitioner={practitioner} clinic={clinic} onClose={() => setShowBookingModal(false)} onConfirm={handleConfirmBooking} />
                )}
            </div>
        </div>
    );
};

export default PractitionerDetailsPage;