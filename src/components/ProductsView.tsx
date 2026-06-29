/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Package,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Barcode,
  Grid,
  FileText,
  Bookmark,
  Check,
  TrendingUp,
  Edit2
} from 'lucide-react';
import { Product, StockMovement, User, UserRole } from '../types';

interface ProductsViewProps {
  currentUser: User | null;
  products: Product[];
  stockMovements: StockMovement[];
  onSaveProduct: (product: any) => void;
  onRegisterStockMovement: (productId: string, type: 'entrada' | 'saida_manual' | 'ajuste', quantity: number, reason: string) => void;
}

export default function ProductsView({
  currentUser,
  products,
  stockMovements,
  onSaveProduct,
  onRegisterStockMovement
}: ProductsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<'estoque' | 'movimentacoes' | 'inventario'>('estoque');
  
  // Modals / Form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedProductForMovement, setSelectedProductForMovement] = useState<Product | null>(null);

  // Form Field States
  const [pId, setPId] = useState('');
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('Finalizador');
  const [pCode, setPCode] = useState('');
  const [pSupplier, setPSupplier] = useState('');
  const [pBuyPrice, setPBuyPrice] = useState(0);
  const [pSellPrice, setPSellPrice] = useState(0);
  const [pQuantity, setPQuantity] = useState(0);
  const [pMinStock, setPMinStock] = useState(5);
  const [pBarcode, setPBarcode] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pStatus, setPStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [pPhotoUrl, setPPhotoUrl] = useState('');

  // Stock Movement Fields
  const [moveType, setMoveType] = useState<'entrada' | 'saida_manual' | 'ajuste'>('entrada');
  const [moveQty, setMoveQty] = useState(1);
  const [moveReason, setMoveReason] = useState('');

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['todos', ...Array.from(list)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery)) ||
        p.supplier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleOpenAddForm = () => {
    setPId('');
    setPName('');
    setPCategory('Finalizador');
    setPCode(`PROD-${Math.floor(100 + Math.random() * 900)}`);
    setPSupplier('');
    setPBuyPrice(0);
    setPSellPrice(0);
    setPQuantity(0);
    setPMinStock(5);
    setPBarcode('');
    setPDescription('');
    setPStatus('ativo');
    setPPhotoUrl('https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=300');
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (prod: Product) => {
    if (!isAdmin) {
      alert('Apenas administradores podem alterar as configurações de produtos!');
      return;
    }
    setPId(prod.id);
    setPName(prod.name);
    setPCategory(prod.category);
    setPCode(prod.code);
    setPSupplier(prod.supplier);
    setPBuyPrice(prod.buyPrice);
    setPSellPrice(prod.sellPrice);
    setPQuantity(prod.quantity);
    setPMinStock(prod.minStock);
    setPBarcode(prod.barcode || '');
    setPDescription(prod.description);
    setPStatus(prod.status);
    setPPhotoUrl(prod.photoUrl || 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=300');
    setEditingProduct(prod);
    setIsFormOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || pBuyPrice <= 0 || pSellPrice <= 0) {
      alert('Nome, valor de compra e venda são obrigatórios!');
      return;
    }
    onSaveProduct({
      id: pId || undefined,
      name: pName,
      category: pCategory,
      code: pCode,
      supplier: pSupplier,
      buyPrice: parseFloat(pBuyPrice.toString()),
      sellPrice: parseFloat(pSellPrice.toString()),
      quantity: parseInt(pQuantity.toString(), 10),
      minStock: parseInt(pMinStock.toString(), 10),
      photoUrl: pPhotoUrl,
      barcode: pBarcode,
      description: pDescription,
      status: pStatus
    });
    setIsFormOpen(false);
  };

  const handleOpenMovementModal = (prod: Product) => {
    setSelectedProductForMovement(prod);
    setMoveType('entrada');
    setMoveQty(1);
    setMoveReason('');
    setIsMovementModalOpen(true);
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForMovement) return;
    if (moveQty <= 0) {
      alert('Quantidade inválida!');
      return;
    }
    onRegisterStockMovement(
      selectedProductForMovement.id,
      moveType,
      moveQty,
      moveReason || (moveType === 'entrada' ? 'Entrada manual de estoque' : moveType === 'saida_manual' ? 'Saída manual de estoque' : 'Ajuste de inventário')
    );
    setIsMovementModalOpen(false);
  };

  return (
    <div className="space-y-6" id="products_view">
      {/* Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            Controle de Estoque e Catálogo
          </h2>
          <p className="text-sm text-gray-500">
            Gerencie o catálogo de produtos comerciais, acompanhe alertas de estoque baixo e movimentações de entrada e saída.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAddForm}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('estoque')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'estoque'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Visualização Geral e Alertas
        </button>
        <button
          onClick={() => setActiveTab('movimentacoes')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'movimentacoes'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Histórico de Movimentações
        </button>
        <button
          onClick={() => setActiveTab('inventario')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'inventario'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Inventário Comercial (Margens)
        </button>
      </div>

      {activeTab === 'estoque' && (
        <>
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Pesquise por nome, código de barras, fornecedor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                      selectedCategory === cat
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat === 'todos' ? 'Todos os Produtos' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid Products Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(prod => {
              const isLowStock = prod.quantity <= prod.minStock;
              return (
                <div key={prod.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between overflow-hidden relative">
                  {/* Stock Level Warning Badges */}
                  {isLowStock && prod.status === 'ativo' && (
                    <div className="absolute top-3 left-3 bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                      <AlertTriangle className="h-3 w-3" /> Estoque Baixo ({prod.quantity})
                    </div>
                  )}

                  {/* Product Header Photo */}
                  <div className="h-44 w-full bg-gray-100 overflow-hidden relative">
                    <img
                      src={prod.photoUrl || 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=300'}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                      {prod.category}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-gray-400 font-bold tracking-wider">{prod.code}</span>
                        {prod.barcode && (
                          <span className="text-gray-400" title={`Código de barras: ${prod.barcode}`}>
                            <Barcode className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-2">{prod.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">"{prod.description}"</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-50">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Fornecedor:</span>
                        <span className="font-bold text-gray-800">{prod.supplier}</span>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Preço de Venda:</span>
                        <span className="font-extrabold text-purple-700">R$ {prod.sellPrice.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">Qtd Disponível:</span>
                        <span className={`font-extrabold px-2.5 py-0.5 rounded-full text-[11px] ${
                          isLowStock ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {prod.quantity} unidades
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2">
                    <button
                      onClick={() => handleOpenMovementModal(prod)}
                      className="flex-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 py-1.5 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center gap-1"
                    >
                      Mover Estoque
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenEditForm(prod)}
                        className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-all"
                        title="Editar Produto"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'movimentacoes' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase">Lista de Movimentações Recentes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/70 text-gray-500 border-b border-gray-100 text-xs uppercase font-semibold">
                  <th className="p-4">Produto</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4 text-center">Quantidade</th>
                  <th className="p-4">Data e Hora</th>
                  <th className="p-4">Motivo / Operação</th>
                  <th className="p-4">Registrado por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stockMovements.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-gray-900">{m.productName}</td>
                    <td className="p-4">
                      {m.type === 'entrada' && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <ArrowUp className="h-3 w-3" /> Entrada (Compra)
                        </span>
                      )}
                      {m.type === 'saida_automatica' && (
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <ArrowDown className="h-3 w-3" /> Saída (Venda PDV)
                        </span>
                      )}
                      {m.type === 'saida_manual' && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <ArrowDown className="h-3 w-3" /> Saída Manual
                        </span>
                      )}
                      {m.type === 'ajuste' && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Grid className="h-3 w-3" /> Ajuste / Inventário
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center font-extrabold text-gray-900">{m.quantity}</td>
                    <td className="p-4 text-gray-500 font-mono text-xs">{new Date(m.date).toLocaleString()}</td>
                    <td className="p-4 text-gray-600 text-xs italic">"{m.reason}"</td>
                    <td className="p-4 text-gray-700 text-xs font-semibold">{m.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventario' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-md font-bold text-gray-900">Resumo de Inventário e Lucratividade</h3>
              <p className="text-xs text-gray-500">Estimativas de margens e custos do estoque físico atual.</p>
            </div>
            <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-xl text-xs font-bold">
              Total de Itens: {products.length}
            </div>
          </div>

          {/* Margins Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Custo de Aquisição Total</span>
              <h4 className="text-xl font-extrabold text-gray-900 mt-1">
                R$ {products.reduce((sum, p) => sum + (p.buyPrice * p.quantity), 0).toFixed(2)}
              </h4>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Potencial de Venda Estimado</span>
              <h4 className="text-xl font-extrabold text-purple-700 mt-1">
                R$ {products.reduce((sum, p) => sum + (p.sellPrice * p.quantity), 0).toFixed(2)}
              </h4>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Margem de Lucro Bruto Estimada</span>
              <h4 className="text-xl font-extrabold text-emerald-900 mt-1">
                R$ {(
                  products.reduce((sum, p) => sum + (p.sellPrice * p.quantity), 0) -
                  products.reduce((sum, p) => sum + (p.buyPrice * p.quantity), 0)
                ).toFixed(2)}
              </h4>
            </div>
          </div>

          {/* Margin list per product */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-100">
                  <th className="p-3">Produto</th>
                  <th className="p-3">Valor Compra</th>
                  <th className="p-3">Valor Venda</th>
                  <th className="p-3 text-center">Margem R$</th>
                  <th className="p-3 text-center">Markup %</th>
                  <th className="p-3 text-center">Lucro Potencial Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => {
                  const margin = p.sellPrice - p.buyPrice;
                  const markup = ((margin / p.buyPrice) * 100);
                  const totalProfit = margin * p.quantity;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-semibold text-gray-900">{p.name}</td>
                      <td className="p-3 text-gray-600">R$ {p.buyPrice.toFixed(2)}</td>
                      <td className="p-3 text-gray-900 font-bold">R$ {p.sellPrice.toFixed(2)}</td>
                      <td className="p-3 text-center text-emerald-600 font-bold">R$ {margin.toFixed(2)}</td>
                      <td className="p-3 text-center text-indigo-600 font-mono font-bold">+{markup.toFixed(1)}%</td>
                      <td className="p-3 text-center text-gray-800 font-bold bg-gray-50/20">R$ {totalProfit.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Register Stock Movement */}
      {isMovementModalOpen && selectedProductForMovement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">
                Lançar Movimentação de Carga
              </h3>
              <button onClick={() => setIsMovementModalOpen(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Fechar</button>
            </div>

            <form onSubmit={handleMovementSubmit} className="p-5 space-y-4">
              <div className="bg-purple-50 p-3 rounded-xl">
                <span className="text-[10px] text-purple-800 font-bold uppercase">Produto Selecionado</span>
                <p className="text-sm font-bold text-purple-900 mt-0.5">{selectedProductForMovement.name}</p>
                <p className="text-xs text-purple-700 mt-0.5">Estoque Atual: {selectedProductForMovement.quantity} unidades</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Operação</label>
                <select
                  value={moveType}
                  onChange={(e) => setMoveType(e.target.value as any)}
                  className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="entrada">Entrada (Aumento de Carga)</option>
                  <option value="saida_manual">Saída Manual (Avaria, Perda, Consumo)</option>
                  <option value="ajuste">Ajuste Direto de Inventário</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Quantidade</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={moveQty}
                  onChange={(e) => setMoveQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Motivo / Notas</label>
                <input
                  type="text"
                  placeholder="Ex: Compra de reposição via fornecedor principal"
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="bg-white hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Product */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">
                {pId ? 'Editar Detalhes do Produto' : 'Cadastrar Novo Produto Comercial'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Fechar</button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pomada Modeladora"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Categoria</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="Finalizador">Finalizador</option>
                    <option value="Barba">Barba</option>
                    <option value="Shampoo">Shampoo</option>
                    <option value="Acessório">Acessório</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Código de Referência</label>
                  <input
                    type="text"
                    placeholder="PM-001"
                    value={pCode}
                    onChange={(e) => setPCode(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Código de Barras</label>
                  <input
                    type="text"
                    placeholder="789..."
                    value={pBarcode}
                    onChange={(e) => setPBarcode(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fornecedor principal</label>
                  <input
                    type="text"
                    placeholder="Ex: Barber Corp"
                    value={pSupplier}
                    onChange={(e) => setPSupplier(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">URL da Imagem</label>
                  <input
                    type="text"
                    placeholder="Insira link da imagem"
                    value={pPhotoUrl}
                    onChange={(e) => setPPhotoUrl(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Preço de Compra (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pBuyPrice}
                    onChange={(e) => setPBuyPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pSellPrice}
                    onChange={(e) => setPSellPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    value={pQuantity}
                    disabled={!!pId} // Na edição alteramos via Mover Estoque
                    onChange={(e) => setPQuantity(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Alerta Mínimo de Estoque</label>
                  <input
                    type="number"
                    value={pMinStock}
                    onChange={(e) => setPMinStock(parseInt(e.target.value, 10) || 5)}
                    className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-sm font-semibold">
                      <input type="radio" name="status" checked={pStatus === 'ativo'} onChange={() => setPStatus('ativo')} />
                      Ativo no catálogo
                    </label>
                    <label className="flex items-center gap-1.5 text-sm font-semibold">
                      <input type="radio" name="status" checked={pStatus === 'inativo'} onChange={() => setPStatus('inativo')} />
                      Ocultar / Inativo
                    </label>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Descrição</label>
                  <textarea
                    placeholder="Detalhes sobre a pomada..."
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:ring-1 focus:ring-purple-600 focus:outline-none h-16"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
