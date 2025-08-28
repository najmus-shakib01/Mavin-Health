import { useEffect } from "react";
import { FaCalendarCheck, FaCheckCircle, FaClock, FaMapMarkerAlt, FaUserMd } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../features/MedicalAssistant/Header";

const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.bookingData || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <Header />

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-900">
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full dark:bg-green-900/20">
                <FaCheckCircle className="h-16 w-16 text-green-600 dark:text-green-500" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">Appointment Booked Successfully!</h1>
            <p className="text-gray-600 mb-6 dark:text-gray-400">
              Your appointment has been confirmed. You will receive a confirmation message shortly.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Appointment Details</h2>

              <div className="space-y-3">
                <div className="flex items-center">
                  <FaUserMd className="h-5 w-5 text-blue-600 mr-3 dark:text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Healthcare Provider</p>
                    <p className="text-gray-600 dark:text-gray-400">{bookingData.practitioner?.name || bookingData.clinic?.name}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaCalendarCheck className="h-5 w-5 text-blue-600 mr-3 dark:text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Date & Time</p>
                    <p className="text-gray-600 dark:text-gray-400">{bookingData.date} at {bookingData.time}</p>
                  </div>
                </div>

                {bookingData.clinic && bookingData.practitioner && (
                  <div className="flex items-center">
                    <FaUserMd className="h-5 w-5 text-blue-600 mr-3 dark:text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Specialist</p>
                      <p className="text-gray-600 dark:text-gray-400">{bookingData.practitioner.name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <FaMapMarkerAlt className="h-5 w-5 text-blue-600 mr-3 dark:text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {bookingData.practitioner?.address || bookingData.clinic?.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaClock className="h-5 w-5 text-blue-600 mr-3 dark:text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Duration</p>
                    <p className="text-gray-600 dark:text-gray-400">Approximately 30 minutes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left dark:bg-blue-900/20">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 dark:text-white">Next Steps</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 dark:text-gray-300">
                <li>You will receive a confirmation SMS/email within 10 minutes</li>
                <li>Please arrive 15 minutes before your appointment time</li>
                <li>Bring any relevant medical records or test results</li>
                <li>Cancel at least 24 hours in advance if you cannot make it</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate("/")} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition dark:bg-blue-700 dark:hover:bg-blue-800">
                Back to Home
              </button>

              <button onClick={() => navigate("/practitioners")} className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition dark:border-blue-500 dark:text-blue-400 dark:hover:bg-gray-800">
                Book Another Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;