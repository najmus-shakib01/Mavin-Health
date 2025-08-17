import { createBrowserRouter } from "react-router-dom";
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
      }
    ],
  },
]);

export default Routes;
