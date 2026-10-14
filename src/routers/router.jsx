import { lazy, Suspense, memo } from "react";
import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

// Layouts
const HomeLayout = lazy(() => import("../layout/HomeLayout"));
const DashBoardLayout = lazy(() => import("../layout/DashBoardLayout"));

// Public pages
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const AboutUs = lazy(() => import("../pages/AboutUs"));
const AllIssues = lazy(() => import("../pages/AllIssues"));
const Contact = lazy(() => import("../pages/contact"));
const Support = lazy(() => import("../pages/support"));

// Issue pages
const CreateIssue = lazy(() => import("../pages/CreateIssue"));
const IssueDetails = lazy(() => import("../pages/IssueDetails"));
const EditIssue = lazy(() => import("../pages/EditIssue"));

// Dashboard pages
const Overview = lazy(() => import("../pages/Overview"));
const MyIssues = lazy(() => import("../pages/MyIssues"));
const UserProfile = lazy(() => import("../pages/UserProfile"));
const UserPayments = lazy(() => import("../pages/UserPayments"));
const ManageUsers = lazy(() => import("../pages/ManageUsers"));
const ManageIssues = lazy(() => import("../pages/ManageIssues"));
const PaymentSuccess = lazy(() => import("../pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("../pages/PaymentCancel"));

// Error page
const ErrorPage = lazy(() => import("../pages/ErrorPage"));

const RouteLoader = memo(function RouteLoader() {
  return (
    <main
      className="grid min-h-[60vh] place-items-center bg-base-100 px-4"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-sm font-medium text-base-content/60">
          Loading page...
        </p>
      </div>
    </main>
  );
});

const withSuspense = (element) => (
  <Suspense fallback={<RouteLoader />}>{element}</Suspense>
);

const withAuth = (element) => (
  <PrivateRoute>{withSuspense(element)}</PrivateRoute>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(<HomeLayout />),
    errorElement: withSuspense(<ErrorPage />),
    children: [
      // Public routes
      {
        index: true,
        element: withSuspense(<Home />),
      },
      {
        path: "login",
        element: withSuspense(<Login />),
      },
      {
        path: "register",
        element: withSuspense(<Register />),
      },
      {
        path: "about-us",
        element: withSuspense(<AboutUs />),
      },
      {
        path: "all-issues",
        element: withSuspense(<AllIssues />),
      },
      {
        path: "contact",
        element: withSuspense(<Contact />),
      },
      {
        path: "support",
        element: withSuspense(<Support />),
      },

      // Protected issue routes
      {
        path: "create-issue",
        element: withAuth(<CreateIssue />),
      },
      {
        path: "issues/:id",
        element: withAuth(<IssueDetails />),
      },
      {
        path: "edit-issue/:id",
        element: withAuth(<EditIssue />),
      },

      // Protected dashboard routes
      {
        path: "dashboard",
        element: withAuth(<DashBoardLayout />),
        children: [
          {
            index: true,
            element: withSuspense(<Overview />),
          },
          {
            path: "my-issues",
            element: withSuspense(<MyIssues />),
          },
          {
            path: "manage-users",
            element: withSuspense(<ManageUsers />),
          },
          {
            path: "manage-issues",
            element: withSuspense(<ManageIssues />),
          },
          {
            path: "my-payment",
            element: withSuspense(<UserPayments />),
          },
          {
            path: "profile",
            element: withSuspense(<UserProfile />),
          },
          {
            path: "payment-success",
            element: withSuspense(<PaymentSuccess />),
          },
          {
            path: "payment-cancel",
            element: withSuspense(<PaymentCancel />),
          },
        ],
      },
    ],
  },
]);