/* KrakenSpy — configuração central. Alterar só aqui. */
window.KS = {
  brand: 'KrakenSpy',

  /* e-mail de suporte (deixe vazio para esconder o bloco de dúvidas) */
  supportEmail: '',

  checkout: {
    mode: 'external',            // 'external' ou 'whatsapp'
    url: '',                     // ex: https://pay.seudominio.com.br/krakenspy-vip
    whatsapp: '',                // ex: 5511999999999
    prices: { vip: '37,90', lifetime: '67,90', bump: '9,90' }
  },

  freeChats: 3,                  // conversas abertas antes do paywall
  trialMinutes: 10,              // 0 = sem contador de tempo
  searchPerDevice: 0,            // 1 = trava em 1 pesquisa por dispositivo

  pixel: { meta: '', clarity: '' }
};
