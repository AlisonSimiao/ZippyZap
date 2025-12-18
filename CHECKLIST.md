Claro! Aqui está um **Markdown limpo, organizado e pronto para edição**, perfeito para você acompanhar durante as 2  story:

---

# 🚀 **ROADMAP DE 2 stories PARA LANÇAMENTO DO MVP — SaaS WhatsApp API**

> **Objetivo:** lançar o MVP funcional, simples e confiável, com autenticação, API Key, sessões, envio de mensagens, webhooks e primeiro plano pago.

---


### 📊 **Progresso Atual**
![Progress](https://progress-bar.dev/66)
**66% Concluído** (47 de 71 tarefas)

---

---

## 🗓 ** story1 — Fundamentos, Estabilidade e API**

### **📅 sprint 1 — Revisão Geral da Estrutura**

* [x] Revisar arquitetura atual
* [x] Revisar pastas de tokens, logs e sessões
* [x] Garantir que os containers sobem limpos (Docker Compose)
* [x] Criar `.env.example` e padronizar variáveis de ambiente

---

### **📅 sprint 2 — Autenticação & API Key**

* [x] Finalizar login e recuperação de senha
* [x] Criar/validar a API Key por usuário
* [x] Middleware de validação da API Key
* [x] Tela/endpoint de regenerar API Key

---

### **📅 sprint 3 — Sessões WhatsApp**

* [x] Criar sessão
* [x] Ler QR Code
* [x] Manter sessão viva com Docker
* [x] Verificação automática de reconexão
* [x] Persistência simples da sessão (tokens/{user_id})

---

### **📅 sprint 4 — Envio de Mensagens + Webhooks**

* [x] Rota de envio de mensagem (texto)
* [ ] Rota para envio com mídia (Adiado para v2)
* [ ] Testes de envio em massa (Adiado para v2)
* [x] Configuração de webhooks
* [x] Envio de eventos básicos:

  * [x] Mensagem recebida
  * [x] Status de envio

---

### **📅 sprint 5 — Rate Limit & Limite de Sessão**

* [x] Configurar `ThrottlerModule` (Rate Limit global)
* [x] Implementar `PlanLimitGuard` (Limites diários/mensais)
* [x] Implementar verificação de sessão única (1 sessão por usuário)
* [x] Adicionar contadores de uso no Redis
* [x] Bloqueio elegante com mensagens de erro claras

---

## 🗓 ** story2 — Pagamentos, Painel e Preparação do Lançamento**

### **📅 sprint 6 — Sistema de Pagamento**

* [x] Definir fornecedor (Stripe / Mercado Pago / OpenPix) - **Mercado Pago**
* [x] Criar plano mensal básico
* [x] Criar assinatura do usuário
* [x] Webhook de pagamento aprovado
* [x] Atualizar status de assinatura no BD
* [x] Implementar fluxo completo de checkout
* [x] Criar páginas de resultado (sucesso/falha/pendente)
* [x] Integrar botões de pagamento na landing page
* [x] Implementar renovação inteligente (preserva dias restantes)

---

### **📅 sprint 7 — Painel do Usuário**

* [x] Página com API Key
* [x] Página com status da sessão
* [x] Página com QR Code
* [ ] Página com logs e webhooks enviados
* [x] Página com plano e pagamento

---

### **📅 sprint 8 — Melhorias no Backend**

- [ ] Adicionar logs estruturados (pino ou outro)
- [ ] Captura de erros centralizada
- [ ] Melhorar resposta de erros (status codes + mensagens claras)
- [x] Criar health-check para Docker/infra

---

### **📅 sprint 9 — Documentação**

- [x] Página de “Primeiros Passos”
- [x] Referência da API (já iniciada, finalizar)
- [x] Exemplo de uso com Node.js
- [x] Exemplo de uso com cURL
- [ ] Esquema visual de como funciona a sessão

---

### **📅 sprint 10 — Deploy & CI/CD**

* [ ] Criar pipeline GitHub Actions (build, test, deploy)
* [ ] Subir backend no server (VPS/Hetzner)
* [ ] Configurar SSL
* [ ] Configurar monitoramento básico (UptimeRobot)
* [ ] Teste completo de ponta a ponta

---

### **📅 sprint 11 — Testes com 2–3 usuários reais (beta)**

* [ ] Criar contas beta
* [ ] Acompanhar logs e feedback
* [ ] Ajustar bugs de sessão
* [ ] Ajustar webhooks / API

---

### **📅 sprint 12 — Ajustes Finais**

* [ ] Melhorar mensagens de erro
* [ ] Revisar UI do painel
* [ ] Revisar limites e plano
* [x] Revisar documentação final

---

### **📅 sprint 13 — Preparar Landing Page**

* [x] Criar título e subtítulo
* [x] Adicionar recursos do MVP
* [x] Criar botão “Criar Conta”
* [x] Criar sessão “Como funciona”
* [x] Criar sessão “Preço único + testes grátis”
* [x] Otimização de SEO (Metadados, JSON-LD, Sitemap)

---

### **📅 sprint 14 — Lançamento**

* [ ] Liberar cadastro público
* [ ] Últimos testes
* [ ] Abrir oficialmente para os 10 primeiros usuários
* [ ] Ativar monitoramento real-time
* [ ] Anunciar o MVP 🎉