import { createBrowserRouter } from 'react-router-dom'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
//import { Dashboard } from '../pages/Dashboard'
import { Home } from '../pages/Home'
import { ProtectedRoute } from '../components/ProtectedRoutes/ProtectedRoute'
import { AuthRedirect } from '../components/ProtectedRoutes/AuthRedirect'
import {StudentDashboard} from "@/components/DashboardPage/StudentDashboardPage.tsx";
import {LecturerDashboard} from "@/components/DashboardPage/LecturerDashboardPage.tsx";
import { CalendarPage } from '@/components/Calendar/CalendarPage.tsx'
export const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />
    },
    //przekierowanie dla niezalogowanych uzygtkownikow:
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
            }
        ]
    },

    //przekierowanie dla zalogowanych uzytkownikow (protected route)
    {
        element: <ProtectedRoute allowedRoles={["lecturer"]}/>,
        children : [
            {
                path: 'lecturer-dashboard',
                element: <LecturerDashboard />
                // path: 'student-dashboard',
                //  element: <StudentDashboard />
            },
            {
                path: 'lecturer-calendar',
                element: <CalendarPage />
            }
        ]
    },
    {
        element: <ProtectedRoute allowedRoles={["student"]}/>,
        children : [
            {
                path: 'student-dashboard',
                 element: <StudentDashboard />
            },
        ]
    },

]);