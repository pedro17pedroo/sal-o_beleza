import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Filter, Receipt, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, parseCurrency } from "@/lib/format";

const transactionSchema = z.object({
  type: z.enum(["revenue", "expense"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  transactionDate: z.string().min(1, "Data é obrigatória"),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function CashFlowManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "revenue" | "expense">("all");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryValue, setCustomCategoryValue] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      category: "",
      amount: "",
      description: "",
      transactionDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  // Get financial summary for the selected month
  const { data: financialSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/financial/summary", selectedMonth],
    queryFn: async () => {
      const startOfMonth = new Date(selectedMonth + "-01");
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
      const response = await apiRequest(
        "GET",
        `/api/financial/summary?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`
      );
      return await response.json();
    },
  });

  // Get transactions for the selected month
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions", selectedMonth],
    queryFn: async () => {
      const startOfMonth = new Date(selectedMonth + "-01");
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
      const response = await apiRequest(
        "GET",
        `/api/transactions?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`
      );
      return await response.json();
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionForm) => {
      const response = await apiRequest(
        "POST",
        "/api/transactions",
        {
          ...data,
          amount: parseCurrency(data.amount),
          transactionDate: new Date(data.transactionDate).toISOString(),
        }
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsModalOpen(false);
      form.reset();
      setIsCustomCategory(false);
      setCustomCategoryValue("");
      toast({
        title: "Transação criada",
        description: "A transação foi registrada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar transação.",
        variant: "destructive",
      });
    },
  });



  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      service_payment: "Pagamento de Serviço",
      salary: "Salário",
      supplies: "Materiais",
      rent: "Aluguel",
      utilities: "Contas Básicas",
      other: "Outros",
    };
    // Return the mapped label if it exists, otherwise return the category as-is (for custom categories)
    return categories[category] || category;
  };

  const filteredTransactions = ((transactions as any) || []).filter((transaction: any) => {
    if (filterType === "all") return true;
    return transaction.type === filterType;
  });

  const onSubmit = (data: TransactionForm) => {
    createTransactionMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Controle de Caixa</h1>
          <p className="text-slate-600">Gerencie receitas e despesas do salão</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-40"
          />
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setIsCustomCategory(false);
              setCustomCategoryValue("");
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="revenue">Receita</SelectItem>
                            <SelectItem value="expense">Despesa</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        {!isCustomCategory ? (
                          <div className="space-y-2">
                            <Select 
                              onValueChange={(value) => {
                                if (value === "custom") {
                                  setIsCustomCategory(true);
                                  setCustomCategoryValue("");
                                  field.onChange("");
                                } else {
                                  field.onChange(value);
                                }
                              }} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {form.watch("type") === "revenue" ? (
                                  <>
                                    <SelectItem value="service_payment">Pagamento de Serviço</SelectItem>
                                    <SelectItem value="other">Outros</SelectItem>
                                    <SelectItem value="custom">+ Adicionar nova categoria</SelectItem>
                                  </>
                                ) : (
                                  <>
                                    <SelectItem value="salary">Salário</SelectItem>
                                    <SelectItem value="supplies">Materiais</SelectItem>
                                    <SelectItem value="rent">Aluguel</SelectItem>
                                    <SelectItem value="utilities">Contas Básicas</SelectItem>
                                    <SelectItem value="other">Outros</SelectItem>
                                    <SelectItem value="custom">+ Adicionar nova categoria</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                            {field.value && !["service_payment", "salary", "supplies", "rent", "utilities", "other"].includes(field.value) && (
                              <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded border">
                                Categoria personalizada: <span className="font-medium">{field.value}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2 h-auto p-1 text-slate-500 hover:text-slate-700"
                                  onClick={() => {
                                    setIsCustomCategory(true);
                                    setCustomCategoryValue(field.value);
                                  }}
                                >
                                  Editar
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              placeholder="Digite o nome da nova categoria"
                              value={customCategoryValue}
                              onChange={(e) => {
                                setCustomCategoryValue(e.target.value);
                                field.onChange(e.target.value);
                              }}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setIsCustomCategory(false);
                                  setCustomCategoryValue("");
                                  field.onChange("");
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                disabled={!customCategoryValue.trim()}
                                onClick={() => {
                                  if (customCategoryValue.trim()) {
                                    field.onChange(customCategoryValue.trim());
                                    setIsCustomCategory(false);
                                  }
                                }}
                              >
                                Confirmar
                              </Button>
                            </div>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0.00"
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input placeholder="Descrição da transação" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transactionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createTransactionMutation.isPending}>
                      {createTransactionMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Receitas</p>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency((financialSummary as any)?.totalRevenue || 0)}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Despesas</p>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency((financialSummary as any)?.totalExpenses || 0)}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Lucro Líquido</p>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className={`text-2xl font-bold ${((financialSummary as any)?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency((financialSummary as any)?.netIncome || 0)}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${((financialSummary as any)?.netIncome || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`w-6 h-6 ${((financialSummary as any)?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transações</CardTitle>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="revenue">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((transaction: any) => (
                <div key={transaction.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    transaction.type === 'revenue' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'revenue' ? (
                      <TrendingUp className={`w-6 h-6 text-green-600`} />
                    ) : (
                      <TrendingDown className={`w-6 h-6 text-red-600`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{transaction.description}</p>
                    <p className="text-sm text-slate-600">{getCategoryLabel(transaction.category)}</p>
                    <p className="text-xs text-slate-500">{formatDate(transaction.transactionDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'revenue' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                    </p>
                    <Badge variant={transaction.type === 'revenue' ? 'default' : 'secondary'}>
                      {transaction.type === 'revenue' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Nenhuma transação encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}