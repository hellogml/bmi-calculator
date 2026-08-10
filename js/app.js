/* ===== BMI Calculator — Pure Frontend Logic ===== */
/* No API. Metric + Imperial dual units. WHO classification. */

(function () {
  'use strict';

  var unit = 'metric'; // 'metric' or 'imperial'
  var heightInput = document.getElementById('height');
  var weightInput = document.getElementById('weight');
  var heightSuffix = document.getElementById('height-suffix');
  var weightSuffix = document.getElementById('weight-suffix');
  var metricBtn = document.getElementById('unit-metric');
  var imperialBtn = document.getElementById('unit-imperial');
  var calcBtn = document.getElementById('calc-btn');
  var errorMsg = document.getElementById('error-msg');
  var results = document.getElementById('results');

  // ---- Unit toggle ----
  function setUnit(u) {
    unit = u;
    if (u === 'metric') {
      metricBtn.classList.add('active');
      imperialBtn.classList.remove('active');
      heightSuffix.textContent = 'cm';
      weightSuffix.textContent = 'kg';
      heightInput.placeholder = 'e.g. 175';
      weightInput.placeholder = 'e.g. 70';
    } else {
      imperialBtn.classList.add('active');
      metricBtn.classList.remove('active');
      heightSuffix.textContent = 'in';
      weightSuffix.textContent = 'lb';
      heightInput.placeholder = 'e.g. 69';
      weightInput.placeholder = 'e.g. 154';
    }
    heightInput.value = '';
    weightInput.value = '';
  }
  if (metricBtn) metricBtn.addEventListener('click', function () { setUnit('metric'); });
  if (imperialBtn) imperialBtn.addEventListener('click', function () { setUnit('imperial'); });

  // ---- BMI calculation ----
  function calcBMI(h, w, u) {
    var bmi;
    if (u === 'metric') {
      // height in cm → m, weight in kg
      var hM = h / 100;
      if (hM <= 0) return null;
      bmi = w / (hM * hM);
    } else {
      // height in inches, weight in pounds
      if (h <= 0) return null;
      bmi = (w * 703) / (h * h);
    }
    return bmi;
  }

  // ---- WHO classification ----
  function classify(bmi) {
    if (bmi < 18.5) return { cat: 'underweight', label: 'Underweight', range: 'Below 18.5' };
    if (bmi < 25)   return { cat: 'normal',      label: 'Normal weight', range: '18.5 – 24.9' };
    if (bmi < 30)   return { cat: 'overweight',  label: 'Overweight', range: '25.0 – 29.9' };
    if (bmi < 35)   return { cat: 'obese',       label: 'Obese (Class I)', range: '30.0 – 34.9' };
    if (bmi < 40)   return { cat: 'obese',       label: 'Obese (Class II)', range: '35.0 – 39.9' };
    return { cat: 'obese', label: 'Obese (Class III)', range: '40.0 and above' };
  }

  // ---- Health advice per category ----
  function advice(cat) {
    switch (cat) {
      case 'underweight':
        return 'Your BMI is below the normal range. Consider consulting a healthcare provider or dietitian to develop a balanced nutrition plan that supports healthy weight gain.';
      case 'normal':
        return 'Your BMI is within the healthy range. Maintain a balanced diet and regular physical activity to keep your weight in this zone.';
      case 'overweight':
        return 'Your BMI is above the normal range. A combination of regular exercise and a mindful diet can help move toward the healthy range. Consider consulting a healthcare professional for personalized guidance.';
      case 'obese':
        return 'Your BMI indicates obesity. We recommend consulting a healthcare provider for a comprehensive assessment and a personalized health plan.';
      default:
        return '';
    }
  }

  // ---- Healthy weight range for the given height ----
  function healthyRange(h, u) {
    var minBMI = 18.5, maxBMI = 24.9;
    if (u === 'metric') {
      var hM = h / 100;
      return { min: (minBMI * hM * hM), max: (maxBMI * hM * hM), unit: 'kg' };
    } else {
      return { min: (minBMI * h * h) / 703, max: (maxBMI * h * h) / 703, unit: 'lb' };
    }
  }

  function fmt(val) {
    return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function showError(msg) { errorMsg.textContent = msg; errorMsg.classList.add('show'); results.classList.remove('show'); }
  function clearError() { errorMsg.textContent = ''; errorMsg.classList.remove('show'); }

  // ---- Render ----
  function render(bmi) {
    var c = classify(bmi);

    // Hero
    var hero = document.getElementById('r-hero');
    hero.className = 'result-hero ' + c.cat;
    document.getElementById('r-bmi').textContent = fmt(bmi);
    document.getElementById('r-category').textContent = c.label;
    document.getElementById('r-range').textContent = 'WHO category: ' + c.range;

    // Advice
    document.getElementById('r-advice-text').textContent = advice(c.cat);

    // Healthy weight range
    var h = parseFloat(heightInput.value);
    var hr = healthyRange(h, unit);
    document.getElementById('r-healthy-range').textContent = fmt(hr.min) + ' – ' + fmt(hr.max) + ' ' + hr.unit;

    // Scale marker position (BMI 15 → 40 mapped to 0% → 100%)
    var pos = ((bmi - 15) / (40 - 15)) * 100;
    if (pos < 0) pos = 0;
    if (pos > 100) pos = 100;
    var marker = document.getElementById('scale-marker');
    marker.style.marginLeft = pos + '%';

    results.classList.add('show');
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function onCalculate() {
    clearError();
    var h = parseFloat(heightInput.value);
    var w = parseFloat(weightInput.value);

    if (isNaN(h) || h <= 0) { showError('Please enter a valid height.'); return; }
    if (isNaN(w) || w <= 0) { showError('Please enter a valid weight.'); return; }

    // Sanity bounds
    if (unit === 'metric') {
      if (h < 50 || h > 250) { showError('Please enter a height between 50 and 250 cm.'); return; }
      if (w < 20 || w > 300) { showError('Please enter a weight between 20 and 300 kg.'); return; }
    } else {
      if (h < 20 || h > 100) { showError('Please enter a height between 20 and 100 inches.'); return; }
      if (w < 44 || w > 660) { showError('Please enter a weight between 44 and 660 lb.'); return; }
    }

    var bmi = calcBMI(h, w, unit);
    if (bmi === null) { showError('Could not calculate BMI. Please check your inputs.'); return; }
    render(bmi);
  }

  if (calcBtn) calcBtn.addEventListener('click', onCalculate);

  // Contact form
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('contact-status');
      if (status) {
        status.textContent = 'Thank you for your message. We will get back to you soon.';
        status.style.color = 'var(--success, #2e7d32)';
      }
      contactForm.reset();
    });
  }

  if (heightInput) heightInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') onCalculate(); });
  if (weightInput) weightInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') onCalculate(); });

  // Init
  if (metricBtn) setUnit('metric');

  // ===== Cookie Consent =====
  var cookieBanner = document.getElementById('cookie-banner');
  if (cookieBanner) {
    if (!localStorage.getItem('cookie-consent')) cookieBanner.classList.add('show');
    var acceptBtn = document.getElementById('cookie-accept');
    var declineBtn = document.getElementById('cookie-decline');
    if (acceptBtn) acceptBtn.addEventListener('click', function () { localStorage.setItem('cookie-consent', 'accepted'); cookieBanner.classList.remove('show'); });
    if (declineBtn) declineBtn.addEventListener('click', function () { localStorage.setItem('cookie-consent', 'declined'); cookieBanner.classList.remove('show'); });
  }
})();
