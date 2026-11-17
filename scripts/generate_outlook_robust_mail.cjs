const fs = require('fs');
const path = require('path');

// Récupérer le GIF et les logos en Base64
const gifB64 = fs.readFileSync(path.join(__dirname, '..', 'public', 'images', 'atlas-presentation.gif')).toString('base64');
const logoB64 = fs.readFileSync(path.join(__dirname, '..', 'public', 'images', 'cfdt_logo_texte.png')).toString('base64');
const votezB64 = fs.readFileSync(path.join(__dirname, '..', 'public', 'images', 'votez_cfdt.png')).toString('base64');

// Code HTML spécifiquement durci pour le moteur Word d'Outlook :
// - Utilisation systématique de la balise <font color="..."> pour empêcher Outlook de forcer le texte en noir sur fond sombre
// - Attributs HTML natifs bgcolor="..." ET style="background-color:..." sur chaque <td> pour garantir les fonds de cartes
// - Tableaux imbriqués avec cellpadding="0" et cellspacing="0"
// - Styles inline sans dépendance CSS externe

const htmlContent = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ATLAS - CFDT Gennevilliers</title>
  <style type="text/css">
    body { margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    td { font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    a { color:#ea580c; text-decoration:none; }
    
    .toolbar-helper {
      max-width: 650px;
      margin: 15px auto;
      background: #0f172a;
      color: #ffffff;
      border-radius: 12px;
      padding: 16px 20px;
      border: 1px solid #334155;
    }
    .btn-copy {
      background: #ea580c;
      color: #ffffff;
      border: none;
      padding: 12px 22px;
      font-size: 15px;
      font-weight: 800;
      border-radius: 8px;
      cursor: pointer;
    }
    .btn-copy:hover {
      background: #c2410c;
    }
  </style>
</head>
<body bgcolor="#f1f5f9" style="margin:0; padding:0; background-color:#f1f5f9;">

  <!-- BARRE OUTILS COPIE -->
  <div class="toolbar-helper" id="helper-bar">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <div style="font-size:11px; text-transform:uppercase; color:#fb923c; font-weight:800; letter-spacing:1px;">
          Version Blindée 100% Compatible Outlook
        </div>
        <div style="font-size:16px; font-weight:900; margin-top:2px;">
          Modèle d'E-mail ATLAS • CFDT Gennevilliers
        </div>
      </div>
      <button type="button" class="btn-copy" onclick="copyEmailBody()" id="copy-btn">
        📋 Copier le mail pour Outlook
      </button>
    </div>
  </div>

  <!-- ZONE COPIABLE POUR OUTLOOK -->
  <div id="email-content-wrapper">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f1f5f9" style="width:100%; margin:0; padding:20px 0; background-color:#f1f5f9;">
      <tr>
        <td align="center" valign="top">

          <!-- CONTENEUR PRINCIPAL 640PX -->
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="width:640px; max-width:640px; background-color:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #cbd5e1;">

            <!-- BANDEAU TOP ORANGE -->
            <tr>
              <td bgcolor="#ea580c" align="center" style="background-color:#ea580c; padding:10px 15px;">
                <font color="#ffffff" size="2" face="'Segoe UI', Tahoma, Arial, sans-serif" style="color:#ffffff; font-size:12px; font-weight:bold; letter-spacing:0.5px; text-transform:uppercase;">
                  ✨ FAIT À GENNEVILLIERS • PORTAIL NUMÉRIQUE GRATUIT &amp; ANONYME POUR TOUS LES AGENTS
                </font>
              </td>
            </tr>

            <!-- EN-TÊTE SOMBRE AVEC TITRE BLANC PROTÉGÉ POUR OUTLOOK -->
            <tr>
              <td bgcolor="#0f172a" style="background-color:#0f172a; padding:28px 28px 24px 28px; border-bottom:4px solid #ea580c;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <!-- LOGO CFDT -->
                    <td width="95" valign="middle" style="padding-right:18px;">
                      <a href="https://atlas-cfdt.vercel.app/" target="_blank">
                        <img src="data:image/png;base64,${logoB64}" alt="CFDT" width="85" border="0" style="display:block; width:85px; max-width:85px; height:auto; background-color:#ffffff; padding:6px; border-radius:8px;" />
                      </a>
                    </td>

                    <!-- TEXTES EN-TÊTE : FORCE LE BLANC POUR OUTLOOK -->
                    <td valign="middle">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:6px;">
                        <tr>
                          <td bgcolor="#ea580c" style="background-color:#ea580c; border-radius:12px; padding:3px 10px;">
                            <font color="#ffffff" size="1" face="'Segoe UI', Tahoma, Arial, sans-serif" style="color:#ffffff; font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">
                              CFDT INTERCO • MAIRIE DE GENNEVILLIERS
                            </font>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- TITRE ATLAS FORCÉ BLANC -->
                      <h1 style="margin:4px 0 0 0; font-size:32px; line-height:36px; font-weight:900; color:#ffffff !important;">
                        <font color="#ffffff" face="'Segoe UI', Tahoma, Arial, sans-serif" style="color:#ffffff;">
                          ATLAS
                        </font>
                      </h1>

                      <!-- SOUS TITRE FORCÉ CLAIR -->
                      <p style="margin:4px 0 0 0; font-size:14px; line-height:20px; font-weight:bold; color:#cbd5e1 !important;">
                        <font color="#cbd5e1" face="'Segoe UI', Tahoma, Arial, sans-serif" style="color:#cbd5e1;">
                          Votre assistant syndical, simulateur de paie, de carrière &amp; d'information statutaire
                        </font>
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- LE GIF ANIMÉ HAUTE QUALITÉ -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:20px;">
                  <tr>
                    <td align="center">
                      <a href="https://atlas-cfdt.vercel.app/" target="_blank" style="display:block;">
                        <img src="data:image/gif;base64,${gifB64}" alt="Aperçu animé ATLAS" width="580" border="0" style="display:block; width:100%; max-width:580px; height:auto; border-radius:10px; border:2px solid #334155;" />
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- GROS BOUTON OUVRIR ATLAS -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center" bgcolor="#ea580c" style="background-color:#ea580c; border-radius:8px; padding:12px 28px;">
                            <a href="https://atlas-cfdt.vercel.app/" target="_blank" style="color:#ffffff; font-size:15px; font-weight:bold; text-decoration:none; display:inline-block;">
                              <font color="#ffffff" face="'Segoe UI', Tahoma, Arial, sans-serif" style="color:#ffffff; font-weight:bold;">
                                👉 Accéder directement à ATLAS (atlas-cfdt.vercel.app) →
                              </font>
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- CORPS DU MESSAGE -->
            <tr>
              <td style="padding:26px 30px 14px 30px; color:#1e293b; font-size:15px; line-height:24px;">
                <p style="margin:0 0 12px 0; font-weight:bold; font-size:16px; color:#0f172a;">
                  Bonjour à toutes et à tous,
                </p>
                <p style="margin:0 0 12px 0; color:#334155;">
                  Vos collègues de la <strong>CFDT de Gennevilliers</strong> ont mis en ligne <strong><a href="https://atlas-cfdt.vercel.app/" target="_blank" style="color:#ea580c; font-weight:bold; text-decoration:underline;">ATLAS</a></strong>, un portail complet créé pour vous accompagner dans votre quotidien professionnel à la Mairie.
                </p>
                <p style="margin:0; color:#334155;">
                  Que vous soyez <strong>fonctionnaire titulaire, stagiaire ou agent contractuel</strong>, accédez instantanément à vos réponses sur vos primes, vos congés, votre carrière et vos droits statutaires.
                </p>
              </td>
            </tr>

            <!-- SECTION 1 : BOÎTE À OUTILS -->
            <tr>
              <td style="padding:10px 30px 15px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-bottom:2px solid #ffedd5; padding-bottom:6px; margin-bottom:14px;">
                  <tr>
                    <td>
                      <font color="#ea580c" size="2" style="font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;">1. Rémunération &amp; Pouvoir d'Achat</font>
                      <h2 style="margin:2px 0 0 0; font-size:19px; font-weight:bold; color:#0f172a;">
                        🧮 Simulateurs de Paie &amp; Boîte à Outils
                      </h2>
                    </td>
                  </tr>
                </table>

                <!-- CARTE FICHE DE PAIE AVEC BGCOLOR VERT CLAIR EXPLICITE -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ecfdf5" style="background-color:#ecfdf5; border:1px solid #6ee7b7; border-radius:10px; margin-bottom:12px;">
                  <tr>
                    <td bgcolor="#ecfdf5" style="background-color:#ecfdf5; padding:15px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:6px;">
                        <tr>
                          <td bgcolor="#059669" style="background-color:#059669; border-radius:6px; padding:2px 8px;">
                            <font color="#ffffff" size="1" style="font-weight:bold; text-transform:uppercase;">✨ Nouveau • Modèle officiel OpenFisca</font>
                          </td>
                        </tr>
                      </table>
                      <div style="font-size:16px; font-weight:bold; color:#064e3b; margin-bottom:4px;">
                        📄 Audit &amp; Décryptage de Fiche de Paie ligne par ligne
                      </div>
                      <div style="font-size:13px; line-height:20px; color:#065f46;">
                        Téléversez votre bulletin ou testez un profil type : ATLAS explique chaque ligne (traitement indiciaire, IFSE, cotisations CNRACL/RAFP, CSG/CRDS) en toute confidentialité.
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- GRILLE 2X2 DES OUTILS AVEC BGCOLOR EXPLICITE (#f8fafc) ET BORDURE -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="48%" valign="top" style="padding-bottom:10px; padding-right:6px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f8fafc" style="background-color:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
                        <tr>
                          <td bgcolor="#f8fafc" style="background-color:#f8fafc; padding:12px;">
                            <div style="font-size:13.5px; font-weight:bold; color:#0f172a; margin-bottom:4px;">💶 Primes IFSE, CIA &amp; 13e Mois</div>
                            <div style="font-size:12px; line-height:17px; color:#475569;">Estimez vos primes mensuelles, le CIA et votre 13ème mois selon votre cadre d'emplois.</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td width="48%" valign="top" style="padding-bottom:10px; padding-left:6px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f8fafc" style="background-color:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
                        <tr>
                          <td bgcolor="#f8fafc" style="background-color:#f8fafc; padding:12px;">
                            <div style="font-size:13.5px; font-weight:bold; color:#0f172a; margin-bottom:4px;">📊 Net à Payer &amp; Heures Sup' (IHTS)</div>
                            <div style="font-size:12px; line-height:17px; color:#475569;">Consultez les grilles indiciaires, convertissez brut/net et chiffrez vos heures majorées.</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td width="48%" valign="top" style="padding-right:6px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f8fafc" style="background-color:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
                        <tr>
                          <td bgcolor="#f8fafc" style="background-color:#f8fafc; padding:12px;">
                            <div style="font-size:13.5px; font-weight:bold; color:#0f172a; margin-bottom:4px;">🚆 Navigo (75 %), SFT &amp; Déplacements</div>
                            <div style="font-size:12px; line-height:17px; color:#475569;">Calculez votre prise en charge transport, le Supplément Familial et vos frais de mission.</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td width="48%" valign="top" style="padding-left:6px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f8fafc" style="background-color:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
                        <tr>
                          <td bgcolor="#f8fafc" style="background-color:#f8fafc; padding:12px;">
                            <div style="font-size:13.5px; font-weight:bold; color:#0f172a; margin-bottom:4px;">🏖️ RTT, Maladie &amp; Impôt (PAS 2026)</div>
                            <div style="font-size:12px; line-height:17px; color:#475569;">Calcul des droits à congés, suivi maladie CMO/CLM et contrôle du prélèvement à la source.</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- SECTION 2 : CARRIÈRE AVEC BGCOLOR ORANGE CLAIR EXPLICITE -->
            <tr>
              <td style="padding:10px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#fff7ed" style="background-color:#fff7ed; border:2px solid #fdba74; border-radius:10px;">
                  <tr>
                    <td bgcolor="#fff7ed" style="background-color:#fff7ed; padding:18px;">
                      <font color="#c2410c" size="2" style="font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;">2. Espace Carrière • Simulateur Interactif</font>
                      <h3 style="margin:4px 0 10px 0; font-size:17px; font-weight:bold; color:#0f172a;">
                        🚀 4 réponses clés sur votre avenir professionnel :
                      </h3>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:13px; line-height:22px; color:#334155;">
                        <tr><td style="padding-bottom:4px;">⏱️ <strong>Échelon :</strong> <em>« Quand a lieu mon prochain avancement d'échelon ? »</em></td></tr>
                        <tr><td style="padding-bottom:4px;">📈 <strong>Grade :</strong> <em>« Remplis-je les conditions d'ancienneté cette année ? »</em></td></tr>
                        <tr><td style="padding-bottom:4px;">🏅 <strong>Promotion Interne (LDG) :</strong> <em>« Combien ai-je de points (barème CIG 175 pts) ? »</em></td></tr>
                        <tr><td>🎓 <strong>Concours / Examen pro :</strong> <em>« Quel reclassement indiciaire et quel gain en cas de réussite ? »</em></td></tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- SECTION 3 : IA & DOCUTHÈQUE AVEC BGCOLOR EXPLICITE -->
            <tr>
              <td style="padding:15px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-bottom:2px solid #e0e7ff; padding-bottom:6px; margin-bottom:12px;">
                  <tr>
                    <td>
                      <font color="#4f46e5" size="2" style="font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;">3. Intelligence Artificielle &amp; Démarches</font>
                      <h2 style="margin:2px 0 0 0; font-size:19px; font-weight:bold; color:#0f172a;">
                        🤖 Assistant IA, Docuthèque RH &amp; Courriers
                      </h2>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f5f3ff" style="background-color:#f5f3ff; border-left:4px solid #7c3aed; border:1px solid #ddd6fe; border-radius:8px; margin-bottom:10px;">
                  <tr>
                    <td bgcolor="#f5f3ff" style="background-color:#f5f3ff; padding:12px 14px;">
                      <div style="font-size:13.5px; font-weight:bold; color:#2e1065;">💬 Assistant IA 24h/24</div>
                      <div style="font-size:12.5px; line-height:18px; color:#4c1d95; margin-top:2px;">
                        Posez vos questions sur le temps de travail, les congés, les ASA ou le télétravail : l'assistant s'appuie sur les accords locaux de Gennevilliers et le CGFP (Légifrance).
                      </div>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#eff6ff" style="background-color:#eff6ff; border-left:4px solid #2563eb; border:1px solid #bfdbfe; border-radius:8px;">
                  <tr>
                    <td bgcolor="#eff6ff" style="background-color:#eff6ff; padding:12px 14px;">
                      <div style="font-size:13.5px; font-weight:bold; color:#1e3a8a;">📂 +110 Formulaires RH &amp; Courriers Types</div>
                      <div style="font-size:12.5px; line-height:18px; color:#1e40af; margin-top:2px;">
                        Téléchargez directement les formulaires officiels de la Ville et générez automatiquement vos courriers administratifs (télétravail, temps partiel, congés, recours).
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- SECTION 4 : KIOSQUE ET INFOGRAPHIES -->
            <tr>
              <td style="padding:5px 30px 18px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f8fafc" style="background-color:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
                  <tr>
                    <td bgcolor="#f8fafc" style="background-color:#f8fafc; padding:14px 18px;">
                      <div style="font-size:13.5px; font-weight:bold; color:#0f172a; margin-bottom:4px;">🎨 Également disponible sur ATLAS :</div>
                      <div style="font-size:12.5px; line-height:20px; color:#334155;">
                        • <strong>« Dessine-moi le statut » :</strong> +100 infographies CIG/CDG pour comprendre le statut visuellement.<br />
                        • <strong>Kiosque CFDT &amp; Guides :</strong> Le journal CFDT Gennevilliers, le Guide de l'Agent Public et le Guide des Contractuels.<br />
                        • <strong>Podcasts RH, veille d'actualité en continu, météo locale et espace détente.</strong>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- ENCADRÉ FAVORIS -->
            <tr>
              <td style="padding:0 30px 24px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#fffbeb" style="background-color:#fffbeb; border:1px dashed #f59e0b; border-radius:10px;">
                  <tr>
                    <td bgcolor="#fffbeb" align="center" style="background-color:#fffbeb; padding:16px 18px;">
                      <div style="font-size:13.5px; font-weight:bold; color:#9a3412; margin-bottom:4px;">
                        ⭐ Astuce : Gardez ATLAS dans vos favoris !
                      </div>
                      <div style="font-size:12.5px; line-height:18px; color:#7c2d12; margin-bottom:12px;">
                        Rendez-vous sur <strong><a href="https://atlas-cfdt.vercel.app/" target="_blank" style="color:#ea580c;">https://atlas-cfdt.vercel.app/</a></strong> et appuyez sur <strong>Ctrl + D</strong> pour l'ajouter à vos raccourcis.
                      </div>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center" bgcolor="#ea580c" style="background-color:#ea580c; border-radius:6px; padding:10px 22px;">
                            <a href="https://atlas-cfdt.vercel.app/" target="_blank" style="color:#ffffff; font-size:13px; font-weight:bold; text-decoration:none; display:inline-block;">
                              <font color="#ffffff" face="'Segoe UI', Tahoma, Arial, sans-serif" style="color:#ffffff;">
                                Ouvrir ATLAS maintenant →
                              </font>
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- PIED DE PAGE : CONTACTS CFDT -->
            <tr>
              <td bgcolor="#0f172a" align="center" style="background-color:#0f172a; padding:24px 28px; border-top:3px solid #ea580c;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center" style="padding-bottom:10px;">
                      <img src="data:image/png;base64,${votezB64}" alt="CFDT" width="110" border="0" style="display:block; width:110px; max-width:110px; height:auto; margin:0 auto;" />
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom:6px;">
                      <font color="#fdba74" size="3" face="'Segoe UI', Tahoma, Arial, sans-serif" style="color:#fdba74; font-weight:bold;">
                        Syndicat CFDT Interco — Mairie de Gennevilliers
                      </font>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <font color="#cbd5e1" size="2" face="'Segoe UI', Tahoma, Arial, sans-serif" style="color:#cbd5e1; line-height:20px;">
                        📞 01 40 85 64 64 &nbsp;|&nbsp; ✉️ <a href="mailto:cfdt-interco@ville-gennevilliers.fr" style="color:#fdba74; text-decoration:underline;">cfdt-interco@ville-gennevilliers.fr</a>
                        <br />
                        📍 177 avenue Gabriel-Péri — 92237 Gennevilliers Cedex
                      </font>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:10px;">
                      <a href="https://atlas-cfdt.vercel.app/" target="_blank" style="color:#94a3b8; font-size:12px; text-decoration:underline;">
                        <font color="#94a3b8">https://atlas-cfdt.vercel.app/</font>
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
          <!-- FIN DU CONTENEUR -->

        </td>
      </tr>
    </table>
  </div>

  <script>
    async function copyEmailBody() {
      const wrapper = document.getElementById('email-content-wrapper');
      const btn = document.getElementById('copy-btn');
      if (!wrapper) return;

      try {
        const htmlContent = wrapper.innerHTML;
        const textContent = wrapper.innerText;

        if (navigator.clipboard && window.ClipboardItem) {
          const blobHtml = new Blob([htmlContent], { type: 'text/html' });
          const blobText = new Blob([textContent], { type: 'text/plain' });
          const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
          await navigator.clipboard.write(data);
        } else {
          const range = document.createRange();
          range.selectNodeContents(wrapper);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          document.execCommand('copy');
          sel.removeAllRanges();
        }

        const orig = btn.innerHTML;
        btn.innerHTML = '✅ Copié pour Outlook ! Faites Ctrl+V dans votre message';
        btn.style.background = '#059669';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '#ea580c';
        }, 3500);
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la copie automatique. Sélectionnez le mail avec la souris et faites Ctrl+C / Ctrl+V.');
      }
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'mail-atlas-cfdt.html'), htmlContent, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'public', 'mail-preview.html'), htmlContent, 'utf8');

console.log('✅ Version blindée Outlook générée avec succès dans mail-atlas-cfdt.html et public/mail-preview.html !');
