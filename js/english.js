/* ============= zhaoline工作台 · 英语学习（听说读写 · 美英双音 · 场景对话 · 资料导入） ============= */
(function(){
const Z=window.Z;
const S=Z.store;
const ui={tab:'words',set:'mall',mode:'list',dlg:0,rate:1,quiz:null,listeningDlg:0,readIdx:0,writing:'write'};
Z.engUI=ui;

/* ---------- TTS（美音 / 英音） ---------- */
const voices={US:[],UK:[]};
function warmVoices(){
  if(!('speechSynthesis' in window))return;
  const v=speechSynthesis.getVoices();
  voices.US=v.filter(x=>/^en[-_]US/i.test(x.lang));
  voices.UK=v.filter(x=>/^en[-_]GB/i.test(x.lang));
}
if('speechSynthesis' in window){ warmVoices(); speechSynthesis.onvoiceschanged=warmVoices; }
function pickVoice(acc){
  const arr=voices[acc==='UK'?'UK':'US'];
  if(arr&&arr.length){
    // 优先自然发音
    const nice=arr.find(v=>/natural|neural|premium|Siri|Daniel|Google UK|Google US/i.test(v.name))||arr[0];
    return nice;
  }
  return null;
}
let speakTok=0;
function stopSpeak(){ speakTok++; try{speechSynthesis.cancel();}catch(e){} }
function speak(text,acc,rate,onend){
  if(!text||!('speechSynthesis' in window)){ Z.toast('当前浏览器不支持语音朗读'); if(onend)onend(); return; }
  stopSpeak();
  const my=++speakTok;
  const u=new SpeechSynthesisUtterance(text);
  u.lang=acc==='UK'?'en-GB':'en-US';
  u.rate=rate||1; u.pitch=1.02;
  const v=pickVoice(acc); if(v)u.voice=v;
  if(onend){ u.onend=()=>{ if(my===speakTok)onend(); }; u.onerror=()=>{ if(my===speakTok)onend(); }; }
  speechSynthesis.speak(u);
  return my;
}
function speakSeq(lines,opt){
  // lines:[{text,who,el?}] 依次朗读
  stopSpeak();
  const acc=Z.settings.acc, rate=opt.rate||1;
  const my=++speakTok;
  function n(i){
    if(my!==speakTok)return;
    if(i>=lines.length){ if(opt.onDone)opt.onDone(); return; }
    const ln=lines[i];
    if(opt.skipWho&&ln.who===opt.skipWho){ setTimeout(()=>n(i+1),400); return; }
    if(ln.el){ document.querySelectorAll('.speaking').forEach(e=>e.classList.remove('speaking')); ln.el.classList.add('speaking'); }
    speak(ln.text,acc,rate,()=>{ setTimeout(()=>n(i+1), opt.gap!=null?opt.gap:250); });
  }
  n(0);
  return my;
}
function rateBtnHTML(){
  return '<div class="seg" style="margin-right:6px"><button data-rate="1" class="'+(ui.rate===1?'on':'')+'" type="button">常速</button><button data-rate="0.65" class="'+(ui.rate<1?'on':'')+'" type="button">慢速</button></div>';
}
function accBtnHTML(){
  const acc=Z.settings.acc;
  return '<div class="seg"><button data-acc="US" class="'+(acc==='US'?'on':'')+'" type="button">🇺🇸 美音</button><button data-acc="UK" class="'+(acc==='UK'?'on':'')+'" type="button">🇬🇧 英音</button></div>';
}

/* ---------- 单词库：日常生活场景 · 美/英音标 ---------- */
const VOCAB=[
{id:'mall',icon:'🛍️',cn:'逛商场',words:[
['receipt','rɪˈsiːt','rɪˈsiːt','n.','收据','Could I have a receipt, please?','可以给我一张收据吗？'],
['discount','ˈdɪskaʊnt','ˈdɪskaʊnt','n./v.','折扣','Is there any discount today?','今天有折扣吗？'],
['fitting room','ˈfɪtɪŋ ruːm','ˈfɪtɪŋ rʊm','n.','试衣间','Where is the fitting room?','试衣间在哪里？'],
['cashier','kæˈʃɪr','kæˈʃɪə(r)','n.','收银员','You can pay at the cashier over there.','你可以在那边的收银台付款。'],
['bargain','ˈbɑːrɡən','ˈbɑːɡən','n.','划算的交易','This coat is a real bargain.','这件大衣真划算。'],
['aisle','aɪl','aɪl','n.','(货架/座位)通道','Walk down the aisle to find the milk.','沿着通道走就能找到牛奶。'],
['cart','kɑːrt','kɑːt','n.','购物车(美)','Could you hold my cart for a second?','你能帮我看一下购物车吗？'],
['refund','ˈriːfʌnd','ˈriːfʌnd','n./v.','退款','I’d like a refund for this shirt.','这件衬衫我想退款。'],
['on sale','ɒn seɪl','ɒn seɪl','ph.','打折促销','These shoes are on sale this week.','这双鞋本周在打折。'],
['price tag','praɪs tæɡ','praɪs tæɡ','n.','价签','The price tag says 199.','价签上写着 199。'],
['try on','traɪ ɒn','traɪ ɒn','ph.','试穿','Can I try this on?','我能试穿一下吗？'],
['size','saɪz','saɪz','n.','尺码','Do you have this in a medium?','这件有中码吗？'],
['checkout','ˈtʃekaʊt','ˈtʃekaʊt','n.','结账台','The checkout is on the second floor.','结账台在二楼。'],
['counter','ˈkaʊntər','ˈkaʊntə(r)','n.','柜台','Pay at the counter, please.','请到柜台���款。'],
['warranty','ˈwɔːrənti','ˈwɒrənti','n.','保修单','Does this come with a warranty?','这个有保修吗？'],
['exchange','ɪksˈtʃeɪndʒ','ɪksˈtʃeɪndʒ','v.','换货','Can I exchange it for another color?','我能换一个颜色吗？'],
['voucher','ˈvaʊtʃər','ˈvaʊtʃə(r)','n.','代金券','Use this voucher for 50 off.','用这张代金券减 50 元。'],
['out of stock','aʊt əv stɑːk','aʊt əv stɒk','ph.','缺货','Sorry, this size is out of stock.','抱歉，这个尺码缺货。'],
['loyalty card','ˈlɔɪəlti kɑːrd','ˈlɔɪəlti kɑːd','n.','会员卡','Do you have a loyalty card?','您有会员卡吗？'],
['window shop','ˈwɪndoʊ ʃɑːp','ˈwɪndəʊ ʃɒp','ph.','逛橱窗（不买）','Let’s just window shop today.','今天我们就逛逛不买了。']]},
{id:'gym',icon:'🏋️',cn:'运动健身',words:[
['workout','ˈwɜːrkaʊt','ˈwɜːkaʊt','n.','训练/锻炼','I do a full-body workout three times a week.','我每周做三次全身训练。'],
['muscle','ˈmʌsl','ˈmʌsl','n.','肌肉','Lift weights to build muscle.','举铁可以增肌。'],
['protein','ˈproʊtiːn','ˈprəʊtiːn','n.','蛋白质','Eat enough protein after training.','训练后要吃够蛋白质。'],
['gym','dʒɪm','dʒɪm','n.','健身房','I go to the gym after work.','我下班后去健身房。'],
['trainer','ˈtreɪnər','ˈtreɪnə(r)','n.','教练','My trainer made me a weekly plan.','我的教练给我做了周计划。'],
['stretch','stretʃ','stretʃ','v./n.','拉伸','Always stretch before you lift.','举铁前一定要拉伸。'],
['reps','reps','reps','n.','次数(重复)','Do three sets of ten reps.','做三组，每组十次。'],
['sweat','swet','swet','v.','出汗','Don’t be afraid to sweat a little.','别怕出点汗。'],
['gains','ɡeɪnz','ɡeɪnz','n.(pl)','增肌成果(俚)','Slow gains are still gains.','慢速增肌也是增肌。'],
['set','set','set','n.','组','Take a 60-second rest between sets.','组间休息 60 秒。'],
['cardio','ˈkɑːrdioʊ','ˈkɑːdiəʊ','n.','有氧','I do 20 minutes of cardio to warm up.','我先做 20 分钟有氧热身。'],
['warm up','wɔːrm ʌp','wɔːm ʌp','ph.','热身','Warm up for five minutes first.','先热身 5 分钟。'],
['cool down','kuːl daʊn','kuːl daʊn','ph.','放松/拉伸','Don’t skip the cool down.','别跳过放松环节。'],
['bench press','bentʃ pres','bentʃ pres','n.','卧推','I increased my bench press by 5kg.','我的卧推多了 5 公斤。'],
['squat','skwɑːt','skwɒt','n./v.','深蹲','Squats are great for legs.','深蹲对腿特别好。'],
['deadlift','ˈdedlɪft','ˈdedlɪft','n.','硬拉','Deadlifts work your whole back.','硬拉练整片背。'],
['treadmill','ˈtredmɪl','ˈtredmɪl','n.','跑步机','I ran 5k on the treadmill.','我在跑步机上跑了 5 公里。'],
['hydrate','ˈhaɪdreɪt','ˈhaɪdreɪt','v.','补水','Drink water to stay hydrated.','多喝水保持水分。'],
['rest day','rest deɪ','rest deɪ','n.','休息日','Sunday is my rest day.','周日是我的休息日。'],
['form','fɔːrm','fɔːm','n.','动作姿势','Keep good form to avoid injury.','保持好姿势避免受伤。']]},
{id:'bank',icon:'🏦',cn:'银行',words:[
['account','əˈkaʊnt','əˈkaʊnt','n.','账户','I’d like to open a savings account.','我想开一个储蓄账户。'],
['teller','ˈtelər','ˈtelə(r)','n.','柜员','The teller asked for my ID.','柜员问我要身份证件。'],
['deposit','dɪˈpɑːzɪt','dɪˈpɒzɪt','v./n.','存入；存款','I want to deposit some cash.','我想存点现金。'],
['withdraw','wɪðˈdrɔː','wɪðˈdrɔː','v.','取款','How much do you want to withdraw?','您想取多少？'],
['exchange','ɪksˈtʃeɪndʒ','ɪksˈtʃeɪndʒ','v./n.','兑换(外币)','Where can I exchange dollars?','我在哪里能兑换美元？'],
['rate','reɪt','reɪt','n.','(汇率/利率)','The exchange rate changes daily.','汇率每天都会变。'],
['PIN','pɪn','pɪn','n.','密码(卡)','Enter your PIN to continue.','输入密码以继续。'],
['ATM','ˌeɪ tiː ˈem','ˌeɪ tiː ˈem','n.','自动取款机','Is there an ATM near here?','这附近有取款机吗？'],
['form','fɔːrm','fɔːm','n.','表格','Please fill in this form first.','请先填一下这张表。'],
['balance','ˈbæləns','ˈbæləns','n.','余额','What’s my account balance?','我的账户余额是多少？'],
['transfer','trænsˈfɜːr','trænsˈfɜː(r)','v./n.','转账','I want to transfer 500 to my friend.','我想给朋友转 500 元。'],
['wire','ˈwaɪər','ˈwaɪə(r)','v./n.','电汇','I’ll wire the money today.','我今天电汇过去。'],
['loan','loʊn','ləʊn','n.','贷款','I applied for a small loan.','我申请了一笔小额贷款。'],
['interest','ˈɪntrəst','ˈɪntrəst','n.','利息','The interest rate is very low.','利率很低。'],
['signature','ˈsɪɡnətʃər','ˈsɪɡnətʃə(r)','n.','签名','Please sign your signature here.','请在这里签名。'],
['branch','bræntʃ','brɑːntʃ','n.','分行','The nearest branch is two blocks away.','最近的分行在两个街区外。'],
['receipt','rɪˈsiːt','rɪˈsiːt','n.','回执','Keep the receipt for your records.','保留回执作为记录。'],
['credit card','ˈkredɪt kɑːrd','ˈkredɪt kɑːd','n.','信用卡','Do you accept credit cards?','你们收信用卡吗？'],
['debit card','ˈdebɪt kɑːrd','ˈdebɪt kɑːd','n.','借记卡','Use your debit card at the ATM.','用借记卡在 ATM 上取款。'],
['statement','ˈsteɪtmənt','ˈsteɪtmənt','n.','账单','My monthly statement is ready.','我的月度账单已出。']]},
{id:'airport',icon:'✈️',cn:'机场登机',words:[
['boarding pass','ˈbɔːrdɪŋ pæs','ˈbɔːdɪŋ pɑːs','n.','登机牌','Show your boarding pass at the gate.','登机口要出示登机牌。'],
['check-in','ˈtʃek ɪn','ˈtʃek ɪn','n./v.','值机','The check-in counter is on the right.','值机柜台在右边。'],
['gate','ɡeɪt','ɡeɪt','n.','登机口','Our flight leaves from Gate 23.','我们的航班在23号登机口起飞。'],
['departure','dɪˈpɑːrtʃər','dɪˈpɑːtʃə(r)','n.','出发','Check the departure board first.','先看一下出发信息屏。'],
['delay','dɪˈleɪ','dɪˈleɪ','n./v.','延误','The flight is delayed by an hour.','航班延误一小时。'],
['luggage','ˈlʌɡɪdʒ','ˈlʌɡɪdʒ','n.','行李','How many bags are you checking in?','您托运几件行李？'],
['security','sɪˈkjʊrəti','sɪˈkjʊərəti','n.','安检','Take your laptop out at security.','过安检时把电脑拿出来。'],
['carry-on','ˈkæri ɒn','ˈkæri ɒn','n.','随身行李','Keep valuables in your carry-on.','贵重物品放随身行李里。'],
['aisle seat','aɪl siːt','aɪl siːt','n.','过道座位','Can I have an aisle seat, please?','可以给我一个过道座位吗？'],
['window seat','ˈwɪndoʊ siːt','ˈwɪndəʊ siːt','n.','靠窗座位','I prefer a window seat.','我更喜欢靠窗座位。'],
['passport','ˈpæspɔːrt','ˈpɑːspɔːt','n.','护照','Your passport, please.','请出示您的护照。'],
['visa','ˈviːzə','ˈviːzə','n.','签证','Do I need a visa for Japan?','去日本需要签证吗？'],
['terminal','ˈtɜːrmɪnl','ˈtɜːmɪnl','n.','航站楼','Terminal 3 is for international flights.','3 号航站楼飞国际航班。'],
['flight','flaɪt','flaɪt','n.','航班','My flight is at 9 p.m.','我的航班是晚上 9 点。'],
['arrival','əˈraɪvl','əˈraɪvl','n.','到达','Check the arrival board after landing.','落地后看到达信息屏。'],
['customs','ˈkʌstəmz','ˈkʌstəmz','n.','海关','Go through customs after you land.','落地后过海关。'],
['overhead bin','ˈoʊvərhed bɪn','ˈəʊvəhed bɪn','n.','行李架','Put your bag in the overhead bin.','把包放进行李架。'],
['turbulence','ˈtɜːrbjələns','ˈtɜːbjələns','n.','气流颠簸','We hit some turbulence.','我们遇到一些颠簸。'],
['layover','ˈleɪoʊvər','ˈleɪəʊvə(r)','n.','中途停留','I have a 3-hour layover in Seoul.','我在首尔中途停留 3 小时。'],
['duty-free','ˈduːti friː','ˈdjuːti friː','n.','免税店','I bought perfume at duty-free.','我在免税店买了香水。']]},
{id:'dining',icon:'🍜',cn:'餐厅点餐',words:[
['menu','ˈmenjuː','ˈmenjuː','n.','菜单','Could I see the menu, please?','可以看一下菜单吗？'],
['order','ˈɔːrdər','ˈɔːdə(r)','v./n.','点餐','I’d like to order the set meal.','我想点套餐。'],
['recommend','ˌrekəˈmend','ˌrekəˈmend','v.','推荐','What do you recommend?','你有什么推荐吗？'],
['spicy','ˈspaɪsi','ˈspaɪsi','adj.','辣的','Is this dish spicy?','这道菜辣吗？'],
['bill','bɪl','bɪl','n.','账单','Could we have the bill, please?','请给我们结账。'],
['tip','tɪp','tɪp','n.','小费','Is a tip included in the bill?','账单里包含小费吗？'],
['takeaway','ˈteɪkəweɪ','ˈteɪkəweɪ','n.','外卖/打包','Can I get this as a takeaway?','这个能打包吗？'],
['tasty','ˈteɪsti','ˈteɪsti','adj.','好吃的','This soup is really tasty.','这个汤真好喝。'],
['dessert','dɪˈzɜːrt','dɪˈzɜːt','n.','甜点','Save some room for dessert!','留点肚子吃甜点！'],
['starter','ˈstɑːrtər','ˈstɑːtə(r)','n.','前菜','We’ll have the soup as a starter.','我们点汤作为前菜。'],
['main course','meɪn kɔːrs','meɪn kɔːs','n.','主菜','What’s today’s main course?','今天的主菜是什么？'],
['appetizer','ˈæpɪtaɪzər','ˈæpɪtaɪzə(r)','n.','开胃菜','The appetizer was delicious.','开胃菜很美味。'],
['vegetarian','ˌvedʒəˈteriən','ˌvedʒəˈteəriən','adj./n.','素食','Do you have vegetarian options?','有素食选项吗？'],
['allergy','ˈælərdʒi','ˈælədʒi','n.','过敏','I have a nut allergy.','我对坚果过敏。'],
['ingredient','ɪnˈɡriːdiənt','ɪnˈɡriːdiənt','n.','食材','What are the ingredients?','食材有哪些？'],
['portion','ˈpɔːrʃn','ˈpɔːʃn','n.','份量','The portion is huge.','份量很大。'],
['served','sɜːrvd','sɜːvd','adj.','几分熟','How is your steak served?','你的牛排几分熟？'],
['rare','rer','reə(r)','adj.','三分熟','I’d like my steak medium rare.','我的牛排要三分熟。'],
['refill','ˈriːfɪl','ˈriːfɪl','n./v.','续杯','Can I get a water refill?','能续一杯水吗？'],
['reservation','ˌrezərˈveɪʃn','ˌrezəˈveɪʃn','n.','预订','I made a reservation for 7 p.m.','我预订了晚上 7 点。']]},
{id:'travel',icon:'🧳',cn:'旅行问路/酒店',words:[
['reservation','ˌrezərˈveɪʃn','ˌrezəˈveɪʃn','n.','预订','I have a reservation under the name Li.','我用李这个名字预订了房间。'],
['check in','tʃek ɪn','tʃek ɪn','ph.','办理入住','We’d like to check in, please.','我们想办理入住。'],
['check out','tʃek aʊt','tʃek aʊt','ph.','退房','What time is check out?','几点退房？'],
['Wi-Fi','ˈwaɪ faɪ','ˈwaɪ faɪ','n.','无线网络','What’s the Wi-Fi password?','Wi-Fi 密码是多少？'],
['directions','dəˈrekʃnz','daɪˈrekʃnz','n.','路线指引','Can you give me directions to the museum?','能告诉我怎么去博物馆吗？'],
['straight','streɪt','streɪt','adv.','笔直地','Go straight and turn left.','直走然后左转。'],
['corner','ˈkɔːrnər','ˈkɔːnə(r)','n.','拐角','The hotel is on the corner.','酒店就在拐角处。'],
['nearby','ˌnɪrˈbaɪ','ˌnɪəˈbaɪ','adv.','附近','Is there a subway station nearby?','附近有地铁站吗？'],
['lost','lɔːst','lɒst','adj.','迷路的','I think we’re lost.','我觉得我们迷路了。'],
['lobby','ˈlɑːbi','ˈlɒbi','n.','大堂','Meet me in the lobby at 8.','8 点在大堂见我。'],
['suite','swiːt','swiːt','n.','套房','We booked a suite with a view.','我们订了一间有景观的套房。'],
['single room','ˈsɪŋɡl ruːm','ˈsɪŋɡl rʊm','n.','单人间','I’d like a single room.','我想要单间。'],
['double room','ˈdʌbl ruːm','ˈdʌbl rʊm','n.','双人间','A double room, please.','请给我一间双人间。'],
['breakfast included','ˈbrekfəst ɪnˈkluːdɪd','ˈbrekfəst ɪnˈkluːdɪd','ph.','含早餐','Is breakfast included?','含早餐吗？'],
['key card','kiː kɑːrd','kiː kɑːd','n.','房卡','Here’s your key card.','这是您的房卡。'],
['tour','tʊr','tʊə(r)','n.','旅行团','We took a guided tour.','我们报了个导游团。'],
['sightseeing','ˈsaɪtsiːɪŋ','ˈsaɪtsiːɪŋ','n.','观光','We did some sightseeing today.','我们今天观光了一下。'],
['souvenir','ˌsuːvəˈnɪr','ˌsuːvəˈnɪə(r)','n.','纪念品','I bought a souvenir for Mom.','我给妈妈买了个纪念品。'],
['map','mæp','mæp','n.','地图','Do you have a city map?','有城市地图吗？'],
['subway','ˈsʌbweɪ','ˈsʌbweɪ','n.','地铁','Take the subway to the museum.','坐地铁去博物馆。']]},
{id:'office',icon:'💼',cn:'职场日常',words:[
['meeting','ˈmiːtɪŋ','ˈmiːtɪŋ','n.','会议','We have a meeting at 10 a.m.','我们上午十点开会。'],
['deadline','ˈdedlaɪn','ˈdedlaɪn','n.','截止时间','The deadline is this Friday.','截止时间是本周五。'],
['schedule','ˈskedʒuːl','ˈʃedjuːl','n./v.','日程(美/英音不同)','Let me check my schedule.','让我看一下我的日程。'],
['report','rɪˈpɔːrt','rɪˈpɔːt','n./v.','报告','I’m working on the monthly report.','我在做月报。'],
['colleague','ˈkɑːliːɡ','ˈkɒliːɡ','n.','同事','My colleague helped me with the data.','同事帮我处理了数据。'],
['promotion','prəˈmoʊʃn','prəˈməʊʃn','n.','晋升','She got a promotion last month.','她上个月升职了。'],
['overtime','ˈoʊvərtaɪm','ˈəʊvətaɪm','n.','加班','I worked overtime twice this week.','这周我加了两次班。'],
['bored','bɔːrd','bɔːd','adj.','无聊的','I felt bored in that long meeting.','那个长会很无聊。'],
['salary','ˈsæləri','ˈsæləri','n.','薪水','The salary comes in on the 10th.','工资十号到账。'],
['boss','bɔːs','bɒs','n.','老板','My boss is on vacation this week.','我老板这周在休假。'],
['client','ˈklaɪənt','ˈklaɪənt','n.','客户','I have a client call at 3.','我 3 点有个客户电话。'],
['project','ˈprɑːdʒekt','ˈprɒdʒekt','n.','项目','The project launches next month.','这个项目下个月启动。'],
['agenda','əˈdʒendə','əˈdʒendə','n.','议程','What’s on the agenda?','议程是什么？'],
['minutes','ˈmɪnɪts','ˈmɪnɪts','n.','会议纪要','Take minutes during the meeting.','开会时做记录。'],
['feedback','ˈfiːdbæk','ˈfiːdbæk','n.','反馈','Thanks for the feedback.','谢谢反馈。'],
['resign','rɪˈzaɪn','rɪˈzaɪn','v.','辞职','He resigned last week.','他上周辞职了。'],
['hire','ˈhaɪər','ˈhaɪə(r)','v.','招聘','We’re hiring three designers.','我们在招 3 个设计师。'],
['freelance','ˈfriːlæns','ˈfriːlɑːns','adj.','自由职业','She does freelance writing.','她做自由撰稿。'],
['remote','rɪˈmoʊt','rɪˈməʊt','adj.','远程','I work a remote job.','我做远程工作。'],
['invoice','ˈɪnvɔɪs','ˈɪnvɔɪs','n.','发票','Please send me the invoice.','请把发票发给我。']]},
{id:'health',icon:'💊',cn:'就医买药',words:[
['appointment','əˈpɔɪntmənt','əˈpɔɪntmənt','n.','预约','I need to make an appointment with the doctor.','我需要预约医生。'],
['pharmacy','ˈfɑːrməsi','ˈfɑːməsi','n.','药房','Is there a pharmacy open now?','现在有开着的药房吗？'],
['medicine','ˈmedɪsn','ˈmedsn','n.','药','Take this medicine twice a day.','这个药一天吃两次。'],
['symptom','ˈsɪmptəm','ˈsɪmptəm','n.','症状','What are your symptoms?','你有什么症状？'],
['fever','ˈfiːvər','ˈfiːvə(r)','n.','发烧','I have a slight fever.','我有点发烧。'],
['throat','θroʊt','θrəʊt','n.','喉咙','My throat is sore.','我嗓子疼。'],
['rest','rest','rest','n./v.','休息','You need plenty of rest.','你需要多休息。'],
['prescription','prɪˈskrɪpʃn','prɪˈskrɪpʃn','n.','处方','This is a prescription medicine.','这是处方药。'],
['recover','rɪˈkʌvər','rɪˈkʌvə(r)','v.','康复','Drink water and you’ll recover soon.','多喝水，很快就会好。'],
['headache','ˈhedeɪk','ˈhedeɪk','n.','头痛','I’ve had a headache all day.','我头痛了一整天。'],
['cough','kɔːf','kɒf','n./v.','咳嗽','I have a bad cough.','我咳得很厉害。'],
['allergy','ˈælərdʒi','ˈælədʒi','n.','过敏','I have seasonal allergies.','我有季节性过敏。'],
['insurance','ɪnˈʃʊrəns','ɪnˈʃʊərəns','n.','保险','Does my insurance cover this?','我的保险能报销吗？'],
['sore','sɔːr','sɔː(r)','adj.','酸痛的','My back is sore.','我背酸。'],
['injury','ˈɪndʒəri','ˈɪndʒəri','n.','伤','He had a sports injury.','他有运动伤。'],
['X-ray','ˈeks reɪ','ˈeks reɪ','n.','X 光','I need an X-ray for my ankle.','我的脚踝要照 X 光。'],
['blood test','blʌd test','blʌd test','n.','验血','The doctor ordered a blood test.','医生开了验血单。'],
['painkiller','ˈpeɪnkɪlər','ˈpeɪnkɪlə(r)','n.','止痛药','Take a painkiller if it hurts.','痛的话吃片止痛药。'],
['dose','doʊs','dəʊs','n.','剂量','Follow the dose on the label.','按标签上的剂量服用。'],
['checkup','ˈtʃekʌp','ˈtʃekʌp','n.','体检','I have my annual checkup tomorrow.','我明天做年度体检。']]}
];
function setById(id){ return VOCAB.find(s=>s.id===id)||VOCAB[0]; }

/* ---------- 场景对话（双人播客感） ---------- */
const DIALOGS=[
{id:'airport',icon:'✈️',cn:'机场登机',who:['Lily','Max'],pod:'English on the Go · 边走边学',lines:[
['L','Welcome back to “English on the Go”! Today we are at the airport.','欢迎回到《边走边学英语》！今天我们来到机场。'],
['M','Do I need my passport at check-in, or only at security?','值机的时候要护照吗？还是只有安检才要？'],
['L','Both, actually. Keep your passport, boarding pass and phone in your hand.','其实都要。把护照、登机牌和手机拿在手里。'],
['M','Got it. And how do I know which gate to go to?','明白了。那怎么知道去哪个登机口？'],
['L','Check the big screens — they show “Gate 23, boarding at 10:30”. Then follow the signs.','看大屏幕——上面写着“23号登机口，10:30登机”。然后跟着指示牌走。'],
['M','What if my flight is delayed or even canceled?','如果航班延误甚至取消怎么办？'],
['L','The airline will announce it. You can also ask at the counter or check the app.','航空公司会广播通知。你也可以去柜台问，或者查 App。'],
['M','So today’s words: boarding pass, gate, departure, delay…','那今天的单词就是：登机牌、登机口、出发、延误……'],
['L','Exactly! Now repeat after me: “Where is the boarding gate?”','没错！跟我读：“Where is the boarding gate?”'],
['M','Where is the boarding gate?','Where is the boarding gate?'],
['L','Perfect. One more: “Is my flight on time?”','非常好。再来一句：“Is my flight on time?”'],
['M','Is my flight on time?','Is my flight on time?'],
['L','Great job. Next stop — duty free and coffee!','很棒。下一站——免税店和咖啡！']]},
{id:'mall',icon:'🛍️',cn:'逛商场试衣',who:['Lily','Max'],pod:'Shopping Time',lines:[
['L','Max, you’ve been staring at that jacket for five minutes.','Max，你已经盯着那件夹克五分钟了。'],
['M','It’s 30% off! Is it still on sale tomorrow?','打七折呢！明天还打折吗？'],
['L','Usually sales end tonight. Just ask the clerk.','一般活动今晚就结束。直接问店员就好。'],
['M','Excuse me, do you have this in a size M?','不好意思，这件有 M 码吗？'],
['L','Good question! And don’t forget to ask where the fitting room is.','问得好！别忘了问试衣间在哪里。'],
['M','Where is the fitting room?','Where is the fitting room?'],
['L','It’s at the back, near the mirrors. Also — keep your receipt!','在后面，镜子旁边。还有——收据要留好！'],
['M','Why? Do I need it for a refund?','为什么？退货要用吗？'],
['L','Yes. Most stores give refunds within 14 days with the receipt.','对。多数门店凭收据14天内可以退货。'],
['M','Great, I’ll take it. This is my first “English shopping success”!','太好了，我买了。这是我第一次“用英语购物成功”！'],
['L','And the best word of the day? “Bargain” — you got a real bargain.','今天的最佳单词是“Bargain”——你买得太划算了。']]},
{id:'gym',icon:'🏋️',cn:'运动增肌',who:['Lily','Max'],pod:'Gym Buddies',lines:[
['M','Lily, I finally joined a gym! I want to gain muscle.','Lily，我终于办卡去健身房了！我想增肌。'],
['L','Love that for you. Start with a full-body workout three times a week.','太为你开心了。先从每周三次的全身训练开始。'],
['M','My trainer said the same. But I’m confused about reps and sets.','我的教练也这么说。但我不太懂次数和组数。'],
['L','A “set” is one round; “reps” are how many times you move. Three sets of ten reps!','“组”是一轮，“次数”是动作做多少下。三组每组十次！'],
['M','So… sets x reps. Got it. Do I need protein powder right away?','所以是组数×次数。明白了。我要马上喝蛋白粉吗？'],
['L','Not right away. First, eat enough protein from food — eggs, chicken, milk.','不用急着喝。先从食物里吃够蛋白质——鸡蛋、鸡肉、牛奶。'],
['M','Okay. And how many rest days?','好。那要休息几天？'],
['L','Muscles grow when you rest. Take one or two rest days every week.','肌肉是在休息时生长的。每周要休息一到两天。'],
['M','Let me try that sentence: “I work out three times a week.”','让我试试这句话：“I work out three times a week.”'],
['L','Perfect. See you at the gym — gain it!','完美。健身房见——增肌加油！']]},
{id:'bank',icon:'🏦',cn:'银行办业务',who:['Lily','Max'],pod:'Money Talk',lines:[
['L','Today: bank English. Nothing scarier than a fast-speaking teller!','今天聊聊银行英语。没什么比语速快的柜员更吓人的了！'],
['M','True. I always forget how to say “取款”.','真的。我总忘了“取款”怎么说。'],
['L','It’s “withdraw” — I’d like to withdraw some cash.','是 withdraw——“我想取些现金”。'],
['M','I’d like to withdraw some cash. And to open an account?','I’d like to withdraw some cash.那“开户”呢？'],
['L','“I’d like to open a savings account, please.” Try it!','“I’d like to open a savings account, please.” 试试！'],
['M','I’d like to open a savings account, please.','I’d like to open a savings account, please.'],
['L','Good. If you need foreign money, say “I’d like to exchange some dollars.”','很好。如果要外币，就说“I’d like to exchange some dollars.”'],
['M','What about the exchange rate?','那汇率怎么说？'],
['L','“What’s the exchange rate today?” — the teller will tell you.','“What’s the exchange rate today?”——柜员会告诉你的。'],
['M','And my password? “PIN number”?','还有密码呢？是“PIN number”吗？'],
['L','Just say “PIN”. “Please enter your PIN.” Don’t say number after PIN.','说 PIN 就行：“Please enter your PIN.” 后面别再加 number。'],
['M','You just saved me from a very awkward moment.','你刚帮我避免了一个超级尴尬的场面。']]},
{id:'restaurant',icon:'🍜',cn:'餐厅点餐',who:['Lily','Max'],pod:'Lunch Rush',lines:[
['L','Starving! Let’s practice ordering food today.','饿死了！今天来练点餐。'],
['M','I’m a little nervous about ordering at a fancy place.','在高级餐厅点餐我有点紧张。'],
['L','Start simple: “Could I see the menu, please?”','从简单的开始：“Could I see the menu, please?”'],
['M','Could I see the menu, please? And… “What do you recommend?”','Could I see the menu, please?还有……“What do you recommend?”'],
['L','“What do you recommend?” is gold. Use it anytime.','“What do you recommend?”是万能句，随时能用。'],
['M','What if the food is too spicy?','如果菜太辣了怎么办？'],
['L','Say: “Could I have it mild, please?” Mild = 微辣/不辣.','说：“Could I have it mild, please?” mild 就是不辣或微辣。'],
['M','Nice. And I love dessert. How do I order cake?','不错。我超爱甜点。怎么点蛋糕？'],
['L','“What desserts do you have today?” Then… enjoy!','“What desserts do you have today?” 然后……享用吧！'],
['M','Final question: how do I pay? “Can I have the bill?”','最后一个问题：怎么结账？“Can I have the bill?”'],
['L','Exactly. Or “Check, please!” in the US.','对。在美国也可以说“Check, please!”。'],
['M','Okay, I’m ready to order like a local.','好了，我可以像本地人一样点餐了。']]},
{id:'travel',icon:'🧳',cn:'旅行·酒店与问路',who:['Lily','Max'],pod:'Roam & Talk',lines:[
['M','Hotel English time! I booked a room — what do I say first?','来学酒店英语！我订了房——进门第一句说什么？'],
['L','“Hi, I have a reservation under the name Max.”','“Hi, I have a reservation under the name Max.”'],
['M','Hi, I have a reservation under the name Max. And the Wi-Fi password?','Hi, I have a reservation under the name Max.那 Wi-Fi 密码呢？'],
['L','“What’s the Wi-Fi password?” — Every traveler’s life saver.','“What’s the Wi-Fi password?”——每个旅行者的救命句。'],
['M','Got it. Tomorrow I want to walk around. How do I ask for directions?','记下了。明天我想出去逛逛，怎么问路？'],
['L','“Excuse me, how do I get to the subway station?”','“Excuse me, how do I get to the subway station?”'],
['M','Excuse me, how do I get to the subway station?','Excuse me, how do I get to the subway station?'],
['L','If they say “go straight and turn left”, just follow that!','如果他们回答“go straight and turn left”，照做就行！'],
['M','And check-out? I need to leave early.','退房怎么说？我得早走。'],
['L','“Can I check out at 6 a.m.?” Ask the front desk tonight.','“Can I check out at 6 a.m.?” 今晚就去前台问。'],
['M','Perfect. This trip will be my best English class ever.','完美。这次旅行会是我最好的英语课。']]},
{id:'office',icon:'💼',cn:'职场·咖啡闲聊',who:['Lily','Max'],pod:'Coffee Break English',lines:[
['L','Coffee break English! The best way to practice is small talk at work.','咖啡时间学英语！工作中练口语最好的方式就是闲聊。'],
['M','But I never know what to say to my colleague.','但我不知道跟同事聊什么。'],
['L','Start with: “How’s your day going?” — so easy.','从这句开始：“How’s your day going?” 非常简单。'],
['M','How’s your day going? Then… “Did you see the meeting is at 10?”','How’s your day going? 然后……“Did you see the meeting is at 10?”'],
['L','Yes! And about your work: “I’m working on the monthly report.”','对！聊到工作就说：“I’m working on the monthly report.”'],
['M','I’m working on the monthly report. It’s due this Friday.','I’m working on the monthly report.这周五截止。'],
['L','Ooh, “due” — nice word! “The deadline is this Friday.”','哦，“due”用得好！“The deadline is this Friday.”'],
['M','The deadline is this Friday. What if I need more time?','The deadline is this Friday.如果需要更多时间呢？'],
['L','Be brave: “Would it be possible to extend the deadline?”','勇敢一点：“Would it be possible to extend the deadline?”'],
['M','That’s such a polite sentence. I’ll use it… carefully.','这句话好有礼貌。我会……小心地使用它。'],
['L','Small talk = big confidence. Now go grab that coffee!','闲聊=大自信。现在去拿你的咖啡吧！']]}
];
function dlgById(i){ return DIALOGS[ui.dlg]||DIALOGS[0]; }

/* ---------- 阅读短文 ---------- */
const READS=[
{title:'A Small Habit That Changed My Morning',level:'初级↑',en:'I used to wake up and check my phone first. Then I tried something new: I drink a glass of water, stretch for two minutes, and write one sentence about my goal for the day. It only takes five minutes. After two weeks, I felt calmer and more focused. Small habits are easy to keep. That is why they work. If you want to change, do not start big. Start small and show up every day.',cn:'我以前起床第一件事就是看手机。后来我试着改变：先喝一杯水，拉伸两分钟，写下关于今日目标的一句话。总共只要五分钟。两周后，我感觉更平静也更专注。小习惯容易坚持，所以有效。想改变就别一开始搞太大，从小事做起，每天出现。',words:[['habit','习惯'],['focused','专注的'],['calm','平静的'],['show up','出现/到场']]},
{title:'How to Gain Muscle (Without a Gym Plan?)',level:'初级↑',en:'Muscle grows when you train hard and rest well. You do not need a fancy gym. Bodyweight exercises like push-ups and squats work fine. Eat enough protein every day — eggs, chicken, milk or beans. Sleep is the secret weapon: muscles repair while you sleep. Be patient. In three months, small daily effort becomes real change.',cn:'肌肉在“练得够、休息好”时生长。不需要花哨的健身房，俯卧撑、深蹲这类自重训练就很有效。每天吃够蛋白质——鸡蛋、鸡肉、牛奶或豆类。睡眠是秘密武器：肌肉在你睡觉时修复。耐心点，三个月的每日小努力会变成真实改变。',words:[['grow','生长'],['fancy','花哨的'],['bodyweight','自重(徒手)'],['repair','修复'],['patient','耐心的']]},
{title:'The Coffee Shop Small Talk Trick',level:'初级↑',en:'Ordering coffee is a perfect chance to practice English. Say hello, order slowly, and smile. Ask the barista one easy question: “Busy morning?” People love talking about their day. Even three sentences of real conversation make your brain faster in English. Do it once a day. Soon, speaking feels less scary and more normal.',cn:'点咖啡是练英语的绝佳机会。打招呼、慢慢点单、微笑。问咖啡师一个简单问题：“Busy morning?”（早上忙吗？）人们喜欢聊自己的一天。即使只有三句真实对话，也能让你的大脑转英语更快。每天一次，很快开口就不那么可怕了。',words:[['barista','咖啡师'],['practice','练习'],['conversation','对话'],['scary','吓人的'],['normal','正常的']]}
];
const WRITE_PROMPTS=[
['今日三件开心的事','用 3 句英文写下今天让你开心的小事。'],
['一句话目标','用英文写：今天最重要的一个目标 + 为什么。'],
['30 秒自我介绍','用英文介绍你自己，控制在 30 秒内（面试/交友都能用）。'],
['安利一个博主','用英文向朋友推荐你关注的博主，讲清他/她哪里好看。'],
['我的增肌周记','用英文记录这周的训练、饮食和小进步。'],
['一次小失败','写一件最近搞砸的小事，以及你学到了什么。'],
['给未来自己写信','写一段英文，给 3 个月后的自己打气。'],
['我的城市','用英文向外地朋友介绍你的城市（吃的/逛的/天气）。'],
['模拟订房','写一段英文：给酒店前台打电话确认预订。'],
['模拟点餐','写一段英文：在餐厅里点一道你没吃过的菜。'],
['评论区双语','用中英双语给喜欢的内容留一条用心的评论。'],
['今日句型 X3','写下你今天学到的 3 个句子，各造一个新句。'],
['翻译挑战','把一句中文鸡汤翻译成英文，再对比译文。'],
['旅行清单','用英文列 10 件旅行必带的东西，并说明理由。'],
['看完一部剧/电影','用 3 句英文说出它讲了什么、你的评价。'],
['抱怨也要会','用英文优雅地投诉一次糟糕的服务。'],
['夸夸朋友','用英文写一段夸奖朋友的彩虹屁。'],
['周计划','用英文写下一周的内容创作计划。'],
['如果我是老板','用英文说：如果我是老板，我会怎么开会。'],
['我的英语目标','用英文写清楚：3 个月后我想达到的口语水平。']
];

/* ---------- 资料库（导入任意文件） ---------- */
const CATS=['全部','听力','口语','阅读','写作','词库','教材','美剧','其他'];
const CAT_COLOR={'听力':'#7d9fae','口语':'#a8956a','阅读':'#6fa394','写作':'#a89f72','词库':'#7d9471','教材':'#8fa493','美剧':'#b39460','其他':'#9aa39b'};
let fileCache=null;
async function filesList(){ if(!fileCache){ fileCache=await Z.idb.all(); } return fileCache.filter(f=>f.eng); }
async function refreshFiles(){ fileCache=null; return filesList(); }
const EXT_TAG={png:'图',jpg:'图',jpeg:'图',gif:'图',webp:'图',mp4:'视频',mov:'视频',webm:'视频',m4v:'视频',mp3:'音频',m4a:'音频',wav:'音频',aac:'音频',ogg:'音频',txt:'文',md:'文',json:'文',srt:'字幕',vtt:'字幕',pdf:'PDF',doc:'文档',docx:'文档',xls:'表',xlsx:'表',csv:'表',ppt:'演示',pptx:'演示'};
const EXT_COLOR={png:'#7d9fae',jpg:'#7d9fae',jpeg:'#7d9fae',gif:'#7d9fae',webp:'#7d9fae',mp4:'#b39460',mov:'#b39460',webm:'#b39460',m4v:'#b39460',mp3:'#a8956a',m4a:'#a8956a',wav:'#a8956a',aac:'#a8956a',ogg:'#a8956a',pdf:'#c97a6e',doc:'#c97a6e',docx:'#c97a6e',txt:'#8a96a8',md:'#8a96a8',srt:'#8a96a8',vtt:'#8a96a8'};

/* ========================================================= */
function render(root){
  const tabs=['words','dlg','listen','read','write','files'];
  const names={words:'📖 单词',dlg:'🗣️ 口语对话',listen:'🎧 听力',read:'📚 阅读',write:'✍️ 写作',files:'📁 我的资料'};
  const tbar='<div class="engTabs">'+tabs.map(t=>'<button class="engTab '+(ui.tab===t?'on':'')+'" data-tab="'+t+'">'+names[t]+'</button>').join('')+'</div>';
  root.innerHTML=tbar+'<div id="engBody"></div>';
  body(root);
}
function body(root){
  const b=Z.$('#engBody',root);
  if(ui.tab==='words')b.innerHTML=wordsHTML();
  else if(ui.tab==='dlg')b.innerHTML=dlgHTML();
  else if(ui.tab==='listen')b.innerHTML=listenHTML();
  else if(ui.tab==='read')b.innerHTML=readHTML();
  else if(ui.tab==='write')b.innerHTML=writeHTML();
  else if(ui.tab==='files'){ b.innerHTML=filesHTML(); loadFiles(root); }
  bindBody(root);
}
function wordsHTML(){
  const set=setById(ui.set), acc=Z.settings.acc;
  const chips=VOCAB.map(s=>'<button class="scnChip '+(s.id===ui.set?'on':'')+'" data-set="'+s.id+'" style="'+(s.id===ui.set?Z.cssV(Z.byId.eng.c):'')+'">'+s.icon+' '+s.cn+'</button>').join('');
  const mode='<div class="row" style="margin:0 0 12px"><div class="seg"><button data-mode="list" class="'+(ui.mode==='list'?'on':'')+'" type="button">📋 列表</button><button data-mode="flash" class="'+(ui.mode==='flash'?'on':'')+'" type="button">🃏 闪卡</button><button data-mode="quiz" class="'+(ui.mode==='quiz'?'on':'')+'" type="button">🎯 自测</button></div><div style="margin-left:auto" class="row">'+rateBtnHTML()+accBtnHTML()+'</div></div>';
  let mid='';
  if(ui.mode==='list'){
    mid='<div class="card flat">'+set.words.map(w=>wordRow(w,acc)).join('')+'</div>';
  }else if(ui.mode==='flash'){
    mid=flashHTML(set);
  }else{
    mid=quizHTML(set);
  }
  return '<div class="row mb8"><div style="font-weight:700">'+set.icon+' '+set.cn+' · 日常单词（含美/英双音标，可点按听发音）</div></div>'
    +'<div class="scnChips">'+chips+'</div>'+mode+mid;
}
function wordRow(w,acc){
  return '<div class="vWord"><span class="w">'+w[0]+'</span><span class="ipa"><span>🇺🇸 /'+w[1]+'/</span><span>🇬🇧 /'+w[2]+'/</span></span><span class="cn">'+w[3]+' '+w[4]+'</span>'
    +'<div class="spk"><button class="spkB us" data-spk="US|'+w[0]+'">🔊美</button><button class="spkB uk" data-spk="UK|'+w[0]+'">🔊英</button></div>'
    +'<div class="ex">例句：<em>'+w[5]+'</em>　'+w[6]+'</div></div>';
}
function flashHTML(set){
  const w=set.words;
  return '<div class="flipCard" data-flip="1" id="flC"><div style="font-size:13px;color:var(--muted)">点击卡片翻面 · 第 <span id="flI">1</span>/'+w.length+' 个</div><div style="font-size:30px;font-weight:800" id="flW">'+w[0][0]+'</div><div class="ipa">🇺🇸 /'+w[0][1]+'/　🇬🇧 /'+w[0][2]+'/</div><div style="color:var(--muted)" id="flH">（点击看释义）</div><div id="flEx"></div><div class="row" style="justify-content:center;margin-top:10px"><button class="spkB us" data-fspk="0|US">🔊 美音</button><button class="spkB uk" data-fspk="0|UK">🔊 英音</button></div></div>'
    +'<div class="row" style="justify-content:center;margin-top:12px"><button class="btn softB" data-fnav="-1">‹ 上一个</button><button class="btn pri" data-fnav="1">下一个 ›</button></div>';
}
function quizHTML(set){
  return '<div class="card"><div style="text-align:center" id="qBox"></div></div>';
}
function dlgHTML(){
  const d=DIALOGS[ui.dlg];
  const chips=DIALOGS.map((x,i)=>'<button class="scnChip '+(ui.dlg===i?'on':'')+'" data-dlg="'+i+'" style="'+(ui.dlg===i?Z.cssV(Z.byId.eng.c):'')+'">'+x.icon+' '+x.cn+'</button>').join('');
  const lines=d.lines.map((ln,idx)=>{
    const who=ln[0]===d.who[0]?'A':'B';
    return '<div class="dlgLine" data-li="'+idx+'" data-who="'+ln[0]+'"><span class="who" style="'+(who==='A'?Z.cssV(Z.byId.eng.c):Z.cssV('#9a9f6b'))+'">'+who+'</span>'
      +'<div class="txt"><div class="en">'+Z.esc(ln[1])+'</div><div class="cn">'+Z.esc(ln[2])+'</div>'
      +'<div class="playM"><button class="spkB us" data-dspk="'+idx+'|US">🔊美</button><button class="spkB uk" data-dspk="'+idx+'|UK">🔊英</button></div></div></div>';
  }).join('');
  return '<div class="card flat mb8"><div style="font-weight:700">🎙️ '+d.pod+' · '+d.icon+' '+d.cn+'</div>'
    +'<div class="muted small">双人播客式场景对话：'+d.who[0]+'(Lily) 与 '+d.who[1]+'(Max)。先盲听整段 → 再跟读，提升口语的黄金练法。</div></div>'
    +'<div class="scnChips">'+chips+'</div>'
    +'<div class="row" style="margin-bottom:12px"><button class="btn pri sm" data-dplay="all|none">▶ 整段播放</button>'
    +'<button class="btn softB sm" data-dplay="all|'+d.who[0]+'">🎭 角色扮演('+d.who[0]+')</button>'
    +'<button class="btn softB sm" data-dplay="all|'+d.who[1]+'">🎭 角色扮演('+d.who[1]+')</button>'
    +'<button class="btn ghost sm" data-stop="1">⏹ 停止</button>'
    +'<div style="margin-left:auto">'+rateBtnHTML()+'</div></div>'
    +'<div class="card" id="dlgList">'+lines+'</div>';
}
function listenHTML(){
  const d=DIALOGS[ui.listeningDlg||0];
  const chips=DIALOGS.map((x,i)=>'<button class="scnChip '+(ui.listeningDlg===i?'on':'')+'" data-ldlg="'+i+'">'+x.icon+' '+x.cn+'</button>').join('');
  return '<div class="row mb8"><div style="font-weight:700">🎧 盲听训练 · '+d.icon+' '+d.cn+'</div></div>'
    +'<div class="scnChips">'+chips+'</div>'
    +'<div class="row" style="margin-bottom:12px"><button class="btn pri sm" data-lplay="1">▶ 播放对话（盲听）</button>'
    +'<button class="btn softB sm" data-lshow="1">👁 显示/隐藏文本</button>'
    +'<button class="btn ghost sm" data-stop="1">⏹ 停止</button><div style="margin-left:auto">'+rateBtnHTML()+accBtnHTML()+'</div></div>'
    +'<div class="card flat" id="lTxt" style="'+(ui.lShow?'':'display:none')+'">'+d.lines.map(ln=>'<div class="muted small" style="margin:4px 0">'+Z.esc(ln[1])+'</div>').join('')+'</div>'
    +'<div class="card"><div class="muted small">🧠 听懂多少？听完后试着回答：这段对话发生在哪？他们在办什么事？写下你听到的 3 个关键词：</div><textarea id="lNote" rows="3" placeholder="我听到的关键词 / 场景是……（本地自动保存）">'+Z.esc(Z.store.g('lNote'+ui.listeningDlg,''))+'</textarea></div>';
}
function readHTML(){
  const r=READS[ui.readIdx];
  const chips=READS.map((x,i)=>'<button class="scnChip '+(ui.readIdx===i?'on':'')+'" data-read="'+i+'">'+x.title+'</button>').join('');
  const sents=r.en.split(/(?<=[.!?])\s+/);
  return '<div class="row mb8"><div style="font-weight:700">📚 '+r.title+' <span class="tag" style="--c-soft:'+Z.rgba(Z.byId.eng.c,.15)+';--c-deep:#6b877a">'+r.level+'</span></div></div>'
    +'<div class="scnChips">'+chips+'</div>'
    +'<div class="row" style="margin-bottom:10px"><button class="btn pri sm" data-rplay="1">▶ 朗读全文</button><button class="btn softB sm" data-rcn="1">🈶 显示/隐藏译文</button><button class="btn ghost sm" data-stop="1">⏹ 停止</button><div style="margin-left:auto">'+rateBtnHTML()+accBtnHTML()+'</div></div>'
    +'<div class="readCard"><div class="para" id="rEn">'+sents.map((s,i)=>'<span data-sent="'+i+'" style="cursor:pointer">'+Z.esc(s)+' </span>').join('')+'</div>'
    +'<div id="rCn" style="display:none" class="muted mt10">'+Z.esc(r.cn)+'</div></div>'
    +'<div class="card flat"><div class="small" style="font-weight:600">生词</div><div class="wordBank">'+r.words.map(w=>'<span>'+w[0]+' · '+w[1]+'</span>').join('')+'</div><div class="muted small mt6">💡 点任意句子可单独朗读。先听全文，再点不熟的句子跟读。</div></div>';
}
function writeHTML(){
  const today=Z.todayISO();
  const saved=Z.store.g('writeMap',{});
  const text=saved[today]||'';
  const p=WRITE_PROMPTS[Math.floor(Math.random()*WRITE_PROMPTS.length)];
  return '<div class="row mb8"><div style="font-weight:700">✍️ 每天写一点（'+Z.cnDate(today)+'）</div><button class="btn softB sm" data-prompt="1">🎲 换个写作灵感</button></div>'
    +'<div class="card flat"><div class="muted small mb8">📌 今日灵感：<b>'+p[0]+'</b> —— '+p[1]+'</div><textarea id="wText" rows="12" placeholder="用英文开始写吧……（自动保存到本地）">'+Z.esc(text)+'</textarea>'
    +'<div class="row mt6"><span class="tag" style="--c-soft:'+Z.rgba('#9db18d',.16)+';--c-deep:#5d7a52">已自动保存</span><button class="btn softB sm" data-wcopy="1" style="margin-left:auto">📋 复制</button></div></div>'
    +'<div class="card flat"><div class="small" style="font-weight:600">写作小贴士（提升口语的地基）</div><div class="muted small mt6">写作 → 朗读 → 录音：把写好的内容读出来，就是最好的口语输出练习。写 3 句英文，比背 30 个单词更有用。</div></div>';
}
function filesHTML(){
  if(typeof ui.fcat==='undefined') ui.fcat='全部';
  if(typeof ui.fsrc==='undefined') ui.fsrc='';
  const cats=CATS.map(c=>'<button class="scnChip '+(ui.fcat===c?'on':'')+'" data-fcat="'+c+'" style="'+(ui.fcat===c?(Z.cssV(CAT_COLOR[c]||Z.byId.eng.c)):'')+'">'+c+'</button>').join('');
  return '<div class="row mb8"><div style="font-weight:700">📁 我的英语资料库</div>'
    +'<button class="btn softB sm" data-fmulti="1" style="margin-left:auto;margin-right:6px">☑️ 多选</button>'
    +'<button class="btn pri sm" data-up="1">⬆️ 导入文件</button></div>'
    +'<div class="card flat mb8" style="background:#f6f8ee"><div class="muted small">支持 <b>文档/图片/视频/音频/PDF/表格/演示/字幕</b> 任意格式；导入后可分类、重命名、移动分类、批量删除。文件存在你的浏览器本地，云同步时会同步文件清单与分类（不会上传文件二进制，节省流量）。</div></div>'
    +'<div class="scnChips">'+cats+'</div>'
    +'<div class="row mb8"><input id="fSrch" class="ipt" placeholder="🔍 搜索文件名…" value="'+Z.esc(ui.fsrc)+'" style="flex:1;margin-right:6px"/>'
    +'<button class="btn ghost sm" data-fsrc-clear="1" data-fsrc="">清除</button></div>'
    +'<div class="fSelBar" id="fSelBar"><span class="count" id="fSelCount">0</span> 个已选'
    +'<button class="btn ghost sm" data-fmall="1">全选/取消</button>'
    +'<button class="btn softB sm" data-fmdel="1">🗑 删除选中</button>'
    +'<button class="btn ghost sm" data-fmulti="1">取消</button>'
    +'</div>'
    +'<div id="fileList"><div class="muted" style="padding:10px 0">加载中…</div></div>';
}
async function loadFiles(root){
  const box=Z.$('#fileList',root); if(!box)return;
  const all=await refreshFiles();
  ui.fmultiOn=!!ui.fmultiOn;
  if(!all.length){ box.innerHTML='<div class="empty"><div class="big">🗂️</div><div>资料库还是空的</div><div class="muted">点右上「导入文件」开始添加——图片、音频、视频、字幕、PDF、文档都能放进来</div></div>'; syncSelBar(root); return; }
  filterFiles(root);
}
function filterFiles(root){
  const box=Z.$('#fileList',root); if(!box)return;
  filesList().then(all=>{
    const list=all.slice().sort((a,b)=>b.ts-a.ts);
    const cat=ui.fcat||'全部';
    const q=(ui.fsrc||'').toLowerCase().trim();
    const filtered=list.filter(f=>{
      const okCat=cat==='全部' || (f.cat||'其他')===cat;
      const okQ=!q || f.name.toLowerCase().indexOf(q)>=0;
      return okCat && okQ;
    });
    if(!filtered.length){ box.innerHTML='<div class="empty"><div class="big">🔎</div><div>没有匹配的资料</div><div class="muted">换个分类或清空搜索词试试</div></div>'; syncSelBar(root); return; }
    box.innerHTML=filtered.map(f=>{
      const ext=(f.name.split('.').pop()||'').toLowerCase();
      const tg=EXT_TAG[ext]||'档';
      const tagColor=EXT_COLOR[ext]||'#7d9fae';
      const catColor=CAT_COLOR[f.cat||'其他']||'#9aa39b';
      const dt=new Date(f.ts); const dtStr=(dt.getMonth()+1)+'/'+dt.getDate();
      return '<div class="fileRow" data-fid="'+f.id+'">'
        +'<span class="fpick" data-fpick="1" title="选中"></span>'
        +'<span class="tag" style="--c-soft:'+Z.rgba(tagColor,.18)+';--c-deep:'+tagColor+'">'+tg+'</span>'
        +'<div class="fname"><div>'+Z.esc(f.name)+'</div>'
        +'<div class="muted small"><span style="color:'+catColor+'">●</span> '+Z.esc(f.cat||'未分类')+' · '+Z.fileSize(f.size)+' · '+dtStr+'</div></div>'
        +'<button class="iconBtn" data-frename="1" title="重命名">✏️</button>'
        +'<button class="iconBtn" data-fcat2="1" data-fcat-val="" title="移动分类" style="position:relative">📂</button>'
        +'<button class="iconBtn" data-fplay="1" title="查看/播放">👁</button>'
        +'<button class="iconBtn" data-fdl="1" title="下载">⬇️</button>'
        +'<button class="iconBtn" data-fdel="1" title="删除">🗑</button></div>';
    }).join('');
    if(ui.fmultiOn){ box.querySelectorAll('[data-fpick]').forEach(c=>c.classList.add('show')); }
    syncSelBar(root);
  });
}
function syncSel(pickEl){
  const row=pickEl.closest('.fileRow');
  if(pickEl.classList.contains('sel')){ row.style.outline='2px solid var(--blue)'; row.style.borderRadius='14px'; }
  else { row.style.outline=''; }
  const root=pickEl.closest('.viewWrap');
  syncSelBar(root);
}
function syncSelBar(root){
  if(!root)return;
  const bar=Z.$('#fSelBar',root); if(!bar)return;
  const picked=root.querySelectorAll('[data-fpick].sel.sel, .fileRow [data-fpick].sel');
  const n=root.querySelectorAll('[data-fpick].sel').length;
  Z.$('#fSelCount',bar).textContent=n;
  if(ui.fmultiOn) bar.classList.add('show'); else bar.classList.remove('show');
}
async function renameFile(fid,root){
  const all=await Z.idb.all(); const f=all.find(x=>x.id===fid); if(!f){ Z.toast('文件不存在'); return; }
  Z.modalForm('重命名文件','<label>新文件名</label><input name="newName" value="'+Z.esc(f.name)+'" style="width:100%"/>',data=>{
    if(!data.newName || !data.newName.trim()){ Z.toast('名字不��为空'); return; }
    f.name=data.newName.trim(); f.uTs=Date.now();
    Z.idb.put(f).then(()=>{ fileCache=null; filterFiles(root); Z.toast('已重命名'); Z.closeModal(); });
  });
}
async function setFileCat(fid,newCat,root){
  const all=await Z.idb.all(); const f=all.find(x=>x.id===fid); if(!f){ Z.toast('文件不存在'); return; }
  // 弹出分类选择
  const opts=CATS.filter(c=>c!=='全部').map(c=>'<button class="scnChip" data-set-cat="'+c+'" style="background:'+CAT_COLOR[c]+';color:#fff;border:0">'+c+'</button>').join('');
  Z.modal({ title:'移动到分类', body:'<div class="row" style="flex-wrap:wrap;gap:6px">'+opts+'</div>',
    acts:[{label:'取消',key:'x',cls:'ghost',fn:Z.closeModal}] });
  // 单次绑定点击
  const mb=Z.$('.mbody');
  mb.onclick=e=>{
    const btn=e.target.closest('[data-set-cat]'); if(!btn)return;
    f.cat=btn.dataset.setCat; f.uTs=Date.now();
    Z.idb.put(f).then(()=>{ fileCache=null; filterFiles(root); Z.toast('已移动到「'+f.cat+'」'); Z.closeModal(); });
  };
}
function previewFile(root,f){
  const ext=(f.name.split('.').pop()||'').toLowerCase();
  const url=URL.createObjectURL(f.blob);
  let inner='';
  if(['png','jpg','jpeg','gif','webp'].indexOf(ext)>=0) inner='<div class="filePrev"><img src="'+url+'"></div>';
  else if(['mp4','mov','webm','m4v'].indexOf(ext)>=0) inner='<div class="filePrev"><video src="'+url+'" controls style="width:100%"></video></div>';
  else if(['mp3','m4a','wav','aac','ogg'].indexOf(ext)>=0) inner='<div class="filePrev"><audio src="'+url+'" controls style="width:100%"></audio></div>';
  else if(['txt','md','json','srt','vtt'].indexOf(ext)>=0){ const r=new FileReader(); r.onload=()=>{ const t=Z.$('#fText'); if(t){ t.textContent=r.result.length>20000? r.result.slice(0,20000)+'\n……(过长已截断)' : r.result; } }; r.readAsText(f.blob); inner='<div class="filePrev"><pre id="fText" style="white-space:pre-wrap;background:var(--card);padding:10px;border-radius:12px;max-height:320px;overflow:auto;font-size:12.5px"></pre></div>'; }
  else if(ext==='pdf') inner='<div class="card flat">PDF 文档：<a href="'+url+'" target="_blank" style="color:var(--c,#5f7a54)">在新窗口打开阅读</a>（或点⬇️下载后用 App 打开）</div>';
  else inner='<div class="card flat">已导入 <b>'+Z.esc(f.name)+'</b>，可点 ⬇️ 下载后用对应 App 打开。</div>';
  Z.modal({ title:'📄 '+Z.esc(f.name), sub:f.cat? '分类：'+f.cat+'': '',
    body:'<div id="mbody">'+inner+'</div>',
    acts:[ {label:'下载',key:'d',cls:'softB',fn:()=>{ const a=document.createElement('a'); a.href=url; a.download=f.name; a.click(); }},{label:'关闭',key:'x',cls:'ghost',fn:()=>{URL.revokeObjectURL(url);Z.closeModal();}} ] });
}
function bindBody(root){
  // 关键：把点击/输入事件绑到 root 整个 viewWrap 上——
  // 因为 .engTabs 和 #engBody 是兄弟节点、点击事件不会跨兄弟节点冒泡，
  // 原代码绑到 #engBody 上时 .engTabs 里的按钮全部点不动（iOS 端表现为「只有单词能点」）
  if(!root)return;
  if(root.dataset.engBounded)return;
  root.dataset.engBounded='1';
  const onClick=e=>{
    const t=e.target.closest('[data-tab]'); if(t){ ui.tab=t.dataset.tab; if(ui.tab==='dlg')ui.dlg=ui.dlg||0; if(ui.tab==='listen')ui.listeningDlg=ui.listeningDlg||0; stopSpeak();
      root.querySelectorAll('.engTab').forEach(x=>x.classList.toggle('on', x.dataset.tab===ui.tab));
      body(root); return; }
    const set=e.target.closest('[data-set]'); if(set){ ui.set=set.dataset.set; ui.mode='list'; body(root); return; }
    const mode=e.target.closest('[data-mode]'); if(mode){ ui.mode=mode.dataset.mode; ui.flashI=0; body(root); return; }
    const rate=e.target.closest('[data-rate]'); if(rate){ ui.rate=+rate.dataset.rate; body(root); return; }
    const acc=e.target.closest('[data-acc]'); if(acc){ Z.settings.acc=acc.dataset.acc; Z.saveSettings(); body(root); return; }
    const spk=e.target.closest('[data-spk]'); if(spk){ const [a,wd]=spk.dataset.spk.split('|'); speak(wd,a,ui.rate); return; }
    const fspk=e.target.closest('[data-fspk]'); if(fspk){ const [i,a]=fspk.dataset.fspk.split('|'); const set=setById(ui.set); speak(set.words[+i][0],a,ui.rate); return; }
    const fnav=e.target.closest('[data-fnav]'); if(fnav){ const set=setById(ui.set); const n=set.words.length; ui.flashI=((ui.flashI||0)+ +fnav.dataset.fnav + n)%n; flashUpdate(set); return; }
    const flip=e.target.closest('[data-flip]'); if(flip){ const set=setById(ui.set); ui.flipped=!ui.flipped; flashUpdate(set); return; }
    const qa=e.target.closest('[data-qa]'); if(qa){ answerQuiz(+qa.dataset.qa,root); return; }
    const dlg=e.target.closest('[data-dlg]'); if(dlg){ ui.dlg=+dlg.dataset.dlg; body(root); return; }
    const dspk=e.target.closest('[data-dspk]'); if(dspk){ const [i,a]=dspk.dataset.dspk.split('|'); const d=dlgById(); speak(d.lines[+i][1],a,ui.rate); return; }
    const dplay=e.target.closest('[data-dplay]'); if(dplay){ playDialogue(root,dplay.dataset.dplay.split('|')); return; }
    const ldlg=e.target.closest('[data-ldlg]'); if(ldlg){ ui.listeningDlg=+ldlg.dataset.ldlg; body(root); return; }
    const lplay=e.target.closest('[data-lplay]'); if(lplay){ playListening(root); return; }
    const lshow=e.target.closest('[data-lshow]'); if(lshow){ const box=Z.$('#lTxt',root); if(box){ ui.lShow=!ui.lShow; box.style.display=ui.lShow?'':'none'; } return; }
    const readI=e.target.closest('[data-read]'); if(readI){ ui.readIdx=+readI.dataset.read; body(root); return; }
    const rplay=e.target.closest('[data-rplay]'); if(rplay){ playReading(root); return; }
    const rcn=e.target.closest('[data-rcn]'); if(rcn){ const c=Z.$('#rCn',root); if(c)c.style.display=c.style.display==='none'?'':'none'; return; }
    const sent=e.target.closest('[data-sent]'); if(sent){ const r=READS[ui.readIdx]; const parts=r.en.split(/(?<=[.!?])\s+/); speak(parts[+sent.dataset.sent],Z.settings.acc,ui.rate); return; }
    const st=e.target.closest('[data-stop]'); if(st){ stopSpeak(); return; }
    const pr=e.target.closest('[data-prompt]'); if(pr){ body(root); return; }
    const wc=e.target.closest('[data-wcopy]'); if(wc){ const t=Z.$('#wText',root); if(t&&t.value){ if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t.value).then(()=>Z.toast('已复制'));} else Z.toast('长按选择复制'); } return; }
    const up=e.target.closest('[data-up]'); if(up){ doUpload(root); return; }
    const fcat=e.target.closest('[data-fcat]'); if(fcat){ ui.fcat=fcat.dataset.fcat; root.querySelectorAll('[data-fcat]').forEach(x=>x.classList.toggle('on', x.dataset.fcat===ui.fcat)); loadFiles(root); return; }
    const fsrc=e.target.closest('[data-fsrc]'); if(fsrc){ ui.fsrc=fsrc.dataset.fsrc; loadFiles(root); return; }
    const fclear=e.target.closest('[data-fsrc-clear]'); if(fclear){ ui.fsrc=''; const ip=Z.$('#fSrch',root); if(ip)ip.value=''; loadFiles(root); return; }
    const fmulti=e.target.closest('[data-fmulti]'); if(fmulti){ ui.fmultiOn=!ui.fmultiOn; root.querySelectorAll('[data-fpick]').forEach(c=>c.classList.toggle('show', ui.fmultiOn)); syncSelBar(root); return; }
    const fpick=e.target.closest('[data-fpick]'); if(fpick){ fpick.classList.toggle('sel'); syncSel(fpick); return; }
    const fmall=e.target.closest('[data-fmall]'); if(fmall){ const allOn=!root.querySelector('.fileRow [data-fpick].sel'); root.querySelectorAll('[data-fpick]').forEach(c=>{ c.classList.toggle('sel',allOn); syncSel(c); }); return; }
    const fmdel=e.target.closest('[data-fmdel]'); if(fmdel){ const ids=Array.from(root.querySelectorAll('[data-fpick].sel')).map(c=>c.closest('.fileRow').dataset.fid); if(!ids.length){ Z.toast('先勾选文件'); return; } Z.confirmBox('删除选中的 '+ids.length+' 个文件？',{danger:true}).then(async y=>{ if(y){ for(const id of ids){ await Z.idb.del(id); } fileCache=null; ui.fmultiOn=false; body(root); Z.toast('已删除 '+ids.length+' 个'); } }); return; }
    const frename=e.target.closest('[data-frename]'); if(frename){ const fid=frename.closest('.fileRow').dataset.fid; renameFile(fid,root); return; }
    const fcat2=e.target.closest('[data-fcat2]'); if(fcat2){ const fid=fcat2.closest('.fileRow').dataset.fid; setFileCat(fid,fcat2.dataset.fcat2,root); return; }
    const fplay=e.target.closest('[data-fplay]'); if(fplay){ const fid=fplay.closest('.fileRow').dataset.fid; getFile(fid,root,f=>previewFile(root,f)); return; }
    const fdl=e.target.closest('[data-fdl]'); if(fdl){ const fid=fdl.closest('.fileRow').dataset.fid; getFile(fid,root,f=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(f.blob); a.download=f.name; a.click(); }); return; }
    const fdel=e.target.closest('[data-fdel]'); if(fdel){ const fid=fdel.closest('.fileRow').dataset.fid; Z.confirmBox('删除这份资料？',{danger:true}).then(async y=>{ if(y){ await Z.idb.del(fid); fileCache=null; body(root); Z.toast('已删除'); } }); return; }
  };
  root.addEventListener('click',onClick);
  root.addEventListener('input',e=>{
    if(e.target.id==='lNote'){ Z.store.s('lNote'+ui.listeningDlg,e.target.value); }
    if(e.target.id==='wText'){ const m=Z.store.g('writeMap',{}); m[Z.todayISO()]=e.target.value; Z.store.s('writeMap',m); }
    if(e.target.id==='fSrch'){ ui.fsrc=e.target.value; filterFiles(root); }
  });
}
async function getFile(fid,root,cb){
  const all=await Z.idb.all(); const f=all.find(x=>x.id===fid); if(f)cb(f); else Z.toast('文件不存在');
}
async function doUpload(root){
  Z.pickFile('*/*',true,files=>{
    if(!files.length)return;
    const fl=Array.from(files);
    let n=fl.length;
    fl.forEach(f=>{
      const rec={id:Z.uid(),eng:true,name:f.name,cat:'其他',size:f.size,ts:Date.now(),blob:f};
      Z.idb.put(rec).then(()=>{ n--; if(n===0){ fileCache=null; body(root); Z.toast('已导入 '+fl.length+' 个文件 ✓'); } });
    });
  });
}
function playDialogue(root,args){
  const d=dlgById();
  const mode=args[0], skipWho=args[1]==='none'?null:args[1];
  const els=$$('#dlgList .dlgLine',root);
  const lines=d.lines.map((ln,i)=>({text:ln[1],who:ln[0],el:els[i]}));
  if(mode==='all'){ speakSeq(lines,{rate:ui.rate,skipWho}); Z.toast(skipWho?'角色扮演模式：'+skipWho+' 的台词由你来说（停顿处请开口跟读）':'开始播放（常速）'); }
}
function playListening(root){
  const d=DIALOGS[ui.listeningDlg||0];
  speakSeq(d.lines.map(ln=>({text:ln[1],who:ln[0]})),{rate:ui.rate,gap:700,onDone:()=>Z.toast('播放完毕～现在看看文本，再听一遍会更容易')});
}
function playReading(root){
  const r=READS[ui.readIdx];
  const sents=r.en.split(/(?<=[.!?])\s+/);
  speakSeq(sents.map(s=>({text:s})),{rate:ui.rate,gap:350,onDone:()=>Z.toast('读完了。点不熟的句子可以单句跟读')});
}
function flashUpdate(set){
  const i=ui.flashI||0, w=set.words[i];
  const flC=Z.$('#flC'); if(!flC)return;
  Z.$('#flW',flC).textContent=w[0];
  const ipa=flC.querySelector('.ipa'); if(ipa)ipa.innerHTML='🇺🇸 /'+w[1]+'/　🇬🇧 /'+w[2]+'/';
  Z.$('#flI',flC).textContent=i+1;
  Z.$('#flH',flC).innerHTML=ui.flipped? '<div style="font-size:18px">'+w[3]+' '+w[4]+'</div><div class="small muted">'+Z.esc(w[6])+'</div>' : '（点击看释义）';
  Z.$('#flEx',flC).innerHTML=ui.flipped? '<div class="muted small" style="margin-top:6px">'+Z.esc(w[5])+'</div>' : '';
  const btns=flC.querySelectorAll('[data-fspk]'); if(btns){ btns[0].dataset.fspk=i+'|US'; btns[1].dataset.fspk=i+'|UK'; }
}
function quizHTML(set){
  // 生成 4 个选择题
  if(!ui.q && ui.qset!==set.id) ui.q=null;
  return '<div id="qWrap">'+quizQuestion(set)+'</div>';
}
function quizQuestion(set){
  if(!ui.qSet||ui.qSet!==set.id){ ui.qSet=set.id; ui.qDone=0; ui.qRight=0; ui.qOpts=null; }
  const words=set.words;
  if(ui.qDone>=words.length){
    const ok=ui.qRight, total=words.length;
    ui.qSet=null; ui.qOpts=null;
    const pct=total?Math.round(ok*100/total):0;
    const msg=pct>=90?'神了！保持这个手感 🎉':pct>=70?'不错，再练两个不会的就满分了 💪':pct>=50?'加油，多看例句就能上 80% ✨':'别灰心，先听例句再选效果更好 🌱';
    return '<div style="font-size:18px;font-weight:700;margin-bottom:6px">自测完成！</div>'
      +'<div style="margin:6px 0">答对 <b style="color:'+Z.byId.eng.c+'">'+ok+'</b> / '+total+'　（正确率 '+pct+'%）</div>'
      +'<div class="muted small mt6">'+msg+'</div>'
      +'<div class="row" style="justify-content:center;margin-top:14px"><button class="btn pri" data-mode="quiz" data-re="1" type="button">🔄 再测一次</button><button class="btn ghost" data-mode="list" type="button">📋 返回列表</button></div>';
  }
  // 选未测过的词 + 3 个干扰项
  const w=words[ui.qDone];
  const wrong=words.filter(x=>x[0]!==w[0]);
  if(!ui.qOpts||ui.qOptsDone!==ui.qDone){
    ui.qOpts=shuffle([w].concat(pick(wrong,3)));
    ui.qOptsDone=ui.qDone;
  }
  const correctIdx=ui.qOpts.findIndex(o=>o[0]===w[0]);
  return '<div style="font-size:22px;font-weight:800;margin:10px 0 4px">🇺🇸 /'+w[1]+'/　🇬🇧 /'+w[2]+'/<br><span style="font-size:28px">“'+Z.esc(w[0])+'”</span></div>'
    +'<div class="muted small" style="margin-bottom:14px">选出正确的中文意思（'+(ui.qDone+1)+' / '+words.length+' · 已答对 '+ui.qRight+'）</div>'
    +ui.qOpts.map((o,i)=>'<button class="btn ghost qOpt" style="display:block;width:100%;margin:6px 0;text-align:left" data-qa="'+i+'" data-correct="'+correctIdx+'"><b style="margin-right:6px;color:var(--muted)">'+(String.fromCharCode(65+i))+'.</b> '+Z.esc(o[3])+' '+Z.esc(o[4])+'</button>').join('');
}
function answerQuiz(optIdx,root){
  const set=setById(ui.set);
  const w=set.words[ui.qDone];
  const opts=ui.qOpts;
  const chosen=opts&&opts[optIdx];
  // 即时视觉反馈：高亮对/错
  const btns=root.querySelectorAll('.qOpt');
  btns.forEach((b,i)=>{
    const isCorrect=opts&&opts[i]&&opts[i][0]===w[0];
    if(isCorrect) b.classList.add('qRight');
    if(i===optIdx && !isCorrect) b.classList.add('qWrong');
    b.disabled=true;
  });
  if(chosen && chosen[0]===w[0]){
    ui.qRight++;
    Z.toast('✅ 答对了！'+w[5]);
  } else {
    Z.toast('❌ 正确是：'+w[3]+' '+w[4]+'　'+w[6]);
  }
  setTimeout(()=>{
    ui.qDone++;
    const wrap=Z.$('#qWrap',root); if(wrap)wrap.innerHTML=quizQuestion(set);
  },650);
}
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function pick(arr,n){ return shuffle(arr.slice()).slice(0,n); }

Z.regView('eng',(root)=>{
  ui.tab=ui.tab||'words';
  render(root);
  return {title:'英语学习', sub:'听说读写 · 美英双音 · 生活场景口语', acts:''};
},(root)=>{
  stopSpeak();
});

/* 初始化闪卡状态 */
ui.flashI=0; ui.flipped=false;
window.ZEng={speak,stopSpeak,speakSeq};
})();
