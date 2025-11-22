import * as React from 'react';
import { Calendar, Clock, Users, BookOpen } from 'lucide-react';

// Import komponentów Layoutu
import  Header  from '../layout/Header';
import  Footer  from '../layout/Footer';

// Import komponentów UI
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';

// --- Main App Component ---

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white font-inter">
      {/* Tailwind configuration script and font styles - Zostawione dla samodzielnej demonstracji */}
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <Header /> {/* Zastąpiony pełny kod nagłówka */}

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <Badge variant="primaryOutline" className="mb-4">
            System rezerwacji konsultacji AGH
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Umów się na <span className="text-green-600">konsultacje</span> ze swoimi wykładowcami
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Przeglądaj dostępność wykładowców z Twoich przedmiotów, sprawdzaj ich plany i umawiaj się na konsultacje w
            dogodnym dla Ciebie terminie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="shadow-xl shadow-green-200/50">
              Przeglądaj wykładowców
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 bg-white"
            >
              Moje konsultacje
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600 mt-1">Twoich wykładowców</div>
            </div>
            <div className="text-center border-l border-r border-gray-200">
              <div className="text-3xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600 mt-1">Zaplanowane konsultacje</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">8</div>
              <div className="text-sm text-gray-600 mt-1">Przedmiotów w semestrze</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Wszystko w jednym miejscu</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">Zintegrowany system z Twoim kontem studenckim</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-green-500">
              <CardHeader className="text-center pb-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50">
                  <BookOpen className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-xl">Twoi wykładowcy</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Automatyczny dostęp do wykładowców z przedmiotów, na które jesteś zapisany w tym semestrze.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-orange-500">
              <CardHeader className="text-center pb-4">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-orange-50">
                  <Calendar className="h-7 w-7 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Dostępność w czasie rzeczywistym</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Zobacz aktualne godziny konsultacji i dostępne terminy każdego wykładowcy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-purple-500">
              <CardHeader className="text-center pb-4">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-purple-50">
                  <Clock className="h-7 w-7 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Przypomnienia</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Automatyczne powiadomienia o zbliżających się konsultacjach na email studencki.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Jak umówić konsultacje?</h2>
            <p className="text-lg md:text-xl text-gray-600">Prosty proces w trzech krokach</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-4">
              <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Wybierz wykładowcę</h3>
              <p className="text-gray-600">
                Z listy wykładowców z Twoich przedmiotów wybierz tego, z którym chcesz się skonsultować.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Sprawdź dostępność</h3>
              <p className="text-gray-600">
                Zobacz dostępne terminy konsultacji i wybierz ten, który najlepiej Ci odpowiada.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Potwierdź rezerwację</h3>
              <p className="text-gray-600">
                Kliknij wybrany termin, dodaj opcjonalnie temat konsultacji i potwierdź rezerwację.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Szybki dostęp</h2>
            <p className="text-lg md:text-xl text-gray-600">Najczęściej używane funkcje</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Najbliższe konsultacje</h3>
                <p className="text-sm text-gray-600">Zobacz zaplanowane spotkania</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Wszyscy wykładowcy</h3>
                <p className="text-sm text-gray-600">Przeglądaj listę wykładowców</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Moje przedmioty</h3>
                <p className="text-sm text-gray-600">Zobacz przedmioty w semestrze</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Historia</h3>
                <p className="text-sm text-gray-600">Poprzednie konsultacje</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ostatnia aktywność</h2>
          </div>

          <div className="space-y-4">
            <Card className="border-l-8 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Konsultacje z dr. Anną Nowak</h3>
                  <p className="text-sm text-gray-600">Matematyka dyskretna • Jutro, 14:00 • Pawilon D-10, sala 205</p>
                </div>
                <Badge variant="confirmed" className="mt-2 sm:mt-0">
                  Potwierdzone
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-l-8 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Nowe godziny konsultacji</h3>
                  <p className="text-sm text-gray-600">Prof. Jan Kowalski dodał nowe terminy na przyszły tydzień</p>
                </div>
                <Badge variant="new" className="mt-2 sm:mt-0">
                  Nowe
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-l-8 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Zakończone konsultacje</h3>
                  <p className="text-sm text-gray-600">Algorytmy i struktury danych z dr. Piotrem Wiśniewskim (Tydzień temu)</p>
                </div>
                <Badge variant="finished" className="mt-2 sm:mt-0">
                  Zakończone
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-green-700">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Gotowy na konsultacje?</h2>
          <p className="text-lg md:text-xl text-green-100 mb-8">
            Sprawdź dostępność swoich wykładowców i umów się na konsultacje już dziś.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-green-700 hover:bg-gray-100 shadow-xl">
              Przeglądaj wykładowców
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-green-600 hover:border-green-600 bg-transparent"
            >
              Moje konsultacje
            </Button>
          </div>
        </div>
      </section>

      <Footer /> {/* Zastąpiony pełny kod stopki */}
    </div>
  );
};

export default HomePage;