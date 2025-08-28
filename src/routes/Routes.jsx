import { createBrowserRouter } from "react-router-dom";
import ClinicDetailsPage from "../features/Clinics/ClinicDetailsPage";
import ClinicsPage from "../features/Clinics/ClinicsPage";
import ClinicsSpecialitiesProfileView from "../features/Clinics/ClinicsSpecialitiesProfileView";
import DoctorDetailsPage from "../features/DoctorList/DoctorDetailsPage";
import DoctorsListPage from "../features/DoctorList/DoctorsListPage";
import MedicalAssistant from "../features/MedicalAssistant/MedicalAssistant";
import BookingSuccessPage from "../features/Practitioners/BookingSuccessPage";
import PractitionersDetails from "../features/Practitioners/PractitionersDetails";
import PractitionersPage from "../features/Practitioners/PractitionersPage";
import Main from "../layouts/Main";

const Routes = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/",
        element: <MedicalAssistant />,
      },
      {
        path: "/doctors",
        element: <DoctorsListPage />,
      },
      { 
        path: "/doctors/list", 
        element: <DoctorsListPage /> 
      },
      {
        path: "/doctors/:id",   
        element: <DoctorDetailsPage />,
      },
      {
        path: "/practitioners",
        element: <PractitionersPage />,
      },
      {
        path: "/practitioners/:type/:id",
        element: <PractitionersDetails />,
      },
      {
        path: "/clinics",
        element: <ClinicsPage />,
      },
      {
        path: "/clinics/:id",
        element: <ClinicDetailsPage />,
      },
      {
        path: "/clinics/:clinicId/practitioners/:practitionerId",
        element: <ClinicsSpecialitiesProfileView />, 
      },
      {
        path: "/booking-success",
        element: <BookingSuccessPage />,
      }
    ],
  },
]);

export default Routes;