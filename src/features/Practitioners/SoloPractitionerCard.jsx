/* eslint-disable react/prop-types */
import { FaCalendarCheck, FaMapMarkerAlt } from "react-icons/fa";

const SoloPractitionerCard = ({ practitioner, onBookAppointment }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 transition dark:bg-gray-900">
            <div className="flex flex-col md:flex-row">
                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <img className="h-32 w-32 object-cover rounded-lg" src={practitioner.image || "/doctor-placeholder.jpg"} alt={practitioner.name} />
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{practitioner.name}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{practitioner.specialty}</p>
                            <p className="text-gray-500 text-sm dark:text-gray-400">{practitioner.experience} experience</p>
                        </div>

                        <div className="flex items-center">
                      
                            <span className="ml-1 text-gray-700 dark:text-gray-300">{practitioner.rating}</span>
                            <span className="text-gray-500 text-sm ml-1 dark:text-gray-400">({practitioner.reviews})</span>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center text-gray-600 mb-1 dark:text-gray-300">
                            <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                            <span>{practitioner.clinicName}</span>
                        </div>
                        <p className="text-gray-500 text-sm ml-6 dark:text-gray-400">{practitioner.address}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{practitioner.fee}</span>
                            <span className="text-gray-600 text-sm dark:text-gray-400"> / consultation</span>
                        </div>

                        <button onClick={() => onBookAppointment(practitioner)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition dark:bg-blue-700 dark:hover:bg-blue-800">
                            <FaCalendarCheck className="h-4 w-4" /> Book Appointment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SoloPractitionerCard;