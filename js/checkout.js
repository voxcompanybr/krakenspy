(function () {
  'use strict';
  var $ = KSU.$;
  var prices = KS.checkout.prices || {};
  var plan = 'vip';
  var price = prices.vip || '37,90';
  var user = new URLSearchParams(location.search).get('u') || '';

  KSU.captureUtms();

  var mail = KSU.todo(KS.supportEmail);
  $('mail').textContent = mail || 'configure o e-mail de suporte em js/config.js';
  $('mail').href = 'mailto:' + mail;
  if (window.fbq) window.fbq('track', 'ViewContent', { content_name: 'checkout' });

  Array.prototype.forEach.call(document.querySelectorAll('.plan'), function (b) {
    b.onclick = function () {
      Array.prototype.forEach.call(document.querySelectorAll('.plan'), function (x) { x.classList.remove('sel'); });
      b.classList.add('sel');
      plan = b.dataset.plan;
      price = b.dataset.price;
    };
  });

  function buildUrl() {
    var base = KSU.todo(KS.checkout.url), q = [], utm = KSU.utmString();
    if (!base) return '';
    if (utm) q.push(utm);
    q.push('plan=' + encodeURIComponent(plan));
    q.push('price=' + encodeURIComponent(price));
    if (user) q.push('ref=' + encodeURIComponent('@' + user));
    if ($('bump').checked) q.push('bump=1');
    return base + (base.indexOf('?') > -1 ? '&' : '?') + q.join('&');
  }

  $('payBtn').onclick = function () {
    var value = Number(String(price).replace(',', '.'));
    KSU.track('InitiateCheckout', { content_name: plan, value: value, currency: 'BRL' });

    if (KS.checkout.mode === 'whatsapp') {
      var wa = KSU.todo(KS.checkout.whatsapp);
      if (!wa) return KSU.toast('Configure o WhatsApp em js/config.js');
      var msg = 'Quero o acesso VIP do ' + KS.brand + (user ? ' (perfil @' + user + ')' : '') + ' — plano ' + plan;
      location.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg);
      return;
    }

    var url = buildUrl();
    if (!url) return KSU.toast('Configure o link de checkout em js/config.js');
    location.href = url;
  };
})();
