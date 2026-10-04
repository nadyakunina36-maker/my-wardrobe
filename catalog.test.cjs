const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/app.js','utf8').replace(/init\(\);\s*$/, '');
function setup(){
 const elements=new Map();
 const el=id=>{if(!elements.has(id))elements.set(id,{style:{},dataset:{},value:'',files:[],checked:false,innerHTML:''});return elements.get(id)};
 let rows=[],failure=false,pending=null,callback,writeCount=0;
 const client={auth:{onAuthStateChange:fn=>callback=fn},from:()=>({select:()=>({eq:(_k,owner)=>({order:async()=>pending?pending:({data:rows.filter(x=>x.user_id===owner),error:failure?new Error('offline'):null})})}),upsert:async row=>{writeCount++;const idx=rows.findIndex(x=>x.id===row.id);if(idx<0)rows.push(row);else rows[idx]=row;return {error:null}}}),storage:{from:()=>({upload:async()=>({error:null})})}};
 const ctx=vm.createContext({supabase:{createClient:()=>client},document:{querySelector:el,querySelectorAll:()=>[]},crypto:{randomUUID:()=> 'stable-test-id'},setTimeout:()=>{},CSS:{escape:x=>x}});
 vm.runInContext(source,ctx);
 return {run:s=>vm.runInContext(s,ctx),el,setRows:r=>rows=r,fail:()=>failure=true,setPending:p=>pending=p,callback:s=>callback('SIGNED_IN',s),writes:()=>writeCount};
}
test('19 persisted items survive adding the first new item',async()=>{
 const a=setup();a.run('session={user:{id:"owner"}}');
 a.setRows(Array.from({length:19},(_,i)=>({id:String(i),user_id:'owner',name:'saved '+i})));
 await a.run('load()');assert.equal(a.run('allItems().length'),19);
 a.el('#name').value='New item';await a.run('saveItem()');assert.equal(a.run('allItems().length'),20);
 assert.equal(a.run('allItems()[19].user_id'),'owner');
});
test('empty database stays empty and errors are not masked by fallback',async()=>{
 const a=setup();a.run('session={user:{id:"owner"}}');await a.run('load()');assert.equal(a.run('allItems().length'),0);
 a.fail();assert.equal(await a.run('load()'),false);assert.ok(a.run('loadError'));a.run('wardrobe()');assert.match(a.el('#app').innerHTML,/Повторить загрузку/);
});
test('account switch clears old items and rejects a stale load result',async()=>{
 const a=setup();a.run('session={user:{id:"owner"}}');let done;a.setPending(new Promise(r=>done=r));const load=a.run('load()');
 a.callback({user:{id:'other'}});done({data:[{user_id:'owner'}],error:null});await load;
 assert.equal(a.run('allItems().length'),0);assert.equal(a.run('loaded'),false);
});
test('double click writes once and retry reuses the same row ID',async()=>{
 const a=setup();a.run('session={user:{id:"owner"}};loaded=true');a.el('#name').value='New item';
 await Promise.all([a.run('saveItem()'),a.run('saveItem()')]);assert.equal(a.writes(),1);
 await a.run('saveItem()');assert.equal(a.run('allItems().length'),1);
});
test('editing photos preserves the existing card and its previous photos',async()=>{
 const a=setup();a.run('session={user:{id:"owner"}};loaded=true');
 a.setRows([{id:'existing',user_id:'owner',name:'Bag',photo_path:'owner/old.jpg',photo_paths:['owner/old.jpg']}]);
 a.el('#name').value='Bag';a.el('#save').dataset.itemId='existing';a.el('#save').dataset.photoPaths='["owner/old.jpg"]';
 a.el('#file').files=[{name:'new.jpg',type:'image/jpeg'}];
 await a.run('saveItem()');
 assert.equal(a.run('allItems().length'),1);assert.equal(a.run('allItems()[0].photo_path'),'owner/old.jpg');
 assert.equal(a.run('allItems()[0].photo_paths.length'),2);
 assert.ok(a.run('allItems()[0].photo_paths[1].startsWith("owner/existing/")'));
});
