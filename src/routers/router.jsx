import { createBrowserRouter } from "react-router";
import HomeLayout from "../layout/HomeLayout";
import DashBoardLayout from "../layout/DashBoardLayout";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ErrorPage from "../pages/ErrorPage";
import AboutUs from "../pages/AboutUs";
import AllIssues from "../pages/AllIssues";
import CreateIssue from "../pages/CreateIssue";
import IssueDetails from "../pages/IssueDetails";
import MyIssues from "../pages/MyIssues";
import EditIssue from "../pages/EditIssue";
import UserProfile from "../pages/UserProfile";
import UserPayments from "../pages/UserPayments";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentCancel from "../pages/PaymentCancel";
import Contact from "../pages/Contact";
import Support from "../pages/Support";
import Overview from "../pages/Overview";


import PrivateRoute from "./PrivateRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "about-us", element: <AboutUs /> },
      { path: "all-issues", element: <AllIssues /> },
      { path: "create-issue", element: <PrivateRoute><CreateIssue /></PrivateRoute> },
      { path: "issues/:id", element: <PrivateRoute><IssueDetails /></PrivateRoute> },

      // Dashboard routes
      {
        path: "dashboard",
        element: <PrivateRoute><DashBoardLayout /></PrivateRoute>,
        children: [
          { path: "my-issues", element: <MyIssues /> },
          { path: "overview", element: <Overview /> },
          { path: "my-payment", element: <UserPayments /> },
          { path: "profile", element: <UserProfile /> },
          { path: "edit-issue/:id", element: <EditIssue /> },
          { path: "payment-success", element: <PaymentSuccess /> },
          { path: "payment-cancel", element: <PaymentCancel /> },
          
        ],
      },
      {
        path: "contact",
        element: <Contact />
      },
      {
        path: "support",
        element: <Support />
      }
    ],
  },
]);
