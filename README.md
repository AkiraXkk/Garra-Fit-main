# Garra Fit

Loja online reconstruida do zero, mantendo as imagens existentes e com foco em operacao real de e-commerce.

## Funcionalidades principais

- Catalogo carregado de arquivo externo (`public/products.json`).
- Busca, filtro por categoria e ordenacao por destaque, preco e nome.
- Carrinho completo com atualizacao de quantidade e remocao de itens.
- Persistencia com localStorage para:
  - carrinho
  - cupom
  - CEP
  - forma de pagamento
  - favoritos
- Sistema de favoritos com filtro "somente favoritos".
- Simulacao de frete por CEP (Gravata, Pernambuco e demais regioes).
- Barra de progresso para frete gratis.
- Descontos acumulados por cupom, pagamento via PIX e campanha por valor.
- Checkout no WhatsApp com resumo completo do pedido.
- Painel administrativo com login, logout e alteracao de senha.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Estrutura

- `index.html`: estrutura da loja
- `style.css`: design responsivo
- `script.js`: logica da aplicacao
- `public/products.json`: catalogo externo dos produtos

## Licenca

MIT
