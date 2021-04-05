const mineflayer = require('mineflayer');
const vec3 = require('vec3');
const fs = require('fs');

var separation = 8;
var space = Math.random()*5;
var lastSign;
var timer = Math.random()*20+20;

const bot = mineflayer.createBot({
	host: "localhost",
	username: "JustinYMachine",
	viewDistance: "tiny",
});

bot.on('kicked', (reason, loggedIn)=> console.log(reason, loggedIn));
bot.on('error', err=> console.log(err));

bot.on('spawn', ()=>{
	lastSign = bot.entity.position;
	equipSigns();
	bot.on('move', update);
});

function update() {
	timer -= 1;
	
	if (timer<=0) {
		timer = Math.random()*20+20;
		bot.look(Math.random()*Math.PI*2, 0);
		bot.setControlState('forward', Math.random()>0.2);
	}

	if (bot.blockAtCursor(2)) bot.look(bot.entity.yaw+0.1, 0);

	bot.setControlState('jump', bot.entity.isCollidedHorizontally);

	if (!bot.controlState.forward) {
		let neighbour = bot.nearestEntity();
		if (neighbour) bot.lookAt(neighbour.position.offset(0, neighbour.height, 0));
	}

	if (lastSign && bot.entity.position.distanceTo(lastSign) > separation+space) {
		comment();
		lastSign = bot.entity.position;
		space = Math.random()*5;
	}
};

bot.on('chat', (username, message)=>{
	//I feel like this should do something.
});

function equipSigns() {
	let signItem = bot.inventory.findInventoryItem('oak_sign');
	if (signItem) bot.equip(signItem, 'hand');
}

function choose(list) {
	return(list[Math.floor(Math.random()*list.length)]);
}

var vowels = 'a e i o u'.split(' ');

var subjects = ['I'];

var verbs = fs.readFileSync('verbs.txt', 'utf8').toString();
verbs = verbs.split('\r\n').map((word)=>{
	word = word.split(' ');
	word[0] = word[0]+(word[0].endsWith('e')? 'd' : 'ed');
	return(word.join(' '));
});

var adjectives = fs.readFileSync('adjectives.txt', 'utf8').toString();
adjectives = adjectives.split('\r\n');

var objects = fs.readFileSync('objects.txt', 'utf8').toString();
objects = objects.split('\r\n');

function generateText() {
	let subject = choose(subjects);//choose([...subjects, ...Object.keys(bot.players)]);
	let verb = choose(verbs);
	let mod = choose(adjectives);
	let object = choose(objects);
	let determiner = vowels.find(v=>mod.startsWith(v))? 'an' : 'a';

	let words = [subject, verb, determiner, mod, object];
	let lines = [];

	//Very dirty solution but it works.
	while (lines.length < 4) {
		lines.push([]);

		while (words.length && lines[lines.length-1].join(' ').length+words[0].length < 14) {
			lines[lines.length-1].push(words[0]);
			words.shift();
		}
	}
	let text = lines.map(k=>k.join(' ')).join('\n');

	console.log(text);
	return(text);
}

function comment() {
	let position = bot.entity.position.offset(-Math.sin(bot.entity.yaw)*2, -1, -Math.cos(bot.entity.yaw)*2);
	let baseBlock = bot.blockAt(position, false);
	bot.placeBlock(baseBlock, vec3(0, 1, 0), ()=>{
		let signBlock = bot.blockAt(position.offset(0, 1, 0));
		bot.updateSign(signBlock, generateText());
	});
}