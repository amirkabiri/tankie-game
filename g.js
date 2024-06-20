class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.size = 10;
        this.rate = 3;
        this.color = 'red';
    }

    preRender(){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle * Math.PI / 180);
        ctx.beginPath();
    }

    postRender(){
        ctx.restore();
    }

    isPartiallyOut(x = this.x, y = this.y){
        const r = this.size / 2;

        return x - r < 0 || x + r > w || y - r < 0 || y + r > h;
    }

    isCompletelyOut(x = this.x, y = this.y){
        const r = this.size / 2;

        return x + r < 0 || x - r > w || y + r < 0 || y - r > h;
    }

    isExpired(){
        return this.isCompletelyOut();
    }

    forward(){
        this.x += this.rate * Math.sin(this.angle * Math.PI / 180);
        this.y += this.rate * Math.cos(this.angle * Math.PI / 180);
        return this;
    }
    backward(){
        this.x -= this.rate * Math.sin(this.angle * Math.PI / 180);
        this.y -= this.rate * Math.cos(this.angle * Math.PI / 180);
        return this;
    }

    get type(){
        return this.constructor.name;
    }
}

class Tank extends GameObject{
    constructor(x, y) {
        super(x, y);
        this.size = 15;
        this.rate = Math.max(Math.random() * .8, .4);
    }

    explode(){
        const randomAngle = rand(0, 360);

        switch (rand(0,3)){
            case 0:
                objects.push(new TankExplosion(this));
                break;

            case 1:
                for(let angle = 0; angle < 360; angle += 90){
                    objects.push(new TankExplosionSquarePiece(this, randomAngle + angle));
                }
                break;

            case 2:
                for(let angle = 0; angle < 360; angle += 22.5){
                    objects.push(new TankExplosionCirclePiece(this, randomAngle + angle));
                }
                break;
        }
        return this;
    }

    render(){
        this.preRender();

        // draw the tank
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

        // draw tank pipe
        const pipeWidth = this.size / 7;
        ctx.fillRect(-pipeWidth / 2, 0, pipeWidth, this.size);

        // if (this.y - this.size > 0 && this.status === 'normal'){
        //     this.explode();
        // }

        this.postRender();

        // if(this.status === 'exploding'){
        //     if(this.explodeMap.every(el => el === 0)){
        //         this.status = 'exploded';
        //     }
        //
        //     for(let i = 0; i < 10; i ++){
        //         const index = rand(0, this.explodeMap.length);
        //         this.explodeMap[index] = 0;
        //     }
        //
        //     const imageDataPos = [
        //         Math.floor(this.x - this.size),
        //         Math.floor(this.y - this.size),
        //     ];
        //     const imageDataSize = [this.size * 2, this.size * 2];
        //     const imageData = ctx.getImageData(...imageDataPos, ...imageDataSize);
        //     for(let i = 0; i < this.explodeMap.length; i ++){
        //         imageData.data[i * 4 + 3] = this.explodeMap[i] * 255;
        //     }
        //     ctx.putImageData(
        //         imageData,
        //         ...imageDataPos
        //     );
        // }

        return this;
    }
}

class TankExplosion extends GameObject{
    constructor(tank) {
        super(tank.x, tank.y);
        this.size = tank.size;
        this.color = tank.color;
        this.angle = tank.angle;
        this.tank = tank;
        this.masks = [];
    }

    isExpired(){
        return super.isExpired() || this.masks.length > 400;
    }

    render(){
        for(let i = 0; i < 20; i ++){
            if(Math.random() < 0.2){
                this.masks.push([
                    rand(0, this.size * 1/7) - 1/7 * this.size,
                    rand(0, 1/2 * this.size) + this.size / 2
                ])
                continue;
            }
            this.masks.push([
                rand(-this.size / 2, this.size / 2),
                rand(-this.size / 2, this.size / 2)
            ]);
        }

        this.tank.render();

        this.preRender();
        for(const mask of this.masks){
            ctx.clearRect(...mask, 1, 1);
        }
        this.postRender();

        return this;
    }

    forward(){
        return this;
    }
    backward(){
        return this;
    }
}

class TankExplosionSquarePiece extends GameObject{
    constructor(tank, angle) {
        super(tank.x, tank.y);
        this.size = tank.size / 2;
        this.color = tank.color;
        this.angle = tank.angle + angle;
        this.rate = 3 * tank.rate;

        this.opacityRate = 0.04;
        this.tank = tank;
        this.opacity = 1;
    }

    isExpired(){
        return super.isExpired() || this.opacity <= 0;
    }

    render(){
        this.preRender();
        ctx.globalAlpha = (this.opacity = Math.max(0, this.opacity - this.opacityRate));
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.rect(- this.size / 2, - this.size / 2, this.size, this.size);
        ctx.fill();

        this.postRender();

        return this;
    }
}
class TankExplosionCirclePiece extends GameObject{
    constructor(tank, angle) {
        super(tank.x, tank.y);
        this.size = tank.size / 8;
        this.color = tank.color;
        this.angle = tank.angle + angle;
        this.rate = Math.max(3 * tank.rate, 2);

        this.opacityRate = 0.04;
        this.tank = tank;
        this.opacity = 1;
    }

    isExpired(){
        return super.isExpired() || this.opacity <= 0;
    }

    render(){
        this.preRender();
        ctx.globalAlpha = (this.opacity = Math.max(0, this.opacity - this.opacityRate));
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, 2 * Math.PI);
        ctx.fill();

        this.postRender();

        return this;
    }
}

class EnemyTank extends Tank{
    constructor() {
        super();
        this.angle = rand(-10, 10);
        this.x = rand(this.size / 2, w - this.size / 2);
        this.y = -this.size / 2;
        this.color = '#FF4C4B';

        this.rotating = false;
    }

    rotate(angle){
        if(angle === 0) {
            this.rotating = false;
            return;
        }

        this.rotating = true;
        const step = (angle >= 0 ? -1 : 1) * 0.25;
        this.angle += step;

        setTimeout(() => this.rotate(angle + step), 10);
    }

    forward() {
        if(!this.rotating && Math.random() < 0.001){
            this.rotate(rand(-90, 90));
        }
        return super.forward();
    }
}
class SelfTank extends Tank{
    constructor() {
        super();
        this.angle = 180;
        this.x = w / 2;
        this.y = h - this.size * 2;
        this.color = '#fff';
        this.moveStep = 2;

        this.gift = undefined;
        this.giftExpirationTimeout = undefined;

        this.lastFireTime = 0;
    }

    render() {
        if(this.gift instanceof ShieldGift){
            this.preRender();
            ctx.fillStyle = this.gift.color;
            ctx.globalAlpha = .1;

            ctx.beginPath();
            ctx.arc(0, 0, this.size * 2 , 0, 2 * Math.PI);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(0, 0, this.size * 1.5 , 0, 2 * Math.PI);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(0, 0, this.size * 1 , 0, 2 * Math.PI);
            ctx.fill();

            this.postRender();
        }

        return super.render();
    }

    fire(){
        // prevent firing more than one shot per second
        if(Date.now() - this.lastFireTime < 1000) return this;

        if(this.gift instanceof TripleBulletsGift){
            this.tripleBulletsFire(5);
        }
        else if(this.gift instanceof FiveBulletsGift){
            this.fiveBulletFire(5, 100);
        }
        else{
            objects.push(new SelfBullet);
        }

        this.lastFireTime = Date.now();
        return this;
    }
    tripleBulletsFire(deviation = 5){
        for(const angle of [0, -deviation, +deviation]){
            const bullet = new SelfBullet;
            bullet.angle += angle;
            objects.push(bullet);
        }
    }
    fiveBulletFire(count, delay){
        if(count === 0) return;

        objects.push(new SelfBullet);
        setTimeout(() => this.fiveBulletFire(count - 1, delay), delay);
    }

    activateGift(gift){
        if(!(gift instanceof Gift)) return this;

        // set gift
        this.gift = gift;
        // set color of gift as tank's color
        this.color = gift.color;

        // if there is an active timeout for expiration of gift, just remove it
        if(this.giftExpirationTimeout) clearTimeout(this.giftExpirationTimeout);
        // and set new expiration timeout
        this.giftExpirationTimeout = setTimeout(this.expireGift.bind(this), gift.duration);

        return this;
    }
    expireGift(){
        this.giftExpirationTimeout = undefined;
        this.gift = undefined;
        this.color = '#fff';
    }

    moveLeft(){
        if(this.isPartiallyOut(this.x - this.moveStep)) return this;
        this.x -= this.moveStep;
        return this;
    }

    moveRight(){
        if(this.isPartiallyOut(this.x + this.moveStep)) return this;
        this.x += this.moveStep;
        return this;
    }

    forward(){
        return this;
    }

    backward(){
        return this;
    }
}

class Bullet extends GameObject{
    constructor(x = null, y = null) {
        super(x, y);
        this.size = 4;
        this.rate = 5;
    }

    render(){
        this.preRender();

        // draw the bullet
        ctx.fillStyle = this.color;
        const w = 3 * this.size / 5;
        const h = this.size;
        ctx.rect(- w / 2, - h / 2, w, h);
        ctx.fill();

        this.postRender();

        return this;
    }
}
class EnemyBullet extends Bullet{
    constructor(x, y) {
        super(x, y);
        this.color = '#FF4C4B';

        if(!this.x && !this.y){
            const tanks = objects.filter(obj => obj instanceof GameObject && obj.type === 'EnemyTank');
            const index = Math.floor(Math.random() * tanks.length);
            const tank = tanks[index];
            this.x = tank.x || rand(0, w);
            this.y = tank.y || -this.size;
            this.angle = tank.angle || rand(-10, 10);
        }
    }
}
class SelfBullet extends Bullet{
    constructor(x, y) {
        super(x, y);
        this.color = '#fff';

        const tank = objects[0];
        if(!this.x) this.x = tank.x;
        if(!this.y) this.y = tank.y;
        this.angle = tank.angle;
        this.color = tank.color;
    }
}

class Gift extends GameObject{
    constructor(x, y) {
        super(x, y);
        this.size = 10;
        this.rate = Math.max(0.5, Math.random());
        this.angle = 0;
        this.duration = 5000;

        if(!this.x) this.x = rand(this.size / 2, w - this.size / 2);
        if(!this.y) this.y = - this.size / 2;
    }

    render(){
        this.preRender();

        ctx.fillStyle = this.color;
        ctx.rotate(45 * Math.PI / 180);

        ctx.rect(- this.size / 2, - this.size / 2, this.size, this.size);
        ctx.fill();

        this.postRender();

        return this;
    }
}
class TripleBulletsGift extends Gift{
    constructor(x, y) {
        super(x, y);
        this.color = '#5D44FE';
        this.duration = 10000;
    }
}
class FiveBulletsGift extends Gift{
    constructor(x, y) {
        super(x, y);
        this.color = '#FFC638';
    }
}
class ShieldGift extends Gift{
    constructor(x, y) {
        super(x, y);
        this.color = '#61FFBC';
    }
}
class Score extends GameObject{
    constructor() {
        super(w - 220, 30);
        this.color = '#4D525E';
    }

    render(){
        this.preRender();

        ctx.fillStyle = this.color;
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'end';
        ctx.beginPath();
        ctx.fillText(score, this.x, this.y);

        this.postRender();

        return this;
    }

    forward(){
        return this;
    }

    backward(){
        return this;
    }
}

function rand(min, max){
    return Math.floor(Math.random() * (max - min) + min)
}
function animate(){
    ctx.clearRect(0, 0, w, h);

    if(pressedKeys.has('ArrowLeft') || pressedKeys.has('KeyA')) objects[0].moveLeft();
    if(pressedKeys.has('ArrowRight') || pressedKeys.has('KeyD')) objects[0].moveRight();
    if(pressedKeys.has('Space')){
        objects[0].fire();
    }

    for(let i = objects.length - 1; i >= 0; i --){
        const obj = objects[i];

        // remove objects that are completely out of board
        if(!(obj instanceof GameObject) || obj.isExpired()){
            objects.splice(i, 1);
            continue;
        }

        // move all objects
        obj.forward().render();
    }

    // checking collisions
    for(let a = objects.length - 1; a >= 0; a --){
        const objA = objects[a];
        if(!(objA instanceof GameObject)) continue;

        for(let b = objects.length - 1; b >= 0; b --){
            const objB = objects[b];
            if(!(objB instanceof GameObject)) continue;

            // check collision of SelfTank with EnemyTank or EnemyBullet
            if(objA instanceof SelfTank && [EnemyTank, EnemyBullet].some(cls => objB instanceof cls)){
                if(!(objA.gift instanceof ShieldGift) && collision(objA, objB))
                    return gameOver();
            }

            // check collision of EnemyTank with SelfBullet
            if(objA instanceof EnemyTank && objB instanceof SelfBullet){
                if(collision(objA, objB)){
                    // remove EnemyTank and add Explosion animation
                    objects.splice(a, 1, null);
                    objA.explode();

                    // remove bullet
                    objects.splice(b, 1, null);

                    // increase score
                    score += 10;

                    playSound('explosion');
                }
            }

            // check collision with gifts
            if(objA instanceof SelfTank && objB instanceof Gift && collision(objA, objB)){
                objects.splice(b, 1, null);
                objects[0].activateGift(objB);
                playSound('gift');
            }
        }
    }

    window.animationID = requestAnimationFrame(animate);
}

function init(){
    score = 0;
    objects = [ new SelfTank, new Score, new EnemyTank ];

    let tankGenerationInterval;
    let bulletGenerationInterval;
    let giftGenerationInterval;
    const stop = () => {
        cancelAnimationFrame(window.animationID);

        clearInterval(tankGenerationInterval);
        clearInterval(bulletGenerationInterval);
        clearInterval(giftGenerationInterval);

        pauseSound('background');

        return resume;
    }
    const resume = () => {
        animate();

        tankGenerationInterval = setInterval(() => objects.push(new EnemyTank), 1000)
        bulletGenerationInterval = setInterval(() => objects.push(new EnemyBullet), 500)
        giftGenerationInterval = setInterval(() => {
            const gifts = [TripleBulletsGift, FiveBulletsGift, ShieldGift];
            const gift = gifts[Math.floor(Math.random() * gifts.length)];
            objects.push(new gift);
        }, 3000)

        setTimeout(() => {
            playSound('background', {
                loop: true,
                volume: .5
            });
        }, 1000);

        return stop;
    };

    resume();

    return stop
}
function distance(a, b){
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
function collision(a, b){
    const dis = distance(a, b);
    const maxDistance = a.size / 2 + b.size / 2;
    return dis < maxDistance;
}
function gameOver(){
    playSound('gameover');
    stop();
}
function loadAudio(path){
    return new Promise((resolve, reject) => {
        const audio = new Audio(path);
        audio.oncanplaythrough = () => resolve(audio);
        audio.onerror = reject;
    });
}
function loadSounds(){
    const files = {
        background: 'background.mp3',
        explosion: 'explosion.wav',
        gameover: 'gameover.mp3',
        gift: 'gift.wav',
    };
    const promises = Object.entries(files).map(async ([key, value]) => {
        sounds[key] = await loadAudio('sounds/' + value);
    });
    return Promise.all(promises);
}
function playSound(key, options = {}){
    if(sounds[key] === undefined) return false;
    sounds.explosion.currentTime = 0;
    for(let k in options){
        sounds[key][k] = options[k];
    }
    sounds[key].play();
    return true;
}
function pauseSound(key){
    if(sounds[key] === undefined) return false;
    sounds[key].pause();
    return true;
}

const cnv = document.getElementById('canvas')
const ctx = cnv.getContext('2d');
const w = cnv.width = 400
const h = cnv.height = 600;

let objects = [];
let score = 0;
let pressedKeys = new Set;
let sounds = {};

window.onkeydown = e => pressedKeys.add(e.code);
window.onkeyup = e => pressedKeys.delete(e.code);

loadSounds().then(() => console.log('all sounds loaded'));
const stop = init();