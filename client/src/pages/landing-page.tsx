import { Link } from "wouter";
import { Calendar, Clock, Sparkles, Star, Users, MapPin, Phone, Mail, Images, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { AboutInfo, Service, GalleryImage } from "@shared/schema";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch public data
  const { data: aboutInfo } = useQuery<AboutInfo>({
    queryKey: ["/api/public/about"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/public/services"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: galleryImages = [] } = useQuery<GalleryImage[]>({
    queryKey: ["/api/public/gallery"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get salon name from about info or use default
  const salonName = aboutInfo?.title || "Bella Studio";

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-pink-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{salonName}</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => scrollToSection('services')} 
                className="text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400 transition-colors"
              >
                Serviços
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400 transition-colors"
              >
                Sobre
              </button>
              <button 
                onClick={() => scrollToSection('gallery')} 
                className="text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400 transition-colors"
              >
                Galeria
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400 transition-colors"
              >
                Contato
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-3 pt-4">
                <button 
                  onClick={() => scrollToSection('services')} 
                  className="text-left text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400 transition-colors py-2"
                >
                  Serviços
                </button>
                <button 
                  onClick={() => scrollToSection('about')} 
                  className="text-left text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400 transition-colors py-2"
                >
                  Sobre
                </button>
                <button 
                  onClick={() => scrollToSection('gallery')} 
                  className="text-left text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400 transition-colors py-2"
                >
                  Galeria
                </button>
                <button 
                  onClick={() => scrollToSection('contact')} 
                  className="text-left text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400 transition-colors py-2"
                >
                  Contato
                </button>
                <div className="pt-2">
                  <Link href="/booking">
                    <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white">
                      <Calendar className="mr-2 h-4 w-4" />
                      Agendar Horário
                    </Button>
                  </Link>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Sua beleza,
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              {" "}nossa paixão
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {aboutInfo?.description || "Transforme seu visual com nossos serviços profissionais de beleza. Agende seu horário de forma rápida e fácil."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button size="lg" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Horário
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg"
              onClick={() => scrollToSection('services')}
            >
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
            Nossos Serviços
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Oferecemos uma experiência completa de beleza com profissionais qualificados e ambiente acolhedor.
          </p>
        </div>
        
        {services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => (
              <Card key={service.id} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Sparkles className="h-12 w-12 text-pink-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-2">{service.name}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Serviço profissional de qualidade
                  </p>
                  <div className="flex justify-center items-center space-x-4 text-sm">
                    <Badge variant="outline" className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {service.duration}min
                    </Badge>
                    <Badge className="bg-pink-600 text-white">
                      {Number(service.price).toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'AOA',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0 
                      })}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
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
        )}
      </section>

      {/* About Section */}
      {aboutInfo && (
        <section id="about" className="bg-gray-50 dark:bg-gray-800 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Sobre {salonName}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {aboutInfo.description}
                  </p>
                  
                  {aboutInfo.services && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Nossos Serviços Especializados
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {aboutInfo.services}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {aboutInfo.workingHours && (
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-pink-600" />
                          Horário de Funcionamento
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                          {aboutInfo.workingHours}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid gap-4">
                    {aboutInfo.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-pink-600" />
                        <span className="text-gray-600 dark:text-gray-300">{aboutInfo.phone}</span>
                      </div>
                    )}
                    
                    {aboutInfo.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-pink-600" />
                        <span className="text-gray-600 dark:text-gray-300">{aboutInfo.email}</span>
                      </div>
                    )}
                    
                    {aboutInfo.address && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-pink-600" />
                        <span className="text-gray-600 dark:text-gray-300">{aboutInfo.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {galleryImages.length > 0 && (
        <section id="gallery" className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Nossa Galeria
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Confira alguns dos nossos trabalhos e inspire-se para sua próxima transformação.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryImages.slice(0, 8).map((image) => (
              <Card key={image.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="aspect-square relative">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white p-4">
                      <h4 className="font-semibold mb-2">{image.title}</h4>
                      {image.description && (
                        <p className="text-sm opacity-90">{image.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {galleryImages.length > 8 && (
            <div className="text-center mt-8">
              <Button variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50">
                <Images className="mr-2 h-4 w-4" />
                Ver Mais Fotos
              </Button>
            </div>
          )}
        </section>
      )}

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
                <h4 className="text-xl font-bold">{salonName}</h4>
              </div>
              <p className="text-gray-400">
                {aboutInfo?.description || "Transformando vidas através da beleza e do bem-estar."}
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Contato</h5>
              <div className="space-y-2 text-gray-400">
                {aboutInfo?.phone ? (
                  <p>📞 {aboutInfo.phone}</p>
                ) : (
                  <p>📞 +244 923 456 789</p>
                )}
                {aboutInfo?.email ? (
                  <p>📧 {aboutInfo.email}</p>
                ) : (
                  <p>📧 contato@bellastudio.co.ao</p>
                )}
                {aboutInfo?.address ? (
                  <p>📍 {aboutInfo.address}</p>
                ) : (
                  <p>📍 Rua da Beleza, 123 - Luanda</p>
                )}
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Horário de Funcionamento</h5>
              <div className="space-y-2 text-gray-400">
                {aboutInfo?.workingHours ? (
                  <div className="whitespace-pre-line">{aboutInfo.workingHours}</div>
                ) : (
                  <>
                    <p>Segunda a Sexta: 9h às 18h</p>
                    <p>Sábado: 9h às 16h</p>
                    <p>Domingo: Fechado</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {salonName}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}