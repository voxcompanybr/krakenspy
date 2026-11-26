(function () {
  'use strict';
  var $ = KSU.$, plan = 'vip', price = '37.90', user = new URLSearchParams(location.search).get('u') || '';

  KSU.captureUtms();
  $('mail').textContent = KS.supportEmail;
  $('mail').href = 'mailto:' + KS.supportEmail;
  if (window.fbq) window.fbq('track', 'ViewContent', { content_name: 'checkout' });

  Array.prototype.forEach.call(document.querySelectorAll('.plan'), function (b) {
    b.onclick = function () {
      Array.prototype.forEach.call(document.querySelectorAll('.plan'), function (x) { x.classList.remove('sel'); });
      b.classList.add('sel');
      plan = b.dataset.plan; price = b.dataset.price;
    };
  });

  function buildUrl() {
    var base = KS.checkout.url, q = [], utm = KSU.utmString();
    if (utm) q.push(utm);
    q.push('plan=' + encodeURIComponent(plan));
    q.push('price=' + encodeURIComponent(price));
    if (user) q.push('ref=' + encodeURIComponent('@' + user));
    if ($('bump').checked) q.push('bump=1');
    if (!base) return '';
    return base + (base.indexOf('?') > -1 ? '&' : '?') + q.join('&');
  }

  $('payBtn').onclick = function () {
    KSU.track('InitiateCheckout', { content_name: plan, value: Number(price), currency: 'BRL' });
    if (KS.checkout.mode === 'whatsapp') {
      var msg = 'Quero o acesso VIP do ' + KS.brand + (user ? ' (perfil @' + user + ')' : '') + ' — plano ' + plan;
      location.href = 'https://wa.me/' + KS.checkout.whatsapp + '?text=' + encodeURIComponent(msg);
      return;
    }
    var url = buildUrl();
    if (!url) { KSU.toast('Configure o link de checkout em js/config.js'); return; }
    location.href = url;
  };
})();
