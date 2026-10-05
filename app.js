const SUPABASE_URL="https://cszbtkesmsakmxcxqcnb.supabase.co";
const SUPABASE_KEY="sb_publishable_Q2iQqvstoX25uLyldHzAPw_SWqdTpE4";
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let page="wardrobe",filter="Все",cloudItems=[],session=null,loadError="",loaded=false,loadVersion=0,saving=false;
const app=document.querySelector("#app"),nav=document.querySelector("#nav");
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
async function init(){
  const {data,error}=await sb.auth.getSession();
  session=data.session;
  if(error)loadError="Не удалось проверить вход. Обновите страницу.";
  await load();render();
}
async function load(){
  const owner=session?.user.id, version=++loadVersion;
  if(!owner){cloudItems=[];loaded=false;loadError="";return false}
  try{
    const {data,error}=await sb.from("wardrobe_items").select("*").eq("user_id",owner).order("created_at");
    if(version!==loadVersion||session?.user.id!==owner)return false;
    if(error)throw error;
    cloudItems=data||[];loaded=true;loadError="";return true;
  }catch(error){
    if(version===loadVersion&&session?.user.id===owner)loadError="Не удалось загрузить каталог. Проверьте соединение и повторите попытку.";
    return false;
  }
}
function allItems(){return cloudItems}
function photo(x){if(!x.photo_path)return Promise.resolve(null);return sb.storage.from("wardrobe-photos").createSignedUrl(x.photo_path,3600).then(r=>r.data?.signedUrl||null)}
function render(){nav.style.display=session?"flex":"none";if(!session)return login();page==="wardrobe"?wardrobe():page==="looks"?looks():pick()}
function login(){app.innerHTML='<div class="login"><p class="eyebrow">ЛИЧНЫЙ ГАРДЕРОБ</p><h1>Мой гардероб</h1><p class="muted">Войдите, чтобы ваши вещи и фотографии были доступны только вам и синхронизировались между устройствами.</p><label>Email<input id="email" type="email" autocomplete="email"></label><label>Пароль<input id="password" type="password" autocomplete="current-password"></label><button class="primary" id="signin">Войти</button><button id="signup">Первый вход — создать доступ</button><p id="msg" class="muted"></p></div>';document.querySelector("#signin").onclick=()=>auth(false);document.querySelector("#signup").onclick=()=>auth(true)}
async function auth(signup){let email=document.querySelector("#email").value.trim(),password=document.querySelector("#password").value,msg=document.querySelector("#msg");if(!email||password.length<6){msg.textContent="Введите email и пароль не короче 6 символов.";return}msg.textContent="Подождите…";let r=signup?await sb.auth.signUp({email,password}):await sb.auth.signInWithPassword({email,password});if(r.error){msg.textContent=r.error.message;return}session=r.data.session;if(!session){msg.textContent="Проверьте почту: Supabase попросил подтвердить email. После подтверждения вернитесь и нажмите «Войти».";return}await load();render()}
function wardrobe(){
if(!session)return render();
if(loadError){app.innerHTML=`<h1>Мой гардероб</h1><p role="alert">${esc(loadError)}</p><button id="retry">Повторить загрузку</button>`;document.querySelector("#retry").onclick=async()=>{await load();render()};return}
if(!loaded){app.innerHTML='<p>Загружаю каталог…</p>';return}
let items=allItems(),cats=["Все",...new Set(items.map(x=>x.category))],list=filter==="Все"?items:items.filter(x=>x.category===filter);app.innerHTML=`<header><p class=eyebrow>ПЕРСОНАЛЬНАЯ КАПСУЛА</p><div class=headline><h1>Мой гардероб</h1><button id=logout class=quiet>Выйти</button></div><p class=muted>${items.length} вещей</p></header><div class=chips>${cats.map(c=>`<button class="chip ${c===filter?"active":""}" data-filter="${esc(c)}">${esc(c)}</button>`).join("")}</div><div class=grid>${list.map(x=>`<article class=card data-id="${x.id}"><div class=photo id="p-${x.id}"><span>◇</span></div><b>${esc(x.name)}</b><button data-edit="${x.id}">Открыть</button><span class=tags>${esc(x.category)} · ${esc(x.color||"цвет не указан")}</span></article>`).join("")}</div><button class=add id=add>+</button>`;document.querySelector("#logout").onclick=async()=>{await sb.auth.signOut();session=null;cloudItems=[];loaded=false;loadError="";loadVersion++;render()};document.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;wardrobe()});document.querySelector("#add").onclick=()=>addForm();document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>addForm(items.find(x=>x.id===b.dataset.edit)));list.filter(x=>x.photo_path).forEach(async x=>{let u=await photo(x),el=document.querySelector("#p-"+CSS.escape(x.id));if(u&&el)el.innerHTML=`<img src="${u}" alt="">`})}
function looks(){app.innerHTML='<p class=eyebrow>ОБРАЗЫ</p><h1>Мои образы</h1><section class=hero><h2>Следующий этап</h2><p>Здесь будут комплекты из сохранённых вещей. Сначала наполним ваш приватный гардероб фотографиями.</p></section>'}
function pick(){app.innerHTML='<p class=eyebrow>ПОДБОР</p><h1>Что надеть?</h1><section class=hero><p>Подбор будет работать по вашим сохранённым вещам, погоде и ситуации. База уже готова для следующего шага.</p></section>'}
function addForm(item=null){app.innerHTML=`<button class=back id=back>‹ Гардероб</button><p class=eyebrow>${item?"МОЯ ВЕЩЬ":"НОВАЯ ВЕЩЬ"}</p><h1>${item?esc(item.name):"Добавить вещь"}</h1><div id="saved-photos" class="grid"></div><section class=form><label>Добавить фотографии<input id=file type=file accept="image/*" multiple></label><label>Название<input id=name placeholder="Например: молочный джемпер"></label><label>Категория<select id=cat><option>Верх</option><option>Брюки</option><option>Юбки</option><option>Платья</option><option>Трикотаж</option><option>Жакеты</option><option>Жилеты</option><option>Верхняя одежда</option><option>Обувь</option><option>Сумки</option><option>Аксессуары</option><option>Украшения</option></select></label><label>Цвет<input id=color placeholder="Например: бордо"></label><label>Сезон<select id=season><option value="">Не указан</option><option>Всесезон</option><option>Тепло</option><option>Прохладно</option><option>Холодно</option></select></label><label class=check><input id=mac type=checkbox> Подходит для MacBook</label><label>Заметка<textarea id=notes rows=3></textarea></label><button class=primary id=save>Сохранить вещь</button><p id=msg class=muted></p></section>`;document.querySelector("#back").onclick=wardrobe;document.querySelector("#save").onclick=saveItem;
const button=document.querySelector("#save");
button.dataset.photoPaths=JSON.stringify(item?.photo_paths?.length?item.photo_paths:item?.photo_path?[item.photo_path]:[]);
if(item){
 button.dataset.itemId=item.id;
 button.dataset.createdAt=item.created_at;
 for(const [field,value] of Object.entries({name:item.name,cat:item.category,color:item.color,season:item.season,notes:item.notes}))document.querySelector("#"+field).value=value||"";
 document.querySelector("#mac").checked=item.macbook;
 const gallery=document.querySelector("#saved-photos");
 for(const path of JSON.parse(button.dataset.photoPaths))photo({photo_path:path}).then(url=>{if(url&&gallery.isConnected){const img=document.createElement("img");img.src=url;img.alt=item.name;img.style.cssText="width:100%;max-height:400px;object-fit:contain";gallery.appendChild(img)}});
}
}
async function saveItem(){
  if(saving)return;
  const msg=document.querySelector("#msg"),button=document.querySelector("#save"),owner=session?.user.id;
  const name=document.querySelector("#name").value.trim(),files=Array.from(document.querySelector("#file").files);
  if(!owner||!loaded||loadError){msg.textContent="Сначала войдите и загрузите каталог.";return}
  if(!name){msg.textContent="Введите название вещи.";return}
  // Reuse the same ID if a response is lost and the user retries this form.
  const id=button.dataset.itemId||(button.dataset.itemId=crypto.randomUUID());
  const row={id,user_id:owner,name,category:document.querySelector("#cat").value,color:document.querySelector("#color").value.trim(),season:document.querySelector("#season").value,notes:document.querySelector("#notes").value.trim(),macbook:document.querySelector("#mac").checked,photo_path:null,photo_paths:JSON.parse(button.dataset.photoPaths||"[]")};
  row.photo_path=row.photo_paths[0]||null;
  if(button.dataset.createdAt)row.created_at=button.dataset.createdAt;
  saving=true;button.disabled=true;msg.textContent="Сохраняю…";
  try{
    for(const file of files){
      const ext=(file.name.split(".").pop()||"jpg").toLowerCase(),safeExt=["jpg","jpeg","png","webp","heic","heif"].includes(ext)?ext:"jpg";
      const path=`${owner}/${id}/${crypto.randomUUID()}.${safeExt}`;
      const up=await sb.storage.from("wardrobe-photos").upload(path,file,{contentType:file.type||"image/jpeg",upsert:true});
      if(up.error)throw new Error("Фото не загрузилось: "+up.error.message);
      row.photo_paths.push(path);
    }
    if(session?.user.id!==owner)throw new Error("Аккаунт изменился. Откройте форму заново.");
    row.photo_path=row.photo_paths[0]||null;
    const result=await sb.from("wardrobe_items").upsert(row,{onConflict:"id"});
    if(result.error)throw new Error("Не удалось сохранить: "+result.error.message);
    if(session?.user.id!==owner)return;
    await load();render();
  }catch(error){msg.textContent=error.message||"Не удалось сохранить. Повторите попытку."}
  finally{saving=false;button.disabled=false}
}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{page=b.dataset.page;render()});sb.auth.onAuthStateChange((_e,s)=>{
  const changed=session?.user.id!==s?.user.id;
  session=s;
  if(changed){
    cloudItems=[];loaded=false;loadError="";filter="Все";loadVersion++;
    setTimeout(async()=>{await load();render()},0);
  }
});init();