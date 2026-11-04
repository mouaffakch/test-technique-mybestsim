/**
 * Interactive Script for MyBestSim Cruise SEO Article
 */

document.addEventListener("DOMContentLoaded", () => {
  initCruiseSimulator();
});

function initCruiseSimulator() {
  const btn = document.getElementById("simCalculateBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const dest = document.getElementById("simDest")?.value || "med";
    const seaNeed = document.getElementById("simSeaNeed")?.value || "no";
    const duration = document.getElementById("simDuration")?.value || "7";
    const resultBox = document.getElementById("simResult");

    if (!resultBox) return;

    let recTitle = "";
    let recBadge = "";
    let recDesc = "";
    let recPrice = "";
    let recProvider = "";
    let warning = "";

    if (seaNeed === "yes") {
      recTitle = "Formule Haute Mer & Escales Hybride";
      recBadge = "Connexion Partout (Au Large + Terre)";
      recProvider = "GigSky Cruise + Land";
      recPrice = duration === "7" ? "Env. 35 € - 45 €" : "Env. 60 € - 85 €";
      recDesc = "Idéal si vous devez impérativement recevoir vos e-mails professionnels ou rester en contact avec vos proches pendant la navigation en haute mer. Fonctionne sur le réseau satellite maritime (WMS / Cellular at Sea de +200 navires) ET sur les antennes 4G/5G des ports d'escale.";
      warning = "Bien plus avantageux que le Wi-Fi paquebot vendu à 20-30 €/jour par personne, et 100x moins cher que le roaming maritime sauvage de votre opérateur classique !";
    } else {
      recTitle = "Formule Escales Malin & Économique (Top Recommandation)";
      recBadge = "100% Escales 4G/5G Sans Stress";
      recProvider = dest === "caraibes" ? "Airalo / Saily (Pack Caraïbes)" : "Airalo Eurolink / Saily Europe";
      recPrice = duration === "7" ? "Env. 7 € - 14 €" : "Env. 15 € - 24 €";
      recDesc = "La stratégie des croisiéristes avertis ! Vous profitez d'une 4G/5G ultra-rapide dès que le bateau approche des côtes et durant toutes vos excursions au port. En mer, mettez votre téléphone en mode avion et profitez des spectacles, piscines et de la déconnexion.";
      warning = "Pensez à désactiver l'itinérance sur votre SIM française dès que le navire quitte le quai pour bloquer tout piratage maritime !";
    }

    resultBox.innerHTML = `
      <div class="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span class="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">${recBadge}</span>
          <span class="text-sm font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">${recPrice}</span>
        </div>
        <h4 class="text-xl font-bold text-slate-900 mb-2">${recTitle}</h4>
        <div class="text-blue-900 font-semibold mb-3 flex items-center gap-2">
          <span>Opérateur recommandé :</span> 
          <span class="underline decoration-blue-500 font-bold text-blue-700">${recProvider}</span>
        </div>
        <p class="text-slate-700 text-sm mb-4 leading-relaxed">${recDesc}</p>
        <div class="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-amber-900 text-xs mb-4">
          <strong>Astuce MyBestSim :</strong> ${warning}
        </div>
        <a href="https://mybestsim.com" target="_blank" class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-all">
          Voir les meilleures offres sur MyBestSim.com
        </a>
      </div>
    `;
    resultBox.classList.remove("hidden");
  });
}
