import React from 'react';

export function DashboardPage(){
    return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-green-600 mb-4">Witaj w Systemie!</h1>
      <p className="text-lg text-gray-700">Pomyślnie się zalogowano.</p>
      <p className="mt-4 text-sm text-gray-500">To jest Twoja strona główna.</p>
    </div>);
}