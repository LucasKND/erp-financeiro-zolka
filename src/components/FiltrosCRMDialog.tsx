import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCRM } from "@/hooks/useCRM";

export interface CRMFilters {
  search: string;
  columns: string[];
  labels: string[];
  dateRange: {
    start: string;
    end: string;
  };
  hasEmail: boolean;
  hasPhone: boolean;
}

interface FiltrosCRMDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CRMFilters;
  onFiltersChange: (filters: CRMFilters) => void;
}

export function FiltrosCRMDialog({ 
  open, 
  onOpenChange, 
  filters, 
  onFiltersChange 
}: FiltrosCRMDialogProps) {
  const { columns, labels } = useCRM();
  const [tempFilters, setTempFilters] = useState<CRMFilters>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    const emptyFilters: CRMFilters = {
      search: "",
      columns: [],
      labels: [],
      dateRange: { start: "", end: "" },
      hasEmail: false,
      hasPhone: false,
    };
    setTempFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    onOpenChange(false);
  };

  const updateFilter = (key: keyof CRMFilters, value: any) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleColumn = (columnId: string) => {
    const newColumns = tempFilters.columns.includes(columnId)
      ? tempFilters.columns.filter(id => id !== columnId)
      : [...tempFilters.columns, columnId];
    updateFilter('columns', newColumns);
  };

  const toggleLabel = (labelId: string) => {
    const newLabels = tempFilters.labels.includes(labelId)
      ? tempFilters.labels.filter(id => id !== labelId)
      : [...tempFilters.labels, labelId];
    updateFilter('labels', newLabels);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtros Avançados</DialogTitle>
          <DialogDescription>
            Configure os filtros para visualizar os cartões desejados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Busca por texto */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar por texto</Label>
            <Input
              id="search"
              value={tempFilters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Buscar em títulos, nomes, emails..."
            />
          </div>

          {/* Filtrar por colunas */}
          <div className="space-y-2">
            <Label>Filtrar por colunas</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {columns.map((column) => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`column-${column.id}`}
                    checked={tempFilters.columns.includes(column.id)}
                    onCheckedChange={() => toggleColumn(column.id)}
                  />
                  <Label htmlFor={`column-${column.id}`} className="text-sm">
                    {column.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Filtrar por etiquetas */}
          <div className="space-y-2">
            <Label>Filtrar por etiquetas</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {labels.map((label) => (
                <div key={label.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`label-${label.id}`}
                    checked={tempFilters.labels.includes(label.id)}
                    onCheckedChange={() => toggleLabel(label.id)}
                  />
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{ 
                      backgroundColor: label.color + '20', 
                      color: label.color,
                      borderColor: label.color + '40'
                    }}
                  >
                    {label.name}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Período de criação */}
          <div className="space-y-2">
            <Label>Período de criação</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start-date" className="text-xs">Data inicial</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={tempFilters.dateRange.start}
                  onChange={(e) => updateFilter('dateRange', { 
                    ...tempFilters.dateRange, 
                    start: e.target.value 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-xs">Data final</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={tempFilters.dateRange.end}
                  onChange={(e) => updateFilter('dateRange', { 
                    ...tempFilters.dateRange, 
                    end: e.target.value 
                  })}
                />
              </div>
            </div>
          </div>

          {/* Filtros de contato */}
          <div className="space-y-2">
            <Label>Informações de contato</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-email"
                  checked={tempFilters.hasEmail}
                  onCheckedChange={(checked) => updateFilter('hasEmail', checked)}
                />
                <Label htmlFor="has-email" className="text-sm">
                  Apenas com email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-phone"
                  checked={tempFilters.hasPhone}
                  onCheckedChange={(checked) => updateFilter('hasPhone', checked)}
                />
                <Label htmlFor="has-phone" className="text-sm">
                  Apenas com telefone
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}