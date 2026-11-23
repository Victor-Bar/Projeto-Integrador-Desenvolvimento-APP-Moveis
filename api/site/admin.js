module.exports = function adminPage() {
    return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Administração - Projeto Integrador</title>
  <style>
    * { box-sizing: border-box; }
    body { font: 16px system-ui, sans-serif; margin: 0; padding: 32px 20px; color: #20242b; background: #f3f4f6; }
    main { width: min(100%, 1120px); margin: 0 auto; padding: 24px; border-radius: 16px; background: white; }
    h1, h2, p { margin-top: 0; }
    button { font: inherit; padding: 10px 14px; border: 0; border-radius: 8px; color: white; background: #d62828; cursor: pointer; }
    button:disabled { opacity: .6; cursor: wait; }
    .secondary-button { color: #454a54; background: #f3f4f6; }
    .login-card { max-width: 440px; margin-top: 10vh; }
    .form { display: grid; gap: 12px; }
    input { width: 100%; padding: 12px; border: 1px solid #dfe2e7; border-radius: 8px; font: inherit; }
    .notice { color: #737985; font-size: 14px; }
    .error { color: #b42318; min-height: 1.5em; }
    .dashboard-header, .section-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .dashboard { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .panel { min-width: 0; padding: 18px; border: 1px solid #eceef1; border-radius: 12px; }
    .record { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 0; border-bottom: 1px solid #eceef1; }
    .record:last-child { border-bottom: 0; }
    .record-copy { min-width: 0; overflow-wrap: anywhere; }
    .record-copy p { margin: 4px 0 0; color: #737985; font-size: 14px; }
    .record-actions { display: flex; flex: 0 0 auto; gap: 8px; }
    .record-actions button { padding: 7px 10px; }
    .sos-record { width: 100%; color: #20242b; text-align: left; background: white; border-bottom: 1px solid #eceef1; border-radius: 0; }
    .empty { color: #737985; padding: 18px 0; }
    .modal { position: fixed; inset: 0; z-index: 1; display: none; place-items: center; overflow: auto; padding: 20px; background: rgba(32, 36, 43, .5); }
    .modal.open { display: grid; }
    .modal-card { width: min(100%, 560px); max-height: 90vh; overflow: auto; padding: 24px; border-radius: 16px; background: white; box-shadow: 0 16px 48px rgba(0, 0, 0, .2); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
    .sos-overview { padding: 16px; border: 1px solid #eceef1; border-radius: 12px; background: #fafafa; }
    .sos-overview-header, .sos-contacts-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .sos-overview-label, .sos-person-label { color: #737985; font-size: 12px; font-weight: 600; }
    .sos-overview-time { display: block; margin-top: 5px; color: #20242b; font-size: 18px; }
    .sos-status-badge { flex: 0 0 auto; padding: 6px 10px; border-radius: 999px; color: #a32121; background: #fce8e8; font-size: 12px; font-weight: 700; }
    .sos-person-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
    .sos-person-field { min-width: 0; padding: 11px 12px; border: 1px solid #eceef1; border-radius: 10px; background: white; }
    .sos-person-value { margin: 5px 0 0; color: #20242b; font-weight: 600; overflow-wrap: anywhere; }
    .sos-contacts-section { margin-top: 16px; }
    .sos-contacts-header { margin-bottom: 10px; }
    .sos-contacts-header h3 { margin: 0; font-size: 16px; }
    .sos-contacts-count { color: #737985; font-size: 13px; }
    .sos-contacts-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 220px; overflow-y: auto; overscroll-behavior: contain; padding: 2px 6px 2px 2px; }
    .sos-contact-card { min-width: 0; padding: 12px; border: 1px solid #eceef1; border-radius: 10px; background: white; }
    .sos-contact-name { margin: 0; color: #20242b; font-size: 14px; }
    .sos-contact-detail { margin: 6px 0 0; color: #737985; font-size: 13px; overflow-wrap: anywhere; }
    .sos-contacts-empty { grid-column: 1 / -1; margin: 0; padding: 14px; border: 1px dashed #dfe2e7; border-radius: 10px; color: #737985; text-align: center; }
    .sos-actions { display: flex; gap: 8px; margin-top: 12px; }
    .sos-actions button { flex: 1; }
    .sos-status-form { display: grid; gap: 12px; margin-top: 16px; }
    .sos-status-form select, .sos-status-form textarea { width: 100%; font: inherit; border: 1px solid #dfe2e7; border-radius: 8px; padding: 10px; }
    .sos-status-form textarea { min-height: 90px; resize: vertical; }
    [hidden] { display: none !important; }
    @media (max-width: 720px) { .dashboard { grid-template-columns: 1fr; } }
    @media (max-width: 480px) { .sos-person-grid, .sos-contacts-list { grid-template-columns: 1fr; } }
    @media (max-width: 480px) { body { padding: 16px 10px; } main { padding: 18px; } .record { align-items: flex-start; flex-direction: column; } }
  </style>
</head>
<body>
  <main class="login-card" id="login-page">
    <h1>Entrar no painel</h1>
    <p class="notice">Tela demonstrativa. O login não é validado nem protege as rotas da API.</p>
    <form class="form" id="login-form">
      <input name="username" placeholder="Usuário" autocomplete="username" required>
      <input name="password" type="password" placeholder="Senha" autocomplete="current-password" required>
      <button type="submit">Entrar</button>
    </form>
  </main>
  <main id="dashboard" hidden>
    <div class="dashboard-header">
      <div>
        <h1>Painel administrativo</h1>
        <p class="notice">Acesso demonstrativo; este painel não realiza autenticação.</p>
      </div>
      <button type="button" class="secondary-button" id="refresh">Atualizar</button>
    </div>
    <p class="error" id="page-message" role="status"></p>
    <div class="dashboard">
      <section class="panel">
        <div class="section-header">
          <h2>Usuários</h2>
          <button type="button" id="open-user-modal">Adicionar</button>
        </div>
        <div id="users-list"></div>
      </section>
      <section class="panel">
        <div class="section-header">
          <h2>Chamados SOS</h2>
          <span id="sos-count" class="notice"></span>
        </div>
        <div id="sos-list"></div>
      </section>
    </div>
  </main>
  <div class="modal" id="user-modal" aria-hidden="true">
    <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
      <h2 id="user-modal-title">Novo usuário</h2>
      <form class="form" id="user-form">
        <input name="username" placeholder="Usuário" autocomplete="username" required>
        <input name="email" type="email" placeholder="E-mail" autocomplete="email" required>
        <input name="address" placeholder="Endereço" autocomplete="street-address">
        <input name="password" type="password" placeholder="Senha (mínimo 8 caracteres)" minlength="8" autocomplete="new-password">
        <p class="notice" id="user-modal-hint"></p>
        <p class="error" id="user-message" role="status"></p>
        <div class="modal-actions">
          <button type="button" class="secondary-button" id="close-user-modal">Cancelar</button>
          <button type="submit" id="save-user">Criar usuário</button>
        </div>
      </form>
    </section>
  </div>
  <div class="modal" id="sos-modal" aria-hidden="true">
    <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="sos-modal-title">
      <h2 id="sos-modal-title">Dados do chamado</h2>
      <div id="sos-details"></div>
      <div class="modal-actions">
        <button type="button" id="close-sos-modal">Fechar</button>
      </div>
    </section>
  </div>
  <script src="/admin-assets/admin.js" defer></script>
</body>
</html>`;
};
