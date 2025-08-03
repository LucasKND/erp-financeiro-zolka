import { useState } from 'react';
import { Plus, Search, Filter, UserPlus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCRM, CRMCard } from '@/hooks/useCRM';
import { CRMColumn } from '@/components/CRMColumn';
import { NovoCartaoDialog } from '@/components/NovoCartaoDialog';
import { GerenciarColunasDialog } from '@/components/GerenciarColunasDialog';
import { FiltrosCRMDialog, CRMFilters } from '@/components/FiltrosCRMDialog';
import { GerenciarEtiquetasDialog } from '@/components/GerenciarEtiquetasDialog';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { CRMCardComponent } from '@/components/CRMCard';

export default function CRM() {
  const { columns, cards, labels, loading, moveCard, refetch } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCard, setActiveCard] = useState<CRMCard | null>(null);
  const [novoCartaoOpen, setNovoCartaoOpen] = useState(false);
  const [gerenciarColunasOpen, setGerenciarColunasOpen] = useState(false);
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [etiquetasOpen, setEtiquetasOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [filters, setFilters] = useState<CRMFilters>({
    search: '',
    columns: [],
    labels: [],
    dateRange: { start: '', end: '' },
    hasEmail: false,
    hasPhone: false,
  });

  // Configurar sensores para melhor responsividade
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Só ativa o drag após mover 8px
      },
    })
  );

  const filteredCards = cards.filter(card => {
    // Filtro por busca textual
    const searchMatch = !filters.search || 
      card.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      card.contact_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      card.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      card.project_summary?.toLowerCase().includes(filters.search.toLowerCase());
    
    // Filtro por colunas
    const columnMatch = filters.columns.length === 0 || filters.columns.includes(card.column_id);
    
    // Filtro por etiquetas
    const labelMatch = filters.labels.length === 0 || 
      card.labels?.some(label => filters.labels.includes(label.id));
    
    // Filtro por período
    const dateMatch = (!filters.dateRange.start || new Date(card.created_at) >= new Date(filters.dateRange.start)) &&
      (!filters.dateRange.end || new Date(card.created_at) <= new Date(filters.dateRange.end));
    
    // Filtro por informações de contato
    const emailMatch = !filters.hasEmail || (card.email && card.email.trim() !== '');
    const phoneMatch = !filters.hasPhone || (card.phone && card.phone.trim() !== '');
    
    return searchMatch && columnMatch && labelMatch && dateMatch && emailMatch && phoneMatch;
  });

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
        <div>
          <Button onClick={() => setNovoCartaoOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
          <Button variant="outline" onClick={() => setGerenciarColunasOpen(true)} className="ml-2">
            <Settings className="mr-2 h-4 w-4" />
            Gerenciar Colunas
          </Button>
          <Button variant="outline" onClick={() => setEtiquetasOpen(true)} className="ml-2">
            <Settings className="mr-2 h-4 w-4" />
            Etiquetas
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setFiltrosOpen(true)}>
          <Filter className="mr-2 h-4 w-4" />
          Filtros Avançados
          {(filters.columns.length > 0 || filters.labels.length > 0 || filters.dateRange.start || filters.hasEmail || filters.hasPhone) && (
            <Badge variant="secondary" className="ml-2">
              {[...filters.columns, ...filters.labels, filters.dateRange.start && '📅', filters.hasEmail && '📧', filters.hasPhone && '📞'].filter(Boolean).length}
            </Badge>
          )}
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
        sensors={sensors}
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
        
        {/* DragOverlay para mostrar o card sendo arrastado */}
        <DragOverlay
          adjustScale={false}
          style={{
            transformOrigin: '0 0',
          }}
        >
          {activeCard ? (
            <div className="rotate-3 opacity-95">
              <CRMCardComponent 
                card={activeCard} 
                onRefetch={refetch}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <NovoCartaoDialog
        open={novoCartaoOpen}
        onOpenChange={setNovoCartaoOpen}
        preSelectedColumnId={selectedColumnId}
        onCardCreated={refetch}
      />

      <GerenciarColunasDialog
        open={gerenciarColunasOpen}
        onOpenChange={setGerenciarColunasOpen}
      />

      <FiltrosCRMDialog
        open={filtrosOpen}
        onOpenChange={setFiltrosOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <GerenciarEtiquetasDialog
        open={etiquetasOpen}
        onOpenChange={setEtiquetasOpen}
        onUpdate={refetch}
      />
    </div>
  );
}