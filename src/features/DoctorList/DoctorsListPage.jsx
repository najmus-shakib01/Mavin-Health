import { useEffect, useState } from "react";
import { FaArrowLeft, FaCalendarCheck, FaMapMarkerAlt, FaStar, FaUserMd, } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { allDoctors, medicalSpecialties, } from "../../constants/specialties.constants";
import PageTitle from "../../utils/PageTitle";
import Header from "../MedicalAssistant/Header";

const DoctorsListPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const specialtyParam = searchParams.get("specialty");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchTerm] = useState("");
  const [specialty, setSpecialty] = useState("");

  // URL প্যারামিটার থেকে specialty সেট করা হল
  useEffect(() => {
    if (specialtyParam) {
      setSpecialty(specialtyParam);
    }
  }, [specialtyParam]);

  // specialty কে capitalize করে দেখানো হয়েছে
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // ফিল্টার্ড ডাক্তারের লিস্ট
  const filteredDoctors = () => {
    if (!specialty) return [];
    let doctors = allDoctors[specialty.toLowerCase()] || [];
    return doctors;
  };

  const doctors = filteredDoctors();

  if (selectedDoctor) {
    return (
      <div className="min-h-full flex items-center justify-center py-8 px-4 bg-gray-50">
        <PageTitle title="Doctors Page" />
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <button onClick={() => setSelectedDoctor(null)} className="flex items-center gap-2 text-blue-600 mb-6 font-medium">
            <FaArrowLeft className="h-4 w-4" /> Back to Doctors List
          </button>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-shrink-0">
                <img className="h-48 w-full md:w-64 object-cover" src={selectedDoctor.image || "/doctor-placeholder.jpg"} alt={selectedDoctor.name} />
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h1>
                  <div className="flex items-center">
                    <FaStar className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 text-gray-700">{selectedDoctor.rating}</span>
                    <span className="text-gray-500 ml-1">({selectedDoctor.reviews} reviews)</span>
                  </div>
                </div>

                <p className="mt-2 text-gray-600">{selectedDoctor.expertise || selectedDoctor.specialty}</p>
                <p className="text-gray-500">{selectedDoctor.experience} experience</p>

                <div className="mt-4 flex items-center text-gray-600">
                  <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                  <span>{selectedDoctor.hospital}</span>
                </div>

                <div className="mt-2 flex items-center text-gray-600">
                  <FaMapMarkerAlt className="h-4 w-4 mr-2 opacity-0" />
                  <span>{selectedDoctor.address}</span>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Availability</h3>
                  <p className="text-gray-600">{selectedDoctor.availability}</p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{selectedDoctor.price || selectedDoctor.fee}</span>
                    <span className="text-gray-600"> / consultation</span>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"><FaCalendarCheck className="h-4 w-4" /> Book Appointment</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-blue-600 mb-6 font-medium"><FaArrowLeft className="h-4 w-4" /> Back to Medical Assistant</button>

        {specialty && (
          <button onClick={() => (window.location.href = "/doctors")} className="flex items-center gap-2 text-blue-600 mb-6 font-medium"><FaArrowLeft className="h-4 w-4" /> Back to Doctors List </button>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {specialty
            ? `${capitalizeFirstLetter(specialty)} Specialists`
            : "Find Doctors"}
        </h1>

        {!specialty ? (
          <div className="text-center py-12">
            <FaUserMd className="h-16 w-16 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No specialty selected</h3>
            <p className="mt-2 text-gray-600">Please select a medical specialty to find doctors.</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              {medicalSpecialties.map((spec) => (
                <button key={spec} onClick={() => navigate(`/doctors/list?specialty=${spec.toLowerCase()}`)} className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 transition">
                  <span className="text-sm font-medium">{spec}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">Find the best {specialty.toLowerCase()} specialists in your area</p>

            {doctors.length === 0 ? (
              <div className="text-center py-12">
                <FaUserMd className="h-16 w-16 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No specialists found</h3>
                <p className="mt-2 text-gray-600">
                  {searchTerm
                    ? `No ${specialty.toLowerCase()} specialists found matching "${searchTerm}"`
                    : `We couldn't find any ${specialty.toLowerCase()} specialists at the moment.`}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                        <img className="h-32 w-32 object-cover rounded-lg" src={doctor.image || "/doctor-placeholder.jpg"} alt={doctor.name} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">{doctor.name}</h2>
                            <p className="text-gray-600">{doctor.expertise || doctor.specialty}</p>
                            <p className="text-gray-500 text-sm">{doctor.experience} experience</p>
                          </div>

                          <div className="flex items-center">
                            <FaStar className="h-5 w-5 text-yellow-400" />
                            <span className="ml-1 text-gray-700">{doctor.rating}</span>
                            <span className="text-gray-500 text-sm ml-1">({doctor.reviews})</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center text-gray-600 mb-1">
                            <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                            <span>{doctor.hospital}</span>
                          </div>
                          <p className="text-gray-500 text-sm ml-6">{doctor.address}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-gray-900">{doctor.price || doctor.fee}</span>
                            <span className="text-gray-600 text-sm">{" "} / consultation</span>
                          </div>

                          <div className="flex gap-3">
                            <button onClick={() => navigate(`/doctors/${doctor.id}`)} className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition">
                              View Profile
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"><FaCalendarCheck className="h-4 w-4" /> Book</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorsListPage;
