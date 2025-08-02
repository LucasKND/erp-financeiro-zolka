import { useState } from 'react';
import { Plus, Search, Filter, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCRM, CRMCard } from '@/hooks/useCRM';
import { CRMColumn } from '@/components/CRMColumn';
import { NovoCartaoDialog } from '@/components/NovoCartaoDialog';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

export default function CRM() {
  const { columns, cards, labels, loading, moveCard, refetch } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCard, setActiveCard] = useState<CRMCard | null>(null);
  const [novoCartaoOpen, setNovoCartaoOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');

  const filteredCards = cards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCardsByColumn = (columnId: string) => {
    return filteredCards
      .filter(card => card.column_id === columnId)
      .sort((a, b) => a.position - b.position);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find(c => c.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    // Check if dropping over a column or card
    const targetColumn = columns.find(col => col.id === overId);
    let newColumnId = targetColumn?.id;

    if (!newColumnId) {
      // Dropping over a card - find the column of that card
      const targetCard = cards.find(card => card.id === overId);
      newColumnId = targetCard?.column_id;
    }

    if (!newColumnId) return;

    const cardsInColumn = getCardsByColumn(newColumnId);
    const newPosition = cardsInColumn.length;

    await moveCard(cardId, newColumnId, newPosition);
    setActiveCard(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  const handleAddCard = (columnId: string) => {
    setSelectedColumnId(columnId);
    setNovoCartaoOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">CRM</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[600px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">CRM</h2>
          <p className="text-muted-foreground">
            Gerencie seus clientes e projetos com o quadro Kanban
          </p>
        </div>
        <Button onClick={() => setNovoCartaoOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className="flex space-x-2 mb-4">
        {labels.map((label) => (
          <Badge
            key={label.id}
            variant="secondary"
            style={{ backgroundColor: label.color + '20', color: label.color }}
          >
            {label.name}
          </Badge>
        ))}
      </div>

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex space-x-4 overflow-x-auto pb-4">
          <SortableContext items={columns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
            {columns.map((column) => (
              <CRMColumn
                key={column.id}
                column={column}
                cards={getCardsByColumn(column.id)}
                onAddCard={() => handleAddCard(column.id)}
                onRefetch={refetch}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <NovoCartaoDialog
        open={novoCartaoOpen}
        onOpenChange={setNovoCartaoOpen}
        preSelectedColumnId={selectedColumnId}
        onCardCreated={refetch}
      />
    </div>
  );
}