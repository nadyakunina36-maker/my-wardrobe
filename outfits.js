/* Outfit suggestions use only the signed-in wardrobe. No item data is sent elsewhere. */
const OutfitEngine = (() => {
  const text = x => `${x.name || ''} ${x.color || ''}`.toLowerCase();
  const neutral = x => /чёрн|черн|бел|молоч|беж|серый|серые|корич|шоколад/.test(x.color || '');
  const compatible = (a,b) => neutral(a)||neutral(b)||a.color===b.color;
  function generate(items, options={}) {
    const weather=options.weather||'Прохладно', occasion=options.occasion||'Работа';
    const pool=items.filter(x=>x.id&&(!options.onlyPhotos||x.photo_path)&&(!x.season||x.season==='Всесезон'||x.season===weather));
    const category = (...cats) => pool.filter(x=>cats.includes(x.category));
    const tops=category('Верх','Трикотаж').filter(x=>!(weather==='Тепло'&&/свитер|высоким ворот/.test(text(x))));
    const bottoms=category('Брюки','Юбки'), dresses=category('Платья');
    const layers=category('Жакеты','Жилеты'), coats=category('Верхняя одежда');
    const bags=category('Сумки').filter(x=>!options.macbook||x.macbook);
    const extras=category('Украшения','Аксессуары').filter(x=>!(/шарф/.test(text(x))&&weather==='Тепло'));
    const shoes=category('Обувь');
    const candidates=[];
    function add(base) {
      let score=base.reduce((n,x)=>n+(x.photo_path?3:0),0);
      if(base.length===2)score+=compatible(...base)?4:-3;
      const parts=[...base], notes=[];
      const choose=list=>[...list].sort((a,b)=>{
        const rank=x=>(parts.every(p=>compatible(p,x))?5:0)+(x.photo_path?2:0)+(base.some(p=>p.color===x.color)?3:0);
        return rank(b)-rank(a)||a.id.localeCompare(b.id);
      })[0];
      const knit=base.some(x=>x.category==='Трикотаж');
      if((occasion==='Работа'||occasion==='Вечер')&&!knit) {
        const layer=choose(layers); if(layer){parts.push(layer);score+=2;}
      }
      if(occasion==='Вечер'&&base.some(x=>/сатин|кружев|юбк|плать/.test(text(x))))score+=5;
      if(occasion==='На каждый день'&&base.some(x=>/футбол|трикот|джемпер|резинке/.test(text(x))))score+=5;
      if(occasion==='Работа'&&base.some(x=>/рубаш|блуз|брюк/.test(text(x))))score+=3;
      if(weather!=='Тепло'){
        const coat=choose(coats); if(coat)parts.push(coat);else notes.push('В каталоге нет подходящей верхней одежды для выбранной погоды.');
        if(weather==='Холодно')notes.push('Для улицы проверьте утепление: состав и температурный режим вещей пока не указаны.');
      }
      const bag=choose(bags);if(bag)parts.push(bag);else if(options.macbook)notes.push('Нет сумки с отметкой «Подходит для MacBook».');
      const extra=choose(extras);if(extra)parts.push(extra);
      const shoe=choose(shoes);if(shoe)parts.push(shoe);else notes.push('Обувь пока не добавлена в гардероб — выберите её самостоятельно.');
      candidates.push({items:parts,baseIds:base.map(x=>x.id),score,notes,occasion,weather});
    }
    tops.forEach(t=>bottoms.forEach(b=>add([t,b])));dresses.forEach(d=>add([d]));
    candidates.sort((a,b)=>b.score-a.score||a.baseIds.join().localeCompare(b.baseIds.join()));
    const result=[],used=new Map();
    while(candidates.length&&result.length<18){
      candidates.sort((a,b)=>(b.score-b.baseIds.reduce((n,id)=>n+(used.get(id)||0)*7,0))-(a.score-a.baseIds.reduce((n,id)=>n+(used.get(id)||0)*7,0)));
      const next=candidates.shift();result.push(next);next.baseIds.forEach(id=>used.set(id,(used.get(id)||0)+1));
    }
    return result;
  }
  return {generate};
})();
if(typeof module!=='undefined')module.exports=OutfitEngine;
