const items=[
{id:1,n:"Коричневые широкие брюки",c:"коричневый",cat:"Брюки",icon:"👖",season:"Всесезон",note:"Широкий крой, эластичный пояс"},
{id:2,n:"Тёмно-зелёный джемпер",c:"зелёный",cat:"Трикотаж",icon:"●",season:"Прохладно"},
{id:3,n:"Молочный джемпер",c:"молочный",cat:"Трикотаж",icon:"○",season:"Прохладно"},
{id:4,n:"Молочный топ без рукавов",c:"молочный",cat:"Верх",icon:"○",season:"Тепло"},
{id:5,n:"Тёмный топ без рукавов",c:"тёмно-синий",cat:"Верх",icon:"●",season:"Тепло"},
{id:6,n:"Красный топ без рукавов",c:"красный",cat:"Верх",icon:"●",season:"Тепло"},
{id:7,n:"Розовый джемпер",c:"розовый",cat:"Трикотаж",icon:"●",season:"Прохладно"},
{id:8,n:"Бордовый джемпер",c:"бордо",cat:"Трикотаж",icon:"●",season:"Прохладно",note:"Фактурная вязка"},
{id:9,n:"Чёрный свитер с высоким воротом",c:"чёрный",cat:"Трикотаж",icon:"●",season:"Холодно"},
{id:10,n:"Белая блузка",c:"белый",cat:"Верх",icon:"○",season:"Всесезон"},
{id:11,n:"Коричневая структурная сумка",c:"коричневый",cat:"Сумки",icon:"▰",season:"Всесезон"},
{id:12,n:"Тёмно-зелёная структурная сумка",c:"зелёный",cat:"Сумки",icon:"▰",season:"Всесезон"},
{id:13,n:"Коричневая сумка для MacBook",c:"коричневый",cat:"Сумки",icon:"▰",season:"Всесезон",mac:true,note:"Используется для MacBook"},
{id:14,n:"Зелёная кросс-боди",c:"зелёный",cat:"Сумки",icon:"▰",season:"Всесезон",note:"24 × 19 × 8 см"},
{id:15,n:"Цветочный платок",c:"зелёный / коричневый",cat:"Аксессуары",icon:"◇",season:"Всесезон"},
{id:16,n:"Ярко-зелёный шарф",c:"зелёный",cat:"Аксессуары",icon:"◇",season:"Прохладно"},
{id:17,n:"Жемчужное колье",c:"молочный / золотой",cat:"Украшения",icon:"◌",season:"Всесезон"},
{id:18,n:"Часы с серо-коричневым ремешком",c:"серо-коричневый",cat:"Аксессуары",icon:"◷",season:"Всесезон"},
{id:19,n:"Часы с бордовым ремешком",c:"бордо",cat:"Аксессуары",icon:"◷",season:"Всесезон"}
];
const looks=[
{n:"Спокойный рабочий",ids:[1,10,13,18],why:"Белая блузка, коричневые брюки и сумка для MacBook. Нейтральная база для рабочего дня."},
{n:"Зелёный + шоколад",ids:[1,2,13,18],why:"Глубокий зелёный с коричневым — спокойное сочетание для прохладного рабочего дня."},
{n:"Бордо + коричневый",ids:[1,8,11,19],why:"Бордовый джемпер и часы дают связанный цветовой акцент."},
{n:"Молочная база",ids:[1,4,11,17],why:"Светлый верх и украшение смягчают коричневую базу."}
];
let page="wardrobe",filter="Все",selected=null;
const app=document.querySelector("#app");
const byId=id=>items.find(x=>x.id===id);
function render(){page==="wardrobe"?wardrobe():page==="looks"?showLooks():pick()}
function wardrobe(){let cats=["Все",...new Set(items.map(x=>x.cat))],list=filter==="Все"?items:items.filter(x=>x.cat===filter);app.innerHTML=`<header><p class=eyebrow>ПЕРСОНАЛЬНАЯ КАПСУЛА</p><h1>Мой гардероб</h1><p class=muted>${items.length} подтверждённых вещей</p></header><div class=chips>${cats.map(c=>`<button class="chip ${c===filter?"active":""}" data-filter="${c}">${c}</button>`).join("")}</div><div class=grid>${list.map(x=>card(x)).join("")}</div><button class=add id=add>+</button>`;document.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;wardrobe()});document.querySelectorAll("[data-item]").forEach(b=>b.onclick=()=>detail(+b.dataset.item));document.querySelector("#add").onclick=()=>addItem()}
function card(x){return `<article class=card data-item="${x.id}"><div class="photo tone-${x.c.split(" ")[0].replace("/","")}"><span>${x.icon}</span></div><b>${x.n}</b><span class=tags>${x.cat} · ${x.c}${x.mac?" · MacBook":""}</span></article>`}
function detail(id){let x=byId(id);selected=id;app.innerHTML=`<button class=back id=back>‹ Гардероб</button><div class="detail-photo photo"><span>${x.icon}</span></div><p class=eyebrow>${x.cat}</p><h1 class=detail-title>${x.n}</h1><div class=meta><span>${x.c}</span><span>${x.season}</span>${x.mac?"<span>Для MacBook</span>":""}</div>${x.note?`<section class=note><b>Заметка</b><p>${x.note}</p></section>`:""}<section><h2>В образах</h2>${looks.filter(l=>l.ids.includes(id)).map(l=>`<div class=mini>${l.n}</div>`).join("")||"<p class=muted>Пока не добавлена в готовые образы.</p>"}</section>`;document.querySelector("#back").onclick=wardrobe}
function showLooks(){app.innerHTML=`<p class=eyebrow>СОЧЕТАНИЯ ИЗ ВАШИХ ВЕЩЕЙ</p><h1>Образы</h1>${looks.map(l=>`<section class=look><div class=look-strip>${l.ids.map(id=>`<span title="${byId(id).n}">${byId(id).icon}</span>`).join("")}</div><h2>${l.n}</h2><div class=look-items>${l.ids.map(id=>byId(id).n).join(" · ")}</div><p class=muted>${l.why}</p><div class=actions><button class=like>♡ Нравится</button><button class=worn>Надела</button></div></section>`).join("")}`;document.querySelectorAll(".like").forEach(b=>b.onclick=()=>{b.textContent="♥ Сохранено";localStorage.setItem("liked","1")});document.querySelectorAll(".worn").forEach(b=>b.onclick=()=>b.textContent="✓ Надето")}
function pick(){app.innerHTML=`<p class=eyebrow>ПОДБОР ИЗ ВАШЕГО ШКАФА</p><h1>Что надеть?</h1><section class=hero><h2>Соберём комплект</h2><p>Выберите условие. В подборе используются только вещи, которые уже внесены в гардероб.</p><label class=toggle><input type=checkbox id=mac> Нужен MacBook</label><label class=toggle><input type=checkbox id=cold> Прохладно</label><button class=primary id=go>Подобрать образ</button></section><div id=result></div>`;document.querySelector("#go").onclick=()=>{let pool=looks.filter(l=>!document.querySelector("#mac").checked||l.ids.includes(13));if(document.querySelector("#cold").checked)pool=pool.filter(l=>l.ids.some(id=>byId(id).cat==="Трикотаж"));if(!pool.length)pool=looks;let l=pool[Math.floor(Math.random()*pool.length)];document.querySelector("#result").innerHTML=`<section class=look><div class=look-strip>${l.ids.map(id=>`<span>${byId(id).icon}</span>`).join("")}</div><h2>${l.n}</h2><div class=look-items>${l.ids.map(id=>byId(id).n).join(" · ")}</div><p class=muted>${l.why}</p></section>`}}
function addItem(){app.innerHTML=`<button class=back id=back>‹ Гардероб</button><p class=eyebrow>НОВАЯ ВЕЩЬ</p><h1>Добавить вещь</h1><section class=form><label>Фото<input type=file accept="image/*" capture="environment"></label><label>Название<input id=name placeholder="Например: молочный джемпер"></label><label>Категория<select id=cat><option>Верх</option><option>Брюки</option><option>Трикотаж</option><option>Сумки</option><option>Аксессуары</option><option>Украшения</option></select></label><p class=muted>В этой версии новая карточка сохраняется на этом устройстве; подключение фотографий к закрытому хранилищу будет следующим этапом.</p><button class=primary id=save>Сохранить</button></section>`;document.querySelector("#back").onclick=wardrobe;document.querySelector("#save").onclick=()=>{let n=document.querySelector("#name").value.trim();if(!n)return alert("Введите название вещи");items.push({id:Date.now(),n,c:"не указан",cat:document.querySelector("#cat").value,icon:"＋",season:"Не указано"});localStorage.setItem("extraItems",JSON.stringify(items.slice(19)));wardrobe()}}
try{JSON.parse(localStorage.getItem("extraItems")||"[]").forEach(x=>items.push(x))}catch(e){}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{page=b.dataset.page;render()});render();