import { Link } from "wouter";
import { Calendar, Clock, Sparkles, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-pink-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bella Studio</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#services" className="text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400">
              Serviços
            </a>
            <a href="#about" className="text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400">
              Sobre
            </a>
            <a href="#contact" className="text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400">
              Contato
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Sua beleza,
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              {" "}nossa paixão
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Transforme seu visual com nossos serviços profissionais de beleza. 
            Agende seu horário de forma rápida e fácil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button size="lg" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Horário
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
              <Star className="mr-2 h-5 w-5" />
              Ver Serviços
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Por que escolher a Bella Studio?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Oferecemos uma experiência completa de beleza com profissionais qualificados e ambiente acolhedor.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Calendar className="h-12 w-12 text-pink-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Agendamento Online</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Agende seus horários de forma rápida e prática, 24 horas por dia.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-pink-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Profissionais Qualificados</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Nossa equipe é formada por especialistas em beleza e estética.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Clock className="h-12 w-12 text-pink-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Horários Flexíveis</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Funcionamos com horários que se adaptam à sua rotina.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronta para se sentir ainda mais bela?
          </h3>
          <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
            Agende seu horário agora e descubra por que somos a escolha favorita das nossas clientes.
          </p>
          <Link href="/booking">
            <Button size="lg" variant="secondary" className="bg-white text-pink-600 hover:bg-pink-50 px-8 py-4 text-lg">
              <Calendar className="mr-2 h-5 w-5" />
              Agendar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-pink-400" />
                <h4 className="text-xl font-bold">Bella Studio</h4>
              </div>
              <p className="text-gray-400">
                Transformando vidas através da beleza e do bem-estar.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Contato</h5>
              <div className="space-y-2 text-gray-400">
                <p>📞 (11) 99999-9999</p>
                <p>📧 contato@bellastudio.com</p>
                <p>📍 Rua da Beleza, 123 - São Paulo</p>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Horário de Funcionamento</h5>
              <div className="space-y-2 text-gray-400">
                <p>Segunda a Sexta: 9h às 18h</p>
                <p>Sábado: 9h às 16h</p>
                <p>Domingo: Fechado</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Bella Studio. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}