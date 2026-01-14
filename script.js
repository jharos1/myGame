let score=0,lives=3,isRunning=false,enemies=[],lasers=[],fireInterval=null;
let autoFire = false;   // false = يدوي، true = تلقائي
let lastTap = 0; // لتتبع الوقت بين لمستين على الجوال

const scoreVal=document.getElementById("scoreVal"),
highScoreVal=document.getElementById("highScoreVal"),
finalScore=document.getElementById("finalScore"),
finalHighScore=document.getElementById("finalHighScore"),
rankText=document.getElementById("rankText"),
livesVal=document.getElementById("livesVal"),
player=document.getElementById("player"),
battleField=document.getElementById("battleField"),
fireBtn=document.getElementById("fireBtn"),
musicBtn=document.getElementById("musicBtn"),
laserSound=document.getElementById("laserSound"),
explosionSound=document.getElementById("explosionSound"),
bgMusic=document.getElementById("bgMusic");

let highScore=localStorage.getItem("highScore")||0;
highScoreVal.textContent=highScore;

const enemyImgs=[
"https://emojiguide.com/wp-content/uploads/platform/google/43983.png",
"https://emojiguide.com/wp-content/uploads/platform/apple/43983.png"
];

function initGame(){
let speedMod=parseInt(document.getElementById("diffLevel").value);
document.getElementById("startScreen").style.display="none";
document.getElementById("gameContainer").style.display="block";
score=0;lives=3;enemies=[];lasers=[];
scoreVal.textContent=score;livesVal.textContent="❤️❤️❤️";
isRunning=true;
gameLoop();
}

// --- حركة الصاروخ بالماوس ---
window.addEventListener("mousemove", e => { movePlayer(e.clientX); });

// --- حركة الصاروخ باللمس (جوال) ---
window.addEventListener("touchmove", e => {
    e.preventDefault();
    movePlayer(e.touches[0].clientX);
}, {passive:false});

// دالة تحريك الصاروخ مشتركة
function movePlayer(x){
    if(!isRunning) return;
    let newX = x - 30;
    if(newX < 0) newX = 0;
    if(newX > window.innerWidth - 60) newX = window.innerWidth - 60;
    player.style.left = newX + "px";
}

// --- إطلاق الليزر ---
function fireLaser(){
if(!isRunning) return;
const l=document.createElement("div");
l.className="laser";
l.style.left=(player.offsetLeft+28)+"px";
l.style.top=player.offsetTop+"px";
battleField.appendChild(l);
lasers.push({el:l,y:player.offsetTop});
laserSound.currentTime=0;laserSound.play();
}

// --- وظائف إطلاق النار ---
function startFiring() {
    if (!fireInterval) fireLaser(); // اطلاق أول مرة فوراً
    if (!fireInterval) fireInterval = setInterval(fireLaser, 200);
}
function stopFiring() {
    if (fireInterval && !autoFire) { // توقف فقط إذا الوضع يدوي
        clearInterval(fireInterval);
        fireInterval = null;
    }
}

// --- زر إطلاق النار (يدوي وتلقائي بالضغط المزدوج للجوال) ---
// الكمبيوتر / الماوس
fireBtn.addEventListener("mousedown", () => { if(!autoFire) startFiring(); });
fireBtn.addEventListener("mouseup", stopFiring);
fireBtn.addEventListener("mouseleave", stopFiring);

// الجوال
fireBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    let currentTime = new Date().getTime();
    let tapLength = currentTime - lastTap;

    if (tapLength < 400 && tapLength > 0) {
        // لمستين → تبديل الوضع
        autoFire = !autoFire;
        if (autoFire) {
            fireBtn.textContent = "🚀 تلقائي";
            startFiring(); // يبدأ الإطلاق التلقائي فوراً
        } else {
            fireBtn.textContent = "🚀 إطلاق النار";
            stopFiring(); // توقف الإطلاق التلقائي
        }
    } else {
        // لمسة واحدة → إطلاق يدوي إذا الوضع يدوي
        if (!autoFire) startFiring();
    }

    lastTap = currentTime;
}, {passive:false});

fireBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    stopFiring(); // توقف اليدوي فقط
}, {passive:false});

// --- تشغيل/إيقاف الموسيقى ---
musicBtn.addEventListener("click", ()=>{
if(bgMusic.paused){bgMusic.play(); musicBtn.textContent="إيقاف الموسيقى";}
else{bgMusic.pause(); musicBtn.textContent="تشغيل الموسيقى";}
});

// --- انفجار العدو ---
function explode(x,y){
const ex=document.createElement("div");
ex.className="explosion";
ex.style.left=x+"px";ex.style.top=y+"px";
battleField.appendChild(ex);
setTimeout(()=>ex.remove(),400);
explosionSound.currentTime=0;explosionSound.play();
}

// --- إنشاء العدو ---
function spawnEnemy(){
const e=document.createElement("div");e.className="enemy";
e.style.background="url('"+enemyImgs[Math.floor(Math.random()*enemyImgs.length)]+"') no-repeat center";
e.style.left=Math.random()*(window.innerWidth-50)+"px";
e.style.top="-60px";
battleField.appendChild(e);
enemies.push({el:e,y:-60,s:(2+Math.random()*2)});
}

// --- حلقة اللعبة الرئيسية ---
function gameLoop(){
if(!isRunning) return;
for(let i=lasers.length-1;i>=0;i--){
lasers[i].y-=10;
lasers[i].el.style.top=lasers[i].y+"px";
if(lasers[i].y<-20){lasers[i].el.remove();lasers.splice(i,1);}
}
for(let i=enemies.length-1;i>=0;i--){
let e=enemies[i];
e.y+=e.s;
e.el.style.top=e.y+"px";
let pr=player.getBoundingClientRect(),er=e.el.getBoundingClientRect();
if(!(pr.right<er.left||pr.left>er.right||pr.bottom<er.top||pr.top>er.bottom)){
lives--;
livesVal.innerText="❤️".repeat(lives);
e.el.remove();enemies.splice(i,1);
if(lives<=0){endGame();return;}
continue;
}
for(let j=lasers.length-1;j>=0;j--){
let lr=lasers[j].el.getBoundingClientRect();
if(!(lr.right<er.left||lr.left>er.right||lr.bottom<er.top||lr.top>er.bottom)){
score+=1;scoreVal.textContent=score;
explode(er.left,er.top);
e.el.remove();enemies.splice(i,1);
lasers[j].el.remove();lasers.splice(j,1);break;
}
}
if(e && e.y>window.innerHeight){e.el.remove();enemies.splice(i,1);}
}
if(Math.random()<0.02)spawnEnemy();
requestAnimationFrame(gameLoop);
}

// --- إنهاء اللعبة ---
function endGame(){
isRunning=false; bgMusic.pause();
if(score>highScore){highScore=score;localStorage.setItem("highScore",highScore);}
document.getElementById("gameOverScreen").style.display="flex";
finalScore.textContent=score; finalHighScore.textContent=highScore;
rankText.textContent=getRank(score);
}

// --- تحديد رتبة اللاعب ---
function getRank(s){
if(s<100)return"🟢 مبتدئ";
if(s<300)return"🔵 محترف";
if(s<600)return"🟣 أسطوري";
return"🔥 سيد المجرة";
}
