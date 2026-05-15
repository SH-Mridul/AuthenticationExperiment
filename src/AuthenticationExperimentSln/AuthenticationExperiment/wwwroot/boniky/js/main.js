(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))e(o);new MutationObserver(o=>{for(const d of o)if(d.type==="childList")for(const l of d.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&e(l)}).observe(document,{childList:!0,subtree:!0});function a(o){const d={};return o.integrity&&(d.integrity=o.integrity),o.referrerPolicy&&(d.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?d.credentials="include":o.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function e(o){if(o.ep)return;o.ep=!0;const d=a(o);fetch(o.href,d)}})();(function(){function s(){return{menuToggle:document.getElementById("menu-toggle"),navMenu:document.getElementById("nav-menu"),iconOpen:document.querySelector(".menu-icon-open"),iconClose:document.querySelector(".menu-icon-close")}}function t(e){!e.navMenu||!e.menuToggle||(e.navMenu.classList.remove("hidden"),e.navMenu.setAttribute("aria-hidden","false"),e.menuToggle.setAttribute("aria-expanded","true"),e.iconOpen&&e.iconOpen.classList.add("hidden"),e.iconClose&&e.iconClose.classList.remove("hidden"))}function a(e){!e.navMenu||!e.menuToggle||(e.navMenu.classList.add("hidden"),e.navMenu.setAttribute("aria-hidden","true"),e.menuToggle.setAttribute("aria-expanded","false"),e.iconOpen&&e.iconOpen.classList.remove("hidden"),e.iconClose&&e.iconClose.classList.add("hidden"))}document.addEventListener("click",function(e){const o=s();if(!(!o.menuToggle||!o.navMenu)){if(e.target.closest("#menu-toggle")){o.menuToggle.getAttribute("aria-expanded")==="true"?a(o):t(o);return}o.navMenu.contains(e.target)&&e.target.closest("a")&&(e.target.closest(".dropdown-item")||a(o))}}),window.addEventListener("resize",function(){const e=s();window.innerWidth>=768&&a(e)})})();document.addEventListener("DOMContentLoaded",()=>{const s=document.getElementById("merchantOrdersChart"),t=document.getElementById("merchantSellChart"),a=document.getElementById("performanceGaugeChart"),e=document.getElementById("merchantSalesTrendChart");if(!s||!t||!a||!e)return;const o="#3b99db",d="#10b981",l="#94a3b8";typeof Chart<"u"&&(Chart.defaults.font.family="'Inter', sans-serif",Chart.defaults.color=l,Chart.defaults.plugins.legend.display=!1,new Chart(s,{type:"bar",data:{labels:["Tue","Wed","Thu","Fri","Sat","Sun","Mon"],datasets:[{data:[6e3,5500,7500,8500,9500,8e3,7e3],backgroundColor:f=>f.dataIndex===4?o:"rgba(59, 153, 219, 0.2)",borderRadius:6,borderSkipped:!1}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{y:{display:!1},x:{grid:{display:!1},border:{display:!1},ticks:{font:{size:10,weight:"bold"}}}}}}),new Chart(t,{type:"doughnut",data:{datasets:[{data:[5,95],backgroundColor:[o,d],borderWidth:0,cutout:"75%"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{tooltip:{enabled:!0}}}}),new Chart(a,{type:"doughnut",data:{datasets:[{data:[114,6275],backgroundColor:[o,d],borderWidth:0,circumference:180,rotation:270,cutout:"80%",borderRadius:10}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{tooltip:{enabled:!0}}}}),new Chart(e,{type:"line",data:{labels:["Tue","Wed","Thu","Fri","Sat","Sun","Mon"],datasets:[{data:[80,60,100,110,115,115,115],borderColor:o,borderWidth:3,tension:.4,pointRadius:0,pointHoverRadius:6,pointBackgroundColor:"white",pointBorderWidth:3}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{y:{display:!1},x:{grid:{display:!1},border:{display:!1},ticks:{font:{size:10,weight:"bold"}}}}}}))});document.addEventListener("DOMContentLoaded",()=>{const s=document.body,t=window.matchMedia("(min-width: 1024px)");function a(o){o.matches&&s.classList.remove("mobile-sidebar-open")}t.addEventListener("change",a);function e(){!t.matches?s.classList.toggle("mobile-sidebar-open"):s.classList.toggle("sidebar-collapsed")}document.addEventListener("click",o=>{o.target.closest("#toggleButton, #sidebarToggle, #sidebarBackdrop")&&e()}),typeof lucide<"u"&&lucide.createIcons()});document.addEventListener("click",s=>{var w,x;const t=s.target,a=t.closest(".product-parent");if(a&&!t.closest(".custom-dropdown")){const i=a.getAttribute("data-expand-target");if(i){const n=document.getElementById(i);if(n){n.classList.toggle("hidden"),a.classList.toggle("expanded");return}}}const e=t.closest(".dropdown-trigger");if(e){const i=e.closest(".custom-dropdown"),n=i.querySelector(".dropdown-menu");if(document.querySelectorAll(".custom-dropdown.dropdown-active").forEach(r=>{if(r!==i){r.classList.remove("dropdown-active");const c=r.querySelector(".dropdown-menu");c&&c.classList.remove("right-0","left-0")}}),i.classList.toggle("dropdown-active"),i.classList.contains("dropdown-active")&&n){n.classList.remove("right-0","left-0");const r=n.getBoundingClientRect(),c=window.innerWidth,u=10;r.right+u>c?n.classList.add("right-0"):r.left<u&&n.classList.add("left-0")}return}const o=t.closest(".dropdown-item");if(o){s.preventDefault();const i=o.closest(".custom-dropdown"),n=i.querySelector(".trigger-text");n&&(n.textContent=o.textContent.trim(),n.classList.add("text-slate-900")),i.querySelectorAll(".dropdown-item.active").forEach(r=>r.classList.remove("active")),o.classList.add("active"),i.classList.remove("dropdown-active");return}const d=t.closest(".pagination-btn");if(d&&!d.classList.contains("active")){const i=d.parentElement;d.querySelector("i")||(i.querySelectorAll(".pagination-btn.active").forEach(n=>n.classList.remove("active")),d.classList.add("active"));return}document.querySelectorAll(".custom-dropdown.dropdown-active").forEach(i=>{i.classList.remove("dropdown-active")});const l=t.closest(".toggle-switch");if(l){const i=l.classList.toggle("active"),n=l.getAttribute("data-toggle-target");if(n){const r=document.getElementById(n);if(r){const c=((w=l.getAttribute("data-inactive-class"))==null?void 0:w.split(" "))||[],u=((x=l.getAttribute("data-active-class"))==null?void 0:x.split(" "))||[];i?(c.length&&r.classList.remove(...c),u.length&&r.classList.add(...u)):(u.length&&r.classList.remove(...u),c.length&&r.classList.add(...c))}}return}if(t.closest("#addVariantBtn")){const i=document.getElementById("variantList"),n=Date.now(),r=`
      <div class="p-6 border border-gray-100 bg-white rounded-2xl mb-6  animate-in fade-in slide-in-from-top-2 duration-300" id="variant-${n}">
        <!-- Mandatory Toggle Section -->
        <div class="flex items-center justify-between mb-1">
          <h4 class="font-bold text-slate-900 text-[15px]">Make this variant required</h4>
          <div class="flex items-center gap-2">
            <div class="toggle-switch w-11 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer"
                 data-toggle-label="label-mandatory-${n}">
              <div class="toggle-knob w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
        <p class="text-[13px] text-slate-500 mb-6">Enable this to require customers to select at least one variant option</p>

        <!-- Variant Title -->
        <div class="mb-6">
          <label class="label font-bold text-slate-800 text-[13px] mb-2 block">Title</label>
          <input type="text" class="input h-11 bg-white border-slate-200 focus:border-indigo-400" placeholder="e.g. Size">
        </div>

        <!-- Options Container -->
        <div class="space-y-6 mb-6" id="options-container-${n}">
          <div class="grid grid-cols-12 gap-4 items-end">
            <div class="col-span-11 grid grid-cols-2 gap-4">
              <div>
                <label class="label font-bold text-slate-800 text-[13px] mb-2 block">Product Options</label>
                <input type="text" class="input h-11 border-slate-200 placeholder:text-slate-400" placeholder="Add variant options like Red, Large, or Gold">
              </div>
              <div>
                <label class="label font-bold text-slate-800 text-[13px] mb-2 block">Extra Price</label>
                <input type="text" class="input h-11 border-slate-200" placeholder="Enter extra price for this option">
              </div>
            </div>
            <div class="col-span-1 flex justify-center pb-2">
              <button type="button" class="cursor-pointer text-red-300 hover:text-red-500 transition-colors remove-row" data-target-type="option">
                <i data-lucide="x" class="w-6 h-6"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Add Option Button -->
        <button type="button" class="btn-filled add-option-btn" data-variant-id="${n}">
          Add More
        </button>

        <!-- Hidden Remove Variant (if needed for multiple) -->
        <div class="flex justify-end  border-slate-50 mt-2">
           <button type="button" class="cursor-pointer text-slate-300 hover:text-red-500 transition-all remove-row" data-target="variant-${n}" data-target-type="variant">
             <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;i.insertAdjacentHTML("beforeend",r),typeof lucide<"u"&&lucide.createIcons();return}const b=t.closest(".add-option-btn");if(b){const i=b.getAttribute("data-variant-id");document.getElementById(`options-container-${i}`).insertAdjacentHTML("beforeend",`
      <div class="grid grid-cols-12 gap-4 items-end animate-in fade-in duration-200">
        <div class="col-span-11 grid grid-cols-2 gap-4">
          <div>
            <label class="label font-bold text-slate-800 text-[13px] mb-2 block">Attribute</label>
            <input type="text" class="input h-11 border-slate-200 placeholder:text-slate-400" placeholder="Enter variant option (e.g., Red, Large, Gold)">
          </div>
          <div>
            <label class="label font-bold text-slate-800 text-[13px] mb-2 block">Extra Price</label>
            <input type="text" class="input h-11 border-slate-200" placeholder="Enter extra price for this option">
          </div>
        </div>
        <div class="col-span-1 flex justify-center pb-2">
          <button type="button" class="text-red-300 cursor-pointer hover:text-red-500 transition-colors remove-row" data-target-type="option">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
      </div>
    `),typeof lucide<"u"&&lucide.createIcons();return}if(t.closest("#addDetailBtn")){const i=document.getElementById("detailList"),n=Date.now(),r=`
      <div class="mb-6 p-4 rounded-2xl flex items-center gap-4 border border-gray-100 bg-white  group animate-in fade-in slide-in-from-top-2 duration-300" id="detail-${n}">
        <div class="flex-1 grid grid-cols-2 gap-4">
          <div>
            <label class="label">Specification</label>
            <input type="text" class="input" placeholder="e.g. Battery Life">
          </div>
          <div>
            <label class="label">Value</label>
            <input type="text" class="input " placeholder="e.g. 24 Hours">
          </div>
        </div>
        <button type="button" class="mt-6 p-2 cursor-pointer  text-slate-300 hover:text-destructive transition-colors remove-row" data-target="detail-${n}">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `;i.insertAdjacentHTML("beforeend",r),typeof lucide<"u"&&lucide.createIcons();return}const p=t.closest(".remove-row");if(p){const i=p.getAttribute("data-target");let n=null;i?n=document.getElementById(i):n=p.closest(".grid")||p.closest(".item-card"),n&&(n.classList.add("fade-out","slide-out-to-top-2"),setTimeout(()=>n.remove(),200));return}const v=t.closest("[data-modal-target]");if(v){const i=v.getAttribute("data-modal-target");window.BonikyModal.show(i);return}const h=t.closest("[data-modal-hide]");if(h){const i=h.getAttribute("data-modal-hide");window.BonikyModal.hide(i);return}const g=t.closest(".modal-backdrop");if(g&&g.classList.contains("active")){const i=g.nextElementSibling;i&&i.classList.contains("modal-container")&&window.BonikyModal.hide(i.id);return}const m=t.closest('input[type="date"]');if(m){try{m.showPicker()}catch{m.click()}return}const y=t.closest(".date-trigger");if(y){const n=y.parentElement.querySelector('input[type="date"]');if(n)try{n.showPicker()}catch{n.click()}return}});window.BonikyModal={show:function(s){const t=document.getElementById(s);if(!t)return;const a=t.previousElementSibling;a&&a.classList.contains("modal-backdrop")&&a.classList.add("active"),t.classList.add("active"),document.body.style.overflow="hidden"},hide:function(s){const t=document.getElementById(s);if(!t)return;const a=t.previousElementSibling;a&&a.classList.contains("modal-backdrop")&&a.classList.remove("active"),t.classList.remove("active"),document.querySelectorAll(".modal-container.active").length===0&&(document.body.style.overflow="")}};window.addEventListener("keydown",s=>{if(s.key==="Escape"){const t=document.querySelector(".modal-container.active");t&&window.BonikyModal.hide(t.id)}});document.addEventListener("click",s=>{const t=s.target.closest(".custom-dropdown .dropdown-item");if(!t)return;s.preventDefault();const e=t.closest(".custom-dropdown").querySelector(".dropdown-trigger img"),o=t.querySelector("img");e&&o&&(e.src=o.src,e.alt=o.alt)});
