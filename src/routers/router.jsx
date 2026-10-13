import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

const HomeLayout = lazy(() => import("../layout/HomeLayout"));
const DashBoardLayout = lazy(() => import("../layout/DashBoardLayout"));
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ErrorPage = lazy(() => import("../pages/ErrorPage"));
const AboutUs = lazy(() => import("../pages/AboutUs"));
const AllIssues = lazy(() => import("../pages/AllIssues"));
const CreateIssue = lazy(() => import("../pages/CreateIssue"));
const IssueDetails = lazy(() => import("../pages/IssueDetails"));
const EditIssue = lazy(() => import("../pages/EditIssue"));
const Contact = lazy(() => import("../pages/contact"));
const Support = lazy(() => import("../pages/support"));
const Overview = lazy(() => import("../pages/Overview"));
const MyIssues = lazy(() => import("../pages/MyIssues"));
const UserProfile = lazy(() => import("../pages/UserProfile"));
const UserPayments = lazy(() => import("../pages/UserPayments"));
const ManageUsers = lazy(() => import("../pages/ManageUsers"));
const ManageIssues = lazy(() => import("../pages/ManageIssues"));
const PaymentSuccess = lazy(() => import("../pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("../pages/PaymentCancel"));

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