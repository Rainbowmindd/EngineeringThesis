import { createBrowserRouter } from 'react-router-dom'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { Home } from '../pages/Home'
import { ProtectedRoute } from '../components/ProtectedRoutes/ProtectedRoute'
import { AuthRedirect } from '../components/ProtectedRoutes/AuthRedirect'
import {StudentDashboard} from "@/components/DashboardPage/StudentDashboardPage.tsx";
import {LecturerDashboard} from "@/components/DashboardPage/LecturerDashboardPage.tsx";
import { CalendarPage } from '@/components/Calendar/CalendarPage.tsx'
import ForgotPasswordPage from "@/components/LoginPage/ForgotPasswordPage.tsx";
import ResetPasswordPage from '@/components/LoginPage/ResetPasswordConfirmPage.tsx';
import OAuth2RedirectHandler from "@/components/OAuth2/OAuth2Page.tsx";
import {ReservationsPage} from "@/components/ReservationsPage/ReservationsPage.tsx";
import {AdminPage} from "@/components/AdminPage/AdminPage.tsx";
import LecturerReservationsPage from "@/components/LecturerReservationsPage/LecturerReservationsPage.tsx"; // ✅ DODAJ

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />
    },
    // Przekierowanie dla niezalogowanych użytkowników:
    {
        element: <AuthRedirect/>,
        children: [
            {
                path: '/login',
                element: <Login/>
            },
            {
                path: '/register',
                element: <Register/>
            },
            {
                path:'/password-reset',
                element: <ForgotPasswordPage />
            },
            {
                path:'/password-reset-confirm/:uid/:token',
                element: <ResetPasswordPage />
            },
            {
                path: '/oauth2/redirect',
                element: <OAuth2RedirectHandler />
            }
        ]
    },

    // Przekierowanie dla zalogowanych użytkowników - LECTURER
    {
        element: <ProtectedRoute allowedRoles={["lecturer"]}/>,
        children : [
            {
                path: 'lecturer-dashboard',
                element: <LecturerDashboard />
            },
            {
                path: 'lecturer-calendar',
                element: <CalendarPage />
            },
            {
                path: 'lecturer-reservations',
                element: <LecturerReservationsPage />
            }
        ]
    },

    // Przekierowanie dla zalogowanych użytkowników - STUDENT
    {
        element: <ProtectedRoute allowedRoles={["student"]}/>,
        children : [
            {
                path: 'student-dashboard',
                 element: <StudentDashboard />
            },
            {
                path: 'student-reservations',
                element: <ReservationsPage />
            }
        ]
    },

    // Admin
    {
        element: <ProtectedRoute allowedRoles={[]} />,
        children : [
            {
                path:'admin-panel',
                element: <AdminPage/>
            }
        ]
    }
]);