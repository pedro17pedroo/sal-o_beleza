import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Images, Plus, Edit, Trash2 } from "lucide-react";
import GalleryModal from "@/components/modals/gallery-modal";

interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export default function GalleryPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete image");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Sucesso",
        description: "Imagem removida da galeria!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover imagem da galeria.",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "all", label: "Todas" },
    { value: "general", label: "Geral" },
    { value: "hair", label: "Cabelo" },
    { value: "nails", label: "Unhas" },
    { value: "facial", label: "Facial" },
    { value: "makeup", label: "Maquiagem" },
  ];

  const filteredImages = selectedCategory === "all" 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const handleEdit = (image: GalleryImage) => {
    setSelectedImage(image);
    setGalleryModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja remover esta imagem da galeria?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewImage = () => {
    setSelectedImage(null);
    setGalleryModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg aspect-square animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Images className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-slate-800">Galeria</h1>
        </div>
        
        <Button onClick={handleNewImage} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nova Imagem</span>
        </Button>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Images className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma imagem encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedCategory === "all" 
                ? "Ainda não há imagens na galeria." 
                : `Não há imagens na categoria ${categories.find(c => c.value === selectedCategory)?.label}.`
              }
            </p>
            <Button onClick={handleNewImage}>
              Adicionar Primeira Imagem
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(image)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-800 truncate">
                    {image.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant={image.isActive ? "default" : "secondary"}>
                      {image.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </div>
                {image.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {image.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {categories.find(c => c.value === image.category)?.label || image.category}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(image.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GalleryModal
        open={galleryModalOpen}
        onOpenChange={setGalleryModalOpen}
        image={selectedImage}
      />
    </div>
  );
}