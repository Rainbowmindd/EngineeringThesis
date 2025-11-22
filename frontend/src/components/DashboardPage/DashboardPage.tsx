// import { Button } from "../components/ui/Button";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card";

export function DashboardPage() {
    return (
        <div className="p-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Twój Panel Użytkownika (Dashboard)</h2>
            <p className="text-lg text-green-600">Jesteś zalogowany!</p>
            <div className="mt-6 p-4 bg-white shadow-lg rounded-lg">
                <p>Tutaj znajdą się Twoje rezerwacje, dane profilowe i inne funkcje systemowe.</p>
            </div>
        </div>
    );
}