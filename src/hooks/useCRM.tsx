import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface CRMColumn {
  id: string;
  company_id: string;
  name: string;
  position: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CRMLabel {
  id: string;
  company_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface CRMCard {
  id: string;
  company_id: string;
  column_id: string;
  title: string;
  description?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  project_summary?: string;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  labels?: CRMLabel[];
}

export interface CRMChecklist {
  id: string;
  card_id: string;
  title: string;
  created_at: string;
  items: CRMChecklistItem[];
}

export interface CRMChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export const useCRM = () => {
  const [columns, setColumns] = useState<CRMColumn[]>([]);
  const [cards, setCards] = useState<CRMCard[]>([]);
  const [labels, setLabels] = useState<CRMLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchColumns = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_columns')
        .select('*')
        .order('position');

      if (error) throw error;
      setColumns(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar colunas:', error);
      toast({
        title: "Erro ao carregar colunas",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_cards')
        .select(`
          *,
          labels:crm_card_labels(
            label:crm_labels(*)
          )
        `)
        .order('position');

      if (error) throw error;
      
      // Transform the data to include labels array
      const transformedCards = data?.map(card => ({
        ...card,
        labels: card.labels?.map((l: any) => l.label) || []
      })) || [];
      
      setCards(transformedCards);
    } catch (error: any) {
      console.error('Erro ao buscar cartões:', error);
      toast({
        title: "Erro ao carregar cartões",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchLabels = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_labels')
        .select('*')
        .order('name');

      if (error) throw error;
      setLabels(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar etiquetas:', error);
    }
  };

  const initializeCRMData = async () => {
    try {
      // First check if columns exist
      const { data: existingColumns } = await supabase
        .from('crm_columns')
        .select('*')
        .limit(1);

      if (!existingColumns || existingColumns.length === 0) {
        // Initialize CRM data for the company
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user?.id)
          .single();

        if (profile?.company_id) {
          const { error } = await supabase.rpc('initialize_crm_data', {
            company_uuid: profile.company_id
          });

          if (error) throw error;
        }
      }
    } catch (error: any) {
      console.error('Erro ao inicializar dados do CRM:', error);
    }
  };

  const createCard = async (cardData: Partial<CRMCard>) => {
    if (!user) return;

    try {
      // Get user's company_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        throw new Error('Company not found');
      }

      // Filter out properties that shouldn't be in the insert and ensure required fields
      const { id, labels, created_at, updated_at, ...cleanData } = cardData;
      
      const insertData = {
        title: cleanData.title || '',
        column_id: cleanData.column_id || '',
        company_id: profile.company_id,
        created_by: user.id,
        position: 0,
        ...(cleanData.description && { description: cleanData.description }),
        ...(cleanData.contact_name && { contact_name: cleanData.contact_name }),
        ...(cleanData.email && { email: cleanData.email }),
        ...(cleanData.phone && { phone: cleanData.phone }),
        ...(cleanData.project_summary && { project_summary: cleanData.project_summary }),
      };
      
      const { data, error } = await supabase
        .from('crm_cards')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Create default checklist
      const { error: checklistError } = await supabase
        .from('crm_checklists')
        .insert({
          card_id: data.id,
          title: 'Entregáveis do Projeto'
        });

      if (checklistError) console.error('Erro ao criar checklist:', checklistError);

      // Add default checklist items
      const defaultItems = [
        'Briefing',
        'Design (Mockup)',
        'Desenvolvimento',
        'Revisão Final',
        'Entrega e Treinamento'
      ];

      const { data: checklist } = await supabase
        .from('crm_checklists')
        .select('id')
        .eq('card_id', data.id)
        .single();

      if (checklist) {
        const items = defaultItems.map((title, index) => ({
          checklist_id: checklist.id,
          title,
          position: index
        }));

        await supabase
          .from('crm_checklist_items')
          .insert(items);
      }

      await fetchCards();
      
      toast({
        title: "Cartão criado!",
        description: "Novo cartão adicionado com sucesso.",
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao criar cartão:', error);
      toast({
        title: "Erro ao criar cartão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateCard = async (cardId: string, updates: Partial<CRMCard>) => {
    try {
      const { error } = await supabase
        .from('crm_cards')
        .update(updates)
        .eq('id', cardId);

      if (error) throw error;
      await fetchCards();
    } catch (error: any) {
      console.error('Erro ao atualizar cartão:', error);
      toast({
        title: "Erro ao atualizar cartão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('crm_cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;
      await fetchCards();
      
      toast({
        title: "Cartão removido!",
        description: "Cartão removido com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao remover cartão:', error);
      toast({
        title: "Erro ao remover cartão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveCard = async (cardId: string, newColumnId: string, newPosition: number) => {
    try {
      const { error } = await supabase
        .from('crm_cards')
        .update({
          column_id: newColumnId,
          position: newPosition
        })
        .eq('id', cardId);

      if (error) throw error;
      await fetchCards();
    } catch (error: any) {
      console.error('Erro ao mover cartão:', error);
      toast({
        title: "Erro ao mover cartão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await initializeCRMData();
        await Promise.all([fetchColumns(), fetchCards(), fetchLabels()]);
        setLoading(false);
      };
      
      loadData();
    }
  }, [user]);

  return {
    columns,
    cards,
    labels,
    loading,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    refetch: async () => {
      await Promise.all([fetchColumns(), fetchCards(), fetchLabels()]);
    }
  };
};