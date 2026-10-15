# UrbanFix – Public Infrastructure Issue Reporting System

**Live Site:**  
https://urban-fix-project-01.netlify.app/

## About the Project
UrbanFix is a digital platform that enables citizens to report, track, and resolve city infrastructure issues such as broken streetlights, potholes, water leakage, garbage overflow, and damaged footpaths. The system ensures transparency, reduces response time, and improves city service delivery by connecting citizens, staff, and admins efficiently.

---

## Key Features
1. **User-Friendly Interface:** Responsive design for mobile, tablet, and desktop.  
2. **Issue Reporting:** Citizens can submit issues with title, description, photo, location, and category.  
 
3. **Upvote System:** Logged-in users can upvote issues to highlight public importance; users cannot upvote their own issues.  
4. **Timeline Tracking:** Every issue has a timeline showing status updates, actions, and progress.  
5. **Boost Priority Feature:** Citizens can boost issue priority after successful payment; boosted issues appear at the top.  
8. **Premium Subscription:** Users can upgrade to premium for unlimited issue reporting.  
9. **Payments Integration:** Stripe payment system for boosting issues and subscriptions.  
10. **Search & Filter:** Server-side search and filtering by category, status, priority, and location.  
11. **Dashboard Analytics:** Citizens, Staff, and Admins get stats, charts, and summaries of issues and payments.  
12. **Sweet Alerts & Notifications:** All CRUD actions show interactive notifications for better UX.  

---

## Technologies Used
- **Frontend:** React, Tailwind CSS, DaisyUI, TanStack Query  
- **Backend:** Node.js, Express.js, MongoDB  
- **Authentication:** Firebase Authentication  
- **Payments:** Stripe API  
- **Deployment:** Firebase Hosting (client) & Vercel (server)  

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set the Firebase web configuration and image upload key. `VITE_API_URL` should be the API origin `https://urban-fix-server.vercel.app` (no path suffix); configure the same variable in the frontend deployment environment.
3. Start the client with `npm run dev`; run `npm run lint` and `npm run build` before deployment.

`VITE_API_URL` is shared by all API requests and falls back to `https://urban-fix-server.vercel.app` if omitted. Browser-exposed `VITE_*` values are included in the client bundle; never put server credentials (including MongoDB or Stripe secrets) in these variables. Configure those only in the backend hosting environment.

Netlify's SPA fallback is configured in [`public/_redirects`](./public/_redirects). The API server is maintained separately from this repository; `SITE_DOMAIN` accepts comma-separated allowed origins and defaults to the production Netlify origin. Keep MongoDB, Firebase Admin, and Stripe credentials in the server's hosting environment. Premium checkout pricing is enforced by the API (currently USD 100), which also verifies session ownership and payment before granting premium access. Verify API availability and deployment environment variables before publishing a new client deployment.

Protected API requests use the signed-in Firebase ID token, and the API requires a verified Firebase email. Email/password registration therefore sends a verification link before allowing the user into the app. Issue images are uploaded to the configured image service and the API stores their URL; new issue priority is currently assigned as `Normal` by the API.
