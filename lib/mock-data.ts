// Mock data centralizado — substituir pelas chamadas Supabase quando integrar

export const estabelecimento = {
    nome: "D'Luigi",
    tipo: "Pizzaria",
    regime: "Simples Nacional — 6%",
    regime_aliquota: 0.06,
    projecao_vendas: 90000,
    lucro_desejado: 10,
    markup: 0.375,
};

// markup = 1 - (imposto + lucro_desejado/100)
export function calcMarkup(aliquota: number, lucro: number) {
    return 1 - (aliquota + lucro / 100);
}

export const ingredientes = [
    { id: "1", nome: "Mussarela", unidade: "kg", preco_atual: 32.5, preco_anterior: 30.0 },
    { id: "2", nome: "Farinha de Trigo", unidade: "kg", preco_atual: 4.2, preco_anterior: 3.9 },
    { id: "3", nome: "Molho de Tomate", unidade: "kg", preco_atual: 8.9, preco_anterior: 8.9 },
    { id: "4", nome: "Presunto", unidade: "kg", preco_atual: 22.0, preco_anterior: 21.5 },
    { id: "5", nome: "Frango Desfiado", unidade: "kg", preco_atual: 18.5, preco_anterior: 19.0 },
    { id: "6", nome: "Tomate", unidade: "kg", preco_atual: 6.5, preco_anterior: 5.8 },
    { id: "7", nome: "Cebola", unidade: "kg", preco_atual: 3.2, preco_anterior: 3.2 },
    { id: "8", nome: "Alho", unidade: "kg", preco_atual: 25.0, preco_anterior: 22.0 },
];

export const ingredientes_indiretos = [
    { id: "1", nome: "Caixa Pizza GG", unidade: "unidade", preco: 1.2, qtde_mes: 400 },
    { id: "2", nome: "Caixa Pizza M", unidade: "unidade", preco: 0.85, qtde_mes: 200 },
    { id: "3", nome: "Saco Descartável", unidade: "pacote", preco: 8.5, qtde_mes: 20 },
    { id: "4", nome: "Luvas Descartáveis", unidade: "caixa", preco: 14.0, qtde_mes: 4 },
];

export const preparacoes = [
    {
        id: "1",
        nome: "Massa de Pizza",
        rendimento: "10 unidades",
        ingredientes: [
            { nome: "Farinha de Trigo", quantidade: 1.5, unidade: "kg", custo: 6.3 },
            { nome: "Óleo", quantidade: 0.1, unidade: "litro", custo: 0.9 },
            { nome: "Fermento", quantidade: 0.02, unidade: "kg", custo: 0.6 },
        ],
        custo_total: 7.8,
        custo_por_unidade: 0.78,
    },
    {
        id: "2",
        nome: "Molho de Tomate Caseiro",
        rendimento: "5 litros",
        ingredientes: [
            { nome: "Tomate", quantidade: 3, unidade: "kg", custo: 19.5 },
            { nome: "Alho", quantidade: 0.1, unidade: "kg", custo: 2.5 },
            { nome: "Cebola", quantidade: 0.5, unidade: "kg", custo: 1.6 },
        ],
        custo_total: 23.6,
        custo_por_unidade: 4.72,
    },
];

export const produtos = [
    {
        id: "1",
        nome: "Margherita",
        tamanho: "Grande",
        filtro: "grande",
        preco_atual: 52.9,
        categoria: "Clássicas",
        ingredientes: [
            { nome: "Massa de Pizza", quantidade: 1, unidade: "un", custo_un: 0.78 },
            { nome: "Molho de Tomate", quantidade: 0.15, unidade: "kg", custo_un: 8.9 },
            { nome: "Mussarela", quantidade: 0.35, unidade: "kg", custo_un: 32.5 },
            { nome: "Tomate", quantidade: 0.1, unidade: "kg", custo_un: 6.5 },
        ],
        custo_direto: 14.52,
    },
    {
        id: "2",
        nome: "Calabresa",
        tamanho: "Grande",
        filtro: "grande",
        preco_atual: 54.9,
        categoria: "Clássicas",
        ingredientes: [
            { nome: "Massa de Pizza", quantidade: 1, unidade: "un", custo_un: 0.78 },
            { nome: "Molho de Tomate", quantidade: 0.15, unidade: "kg", custo_un: 8.9 },
            { nome: "Mussarela", quantidade: 0.35, unidade: "kg", custo_un: 32.5 },
            { nome: "Calabresa", quantidade: 0.2, unidade: "kg", custo_un: 18.0 },
        ],
        custo_direto: 16.47,
    },
    {
        id: "3",
        nome: "Frango com Catupiry",
        tamanho: "Grande",
        filtro: "grande",
        preco_atual: 58.9,
        categoria: "Especiais",
        ingredientes: [
            { nome: "Massa de Pizza", quantidade: 1, unidade: "un", custo_un: 0.78 },
            { nome: "Frango Desfiado", quantidade: 0.3, unidade: "kg", custo_un: 18.5 },
            { nome: "Catupiry", quantidade: 0.15, unidade: "kg", custo_un: 28.0 },
            { nome: "Mussarela", quantidade: 0.2, unidade: "kg", custo_un: 32.5 },
        ],
        custo_direto: 17.58,
    },
    {
        id: "4",
        nome: "Margherita",
        tamanho: "Família",
        filtro: "familia",
        preco_atual: 74.9,
        categoria: "Clássicas",
        ingredientes: [
            { nome: "Massa de Pizza", quantidade: 1.4, unidade: "un", custo_un: 0.78 },
            { nome: "Molho de Tomate", quantidade: 0.22, unidade: "kg", custo_un: 8.9 },
            { nome: "Mussarela", quantidade: 0.5, unidade: "kg", custo_un: 32.5 },
            { nome: "Tomate", quantidade: 0.15, unidade: "kg", custo_un: 6.5 },
        ],
        custo_direto: 20.45,
    },
    {
        id: "5",
        nome: "Presunto",
        tamanho: "Broto",
        filtro: "broto",
        preco_atual: 32.9,
        categoria: "Clássicas",
        ingredientes: [
            { nome: "Massa de Pizza", quantidade: 0.6, unidade: "un", custo_un: 0.78 },
            { nome: "Molho de Tomate", quantidade: 0.08, unidade: "kg", custo_un: 8.9 },
            { nome: "Mussarela", quantidade: 0.18, unidade: "kg", custo_un: 32.5 },
            { nome: "Presunto", quantidade: 0.1, unidade: "kg", custo_un: 22.0 },
        ],
        custo_direto: 8.52,
    },
];

export const venda_direta = [
    { id: "1", nome: "Coca-Cola 2L", categoria: "Refrigerante", custo: 6.5, preco_atual: 12.0, previsao_mes: 120 },
    { id: "2", nome: "Guaraná 2L", categoria: "Refrigerante", custo: 5.0, preco_atual: 9.5, previsao_mes: 80 },
    { id: "3", nome: "Água Mineral 500ml", categoria: "Água", custo: 0.9, preco_atual: 3.5, previsao_mes: 200 },
    { id: "4", nome: "Cerveja Heineken Long Neck", categoria: "Bebida Alcoólica", custo: 3.8, preco_atual: 9.0, previsao_mes: 150 },
    { id: "5", nome: "Vinho Casa Valduga 750ml", categoria: "Bebida Alcoólica", custo: 32.0, preco_atual: 75.0, previsao_mes: 20 },
];

export const despesas = [
    { id: "1", descricao: "Aluguel", valor: 4500, categoria: "Infraestrutura" },
    { id: "2", descricao: "Energia Elétrica", valor: 1800, categoria: "Utilidades" },
    { id: "3", descricao: "Gás", valor: 650, categoria: "Utilidades" },
    { id: "4", descricao: "Internet + Telefone", valor: 280, categoria: "Comunicação" },
    { id: "5", descricao: "Sistema PDV", valor: 150, categoria: "Software" },
    { id: "6", descricao: "Contador", valor: 500, categoria: "Serviços" },
    { id: "7", descricao: "Marketing (Impulsionamentos)", valor: 800, categoria: "Marketing" },
];

export const salarios = [
    { id: "1", funcao: "Pizzaiolo", salario: 2800 },
    { id: "2", funcao: "Atendente", salario: 1800 },
    { id: "3", funcao: "Motoboy", salario: 1600 },
];

export const prolabore = [
    { id: "1", nome: "Maria Silva", valor: 5000 },
];

export const lancamentos = [
    { id: "1", data: "2025-05-02", tipo: "FL", descricao: "Vendas Sexta-feira", valor: 3200, conta: "Pix" },
    { id: "2", data: "2025-05-02", tipo: "FL", descricao: "Vendas Sexta-feira", valor: 1850, conta: "Crédito" },
    { id: "3", data: "2025-05-03", tipo: "MP", descricao: "Compra Mart Minas", valor: -1200, conta: "Caixa" },
    { id: "4", data: "2025-05-05", tipo: "FL", descricao: "Vendas Domingo", valor: 4500, conta: "Pix" },
    { id: "5", data: "2025-05-05", tipo: "FL", descricao: "Vendas Domingo", valor: 2200, conta: "Débito" },
    { id: "6", data: "2025-05-07", tipo: "FX", descricao: "Aluguel", valor: -4500, conta: "Sicoob PJ" },
    { id: "7", data: "2025-05-08", tipo: "FX", descricao: "Energia Elétrica", valor: -1800, conta: "Sicoob PJ" },
    { id: "8", data: "2025-05-09", tipo: "FL", descricao: "Vendas Sexta-feira", valor: 3800, conta: "Pix" },
    { id: "9", data: "2025-05-10", tipo: "VA", descricao: "Material de Limpeza", valor: -320, conta: "Caixa" },
    { id: "10", data: "2025-05-12", tipo: "FL", descricao: "Vendas Domingo", valor: 5100, conta: "Pix" },
    { id: "11", data: "2025-05-14", tipo: "TX", descricao: "Tarifa Bancária", valor: -45, conta: "Sicoob PJ" },
    { id: "12", data: "2025-05-15", tipo: "MP", descricao: "Compra Cooperativa Laticínios", valor: -2800, conta: "Sicoob PJ" },
    { id: "13", data: "2025-05-16", tipo: "FL", descricao: "Vendas Sexta-feira", valor: 3600, conta: "Crédito" },
    { id: "14", data: "2025-05-20", tipo: "FX", descricao: "Salários + Encargos", valor: -7310, conta: "Sicoob PJ" },
    { id: "15", data: "2025-05-21", tipo: "FL", descricao: "Vendas Quarta-feira", valor: 2100, conta: "Pix" },
];

export const categorias = {
    tipos_obrigatorios: ["FL — Venda", "MP — Ingrediente", "FX — Despesa Fixa", "VA — Variável", "TX — Bancária", "OP — Operacional"],
    tipos_custom: ["Repasse iFood", "Devolução Cliente"],
    contas: ["Caixa", "Pix", "Crédito", "Débito", "Sicoob PJ", "Santander"],
    despesa_cat: ["Infraestrutura", "Utilidades", "Comunicação", "Software", "Serviços", "Marketing"],
    produto_cat: ["Clássicas", "Especiais", "Doces", "Bebidas"],
};

export function formatBRL(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function calcMargem(preco: number, custo: number) {
    if (!preco) return 0;
    return ((preco - custo) / preco) * 100;
}

export function getMargemBadge(margem: number): "verde" | "amarelo" | "vermelho" {
    if (margem >= 12) return "verde";
    if (margem >= 5) return "amarelo";
    return "vermelho";
}
