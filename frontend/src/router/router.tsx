import { createBrowserRouter } from 'react-router-dom'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
//import { Dashboard } from '../pages/Dashboard'
import { Home } from '../pages/Home'
import { ProtectedRoute, AuthRedirect } from '../components/ProtectedRoutes/ProtectedRoute'
import {StudentDashboard} from "@/components/DashboardPage/StudentDashboardPage.tsx";
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
        element: <ProtectedRoute/>,
        children : [
            {
                path: 'student-dashboard',
                 element: <StudentDashboard />
            }
        ]
    },

]);