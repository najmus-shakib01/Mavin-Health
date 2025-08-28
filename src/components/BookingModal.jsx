/* eslint-disable react/prop-types */
import { useState } from "react";
import { FaCalendar, FaClock, FaTimes, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BookingModal = ({ practitioner, clinic, onClose, onConfirm }) => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [patientName, setPatientName] = useState("");
    const [patientPhone, setPatientPhone] = useState("");

    const timeSlots = [];
    for (let hour = 9; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            timeSlots.push(time);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const bookingData = { practitioner, clinic, date: selectedDate, time: selectedTime, patientName, patientPhone };

        navigate("/booking-success", { state: { bookingData } });

        if (onConfirm) {
            onConfirm(bookingData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 dark:text-slate-100 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Book Appointment</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <FaTimes className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold text-lg">{practitioner?.name}</h3>
                        <p className="text-gray-600">{practitioner?.specialty}</p>
                        {clinic && <p className="text-gray-600">{clinic.name}</p>}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-white text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FaUser className="h-4 w-4 text-gray-400" />
                                </span>
                                <input type="text" required value={patientName} onChange={(e) => setPatientName(e.target.value)} className="pl-10 w-full border border-gray-300 rounded-lg dark:bg-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your full name" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium dark:text-white text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" required value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none dark:bg-gray-800 p-3 focus:ring-2 focus:ring-blue-500" placeholder="Your phone number" />
                        </div>

                        <div>
                            <label className="block text-sm dark:text-white font-medium text-gray-700 mb-1">Date</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FaCalendar className="h-4 w-4 text-gray-400" />
                                </span>
                                <input type="date" required value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="pl-10 w-full dark:bg-gray-800 p-3 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block dark:text-white text-sm font-medium text-gray-700 mb-1">Time</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FaClock className="h-4 w-4 text-gray-400" />
                                </span>
                                <select required value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="pl-10 dark:bg-gray-800 p-3 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select time</option>
                                    {timeSlots.map((time) => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                                Confirm Booking
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;