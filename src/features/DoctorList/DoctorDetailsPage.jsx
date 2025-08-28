import { FaArrowLeft, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { allDoctors } from "../../constants/specialties.constants";
import Header from "../MedicalAssistant/Header";

const DoctorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // সব specialty এর doctors একসাথে মিক্স করি
  const doctor = Object.values(allDoctors).flat().find(d => d.id === parseInt(id));

  if (!doctor) {
    return (
      <div className="p-6 text-center dark:bg-gray-800 dark:text-white">
        <h2 className="text-xl font-bold">Doctor not found</h2>
        <button onClick={() => navigate("/doctors")} className="mt-4 text-blue-600 dark:text-blue-400">Back to Doctors</button>
      </div>
    );
  }

  // Find the specialty for the current doctor
  const specialty = Object.keys(allDoctors).find(key =>
    allDoctors[key].some(d => d.id === doctor.id)
  );

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <Header />
      <button onClick={() => navigate(`/doctors/list?specialty=${specialty ? specialty.toLowerCase() : ""}`)} className="flex items-center gap-2 text-blue-600 mb-6 font-medium dark:text-blue-400">
        <FaArrowLeft className="h-4 w-4" /> Back to Doctors List
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img className="h-48 w-full md:w-64 object-cover" src={doctor.image} alt={doctor.name} />
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{doctor.name}</h1>
              <div className="flex items-center">
                <FaStar className="h-5 w-5 text-yellow-400" />
                <span className="ml-1 text-gray-700 dark:text-gray-300">{doctor.rating}</span>
                <span className="text-gray-500 ml-1 dark:text-gray-400">({doctor.reviews} reviews)</span>
              </div>
            </div>

            <p className="mt-2 text-gray-600 dark:text-gray-300">{doctor.expertise || doctor.specialty}</p>
            <p className="text-gray-500 dark:text-gray-400">{doctor.experience} experience</p>

            <div className="mt-4 flex items-center text-gray-600 dark:text-gray-300">
              <FaMapMarkerAlt className="h-4 w-4 mr-2" />
              <span>{doctor.hospital}</span>
            </div>
            <p className="text-gray-500 ml-6 dark:text-gray-400">{doctor.address}</p>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Availability</h3>
              <p className="text-gray-600 dark:text-gray-300">{doctor.availability}</p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{doctor.price || doctor.fee}</span>
                <span className="text-gray-600 dark:text-gray-400"> / consultation</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailsPage;