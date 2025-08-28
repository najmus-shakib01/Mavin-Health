/* eslint-disable react/prop-types */
import { FaMapMarkerAlt, FaUsers } from "react-icons/fa";

const ClinicCard = ({ clinic }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 transition dark:bg-gray-900">
            <div className="flex flex-col md:flex-row">
                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <img className="h-32 w-32 object-cover rounded-lg" src={clinic.image || "/clinic-placeholder.jpg"} alt={clinic.name} />
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{clinic.name}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{clinic.specialty} Clinic</p>
                            <p className="text-gray-500 text-sm dark:text-gray-400">{clinic.practitionersCount} specialists available</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center text-gray-600 mb-1 dark:text-gray-300">
                            <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                            <span>{clinic.address}</span>
                        </div>
                        <div className="flex items-center text-gray-600 mt-2 dark:text-gray-300">
                            <FaUsers className="h-4 w-4 mr-2" />
                            <span>{clinic.practitionersCount} practitioners</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClinicCard;