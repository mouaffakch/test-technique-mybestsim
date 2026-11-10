/**
 * Interactive Script for MyBestSim Cruise SEO Article
 * Handles the Cruise Recommendation Simulator with realistic market pricing.
 */

document.addEventListener("DOMContentLoaded", () => {
  initCruiseSimulator();
});

function initCruiseSimulator() {
  const btn = document.getElementById("simCalculateBtn");
  const destSelect = document.getElementById("simDest");
  const seaNeedSelect = document.getElementById("simSeaNeed");
  const durationSelect = document.getElementById("simDuration");
  const resultBox = document.getElementById("simResult");

  if (!resultBox) return;

  function calculate() {
    const dest = destSelect?.value || "med";
    const seaNeed = seaNeedSelect?.value || "no";
    const duration = durationSelect?.value || "7";

    let recTitle = "";
    let recBadge = "";
    let recDesc = "";
    let recPrice = "";
    let recProvider = "";
    let warning = "";

    if (seaNeed === "yes") {
      recTitle = "Formule Hybride Haute Mer & Escales (Liaison Satellite)";
      recBadge = "Connecté Partout (Haute Mer + Ports)";
      recProvider = "GigSky Cruise + Land (Solution Externe)";
      recPrice = duration === "7" ? "Dès env. 18,49 € (512 Mo) · ~35 € à 50 € (1-3 Go)" : "Env. 50 € à 75 €";
      recDesc = "Recommandé si vous devez impérativement recevoir vos e-mails professionnels ou rester joignable 24h/24 en pleine navigation. L'eSIM fonctionne sur les relais satellites embarqués de nombreux navires partenaires ET bascule automatiquement en 4G/5G terrestre dès que vous approchez des côtes.";
      warning = "Configuration requise : ne mettez pas votre téléphone en mode avion complet ! Désactivez uniquement l'itinérance sur votre SIM française principale, et activez les données sur votre eSIM GigSky.";
    } else {
      recTitle = "Formule Escales Malin & Économique (Top Recommandation)";
      recBadge = "100% Escales 4G/5G Sans Stress";
      
      if (dest === "caraibes") {
        recProvider = "Airalo Island Hopper / GigSky Caraïbes";
        recPrice = duration === "7" ? "Env. 9 € - 15 €" : "Env. 18 € - 28 €";
        recDesc = "La solution idéale pour les croisières dans les Antilles et Caraïbes ! Une seule eSIM couvre toutes les îles de votre itinéraire (Bahamas, Sint Maarten, Mexique, Jamaïque) en haut débit sans changer de carte SIM à chaque port.";
      } else if (dest === "monde") {
        recProvider = "Roamic Global / Yesim Monde / Airalo Discover";
        recPrice = duration === "7" ? "Env. 12 € - 20 €" : "Env. 25 € - 45 €";
        recDesc = "Couverture universelle sur 130+ pays. Idéal pour les grands voyages, transatlantiques et escales diversifiées hors d'Europe.";
      } else {
        recProvider = "Roamic Europe / Yesim Europe / Airalo Eurolink";
        recPrice = duration === "7" ? "Dès 7,53 € (Airalo 1 Go) à 10,68 € (Roamic 1 Go)" : "Dès 14,25 € (Airalo 3 Go) à 18,96 € (Roamic 3 Go)";
        recDesc = "La stratégie favorite des croisiéristes en Méditerranée ! Vous profitez d'une 4G/5G ultra-rapide dès que le bateau approche des côtes et durant toutes vos excursions au port. En mer, mettez votre téléphone en mode avion pour vous déconnecter et préserver votre batterie.";
      }
      
      warning = "Pensez à passer votre SIM principale en mode avion dès que le navire largue les amarres pour bloquer toute connexion aux antennes satellites non régulées !";
    }

    resultBox.innerHTML = `
      <div class="p-6 bg-white text-slate-800 rounded-2xl shadow-lg border border-slate-200 mt-4 animate-fade-in space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">${recBadge}</span>
          <span class="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">${recPrice}</span>
        </div>
        
        <h4 class="text-lg font-black text-slate-900">${recTitle}</h4>
        
        <div class="text-xs text-slate-600">
          <span class="font-bold text-slate-900">Fournisseur(s) recommandé(s) :</span> 
          <span class="font-bold text-blue-600 underline">${recProvider}</span>
        </div>
        
        <p class="text-xs text-slate-600 leading-relaxed">${recDesc}</p>
        
        <div class="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-amber-900 text-xs">
          <strong>Astuce MyBestSim :</strong> ${warning}
        </div>
        
        <div class="pt-2 flex flex-wrap gap-2">
          <a href="https://mybestsim.com" target="_blank" class="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition">
            Comparer les offres sur MyBestSim.com →
          </a>
          <a href="https://mybestsim.com/codes-promo" target="_blank" class="inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
            Voir les codes promo officiels
          </a>
        </div>
      </div>
    `;
    resultBox.classList.remove("hidden");

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // Bind click & change events
  if (btn) btn.addEventListener("click", calculate);
  if (destSelect) destSelect.addEventListener("change", calculate);
  if (seaNeedSelect) seaNeedSelect.addEventListener("change", calculate);
  if (durationSelect) durationSelect.addEventListener("change", calculate);

  // Initialize immediately on load
  calculate();
}
