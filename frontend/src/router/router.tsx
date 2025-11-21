import { createBrowserRouter } from 'react-router-dom'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { DashboardPage } from '../components/DashboardPage/DashboardPage.tsx'
export const router = createBrowserRouter([
    {
        path: 'dashboard',
        element: <DashboardPage />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    }
])