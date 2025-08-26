import { createBrowserRouter } from "react-router-dom";
import DoctorDetailsPage from "../features/DoctorList/DoctorDetailsPage";
import DoctorsListPage from "../features/DoctorList/DoctorsListPage";
import MedicalAssistant from "../features/MedicalAssistant/MedicalAssistant";
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
      }
    ],
  },
]);

export default Routes;
