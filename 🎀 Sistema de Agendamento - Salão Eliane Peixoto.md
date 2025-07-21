# 🎀 Sistema de Agendamento - Salão Eliane Peixoto

## 📋 Sobre o Projeto

Sistema completo de agendamento online para o salão de beleza **Eliane Peixoto - Manicure & Pedicure Artist**, especializado em serviços de manicure, pedicure.

## ✨ Funcionalidades

### Para Clientes:
- 📅 **Agendamento Online**: Sistema intuitivo de agendamento
- 🕐 **Disponibilidade em Tempo Real**: Visualização de horários disponíveis
- 📱 **Interface Responsiva**: Funciona perfeitamente em celular e desktop
- 💅 **Catálogo de Serviços**: Preços, durações e descrições detalhadas
- 📊 **Status da Agenda**: Acompanhe a disponibilidade do salão
- 📢 **Comunicados**: Receba avisos importantes sobre funcionamento
- 💳 **Resumo do Agendamento**: Visualize todos os detalhes antes de confirmar

### Para o Salão:
- 📧 **Notificações Automáticas**: Receba agendamentos por email e WhatsApp
- 🚫 **Política de Não Comparecimento**: Taxa automática para clientes faltosos
- 📊 **Histórico de Clientes**: Controle de agendamentos e faltas
- 🔒 **Bloqueio de Horários**: Marque dias/horários como indisponíveis
- 📢 **Sistema de Comunicados**: Informe clientes sobre mudanças
- 💾 **Backup de Dados**: Exporte dados para segurança

## 🏪 Informações do Salão

- **Nome**: Eliane Peixoto - Manicure & Pedicure Artist
- **Email**: elianepeixoto.manicure@gmail.com
- **WhatsApp**: (11) 94446-5965
- **Atendimento**: Domiciliar na região de São Paulo - SP

### Horários de Funcionamento:
- **Segunda a Sexta**: 8h às 12h e 13h às 18h
- **Sábado**: 8h às 19h
- **Domingo**: Fechado

## 💅 Serviços Oferecidos

| Serviço | Preço | Duração |
|---------|-------|---------|
| Manicure Simples | R$ 25,00 | 45 min |
| Manicure com Esmaltação | R$ 35,00 | 60 min |
| Pedicure Simples | R$ 30,00 | 50 min |
| Pedicure com Esmaltação | R$ 40,00 | 70 min |
| Manicure + Pedicure | R$ 60,00 | 120 min |
| Unha de Gel | R$ 50,00 | 90 min |
| Nail Art | R$ 45,00 | 75 min |

## 🚀 Como Usar

### Para Clientes:

1. **Acesse a aplicação** através do link fornecido
2. **Verifique o Status** da agenda na seção "Status da Agenda"
3. **Escolha um Serviço** na seção "Nossos Serviços"
4. **Vá para Agendamento** e preencha o formulário:
   - Selecione o serviço desejado
   - Escolha data e horário disponível
   - Preencha seus dados pessoais
   - Adicione observações se necessário
5. **Confirme o Agendamento** e aguarde a confirmação via WhatsApp

### Para o Salão (Administração):

#### Comandos no Console do Navegador:

Abra o console do navegador (F12) e digite `salonAdmin.help()` para ver todos os comandos disponíveis.

#### Principais Comandos:

```javascript
// Ver ajuda completa
salonAdmin.help()

// Bloquear um dia inteiro
salonAdmin.blockDay('2025-07-25', 'Feriado - Natal')

// Desbloquear um dia
salonAdmin.unblockDay('2025-07-25')

// Bloquear horário específico
salonAdmin.blockTimeSlot('2025-07-25', '14:00', '16:00', 'Compromisso pessoal')

// Adicionar comunicado
salonAdmin.addAnnouncement('Funcionamento especial no sábado até 16h', '2025-07-25', '2025-07-26')

// Ver agendamentos
salonAdmin.getAppointments()

// Ver dias bloqueados
salonAdmin.getBlockedDays()

// Marcar cliente como faltoso
salonAdmin.markNoShow('ID_DO_AGENDAMENTO', 'TELEFONE_DO_CLIENTE')

// Exportar backup dos dados
salonAdmin.exportData()

// Limpar todos os dados (cuidado!)
salonAdmin.clearData()
```

## 📱 Notificações Automáticas

### Quando um cliente agenda:

1. **Email para o salão** com todas as informações do agendamento
2. **WhatsApp para o salão** com resumo completo
3. **Confirmação para o cliente** via modal na aplicação

### Formato da mensagem WhatsApp:

```
🎀 NOVO AGENDAMENTO - ELIANE PEIXOTO 🎀

👤 CLIENTE:
Nome: [Nome do Cliente]
Telefone: [Telefone]

💅 SERVIÇO:
[Nome do Serviço]
Duração: [X minutos]
Valor: R$ [Valor]

📅 DATA E HORÁRIO:
[Data por extenso]
[Horário]

📝 OBSERVAÇÕES:
[Observações do cliente]

⏰ Agendado em: [Data/hora atual]
```

## 🚫 Política de Não Comparecimento

- **Taxa**: R$ 8,00 aplicada automaticamente no próximo agendamento
- **Critério**: Não comparecimento sem aviso prévio de pelo menos 1 dia
- **Controle**: Sistema rastreia automaticamente faltas por telefone
- **Aviso**: Cliente é informado sobre a taxa no resumo do agendamento

## 🔧 Estrutura de Arquivos

```
salao-eliane-peixoto/
├── index.html              # Página principal
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos da aplicação
│   ├── js/
│   │   └── script.js       # Funcionalidades JavaScript
│   └── images/
│       └── logoel.jpg      # Logo do salão
└── README.md               # Esta documentação
```

## 💾 Armazenamento de Dados

Os dados são armazenados localmente no navegador usando `localStorage`:

- `appointments`: Lista de agendamentos
- `clientHistory`: Histórico de clientes
- `unavailableSlots`: Horários bloqueados
- `blockedDays`: Dias bloqueados
- `announcements`: Comunicados ativos

## 🎨 Design e Cores

O design foi baseado na identidade visual da logo:
- **Azul Marinho**: #1a237e (cor principal)
- **Azul**: #3949ab (cor secundária)
- **Dourado**: #ffd700 (destaque)
- **Rosa**: #f8bbd9 (accent)
- **Fonte Títulos**: Playfair Display
- **Fonte Texto**: Inter

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona perfeitamente em:
- 📱 Smartphones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)

## 🔒 Segurança

- Validação de dados no frontend
- Sanitização de entradas
- Controle de acesso via console para administração
- Backup automático recomendado

## 🚀 Próximos Passos (Opcional)

Para uma versão mais avançada, considere:
- Backend com banco de dados
- Sistema de login para administração
- Integração com APIs de pagamento
- Notificações push
- Sincronização com Google Calendar

## 📞 Suporte

Para dúvidas ou suporte técnico, entre em contato:
- **WhatsApp**: (11) 94446-5965
- **Email**: elianepeixoto.manicure@gmail.com


