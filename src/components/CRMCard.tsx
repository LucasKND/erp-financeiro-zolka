import { useState } from 'react';
import { MoreHorizontal, Mail, Phone, Edit, Trash2, CheckSquare, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CRMCard, useCRM } from '@/hooks/useCRM';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditarCartaoDialog } from '@/components/EditarCartaoDialog';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { GerenciarEtiquetasDialog } from '@/components/GerenciarEtiquetasDialog';

interface CRMCardProps {
  card: CRMCard;
  onRefetch: () => void;
}

export function CRMCardComponent({ card, onRefetch }: CRMCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [etiquetasOpen, setEtiquetasOpen] = useState(false);
  const { deleteCard } = useCRM();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    boxShadow: isDragging ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : undefined,
    scale: isDragging ? '1.02' : '1',
  };

  const handleDelete = async () => {
    try {
      await deleteCard(card.id);
      onRefetch();
      setDeleteOpen(false);
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditOpen(true);
  };

  const handleEtiquetasClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEtiquetasOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteOpen(true);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`hover:shadow-md transition-all duration-200 ${
          isDragging 
            ? 'cursor-grabbing shadow-2xl border-2 border-blue-300 bg-white' 
            : 'hover:scale-[1.01] cursor-grab'
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div 
              {...attributes}
              {...listeners}
              className={`flex-1 ${
                isDragging 
                  ? 'cursor-grabbing' 
                  : 'cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded p-1 -m-1 transition-colors'
              }`}
            >
              <h3 className="font-medium text-sm leading-tight">{card.title}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                <DropdownMenuItem 
                  onClick={handleEditClick}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleEtiquetasClick}
                  className="cursor-pointer"
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Gerenciar Etiquetas
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteClick} 
                  className="text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {card.contact_name && (
            <p className="text-xs text-muted-foreground mb-1">{card.contact_name}</p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            {card.email && (
              <div className="flex items-center">
                <Mail className="mr-1 h-3 w-3" />
                <span className="truncate max-w-[100px]">{card.email}</span>
              </div>
            )}
            {card.phone && (
              <div className="flex items-center">
                <Phone className="mr-1 h-3 w-3" />
                <span>{card.phone}</span>
              </div>
            )}
          </div>

          {card.project_summary && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {card.project_summary}
            </p>
          )}

          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((label) => (
                <Badge
                  key={label.id}
                  variant="secondary"
                  className="text-xs px-1 py-0"
                  style={{ 
                    backgroundColor: label.color + '20', 
                    color: label.color,
                    borderColor: label.color + '40'
                  }}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <CheckSquare className="mr-1 h-3 w-3" />
              <span>0/5</span>
            </div>
            <span>{new Date(card.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </CardContent>
      </Card>

      <EditarCartaoDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        card={card}
        onCardUpdated={onRefetch}
      />

      <GerenciarEtiquetasDialog
        open={etiquetasOpen}
        onOpenChange={setEtiquetasOpen}
        card={card}
        onUpdate={onRefetch}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir Cartão"
        description={`Tem certeza que deseja excluir o cartão "${card.title}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
      />
    </>
  );
}