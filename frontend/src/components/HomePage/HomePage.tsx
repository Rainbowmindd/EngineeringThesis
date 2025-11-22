import {useEffect, useState} from "react";
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LogIn, UserPlus } from 'lucide-react';
import {logoout } from "../../api/auth";

export function HomePage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('authToken'));
    }, []);

    const handleLogout = async () => {
        try {
            await logoout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem('authToken');
            setIsLoggedIn(false);
            navigate('/');
        }
    };

    return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20">

                {/* Nagłówek i Akcje */}
                <header className="w-full max-w-4xl text-center mb-10">
                    <h1 className="text-5xl font-extrabold text-blue-700">Witaj w Systemie Rezerwacji AGH</h1>
                    <p className="text-xl text-gray-600 mt-3">Szybki dostęp do zasobów uczelni.</p>
                </header>

                {/* Panel Akcji */}
                <div className="flex space-x-6">
                    {isLoggedIn ? (
                        // Opcje dla ZALOGOWANEGO użytkownika
                        <>
                            <Link
                                to="/dashboard"
                                className="flex items-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-lg"
                            >
                                <span>Przejdź do Dashboardu</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition duration-200 shadow-lg"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Wyloguj</span>
                            </button>
                        </>
                    ) : (
                        // Opcje dla NIEZALOGOWANEGO użytkownika
                        <>
                            <Link
                                to="/login"
                                className="flex items-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg"
                            >
                                <LogIn className="h-5 w-5" />
                                <span>Zaloguj się</span>
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center space-x-2 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition duration-200 shadow-lg"
                            >
                                <UserPlus className="h-5 w-5" />
                                <span>Zarejestruj się</span>
                            </Link>
                        </>
                    )}
                </div>

            </div>
        );
    }