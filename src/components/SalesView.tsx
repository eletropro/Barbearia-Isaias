/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Trash2,
  Percent,
  CreditCard,
  Printer,
  Sparkles,
  Search,
  Plus,
  Minus,
  CheckCircle,
  FileText,
  DollarSign,
  User,
  X
} from 'lucide-react';
import { Client, Product, Service, User as BarberUser, SaleItem, PaymentMethod } from '../types';

interface SalesViewProps {
  currentUser: BarberUser | null;
  clients: Client[];
  products: Product[];
  services: Service[];
  barbers: BarberUser[];
  onRegisterSale: (saleData: any) => any;
}

export default function SalesView({
  currentUser,
  clients,
  products,
  services,
  barbers,
  onRegisterSale
}: SalesViewProps) {
  // Shopping Cart state
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedBarberId, setSelectedBarberId] = useState<string>(barbers[0]?.id || currentUser?.id || '');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [installments, setInstallments] = useState<number>(1);
  const [saleNotes, setSaleNotes] = useState<string>('');

  // Search filter inside items selector
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'todos' | 'servicos' | 'produtos'>('todos');

  // Receipt modal state
  const [printedReceiptSale, setPrintedReceiptSale] = useState<any | null>(null);

  // Compute Cart Statistics
  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal - discount);
    return {
      subtotal,
      total,
      discount
    };
  }, [cartItems, discount]);

  // Click to add service
  const handleAddService = (srv: Service) => {
    setCartItems(prev => {
      const idx = prev.findIndex(item => item.type === 'service' && item.itemId === srv.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { type: 'service', itemId: srv.id, itemName: srv.name, quantity: 1, price: srv.price }];
    });
  };

  // Click to add product
  const handleAddProduct = (prod: Product) => {
    if (prod.quantity <= 0) {
      alert('Produto fora de estoque!');
      return;
    }
    setCartItems(prev => {
      const idx = prev.findIndex(item => item.type === 'product' && item.itemId === prod.id);
      if (idx !== -1) {
        const copy = [...prev];
        if (copy[idx].quantity >= prod.quantity) {
          alert('Quantidade máxima de estoque atingida no carrinho!');
          return prev;
        }
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { type: 'product', itemId: prod.id, itemName: prod.name, quantity: 1, price: prod.sellPrice }];
    });
  };

  const handleAdjustQuantity = (index: number, val: number) => {
    setCartItems(prev => {
      const item = prev[index];
      const newQty = item.quantity + val;
      if (newQty <= 0) {
        return prev.filter((_, idx) => idx !== index);
      }
      
      // If product, check stock constraint
      if (item.type === 'product') {
        const prod = products.find(p => p.id === item.itemId);
        if (prod && newQty > prod.quantity) {
          alert('Quantidade máxima de estoque atingida!');
          return prev;
        }
      }

      const copy = [...prev];
      copy[index].quantity = newQty;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Selecione ao menos um produto ou serviço para vender!');
      return;
    }
    if (!selectedClientId) {
      alert('Selecione um cliente!');
      return;
    }
    if (!selectedBarberId) {
      alert('Selecione um barbeiro responsável!');
      return;
    }

    try {
      const clientObj = clients.find(c => c.id === selectedClientId);
      const barberObj = barbers.find(b => b.id === selectedBarberId);

      const saleReceipt = onRegisterSale({
        clientId: selectedClientId,
        clientName: clientObj?.name || 'Cliente Oculto',
        employeeId: selectedBarberId,
        employeeName: barberObj?.name || 'Barbeiro',
        items: cartItems,
        paymentMethod,
        installments: paymentMethod === 'parcelado' ? installments : undefined,
        subtotal: totals.subtotal,
        discount: totals.discount,
        total: totals.total,
        notes: saleNotes
      });

      // Show paper receipt modal immediately
      setPrintedReceiptSale(saleReceipt);

      // Clean Cart
      setCartItems([]);
      setDiscount(0);
      setSaleNotes('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter Catalog items (Search query + Type Category)
  const filteredCatalog = useMemo(() => {
    const srvs = services.map(s => ({ ...s, itemType: 'service' as const }));
    const prods = products.filter(p => p.status === 'ativo').map(p => ({ ...p, itemType: 'product' as const }));

    let combined = [];
    if (activeCategory === 'todos') {
      combined = [...srvs, ...prods];
    } else if (activeCategory === 'servicos') {
      combined = srvs;
    } else {
      combined = prods;
    }

    return combined.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, products, searchQuery, activeCategory]);

  return (
    <div className="space-y-6" id="sales_view">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-purple-600" />
          Terminal de Vendas e Checkout (PDV)
        </h2>
        <p className="text-sm text-gray-500">
          Adicione serviços prestados ou itens comprados pelo cliente, aplique descontos de fidelidade e conclua a cobrança gerando recibo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side (8 cols): Catalog Items selector */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar itens do cardápio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 text-xs rounded-xl focus:outline-none"
              />
            </div>

            {/* Selector Categories tabs */}
            <div className="bg-gray-100 p-1 rounded-xl flex w-full sm:w-auto">
              {(['todos', 'servicos', 'produtos'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveCategory(tab)}
                  className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    activeCategory === tab
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab === 'todos' ? 'Tudo' : tab === 'servicos' ? 'Serviços' : 'Produtos'}
                </button>
              ))}
            </div>
          </div>

          {/* Selector Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[440px] overflow-y-auto p-1.5 border border-dashed border-gray-100 rounded-2xl scrollbar-none">
            {filteredCatalog.map(item => {
              const isSrv = item.itemType === 'service';
              const isOutStock = !isSrv && (item as Product).quantity <= 0;

              return (
                <div
                  key={item.id}
                  onClick={() => isSrv ? handleAddService(item as any) : handleAddProduct(item as any)}
                  className={`p-3.5 border rounded-2xl cursor-pointer flex justify-between items-center hover:scale-[1.01] transition-transform ${
                    isOutStock 
                      ? 'bg-gray-50 border-gray-200 opacity-60 pointer-events-none' 
                      : isSrv 
                        ? 'bg-purple-50/25 hover:bg-purple-50/50 border-purple-100/60' 
                        : 'bg-emerald-50/15 hover:bg-emerald-50/35 border-emerald-100/40'
                  }`}
                >
                  <div className="space-y-1 overflow-hidden pr-2">
                    <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isSrv ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isSrv ? 'Serviço' : `Produto (${(item as Product).quantity} em estoque)`}
                    </span>
                    <h4 className="text-xs font-bold text-gray-800 truncate mt-1">{item.name}</h4>
                    {isSrv ? (
                      <p className="text-[10px] text-gray-400">Tempo: {(item as Service).durationMin} min</p>
                    ) : (
                      <p className="text-[10px] text-gray-400">Ref: {(item as Product).code}</p>
                    )}
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-gray-900">
                      R$ {isSrv ? (item as Service).price.toFixed(2) : (item as Product).sellPrice.toFixed(2)}
                    </p>
                    <span className="text-[9px] font-bold text-purple-600 block mt-1 hover:underline">
                      + Adicionar
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side (5 cols): Checkout cart */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between min-h-[500px]">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-gray-500 uppercase">Carrinho / Comprovante</span>
              <button
                type="button"
                onClick={() => setCartItems([])}
                className="text-[10px] font-bold text-red-500 hover:underline uppercase"
              >
                Esvaziar
              </button>
            </div>

            {/* Cart list elements */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <div key={`${item.type}_${item.itemId}`} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl text-xs">
                    <div className="space-y-0.5 overflow-hidden pr-2">
                      <p className="font-bold text-gray-800 truncate">{item.itemName}</p>
                      <p className="text-[10px] text-gray-400">R$ {item.price.toFixed(2)} unit.</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleAdjustQuantity(index, -1)}
                          className="p-1 hover:bg-gray-100 text-gray-500"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 font-bold font-mono text-xs text-gray-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleAdjustQuantity(index, 1)}
                          className="p-1 hover:bg-gray-100 text-gray-500"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <p className="font-bold font-mono text-gray-900 w-16 text-right">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center">
                  <ShoppingBag className="h-8 w-8 mb-2 text-gray-300 animate-bounce" />
                  <p className="text-xs font-semibold text-gray-500">Carrinho Vazio</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Clique nos itens do cardápio à esquerda para adicionar.</p>
                </div>
              )}
            </div>

            {/* Select Client & Barber fields */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cliente Solicitante</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full p-2 border border-gray-200 text-xs rounded-xl focus:outline-none"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Barbeiro Designado</label>
                <select
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  className="w-full p-2 border border-gray-200 text-xs rounded-xl focus:outline-none"
                >
                  {barbers.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Discounts and notes fields */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Aplicar Desconto (R$)</label>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-200 text-xs rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 border border-gray-200 text-xs rounded-xl focus:outline-none capitalize"
                >
                  <option value="pix">PIX</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao_debito">Cartão Débito</option>
                  <option value="cartao_credito">Cartão Crédito</option>
                  <option value="parcelado">Parcelado</option>
                </select>
              </div>
            </div>

            {paymentMethod === 'parcelado' && (
              <div className="pt-1.5 animate-in slide-in-from-top-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Parcelas</label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
                  className="w-full p-2 border border-gray-200 text-xs rounded-xl focus:outline-none"
                >
                  <option value={2}>2x Sem Juros</option>
                  <option value={3}>3x Sem Juros</option>
                  <option value={4}>4x Sem Juros</option>
                  <option value={5}>5x Sem Juros</option>
                  <option value={6}>6x Sem Juros</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Notas da Venda</label>
              <input
                type="text"
                placeholder="Ex: Deixou gorjeta para o barbeiro"
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                className="w-full p-2 border border-gray-200 text-xs rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing totals block */}
          <div className="pt-4 border-t border-gray-100 bg-gray-50 p-4 rounded-2xl space-y-2 mt-4">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Subtotal:</span>
              <span className="font-semibold font-mono">R$ {totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-xs text-red-500">
                <span>Desconto Aplicado:</span>
                <span className="font-semibold font-mono">- R$ {totals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1 border-t border-gray-200 border-dashed">
              <span>Valor Final Cobrado:</span>
              <span className="font-mono text-lg text-purple-700">R$ {totals.total.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={cartItems.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-3 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2 mt-2"
            >
              <CheckCircle className="h-4 w-4" /> Concluir Venda e Gerar Nota
            </button>
          </div>
        </form>
      </div>

      {/* PAPER TICKET PRINT PREVIEW MODAL */}
      {printedReceiptSale && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative border border-white/10 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setPrintedReceiptSale(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-4">
              <Sparkles className="h-6 w-6 text-yellow-300 mx-auto animate-bounce mb-1" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Cupom de Serviço Gerado!</h3>
              <p className="text-[10px] text-gray-400">Pronto para imprimir ou enviar por PDF</p>
            </div>

            {/* Custom receipt tape block */}
            <div className="receipt-paper p-5 rounded-md text-black space-y-4 max-h-[360px] overflow-y-auto">
              {/* Header */}
              <div className="text-center border-b border-black border-dashed pb-3 space-y-0.5">
                <h4 className="text-xs font-extrabold tracking-wider">BARBEARIA ISAIAS</h4>
                <p className="text-[9px]">CNPJ: 12.345.678/0001-99</p>
                <p className="text-[9px]">Alameda Lorena, 1500 - Cerqueira César, SP</p>
                <p className="text-[9px]">Fone: (11) 3255-9000</p>
              </div>

              {/* OS info metadata */}
              <div className="text-[9px] space-y-1">
                <p><span className="font-bold">DOCUMENTO:</span> {printedReceiptSale.saleNumber}</p>
                <p><span className="font-bold">DATA:</span> {new Date(printedReceiptSale.date).toLocaleString()}</p>
                <p><span className="font-bold">CLIENTE:</span> {printedReceiptSale.clientName}</p>
                <p><span className="font-bold">BARBEIRO:</span> {printedReceiptSale.employeeName}</p>
                <p><span className="font-bold">STATUS:</span> {printedReceiptSale.status.toUpperCase()}</p>
              </div>

              {/* Items grid table */}
              <div className="border-t border-b border-black border-dashed py-2">
                <div className="grid grid-cols-12 font-bold text-[9px] mb-1">
                  <div className="col-span-6">Item</div>
                  <div className="col-span-2 text-center">Qtd</div>
                  <div className="col-span-4 text-right">Preço</div>
                </div>
                <div className="space-y-1 text-[9px]">
                  {printedReceiptSale.items.map((it: any) => (
                    <div key={`${it.type}_${it.itemId}`} className="grid grid-cols-12">
                      <div className="col-span-6 truncate">{it.itemName}</div>
                      <div className="col-span-2 text-center">{it.quantity}</div>
                      <div className="col-span-4 text-right">R$ {(it.price * it.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals and calculations */}
              <div className="text-[9px] space-y-1 text-right font-bold">
                <p>SUBTOTAL: R$ {printedReceiptSale.subtotal.toFixed(2)}</p>
                {printedReceiptSale.discount > 0 && <p>DESCONTO: -R$ {printedReceiptSale.discount.toFixed(2)}</p>}
                <p className="text-xs border-t border-black border-dotted pt-1 mt-1">TOTAL PAGO: R$ {printedReceiptSale.total.toFixed(2)}</p>
              </div>

              {/* Payment details */}
              <div className="bg-gray-100 p-2 rounded text-[9px] space-y-0.5 border border-dashed border-gray-300">
                <p className="font-bold">PAGAMENTO: {printedReceiptSale.paymentMethod.toUpperCase()}</p>
                {printedReceiptSale.installments && <p>PARCELAS: {printedReceiptSale.installments}x sem juros</p>}
                <p className="font-bold text-purple-800">CASHBACK GERADO: R$ {printedReceiptSale.cashbackEarned.toFixed(2)}</p>
                <p className="font-bold text-indigo-700">PONTOS ADICIONADOS: {printedReceiptSale.pointsEarned} pts</p>
              </div>

              {/* Footer messages */}
              <div className="text-center text-[8px] pt-3 border-t border-black border-dashed">
                <p>Obrigado pela preferência!</p>
                <p>Acesse seu painel e confira seu cashback.</p>
                <p className="font-mono mt-1 text-[7px] text-gray-400">Sincronizado via Firebase Firestore</p>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-white hover:bg-gray-100 text-gray-900 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="h-4 w-4" /> Imprimir Comprovante
              </button>
              <button
                onClick={() => {
                  // Simulate sharing
                  alert('Ordem de serviço compartilhada com sucesso por WhatsApp / E-mail em formato PDF!');
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText className="h-4 w-4" /> Compartilhar OS PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
