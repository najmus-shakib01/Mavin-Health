import { createBrowserRouter } from "react-router-dom";
import MedicalAssistant from "../features/MedicalAssistant/MedicalAssistant";
import TermsOfService from "../pages/TermsOfService";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Main from "../layouts/Main";
import MedicalAssistantLayout from "../layouts/MedicalAssistantLayout";

const Routes = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/",
        element: <MedicalAssistantLayout />,
        children: [
          {
            index: true,
            element: <MedicalAssistant />,
          },
        ],
      },
      {
        path: "/terms-of-service",
        element: <TermsOfService />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
    ],
  },
]);

export default Routes;