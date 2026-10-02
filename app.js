const items=[
{id:1,n:"Серые широкие брюки",c:"серый",cat:"Брюки",icon:"👖"},
{id:2,n:"Серый костюм",c:"серый",cat:"Костюмы",icon:"🩶"},
{id:3,n:"Белая рубашка в полоску",c:"белый",cat:"Верх",icon:"👔"},
{id:4,n:"Молочный жилет",c:"молочный",cat:"Верх",icon:"🤍"},
{id:5,n:"Шоколадные брюки",c:"шоколад",cat:"Брюки",icon:"👖"},
{id:6,n:"Тёмно-синий топ",c:"синий",cat:"Верх",icon:"💙"},
{id:7,n:"Молочный топ",c:"молочный",cat:"Верх",icon:"🤍"},
{id:8,n:"Красный топ",c:"красный",cat:"Верх",icon:"❤️"},
{id:9,n:"Чёрная сатиновая юбка",c:"чёрный",cat:"Юбки",icon:"🖤"},
{id:10,n:"Шоколадный жакет",c:"шоколад",cat:"Жакеты",icon:"🤎"},
{id:11,n:"Тёмно-зелёный джемпер",c:"зелёный",cat:"Трикотаж",icon:"💚"},
{id:12,n:"Розовый джемпер",c:"розовый",cat:"Трикотаж",icon:"🩷"},
{id:13,n:"Бордовый джемпер",c:"бордо",cat:"Трикотаж",icon:"🍷"},
{id:14,n:"Чёрный свитер",c:"чёрный",cat:"Трикотаж",icon:"🖤"},
{id:15,n:"Белая блузка",c:"белый",cat:"Верх",icon:"🤍"},
{id:16,n:"Синяя плиссированная юбка",c:"синий",cat:"Юбки",icon:"💙"},
{id:17,n:"Синий жакет",c:"синий",cat:"Жакеты",icon:"💙"},
{id:18,n:"Коричневые ботильоны",c:"коричневый",cat:"Обувь",icon:"👢"},
{id:19,n:"Сумка для MacBook",c:"шоколад",cat:"Сумки",icon:"💼",mac:true},
{id:20,n:"Зелёная кросс-боди",c:"зелёный",cat:"Сумки",icon:"👜"},
{id:21,n:"Чёрное пальто",c:"чёрный",cat:"Верхняя одежда",icon:"🧥"},
{id:22,n:"Часы, серо-коричневый ремешок",c:"коричневый",cat:"Аксессуары",icon:"⌚"},
{id:23,n:"Бордовые часы",c:"бордо",cat:"Аксессуары",icon:"⌚"}
];
const looks=[
{n:"Рабочая классика",items:"Синяя плиссированная юбка · молочный верх · синий жакет · коричневые ботильоны · сумка для MacBook",why:"Собранный офисный образ с мягким сочетанием синего, молочного и шоколадного."},
{n:"Шоколад + молочный",items:"Шоколадные брюки · белая блузка · шоколадный жакет · сумка для MacBook",why:"Спокойный деловой комплект; вертикаль жакета делает образ стройнее."},
{n:"Зелёный акцент",items:"Шоколадные брюки · тёмно-зелёный джемпер · коричневые ботильоны · сумка для MacBook",why:"Глубокие природные оттенки хорошо работают вместе и подходят для обычного рабочего дня."},
{n:"Бордо",items:"Серые широкие брюки · бордовый джемпер · бордовые часы · шоколадная сумка",why:"Цветной акцент без излишней яркости."}
];
let page="wardrobe", filter="Все";
const app=document.querySelector("#app");
function render(){if(page==="wardrobe") wardrobe(); if(page==="looks") showLooks(); if(page==="pick") pick();}
function wardrobe(){let cats=["Все",...new Set(items.map(x=>x.cat))];let list=filter==="Все"?items:items.filter(x=>x.cat===filter);app.innerHTML=`<p class=muted>Персональная капсула</p><h1>Мой гардероб</h1><p>${items.length} вещей в первой базе</p><div class=chips>${cats.map(c=>`<button class="chip ${c===filter?"active":""}" data-filter="${c}">${c}</button>`).join("")}</div><div class=grid>${list.map(x=>`<article class=card><div class=photo>${x.icon}</div><b>${x.n}</b><span class=tags>${x.cat} · ${x.c}${x.mac?" · MacBook":""}</span></article>`).join("")}</div><button class=add title="Добавить вещь">+</button>`;document.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;wardrobe()});}
function showLooks(){app.innerHTML=`<p class=muted>Готовые сочетания</p><h1>Образы</h1>${looks.map((l,i)=>`<section class=look><h2>${l.n}</h2><div class=look-items>${l.items}</div><p class=muted>${l.why}</p><div class=actions><button onclick="this.textContent='♥ Сохранено'">♡ Нравится</button><button onclick="this.textContent='✓ Надето'">Надела</button></div></section>`).join("")}`;}
function pick(){app.innerHTML=`<p class=muted>Подбор из вашего шкафа</p><h1>Что надеть?</h1><section class=hero><h2>Сегодня — на работу</h2><p>Выберите условие, и приложение предложит комплект только из ваших вещей.</p><div class=chips><button class="chip active">Офис</button><button class=chip>С MacBook</button><button class=chip>Теплее</button></div><button class=pick id=go>Подобрать образ</button></section><div id=result></div>`;document.querySelector("#go").onclick=()=>{let l=looks[Math.floor(Math.random()*looks.length)];document.querySelector("#result").innerHTML=`<section class=look><h2>${l.n}</h2><div class=look-items>${l.items}</div><p class=muted>${l.why}</p></section>`}}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{page=b.dataset.page;render()});render();