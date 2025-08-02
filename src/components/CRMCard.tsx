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
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    await deleteCard(card.id);
    onRefetch();
    setDeleteOpen(false);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-sm leading-tight">{card.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEtiquetasOpen(true)}>
                  <Tag className="mr-2 h-4 w-4" />
                  Gerenciar Etiquetas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
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