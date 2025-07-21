# 📊 Sistema de Relatórios - Salão Eliane Peixoto

## 📧 Relatórios Automáticos por Email

O sistema agora envia automaticamente dois tipos de relatórios para o email do salão: **elianepeixoto.manicure@gmail.com**

### 📅 Relatório Semanal de Disponibilidade

**Quando é enviado:** Toda segunda-feira às 8h
**Conteúdo:**
- Status de cada dia da semana (disponível/bloqueado)
- Horários livres por dia
- Horários já ocupados
- Resumo geral da semana
- Total de slots disponíveis

**Exemplo de informações:**
```
📊 Resumo da Semana
- Total de dias analisados: 7
- Dias disponíveis: 6
- Dias bloqueados: 1
- Total de horários livres: 42

📅 Disponibilidade por Dia
Segunda-feira - 21 de julho de 2025
- Horários disponíveis: 8 de 10
- Horários ocupados: 2
- Slots livres: 08:00, 09:00, 10:00, 11:00, 14:00, 15:00, 16:00, 17:00
```

### 💅 Relatório de Agendamentos

**Quando é enviado:** Automaticamente após cada novo agendamento
**Conteúdo:**
- Lista completa de agendamentos da semana
- Receita prevista total
- Análise por tipo de serviço
- Análise por dia da semana
- Detalhes de cada agendamento (cliente, serviço, horário, valor)

**Exemplo de informações:**
```
📊 Resumo Geral
- Total de agendamentos: 12
- Receita prevista: R$ 485,00

💅 Agendamentos Detalhados
🗓️ 21 de julho de 2025 às 09:00
- Cliente: Maria Silva
- Telefone: (11) 99999-9999
- Serviço: Manicure com Esmaltação
- Duração: 60 minutos
- Valor: R$ 35,00
- Status: ✅ Confirmado

📈 Análise por Serviço
- Manicure Simples: 3 agendamentos - R$ 75,00
- Manicure com Esmaltação: 4 agendamentos - R$ 140,00
- Pedicure Simples: 2 agendamentos - R$ 60,00
- Unha de Gel: 3 agendamentos - R$ 150,00
```

## 🔧 Como Funciona Tecnicamente

### Configuração Automática
```javascript
// Configurações dos relatórios
SALON_CONFIG.reports = {
    enabled: true,
    weeklyAvailability: true,
    appointmentUpdates: true
}
```

### Agendamento Automático
- **Relatório Semanal**: Calculado para próxima segunda-feira às 8h
- **Relatório de Agendamentos**: Enviado 2 segundos após confirmação de agendamento

### Funções Principais
1. `generateAvailabilityReport()` - Gera relatório de disponibilidade
2. `generateAppointmentsReport()` - Gera relatório de agendamentos
3. `createEmailReport()` - Cria HTML formatado para email
4. `sendReportEmail()` - Envia email (simulado no console)
5. `scheduleAutomaticReports()` - Agenda envios automáticos

## 📱 Comandos de Administração

Para gerenciar relatórios manualmente, use no console do navegador:

```javascript
// Enviar relatório de disponibilidade agora
sendReportEmail('availability')

// Enviar relatório de agendamentos agora
sendReportEmail('appointments')

// Ver dados do próximo relatório de disponibilidade
generateAvailabilityReport()

// Ver dados do próximo relatório de agendamentos
generateAppointmentsReport()
```

## 🎨 Formato dos Emails

Os emails são enviados em formato HTML profissional com:
- **Header**: Logo e informações do período
- **Resumo**: Estatísticas principais em destaque
- **Detalhes**: Informações completas organizadas
- **Tabelas**: Análises por serviço e dia
- **Cores**: Paleta visual do salão (azul marinho e dourado)
- **Responsivo**: Funciona bem em celular e desktop

## 🔄 Integração com Sistema Existente

Os relatórios estão totalmente integrados com:
- ✅ Sistema de agendamentos
- ✅ Controle de disponibilidade
- ✅ Bloqueio de dias/horários
- ✅ Histórico de clientes
- ✅ Política de não comparecimento

## 🚀 Próximos Passos (Opcional)

Para implementação em produção real:
1. **Integrar com serviço de email** (SendGrid, EmailJS, etc.)
2. **Configurar SMTP** para envio real
3. **Adicionar notificações push** para celular
4. **Backup automático** dos relatórios
5. **Dashboard administrativo** para visualizar relatórios

## 📞 Suporte

Para dúvidas sobre os relatórios:
- **WhatsApp**: (11) 94446-5965
- **Email**: elianepeixoto.manicure@gmail.com

---

**Sistema desenvolvido para otimizar a gestão do Salão Eliane Peixoto** 🎀

