// Configurações do salão
const SALON_CONFIG = {
    email: 'elianepeixoto.manicure@gmail.com',
    whatsapp: '5511944465965',
    businessHours: {
        // Horários por dia da semana (0 = Domingo, 1 = Segunda, etc.)
        schedule: {
            0: [], // Domingo - Fechado
            1: [{start: 8, end: 12}, {start: 13, end: 18}], // Segunda
            2: [{start: 8, end: 12}, {start: 13, end: 18}], // Terça
            3: [{start: 8, end: 12}, {start: 13, end: 18}], // Quarta
            4: [{start: 8, end: 12}, {start: 13, end: 18}], // Quinta
            5: [{start: 8, end: 12}, {start: 13, end: 18}], // Sexta
            6: [{start: 8, end: 19}] // Sábado
        },
        interval: 60, // minutos entre agendamentos
        closedDays: [0] // Domingo
    },
    noShowFee: 15.00,
    reports: {
        enabled: true,
        weeklyAvailability: true,
        appointmentUpdates: true
    }
};

// Dados dos agendamentos e disponibilidade
let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
let clientHistory = JSON.parse(localStorage.getItem('clientHistory') || '{}');
let unavailableSlots = JSON.parse(localStorage.getItem('unavailableSlots') || '[]');
let blockedDays = JSON.parse(localStorage.getItem('blockedDays') || '[]');
let announcements = JSON.parse(localStorage.getItem('announcements') || '[]');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    updateAgendaStatus();
    displayAnnouncements();
    showNextAvailableSlots();
});

function initializeApp() {
    setupNavigation();
    setupDatePicker();
    setupFormHandlers();
    setupMobileMenu();
    
    // Smooth scrolling para links de navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Configuração da navegação
function setupNavigation() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(26, 35, 126, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'linear-gradient(135deg, var(--primary-navy), var(--primary-blue))';
            header.style.backdropFilter = 'none';
        }
    });
}

// Menu mobile
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    
    if (mobileMenuBtn && navList) {
        mobileMenuBtn.addEventListener('click', () => {
            navList.style.display = navList.style.display === 'flex' ? 'none' : 'flex';
            navList.style.position = 'absolute';
            navList.style.top = '100%';
            navList.style.left = '0';
            navList.style.right = '0';
            navList.style.background = 'var(--primary-navy)';
            navList.style.flexDirection = 'column';
            navList.style.padding = '1rem';
            navList.style.borderRadius = '0 0 10px 10px';
        });
    }
}

// Configuração do seletor de data
function setupDatePicker() {
    const dateInput = document.getElementById('date');
    if (!dateInput) return;
    
    // Definir data mínima como hoje
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    dateInput.min = tomorrow.toISOString().split('T')[0];
    
    // Definir data máxima como 30 dias a partir de hoje
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);
    dateInput.max = maxDate.toISOString().split('T')[0];
    
    dateInput.addEventListener('change', updateAvailableTimeSlots);
}

// Atualizar horários disponíveis
function updateAvailableTimeSlots() {
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const serviceSelect = document.getElementById('service');
    
    if (!dateInput.value || !serviceSelect.value) {
        timeSelect.innerHTML = '<option value="">Selecione um horário</option>';
        return;
    }
    
    const selectedDate = new Date(dateInput.value + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();
    
    // Verificar se é um dia fechado
    if (SALON_CONFIG.businessHours.closedDays.includes(dayOfWeek)) {
        timeSelect.innerHTML = '<option value="">Fechado neste dia</option>';
        return;
    }
    
    const serviceDuration = parseInt(serviceSelect.selectedOptions[0].dataset.duration);
    const availableSlots = generateTimeSlots(dateInput.value, serviceDuration);
    
    timeSelect.innerHTML = '<option value="">Selecione um horário</option>';
    
    availableSlots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot.value;
        option.textContent = slot.label;
        timeSelect.appendChild(option);
    });
    
    if (availableSlots.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Nenhum horário disponível';
        timeSelect.appendChild(option);
    }
}

// Gerar slots de horário disponíveis
function generateTimeSlots(date, serviceDuration) {
    const slots = [];
    const selectedDate = new Date(date + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();
    
    // Verificar se o dia está bloqueado
    if (blockedDays.includes(date)) {
        return [];
    }
    
    // Obter horários do dia da semana
    const daySchedule = SALON_CONFIG.businessHours.schedule[dayOfWeek];
    
    if (!daySchedule || daySchedule.length === 0) {
        return [];
    }
    
    const { interval } = SALON_CONFIG.businessHours;
    
    // Gerar slots para cada período do dia
    daySchedule.forEach(period => {
        for (let hour = period.start; hour < period.end; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const endTime = calculateEndTime(hour, minute, serviceDuration);
                
                // Verificar se o serviço termina dentro do período
                const serviceEndsInSamePeriod = endTime.hour < period.end || 
                    (endTime.hour === period.end && endTime.minute === 0);
                
                // Verificar se não ultrapassa para o próximo período
                const nextPeriod = daySchedule.find(p => p.start > period.end);
                const doesntOverlapBreak = !nextPeriod || endTime.hour <= period.end || 
                    (endTime.hour === nextPeriod.start && endTime.minute === 0);
                
                if (serviceEndsInSamePeriod && doesntOverlapBreak) {
                    // Verificar disponibilidade
                    if (isTimeSlotAvailable(date, timeString, serviceDuration)) {
                        slots.push({
                            value: timeString,
                            label: `${timeString} - ${endTime.hour.toString().padStart(2, '0')}:${endTime.minute.toString().padStart(2, '0')}`
                        });
                    }
                }
            }
        }
    });
    
    return slots.sort((a, b) => a.value.localeCompare(b.value));
}

// Calcular horário de término
function calculateEndTime(startHour, startMinute, durationMinutes) {
    const totalMinutes = startHour * 60 + startMinute + durationMinutes;
    return {
        hour: Math.floor(totalMinutes / 60),
        minute: totalMinutes % 60
    };
}

// Verificar se horário está disponível
function isTimeSlotAvailable(date, time, duration) {
    const appointmentDateTime = new Date(`${date}T${time}:00`);
    const appointmentEnd = new Date(appointmentDateTime.getTime() + duration * 60000);
    
    // Verificar conflitos com agendamentos existentes
    const hasAppointmentConflict = appointments.some(appointment => {
        const existingStart = new Date(`${appointment.date}T${appointment.time}:00`);
        const existingEnd = new Date(existingStart.getTime() + appointment.duration * 60000);
        
        return (appointmentDateTime < existingEnd && appointmentEnd > existingStart);
    });
    
    // Verificar slots indisponíveis
    const isUnavailable = unavailableSlots.some(slot => {
        if (slot.date !== date) return false;
        
        if (slot.type === 'time') {
            const unavailableStart = new Date(`${date}T${slot.startTime}:00`);
            const unavailableEnd = new Date(`${date}T${slot.endTime}:00`);
            return (appointmentDateTime < unavailableEnd && appointmentEnd > unavailableStart);
        }
        
        return false;
    });
    
    return !hasAppointmentConflict && !isUnavailable;
}

// Configuração dos manipuladores de formulário
function setupFormHandlers() {
    const form = document.getElementById('appointmentForm');
    const serviceSelect = document.getElementById('service');
    
    if (serviceSelect) {
        serviceSelect.addEventListener('change', updateAppointmentSummary);
    }
    
    ['date', 'time'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateAppointmentSummary);
        }
    });
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Máscara para telefone
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
}

// Formatar número de telefone
function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        if (value.length < 14) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
    }
    
    e.target.value = value;
}

// Atualizar resumo do agendamento
function updateAppointmentSummary() {
    const service = document.getElementById('service');
    const date = document.getElementById('date');
    const time = document.getElementById('time');
    const summary = document.getElementById('appointmentSummary');
    
    if (!service.value || !date.value || !time.value) {
        summary.style.display = 'none';
        return;
    }
    
    const serviceOption = service.selectedOptions[0];
    const servicePrice = parseFloat(serviceOption.dataset.price);
    const serviceDuration = parseInt(serviceOption.dataset.duration);
    
    // Verificar se cliente tem taxa de não comparecimento
    const phone = document.getElementById('phone').value.replace(/\D/g, '');
    const clientData = clientHistory[phone];
    const noShowFee = (clientData && clientData.noShowCount > 0) ? SALON_CONFIG.noShowFee : 0;
    const totalPrice = servicePrice + noShowFee;
    
    document.getElementById('summaryService').textContent = service.selectedOptions[0].text.split(' - ')[0];
    document.getElementById('summaryDate').textContent = formatDate(date.value);
    document.getElementById('summaryTime').textContent = time.value;
    document.getElementById('summaryDuration').textContent = `${serviceDuration} minutos`;
    document.getElementById('summaryPrice').textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
    
    // Mostrar aviso de taxa se aplicável
    if (noShowFee > 0) {
        const existingWarning = summary.querySelector('.no-show-warning');
        if (!existingWarning) {
            const warning = document.createElement('div');
            warning.className = 'no-show-warning';
            warning.style.cssText = 'background: #ffebee; color: #c62828; padding: 1rem; border-radius: 8px; margin-top: 1rem; font-size: 0.9rem;';
            warning.innerHTML = `<strong>⚠️ Taxa de não comparecimento:</strong> R$ ${SALON_CONFIG.noShowFee.toFixed(2).replace('.', ',')} adicionada devido a ausências anteriores.`;
            summary.appendChild(warning);
        }
    }
    
    summary.style.display = 'block';
}

// Formatar data para exibição
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Manipular envio do formulário
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const appointmentData = {
        id: generateId(),
        service: formData.get('service'),
        date: formData.get('date'),
        time: formData.get('time'),
        name: formData.get('name'),
        phone: formData.get('phone').replace(/\D/g, ''),
        notes: formData.get('notes') || '',
        createdAt: new Date().toISOString(),
        status: 'confirmed'
    };
    
    // Adicionar duração e preço
    const serviceOption = document.querySelector(`option[value="${appointmentData.service}"]`);
    appointmentData.duration = parseInt(serviceOption.dataset.duration);
    appointmentData.price = parseFloat(serviceOption.dataset.price);
    
    // Verificar taxa de não comparecimento
    const clientData = clientHistory[appointmentData.phone];
    if (clientData && clientData.noShowCount > 0) {
        appointmentData.noShowFee = SALON_CONFIG.noShowFee;
        appointmentData.price += SALON_CONFIG.noShowFee;
    }
    
    // Validar dados
    if (!validateAppointmentData(appointmentData)) {
        return;
    }
    
    // Salvar agendamento
    appointments.push(appointmentData);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // Atualizar histórico do cliente
    updateClientHistory(appointmentData);
    
    // Enviar notificações
    await sendNotifications(appointmentData);
    
    // Mostrar confirmação
    showConfirmationModal(appointmentData);
    
    // Limpar formulário
    e.target.reset();
    document.getElementById('appointmentSummary').style.display = 'none';
}

// Validar dados do agendamento
function validateAppointmentData(data) {
    const errors = [];
    
    if (!data.service) errors.push('Selecione um serviço');
    if (!data.date) errors.push('Selecione uma data');
    if (!data.time) errors.push('Selecione um horário');
    if (!data.name || data.name.length < 2) errors.push('Nome deve ter pelo menos 2 caracteres');
    if (!data.phone || data.phone.length < 10) errors.push('Telefone inválido');
    
    // Verificar se a data não é no passado
    const appointmentDate = new Date(`${data.date}T${data.time}:00`);
    if (appointmentDate <= new Date()) {
        errors.push('Data e horário devem ser no futuro');
    }
    
    // Verificar disponibilidade
    if (!isTimeSlotAvailable(data.date, data.time, data.duration)) {
        errors.push('Horário não está mais disponível');
    }
    
    if (errors.length > 0) {
        alert('Erro no agendamento:\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

// Atualizar histórico do cliente
function updateClientHistory(appointmentData) {
    if (!clientHistory[appointmentData.phone]) {
        clientHistory[appointmentData.phone] = {
            name: appointmentData.name,
            appointments: [],
            noShowCount: 0,
            totalSpent: 0
        };
    }
    
    const client = clientHistory[appointmentData.phone];
    client.appointments.push({
        id: appointmentData.id,
        date: appointmentData.date,
        time: appointmentData.time,
        service: appointmentData.service,
        price: appointmentData.price,
        status: 'confirmed'
    });
    
    localStorage.setItem('clientHistory', JSON.stringify(clientHistory));
}

// Enviar notificações
async function sendNotifications(appointmentData) {
    try {
        // Preparar dados para notificação
        const serviceOption = document.querySelector(`option[value="${appointmentData.service}"]`);
        const serviceName = serviceOption.text.split(' - ')[0];
        
        const notificationData = {
            cliente: {
                nome: appointmentData.name,
                telefone: appointmentData.phone,
                whatsapp: `https://wa.me/55${appointmentData.phone}`
            },
            agendamento: {
                servico: serviceName,
                data: formatDate(appointmentData.date),
                horario: appointmentData.time,
                duracao: `${appointmentData.duration} minutos`,
                preco: `R$ ${appointmentData.price.toFixed(2).replace('.', ',')}`,
                observacoes: appointmentData.notes || 'Nenhuma'
            },
            timestamp: new Date().toLocaleString('pt-BR')
        };
        
        // Enviar por email (simulado - em produção usar serviço real)
        await sendEmailNotification(notificationData);
        
        // Preparar mensagem para WhatsApp
        const whatsappMessage = createWhatsAppMessage(notificationData);
        
        // Enviar para WhatsApp do salão (abre o WhatsApp)
        const whatsappUrl = `https://wa.me/${SALON_CONFIG.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;
        
        // Abrir em nova aba após um pequeno delay
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao enviar notificações:', error);
    }
}

// Simular envio de email
async function sendEmailNotification(data) {
    // Em produção, usar um serviço como EmailJS, Formspree, ou API própria
    console.log('📧 Email enviado para:', SALON_CONFIG.email);
    console.log('Dados do agendamento:', data);
    
    // Simular delay de envio
    return new Promise(resolve => setTimeout(resolve, 1000));
}

// Criar mensagem para WhatsApp
function createWhatsAppMessage(data) {
    return `🎀 *NOVO AGENDAMENTO - ELIANE PEIXOTO* 🎀

👤 *CLIENTE:*
Nome: ${data.cliente.nome}
Telefone: ${data.cliente.telefone}

💅 *SERVIÇO:*
${data.agendamento.servico}
Duração: ${data.agendamento.duracao}
Valor: ${data.agendamento.preco}

📅 *DATA E HORÁRIO:*
${data.agendamento.data}
${data.agendamento.horario}

📝 *OBSERVAÇÕES:*
${data.agendamento.observacoes}

⏰ *Agendado em:* ${data.timestamp}

---
Para confirmar ou entrar em contato com o cliente:
${data.cliente.whatsapp}`;
}

// Mostrar modal de confirmação
function showConfirmationModal(appointmentData) {
    const modal = document.getElementById('confirmationModal');
    const detailsDiv = document.getElementById('confirmationDetails');
    
    const serviceOption = document.querySelector(`option[value="${appointmentData.service}"]`);
    const serviceName = serviceOption.text.split(' - ')[0];
    
    detailsDiv.innerHTML = `
        <div style="text-align: left; margin: 1rem 0;">
            <p><strong>Serviço:</strong> ${serviceName}</p>
            <p><strong>Data:</strong> ${formatDate(appointmentData.date)}</p>
            <p><strong>Horário:</strong> ${appointmentData.time}</p>
            <p><strong>Valor:</strong> R$ ${appointmentData.price.toFixed(2).replace('.', ',')}</p>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // Fechar modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Compartilhar no WhatsApp (cliente)
function shareOnWhatsApp() {
    const details = document.getElementById('confirmationDetails');
    const text = `Olá! Acabei de agendar um serviço com a Eliane Peixoto:\n\n${details.textContent}\n\nObrigado(a)!`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

// Fechar modal
function closeModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}

// Gerar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Funções utilitárias para administração (podem ser expandidas)
function getAppointmentsByDate(date) {
    return appointments.filter(apt => apt.date === date);
}

function markNoShow(appointmentId, clientPhone) {
    // Marcar como não compareceu
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
        appointment.status = 'no-show';
        
        // Atualizar histórico do cliente
        if (!clientHistory[clientPhone]) {
            clientHistory[clientPhone] = {
                name: appointment.name,
                appointments: [],
                noShowCount: 0,
                totalSpent: 0
            };
        }
        
        clientHistory[clientPhone].noShowCount++;
        
        // Salvar alterações
        localStorage.setItem('appointments', JSON.stringify(appointments));
        localStorage.setItem('clientHistory', JSON.stringify(clientHistory));
    }
}

// Função para limpar dados antigos (executar periodicamente)
function cleanOldData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    appointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= thirtyDaysAgo;
    });
    
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

// Executar limpeza ao carregar a página
cleanOldData();

// Event listeners para modal
document.addEventListener('DOMContentLoaded', function() {
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
});

// Função para exportar dados (para backup)
function exportData() {
    const data = {
        appointments: appointments,
        clientHistory: clientHistory,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agendamentos-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Console commands para administração (digite no console do navegador)
window.salonAdmin = {
    getAppointments: () => appointments,
    getClientHistory: () => clientHistory,
    markNoShow: markNoShow,
    exportData: exportData,
    clearData: () => {
        localStorage.removeItem('appointments');
        localStorage.removeItem('clientHistory');
        appointments = [];
        clientHistory = {};
        console.log('Dados limpos!');
    }
};



// Funções de Status da Agenda
function updateAgendaStatus() {
    const statusCard = document.getElementById('statusCard');
    const statusIcon = statusCard.querySelector('.status-icon i');
    const statusTitle = document.getElementById('statusTitle');
    const statusMessage = document.getElementById('statusMessage');
    
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Verificar se hoje está bloqueado
    const todayBlocked = blockedDays.includes(today);
    const tomorrowBlocked = blockedDays.includes(tomorrowStr);
    
    // Contar horários disponíveis nos próximos 7 dias
    let availableSlots = 0;
    for (let i = 0; i < 7; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() + i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (!blockedDays.includes(dateStr)) {
            const slots = generateTimeSlots(dateStr, 60); // Duração padrão
            availableSlots += slots.length;
        }
    }
    
    // Atualizar status baseado na disponibilidade
    if (availableSlots === 0) {
        statusCard.className = 'status-card unavailable';
        statusIcon.className = 'fas fa-calendar-times';
        statusTitle.textContent = 'Agenda Indisponível';
        statusMessage.textContent = 'No momento não há horários disponíveis. Verifique os comunicados abaixo ou entre em contato conosco.';
    } else if (availableSlots < 10) {
        statusCard.className = 'status-card limited';
        statusIcon.className = 'fas fa-calendar-alt';
        statusTitle.textContent = 'Poucos Horários Disponíveis';
        statusMessage.textContent = `Apenas ${availableSlots} horários disponíveis nos próximos dias. Agende o quanto antes!`;
    } else {
        statusCard.className = 'status-card';
        statusIcon.className = 'fas fa-calendar-check';
        statusTitle.textContent = 'Agenda Disponível';
        statusMessage.textContent = 'Horários disponíveis para agendamento. Selecione seu serviço preferido!';
    }
}

function displayAnnouncements() {
    const announcementsDiv = document.getElementById('announcements');
    const announcementsList = document.getElementById('announcementsList');
    
    // Filtrar comunicados ativos (não expirados)
    const activeAnnouncements = announcements.filter(ann => {
        if (ann.expiryDate) {
            return new Date(ann.expiryDate) >= new Date();
        }
        return true;
    });
    
    if (activeAnnouncements.length === 0) {
        announcementsDiv.style.display = 'none';
        return;
    }
    
    announcementsDiv.style.display = 'block';
    announcementsList.innerHTML = '';
    
    activeAnnouncements.forEach(announcement => {
        const item = document.createElement('div');
        item.className = 'announcement-item';
        item.innerHTML = `
            <div class="date">${formatDate(announcement.date)}</div>
            <div class="message">${announcement.message}</div>
        `;
        announcementsList.appendChild(item);
    });
}

function showNextAvailableSlots() {
    const nextSlotsList = document.getElementById('nextSlotsList');
    const nextSlots = [];
    
    // Buscar próximos 5 horários disponíveis
    for (let i = 0; i < 14 && nextSlots.length < 5; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() + i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (!blockedDays.includes(dateStr)) {
            const slots = generateTimeSlots(dateStr, 60);
            slots.slice(0, 2).forEach(slot => {
                if (nextSlots.length < 5) {
                    nextSlots.push({
                        date: dateStr,
                        time: slot.value,
                        label: slot.label
                    });
                }
            });
        }
    }
    
    nextSlotsList.innerHTML = '';
    
    if (nextSlots.length === 0) {
        nextSlotsList.innerHTML = '<p style="text-align: center; color: var(--text-light);">Nenhum horário disponível no momento.</p>';
        return;
    }
    
    nextSlots.forEach(slot => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'next-slot';
        slotDiv.innerHTML = `
            <div class="date">${formatDate(slot.date)}</div>
            <div class="time">${slot.time}</div>
        `;
        nextSlotsList.appendChild(slotDiv);
    });
}

// Funções de Administração
function blockDay(date, reason = '') {
    if (!blockedDays.includes(date)) {
        blockedDays.push(date);
        localStorage.setItem('blockedDays', JSON.stringify(blockedDays));
        
        if (reason) {
            addAnnouncement(`Dia ${formatDate(date)} indisponível: ${reason}`, date);
        }
        
        updateAgendaStatus();
        showNextAvailableSlots();
        return true;
    }
    return false;
}

function unblockDay(date) {
    const index = blockedDays.indexOf(date);
    if (index > -1) {
        blockedDays.splice(index, 1);
        localStorage.setItem('blockedDays', JSON.stringify(blockedDays));
        updateAgendaStatus();
        showNextAvailableSlots();
        return true;
    }
    return false;
}

function blockTimeSlot(date, startTime, endTime, reason = '') {
    const slot = {
        id: generateId(),
        date: date,
        type: 'time',
        startTime: startTime,
        endTime: endTime,
        reason: reason,
        createdAt: new Date().toISOString()
    };
    
    unavailableSlots.push(slot);
    localStorage.setItem('unavailableSlots', JSON.stringify(unavailableSlots));
    
    if (reason) {
        addAnnouncement(`Horário ${startTime}-${endTime} do dia ${formatDate(date)} indisponível: ${reason}`, date);
    }
    
    updateAgendaStatus();
    showNextAvailableSlots();
    return slot.id;
}

function unblockTimeSlot(slotId) {
    const index = unavailableSlots.findIndex(slot => slot.id === slotId);
    if (index > -1) {
        unavailableSlots.splice(index, 1);
        localStorage.setItem('unavailableSlots', JSON.stringify(unavailableSlots));
        updateAgendaStatus();
        showNextAvailableSlots();
        return true;
    }
    return false;
}

function addAnnouncement(message, date = null, expiryDate = null) {
    const announcement = {
        id: generateId(),
        message: message,
        date: date || new Date().toISOString().split('T')[0],
        expiryDate: expiryDate,
        createdAt: new Date().toISOString()
    };
    
    announcements.push(announcement);
    localStorage.setItem('announcements', JSON.stringify(announcements));
    displayAnnouncements();
    return announcement.id;
}

function removeAnnouncement(announcementId) {
    const index = announcements.findIndex(ann => ann.id === announcementId);
    if (index > -1) {
        announcements.splice(index, 1);
        localStorage.setItem('announcements', JSON.stringify(announcements));
        displayAnnouncements();
        return true;
    }
    return false;
}

// Função para notificar clientes sobre mudanças na agenda
function notifyClientsAboutChange(message, affectedDate = null) {
    // Em produção, isso enviaria notificações por email/WhatsApp
    console.log('📢 Notificação para clientes:', message);
    
    if (affectedDate) {
        // Buscar agendamentos afetados
        const affectedAppointments = appointments.filter(apt => apt.date === affectedDate);
        
        affectedAppointments.forEach(appointment => {
            const clientMessage = `Olá ${appointment.name}! ${message}
            
Seu agendamento:
📅 ${formatDate(appointment.date)} às ${appointment.time}
💅 ${appointment.service}

Entre em contato conosco para reagendar: https://wa.me/${SALON_CONFIG.whatsapp}`;
            
            console.log(`📱 WhatsApp para ${appointment.phone}:`, clientMessage);
        });
    }
}

// Atualizar funções existentes para considerar mudanças na agenda
const originalUpdateAvailableTimeSlots = updateAvailableTimeSlots;
updateAvailableTimeSlots = function() {
    originalUpdateAvailableTimeSlots();
    updateAgendaStatus();
    showNextAvailableSlots();
};

// Console commands para administração (digite no console do navegador)
window.salonAdmin = {
    // Dados
    getAppointments: () => appointments,
    getClientHistory: () => clientHistory,
    getBlockedDays: () => blockedDays,
    getUnavailableSlots: () => unavailableSlots,
    getAnnouncements: () => announcements,
    
    // Gerenciamento de disponibilidade
    blockDay: (date, reason) => blockDay(date, reason),
    unblockDay: (date) => unblockDay(date),
    blockTimeSlot: (date, startTime, endTime, reason) => blockTimeSlot(date, startTime, endTime, reason),
    unblockTimeSlot: (slotId) => unblockTimeSlot(slotId),
    
    // Comunicados
    addAnnouncement: (message, date, expiryDate) => addAnnouncement(message, date, expiryDate),
    removeAnnouncement: (id) => removeAnnouncement(id),
    
    // Notificações
    notifyClients: (message, date) => notifyClientsAboutChange(message, date),
    
    // Utilitários
    markNoShow: markNoShow,
    exportData: exportData,
    clearData: () => {
        localStorage.removeItem('appointments');
        localStorage.removeItem('clientHistory');
        localStorage.removeItem('unavailableSlots');
        localStorage.removeItem('blockedDays');
        localStorage.removeItem('announcements');
        appointments = [];
        clientHistory = {};
        unavailableSlots = [];
        blockedDays = [];
        announcements = [];
        updateAgendaStatus();
        displayAnnouncements();
        showNextAvailableSlots();
        console.log('Dados limpos!');
    },
    
    // Exemplos de uso
    help: () => {
        console.log(`
🎀 SISTEMA DE ADMINISTRAÇÃO - SALÃO ELIANE PEIXOTO 🎀

BLOQUEAR DIA INTEIRO:
salonAdmin.blockDay('2025-07-25', 'Feriado - Natal');

DESBLOQUEAR DIA:
salonAdmin.unblockDay('2025-07-25');

BLOQUEAR HORÁRIO ESPECÍFICO:
salonAdmin.blockTimeSlot('2025-07-25', '14:00', '16:00', 'Compromisso pessoal');

ADICIONAR COMUNICADO:
salonAdmin.addAnnouncement('Funcionamento especial no sábado até 16h', '2025-07-25', '2025-07-26');

NOTIFICAR CLIENTES:
salonAdmin.notifyClients('Horário alterado devido a imprevisto', '2025-07-25');

VER DADOS:
salonAdmin.getAppointments()
salonAdmin.getBlockedDays()

EXPORTAR BACKUP:
salonAdmin.exportData()
        `);
    }
};



// Sistema de Relatórios
function generateAvailabilityReport() {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const report = {
        title: 'Relatório Semanal de Disponibilidade',
        period: `${formatDate(today.toISOString().split('T')[0])} a ${formatDate(nextWeek.toISOString().split('T')[0])}`,
        generatedAt: new Date().toLocaleString('pt-BR'),
        days: []
    };
    
    // Gerar relatório para os próximos 7 dias
    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dateStr = checkDate.toISOString().split('T')[0];
        const dayOfWeek = checkDate.getDay();
        
        const dayReport = {
            date: dateStr,
            dayName: checkDate.toLocaleDateString('pt-BR', { weekday: 'long' }),
            formattedDate: formatDate(dateStr),
            isBlocked: blockedDays.includes(dateStr),
            availableSlots: [],
            totalSlots: 0,
            bookedSlots: 0
        };
        
        if (!dayReport.isBlocked) {
            // Gerar todos os slots possíveis para o dia
            const daySchedule = SALON_CONFIG.businessHours.schedule[dayOfWeek];
            
            if (daySchedule && daySchedule.length > 0) {
                daySchedule.forEach(period => {
                    for (let hour = period.start; hour < period.end; hour++) {
                        const timeString = `${hour.toString().padStart(2, '0')}:00`;
                        dayReport.totalSlots++;
                        
                        if (isTimeSlotAvailable(dateStr, timeString, 60)) {
                            dayReport.availableSlots.push(timeString);
                        } else {
                            dayReport.bookedSlots++;
                        }
                    }
                });
            }
        }
        
        report.days.push(dayReport);
    }
    
    return report;
}

function generateAppointmentsReport() {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= today && aptDate <= nextWeek;
    }).sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });
    
    const report = {
        title: 'Relatório de Agendamentos',
        period: `${formatDate(today.toISOString().split('T')[0])} a ${formatDate(nextWeek.toISOString().split('T')[0])}`,
        generatedAt: new Date().toLocaleString('pt-BR'),
        totalAppointments: upcomingAppointments.length,
        totalRevenue: upcomingAppointments.reduce((sum, apt) => sum + apt.price, 0),
        appointments: upcomingAppointments.map(apt => ({
            id: apt.id,
            date: formatDate(apt.date),
            time: apt.time,
            client: apt.name,
            phone: apt.phone,
            service: getServiceName(apt.service),
            duration: apt.duration,
            price: apt.price,
            status: apt.status || 'confirmed',
            notes: apt.notes || 'Nenhuma'
        })),
        summary: {
            byService: getAppointmentsByService(upcomingAppointments),
            byDay: getAppointmentsByDay(upcomingAppointments)
        }
    };
    
    return report;
}

function getServiceName(serviceValue) {
    const serviceMap = {
        'manicure-simples': 'Manicure Simples',
        'manicure-esmaltacao': 'Manicure com Esmaltação',
        'pedicure-simples': 'Pedicure Simples',
        'pedicure-esmaltacao': 'Pedicure com Esmaltação',
        'manicure-pedicure': 'Manicure + Pedicure',
        'unha-gel': 'Unha de Gel',
        'nail-art': 'Nail Art'
    };
    return serviceMap[serviceValue] || serviceValue;
}

function getAppointmentsByService(appointments) {
    const byService = {};
    appointments.forEach(apt => {
        const serviceName = getServiceName(apt.service);
        if (!byService[serviceName]) {
            byService[serviceName] = { count: 0, revenue: 0 };
        }
        byService[serviceName].count++;
        byService[serviceName].revenue += apt.price;
    });
    return byService;
}

function getAppointmentsByDay(appointments) {
    const byDay = {};
    appointments.forEach(apt => {
        const dayName = new Date(apt.date).toLocaleDateString('pt-BR', { weekday: 'long' });
        if (!byDay[dayName]) {
            byDay[dayName] = { count: 0, revenue: 0 };
        }
        byDay[dayName].count++;
        byDay[dayName].revenue += apt.price;
    });
    return byDay;
}

function createEmailReport(reportData, reportType) {
    let emailContent = '';
    
    if (reportType === 'availability') {
        emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #1e2a4a; }
        .header { background: linear-gradient(135deg, #1e2a4a, #2c3e5c); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .day-card { border: 1px solid #e9ecef; border-radius: 8px; margin: 10px 0; padding: 15px; }
        .available { background-color: #f8f9fa; }
        .blocked { background-color: #ffebee; }
        .slots { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
        .slot { background: #d4af37; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
        .summary { background: #e6f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎀 ${reportData.title}</h1>
        <p>Período: ${reportData.period}</p>
        <p>Gerado em: ${reportData.generatedAt}</p>
    </div>
    
    <div class="content">
        <div class="summary">
            <h3>📊 Resumo da Semana</h3>
            <p><strong>Total de dias analisados:</strong> ${reportData.days.length}</p>
            <p><strong>Dias disponíveis:</strong> ${reportData.days.filter(d => !d.isBlocked).length}</p>
            <p><strong>Dias bloqueados:</strong> ${reportData.days.filter(d => d.isBlocked).length}</p>
            <p><strong>Total de horários livres:</strong> ${reportData.days.reduce((sum, d) => sum + d.availableSlots.length, 0)}</p>
        </div>
        
        <h3>📅 Disponibilidade por Dia</h3>
        ${reportData.days.map(day => `
            <div class="day-card ${day.isBlocked ? 'blocked' : 'available'}">
                <h4>${day.dayName} - ${day.formattedDate}</h4>
                ${day.isBlocked ? 
                    '<p style="color: #dc3545;"><strong>❌ Dia Bloqueado</strong></p>' :
                    `
                    <p><strong>Horários disponíveis:</strong> ${day.availableSlots.length} de ${day.totalSlots}</p>
                    <p><strong>Horários ocupados:</strong> ${day.bookedSlots}</p>
                    ${day.availableSlots.length > 0 ? 
                        `<div class="slots">
                            ${day.availableSlots.map(slot => `<span class="slot">${slot}</span>`).join('')}
                        </div>` : 
                        '<p style="color: #dc3545;">Nenhum horário disponível</p>'
                    }
                    `
                }
            </div>
        `).join('')}
        
        <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <p><small>Este relatório é gerado automaticamente pelo Sistema de Agendamento Eliane Peixoto.</small></p>
        </div>
    </div>
</body>
</html>`;
    } else if (reportType === 'appointments') {
        emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #1e2a4a; }
        .header { background: linear-gradient(135deg, #1e2a4a, #2c3e5c); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .appointment { border: 1px solid #e9ecef; border-radius: 8px; margin: 10px 0; padding: 15px; background: #f8f9fa; }
        .summary { background: #e6f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .revenue { color: #d4af37; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #1e2a4a; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>💅 ${reportData.title}</h1>
        <p>Período: ${reportData.period}</p>
        <p>Gerado em: ${reportData.generatedAt}</p>
    </div>
    
    <div class="content">
        <div class="summary">
            <h3>📊 Resumo Geral</h3>
            <p><strong>Total de agendamentos:</strong> ${reportData.totalAppointments}</p>
            <p><strong>Receita prevista:</strong> <span class="revenue">R$ ${reportData.totalRevenue.toFixed(2).replace('.', ',')}</span></p>
        </div>
        
        ${reportData.appointments.length > 0 ? `
            <h3>📋 Agendamentos Detalhados</h3>
            ${reportData.appointments.map(apt => `
                <div class="appointment">
                    <h4>🗓️ ${apt.date} às ${apt.time}</h4>
                    <p><strong>Cliente:</strong> ${apt.client}</p>
                    <p><strong>Telefone:</strong> ${apt.phone}</p>
                    <p><strong>Serviço:</strong> ${apt.service}</p>
                    <p><strong>Duração:</strong> ${apt.duration} minutos</p>
                    <p><strong>Valor:</strong> <span class="revenue">R$ ${apt.price.toFixed(2).replace('.', ',')}</span></p>
                    <p><strong>Status:</strong> ${apt.status === 'confirmed' ? '✅ Confirmado' : apt.status}</p>
                    ${apt.notes !== 'Nenhuma' ? `<p><strong>Observações:</strong> ${apt.notes}</p>` : ''}
                </div>
            `).join('')}
            
            <h3>📈 Análise por Serviço</h3>
            <table>
                <tr><th>Serviço</th><th>Quantidade</th><th>Receita</th></tr>
                ${Object.entries(reportData.summary.byService).map(([service, data]) => `
                    <tr>
                        <td>${service}</td>
                        <td>${data.count}</td>
                        <td class="revenue">R$ ${data.revenue.toFixed(2).replace('.', ',')}</td>
                    </tr>
                `).join('')}
            </table>
            
            <h3>📅 Análise por Dia</h3>
            <table>
                <tr><th>Dia da Semana</th><th>Agendamentos</th><th>Receita</th></tr>
                ${Object.entries(reportData.summary.byDay).map(([day, data]) => `
                    <tr>
                        <td>${day}</td>
                        <td>${data.count}</td>
                        <td class="revenue">R$ ${data.revenue.toFixed(2).replace('.', ',')}</td>
                    </tr>
                `).join('')}
            </table>
        ` : '<p>Nenhum agendamento encontrado para o período.</p>'}
        
        <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <p><small>Este relatório é atualizado automaticamente a cada novo agendamento.</small></p>
        </div>
    </div>
</body>
</html>`;
    }
    
    return emailContent;
}

async function sendReportEmail(reportType) {
    try {
        let reportData, emailContent, subject;
        
        if (reportType === 'availability') {
            reportData = generateAvailabilityReport();
            emailContent = createEmailReport(reportData, 'availability');
            subject = `📅 Relatório Semanal de Disponibilidade - ${reportData.period}`;
        } else if (reportType === 'appointments') {
            reportData = generateAppointmentsReport();
            emailContent = createEmailReport(reportData, 'appointments');
            subject = `💅 Relatório de Agendamentos - ${reportData.period}`;
        }
        
        // Em produção, usar serviço real de email como EmailJS, SendGrid, etc.
        console.log('📧 Enviando relatório por email...');
        console.log('Para:', SALON_CONFIG.email);
        console.log('Assunto:', subject);
        console.log('Conteúdo HTML:', emailContent);
        
        // Simular envio bem-sucedido
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ Relatório enviado com sucesso!');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao enviar relatório:', error);
        return false;
    }
}

// Função para agendar envio automático de relatórios
function scheduleAutomaticReports() {
    // Enviar relatório de disponibilidade toda segunda-feira às 8h
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
    nextMonday.setHours(8, 0, 0, 0);
    
    const timeUntilMonday = nextMonday.getTime() - now.getTime();
    
    setTimeout(() => {
        sendReportEmail('availability');
        // Repetir a cada semana
        setInterval(() => {
            sendReportEmail('availability');
        }, 7 * 24 * 60 * 60 * 1000);
    }, timeUntilMonday);
    
    console.log(`📅 Relatório semanal agendado para: ${nextMonday.toLocaleString('pt-BR')}`);
}

// Modificar função de agendamento para enviar relatório atualizado
const originalHandleFormSubmit = handleFormSubmit;
handleFormSubmit = async function(e) {
    const result = await originalHandleFormSubmit.call(this, e);
    
    // Enviar relatório atualizado de agendamentos
    if (SALON_CONFIG.reports.appointmentUpdates) {
        setTimeout(() => {
            sendReportEmail('appointments');
        }, 2000);
    }
    
    return result;
};

// Inicializar relatórios automáticos
if (SALON_CONFIG.reports.enabled) {
    scheduleAutomaticReports();
}

