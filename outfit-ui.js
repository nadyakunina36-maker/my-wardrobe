const OutfitUI=(()=>{
 let owner=null,options={occasion:'Работа',weather:'Прохладно',onlyPhotos:true,macbook:false},offset=0,results=[];
 function context(){if(owner!==session?.user.id){owner=session?.user.id;results=[];offset=0;options={occasion:'Работа',weather:'Прохладно',onlyPhotos:true,macbook:false}}}
 function ready(){context();if(loadError||!loaded){app.innerHTML=`<h1>Подбор образов</h1><p role="status">${esc(loadError||'Загружаю ваши вещи…')}</p><button id="outfit-retry">Обновить гардероб</button>`;document.querySelector('#outfit-retry').onclick=async()=>{await load();render()};return false}return true}
 function select(id,label,values,value){return `<label>${label}<select id="${id}">${values.map(v=>`<option ${v===value?'selected':''}>${esc(v)}</option>`).join('')}</select></label>`}
 function pick(){
  if(!ready())return;
  app.innerHTML=`<p class="eyebrow">ИЗ ВАШЕГО ГАРДЕРОБА</p><h1>Что надеть?</h1><p class="muted">Выберите планы и погоду — соберём несколько сочетаний из ваших вещей.</p><section class="form outfit-form">${select('occasion','Куда идём?',['Работа','На каждый день','Вечер'],options.occasion)}${select('weather','Погода — выберите вручную',['Тепло','Прохладно','Холодно'],options.weather)}<label class="check"><input id="only-photos" type="checkbox" ${options.onlyPhotos?'checked':''}> Только вещи с фотографиями</label><label class="check"><input id="take-macbook" type="checkbox" ${options.macbook?'checked':''}> Нужна сумка для MacBook</label><button class="primary" id="build-outfits">Подобрать комплекты</button></section><div id="outfit-results" aria-live="polite"></div>`;
  document.querySelector('#build-outfits').onclick=()=>{
   options={occasion:document.querySelector('#occasion').value,weather:document.querySelector('#weather').value,onlyPhotos:document.querySelector('#only-photos').checked,macbook:document.querySelector('#take-macbook').checked};offset=0;results=OutfitEngine.generate(allItems(),options);showResults();
  };
  if(results.length)showResults();
 }
 function cards(list, saved=false){
  return list.map((look,i)=>`<section class="outfit"><div class="outfit-heading"><div><p class="eyebrow">${esc(look.occasion)} · ${esc(look.weather)}</p><h2>Комплект ${i+1}</h2></div>${saved?'':`<button data-keep="${i}" aria-label="Сохранить комплект ${i+1}">♡ Сохранить</button>`}</div><div class="outfit-grid">${look.items.map(x=>`<div class="outfit-piece"><div class="outfit-photo" data-outfit-photo="${esc(x.id)}">${x.photo_path?'Загружаю фото…':'Фото пока нет'}</div><b>${esc(x.name)}</b><span class="tags">${esc(x.category)} · ${esc(x.color)}</span></div>`).join('')}</div><p class="outfit-reason">${look.items.some(x=>x.category==='Жакеты')?'Жакет завершает комплект; в помещении верхнюю одежду можно снять.':'Основа комплекта — ваши вещи; аксессуары дополняют сочетание.'}</p>${look.notes.map(n=>`<p class="muted outfit-note">${esc(n)}</p>`).join('')}</section>`).join('');
 }
 function photos(){
  const currentOwner=owner;
  document.querySelectorAll('[data-outfit-photo]').forEach(async el=>{
   const x=allItems().find(x=>x.id===el.dataset.outfitPhoto);if(!x?.photo_path)return;
   try{const url=await photo(x);if(!el.isConnected||session?.user.id!==currentOwner)return;if(!url)throw Error();const img=document.createElement('img');img.alt=x.name;img.src=url;img.onerror=()=>{el.textContent='Фото не загрузилось. Попробуйте обновить страницу.'};el.replaceChildren(img)}catch(e){if(el.isConnected)el.textContent='Фото не загрузилось. Попробуйте обновить страницу.'}
  });
 }
 function showResults(){
  const target=document.querySelector('#outfit-results'),batch=results.slice(offset,offset+3);
  if(!batch.length){target.innerHTML='<section class="note"><h2>Пока не хватает вещей</h2><p>Нужны верх и брюки или юбка, либо платье. Попробуйте снять отметку «Только вещи с фотографиями» или выбрать другую погоду.</p></section>';return}
  target.innerHTML=`<h2>Ваши варианты</h2><p class="muted">Предложения по категориям и указанным цветам. Проверьте посадку и тепло по своим ощущениям.</p>${cards(batch)}${results.length>3?'<button id="more-outfits">Другие варианты</button>':''}<p id="outfit-status" role="status"></p>`;
  document.querySelectorAll('[data-keep]').forEach(b=>b.onclick=()=>save(batch[Number(b.dataset.keep)],b));
  const more=document.querySelector('#more-outfits');if(more)more.onclick=()=>{offset=offset+3>=results.length?0:offset+3;showResults()};photos();
 }
 const key=()=>`wardrobe-looks-v1:${owner}`;
 function read(){try{const data=JSON.parse(localStorage.getItem(key())||'[]');return Array.isArray(data)?data.filter(x=>Array.isArray(x.ids)&&typeof x.occasion==='string'&&typeof x.weather==='string'):[]}catch(e){return []}}
 function save(look,button){
  const ids=look.items.map(x=>x.id),signature=[...ids].sort().join('|'),saved=read();
  try{if(!saved.some(x=>[...x.ids].sort().join('|')===signature)){saved.push({ids,occasion:look.occasion,weather:look.weather,notes:look.notes});localStorage.setItem(key(),JSON.stringify(saved))}button.textContent='✓ Сохранено';button.disabled=true;document.querySelector('#outfit-status').textContent='Комплект сохранён в «Образы» в этом браузере.'}catch(e){document.querySelector('#outfit-status').textContent='Не удалось сохранить: браузер запретил локальное хранилище.'}
 }
 function looks(){
  if(!ready())return;
  const saved=read(),valid=saved.map(x=>({...x,notes:Array.isArray(x.notes)?x.notes:[],items:x.ids.map(id=>allItems().find(i=>i.id===id)).filter(Boolean)})).filter(x=>x.items.length===x.ids.length);
  app.innerHTML=`<p class="eyebrow">ВАШИ СОЧЕТАНИЯ</p><h1>Мои образы</h1><p class="muted">Сохранены в этом браузере. На других устройствах они пока не синхронизируются.</p><button id="go-pick" class="primary">Подобрать новый комплект</button>${valid.length?cards(valid,true):'<section class="note"><p>Сохранённых комплектов пока нет. Нажмите «Подобрать новый комплект», затем «♡ Сохранить» у понравившегося варианта.</p></section>'}${valid.length<saved.length?'<p class="muted">Некоторые комплекты скрыты: вещи из них больше не доступны в гардеробе.</p>':''}`;
  document.querySelector('#go-pick').onclick=()=>{page='pick';render()};photos();
 }
 return {pick,looks};
})();
