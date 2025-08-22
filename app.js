const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];

const state = {
  meta: { numero: '', cliente: '', validezDias: 7, moneda: 'USD', notas: '' },
  items: [],
  ajustes: { descuentoPct: 0, impuestoPct: 0, envio: 0 },
};

function formatCurrency(value, currency) {
  try { return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(value || 0); } catch { return value.toFixed(2); }
}

function render() {
  const { meta, items, ajustes } = state;
  const subtotal = items.reduce((s, it) => s + (Number(it.cantidad)||0) * (Number(it.precio)||0), 0);
  const descuento = subtotal * (Number(ajustes.descuentoPct)||0) / 100;
  const base = subtotal - descuento;
  const impuesto = base * (Number(ajustes.impuestoPct)||0) / 100;
  const total = base + impuesto + (Number(ajustes.envio)||0);

  $('#app').innerHTML = `
    <div class="container">
      <div class="header">
        <div class="brand">
          <div class="logo"></div>
          <h1>Cotizador</h1>
        </div>
        <div class="actions">
          <button id="btn-print">Imprimir / PDF</button>
          <button class="secondary" id="btn-clear">Limpiar</button>
          <span class="badge">Moneda: ${meta.moneda}</span>
        </div>
      </div>

      <div class="grid">
        <div class="panel">
          <div class="input-row">
            <div>
              <label>N° Cotización</label>
              <input id="meta-numero" placeholder="0001" value="${meta.numero}">
            </div>
            <div>
              <label>Cliente</label>
              <input id="meta-cliente" placeholder="Nombre / Empresa" value="${meta.cliente}">
            </div>
          </div>
          <div class="input-row" style="margin-top:12px">
            <div>
              <label>Validez (días)</label>
              <input id="meta-validez" type="number" min="0" value="${meta.validezDias}">
            </div>
            <div>
              <label>Moneda</label>
              <select id="meta-moneda">
                ${['USD','EUR','MXN','COP','ARS','CLP','PEN'].map(m => `<option ${m===meta.moneda?'selected':''}>${m}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="margin-top:12px">
            <label>Notas</label>
            <textarea id="meta-notas" rows="3" placeholder="Condiciones, tiempos de entrega, forma de pago, etc.">${meta.notas}</textarea>
          </div>
        </div>

        <div class="panel">
          <div class="input-row">
            <div>
              <label>Descuento %</label>
              <input id="aj-desc" type="number" min="0" max="100" step="0.01" value="${ajustes.descuentoPct}">
            </div>
            <div>
              <label>Impuesto %</label>
              <input id="aj-imp" type="number" min="0" max="100" step="0.01" value="${ajustes.impuestoPct}">
            </div>
          </div>
          <div style="margin-top:12px" class="input-row">
            <div>
              <label>Envío</label>
              <input id="aj-env" type="number" min="0" step="0.01" value="${ajustes.envio}">
            </div>
            <div style="align-self:end">
              <button id="btn-add">Añadir ítem</button>
            </div>
          </div>
        </div>
      </div>

      <div class="panel" style="margin-top:18px">
        <table class="table">
          <thead>
            <tr>
              <th style="width:40%">Descripción</th>
              <th>Cant.</th>
              <th>Precio</th>
              <th>Importe</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${items.map((it, idx) => `
              <tr>
                <td><input data-k="desc" data-i="${idx}" placeholder="Producto / servicio" value="${it.desc||''}"></td>
                <td><input data-k="cantidad" data-i="${idx}" type="number" min="0" step="1" value="${it.cantidad||0}"></td>
                <td><input data-k="precio" data-i="${idx}" type="number" min="0" step="0.01" value="${it.precio||0}"></td>
                <td>${formatCurrency((Number(it.cantidad)||0)*(Number(it.precio)||0), meta.moneda)}</td>
                <td><button class="danger" data-del="${idx}">Quitar</button></td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align:right;color:var(--muted)">Subtotal</td>
              <td colspan="2">${formatCurrency(subtotal, meta.moneda)}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align:right;color:var(--muted)">Descuento</td>
              <td colspan="2">-${formatCurrency(descuento, meta.moneda)}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align:right;color:var(--muted)">Impuesto</td>
              <td colspan="2">${formatCurrency(impuesto, meta.moneda)}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align:right;color:var(--muted)">Envío</td>
              <td colspan="2">${formatCurrency(Number(ajustes.envio)||0, meta.moneda)}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align:right">Total</td>
              <td colspan="2">${formatCurrency(total, meta.moneda)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="footer">Hecho con ❤️ — Cotizador simple</div>
    </div>
  `;

  attachEvents();
  persist();
}

function attachEvents() {
  $('#btn-add')?.addEventListener('click', () => {
    state.items.push({ desc: '', cantidad: 1, precio: 0 });
    render();
  });
  $$('#app [data-k]')?.forEach(inp => {
    inp.addEventListener('input', (e) => {
      const i = Number(inp.getAttribute('data-i'));
      const k = inp.getAttribute('data-k');
      state.items[i][k] = inp.type === 'number' ? Number(inp.value) : inp.value;
      render();
    });
  });
  $$('#app [data-del]')?.forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.getAttribute('data-del'));
      state.items.splice(i, 1);
      render();
    });
  });
  $('#meta-numero')?.addEventListener('input', e => { state.meta.numero = e.target.value; persist(); });
  $('#meta-cliente')?.addEventListener('input', e => { state.meta.cliente = e.target.value; persist(); });
  $('#meta-validez')?.addEventListener('input', e => { state.meta.validezDias = Number(e.target.value||0); persist(); });
  $('#meta-moneda')?.addEventListener('change', e => { state.meta.moneda = e.target.value; render(); });
  $('#meta-notas')?.addEventListener('input', e => { state.meta.notas = e.target.value; persist(); });
  $('#aj-desc')?.addEventListener('input', e => { state.ajustes.descuentoPct = Number(e.target.value||0); render(); });
  $('#aj-imp')?.addEventListener('input', e => { state.ajustes.impuestoPct = Number(e.target.value||0); render(); });
  $('#aj-env')?.addEventListener('input', e => { state.ajustes.envio = Number(e.target.value||0); render(); });
  $('#btn-print')?.addEventListener('click', () => window.print());
  $('#btn-clear')?.addEventListener('click', () => { if (confirm('¿Limpiar cotización?')) { localStorage.removeItem('cotizador-state'); Object.assign(state, { meta:{ numero:'', cliente:'', validezDias:7, moneda: state.meta.moneda, notas:'' }, items:[], ajustes:{ descuentoPct:0, impuestoPct:0, envio:0 } }); render(); } });
}

function persist() {
  localStorage.setItem('cotizador-state', JSON.stringify(state));
}

function load() {
  const raw = localStorage.getItem('cotizador-state');
  if (!raw) return;
  try { const s = JSON.parse(raw); Object.assign(state, s); } catch {}
}

load();
render();