import { createBrowserRouter } from "react-router-dom";
import HomeLayout from "../layout/HomeLayout";
import DashBoardLayout from "../layout/DashBoardLayout";
import PrivateRoute from "./PrivateRoute";

// Public pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ErrorPage from "../pages/ErrorPage";
import AboutUs from "../pages/AboutUs";
import AllIssues from "../pages/AllIssues";
import CreateIssue from "../pages/CreateIssue";
import IssueDetails from "../pages/IssueDetails";
import EditIssue from "../pages/EditIssue";
import Contact from "../pages/Contact";
import Support from "../pages/Support";

// Dashboard pages
import Overview from "../pages/Overview";
import MyIssues from "../pages/MyIssues";
import UserProfile from "../pages/UserProfile";
import UserPayments from "../pages/UserPayments";
import ManageUsers from "../pages/ManageUsers";
import ManageIssues from "../pages/ManageIssues";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentCancel from "../pages/PaymentCancel";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <ErrorPage />,
    children: [
      // ========== Public Routes ==========
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "about-us", element: <AboutUs /> },
      { path: "all-issues", element: <AllIssues /> },
      { path: "contact", element: <Contact /> },
      { path: "support", element: <Support /> },

      // ========== Protected Issue Routes ==========
      {
        path: "create-issue",
        element: (
          <PrivateRoute>
            <CreateIssue />
          </PrivateRoute>
        ),
      },
      {
        path: "issues/:id",
        element: (
          <PrivateRoute>
            <IssueDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "edit-issue/:id",
        element: (
          <PrivateRoute>
            <EditIssue />
          </PrivateRoute>
        ),
      },

      // ========== Dashboard Routes ==========
      {
        path: "dashboard",
        element: (
          <PrivateRoute>
            <DashBoardLayout />
          </PrivateRoute>
        ),
        children: [
          { index: true, element: <Overview /> },
          { path: "my-issues", element: <MyIssues /> },
          { path: "manage-users", element: <ManageUsers /> },
          { path: "manage-issues", element: <ManageIssues /> },
          { path: "my-payment", element: <UserPayments /> },
          { path: "profile", element: <UserProfile /> },
          { path: "payment-success", element: <PaymentSuccess /> },
          { path: "payment-cancel", element: <PaymentCancel /> },
        ],
      },
    ],
  },
]);