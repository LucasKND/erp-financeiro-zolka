import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CRMColumn as CRMColumnType, CRMCard } from '@/hooks/useCRM';
import { CRMCardComponent } from '@/components/CRMCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface CRMColumnProps {
  column: CRMColumnType;
  cards: CRMCard[];
  onAddCard: () => void;
  onRefetch: () => void;
}

export function CRMColumn({ column, cards, onAddCard, onRefetch }: CRMColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {column.name}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {cards.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddCard}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar cartão
          </Button>
        </CardHeader>
        <CardContent className="pt-0" ref={setNodeRef}>
          <div className="space-y-3 min-h-[400px] transition-all duration-200">
            <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
              {cards.map((card) => (
                <div 
                  key={card.id}
                  className="transition-all duration-200 ease-in-out"
                >
                  <CRMCardComponent
                    card={card}
                    onRefetch={onRefetch}
                  />
                </div>
              ))}
            </SortableContext>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}