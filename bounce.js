var self;

function Bounce(cfg) {
	
	// some initialization
	self = this;

	this.loopInterval = 42;

	this.minX = 0;
	this.minY = 0;
	this.maxX = window.innerWidth;
	this.maxY = window.innerHeight;

	this.canvas = document.getElementById(cfg.canvasId);

	this.canvas.width = this.maxX;
	this.canvas.height = this.maxY;

	// get the canvas drawing context
	this.ctx = this.canvas.getContext('2d');

	/*
	 * game state
	 */
	this.score = 0;		// the current score ()
	this.balls = [];	// all balls in game (gets automatically filled)
	this.cursor = {		// the cursor position
		x: null,
		y: null
	};

	// need to keep an eye on the cursor position
	document.onmousemove = function(e) {
		self.cursor.x = e.pageX;
		self.cursor.y = e.pageY;
	};

	// add some balls to start the game
	for (var i = 0; i < cfg.startingBalls; i++)
		this.balls.push(this.generateBall());

	this.draw();
}

Bounce.prototype.generateBall = function() {

	// get a radius first (min 30, max 70)
	var radius = Math.floor(Math.random() * 71 + 30);

	// now calculate its starting position:
	// ball should appear anywhere on the x axis, but no lower than
	// the middle of the viewport height so that bounces are always
	// high enough (otherwise it would be too easy to avoid them)
	var startX = Math.floor(Math.random() * (this.maxX - radius) + radius);
	var startY = Math.floor(Math.random() * (this.maxY / 2 - radius) + radius);

	// also calculate is horizontal speed, which is constant...
	var hSpeed = Math.floor(Math.random() * 300 + 100);

	// ... and it's gravity acceleration
	var gravity = Math.floor(Math.random() * 120 + 60);

	// don't forget to pick a random color
	var color = ['blue', 'red', 'yellow', 'orange', 'pink', 'green', 'black'][Math.floor(Math.random() * 7)];

	// construct the ball object and return it
	var ball = {
		x: startX,
		y: startY,
		radius: radius,
		speed: {
			h: hSpeed,
			v: 0
		},
		gravity: gravity,
		color: color
	};
	return ball;
};

Bounce.prototype.draw = function() {

	// clear the canvas
	this.ctx.clearRect(0, 0, this.maxX, this.maxY);

	// draw each ball at its position
	for (var i in this.balls)
	{
		var b = this.balls[i];

		this.ctx.fillStyle = b.color;
		this.ctx.beginPath();
		this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2, false);
		this.ctx.fill();
	}

	// draw the score on a corner
	this.ctx.fillStyle = "black";
	this.ctx.font = "20px monospace";
	this.ctx.textAlign = "left";
	this.ctx.fillText(this.score, 10, 30);
	this.ctx.textAlign = "right";
	this.ctx.fillText("BALLS: " + this.balls.length, this.maxX - 10, 30);
};

Bounce.prototype.gameOver = function() {

	this.ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
	this.ctx.fillRect(0, 0, this.maxX, this.maxY);

	this.ctx.font = "30px monospace";
	this.ctx.textAlign = "center";

	var texts = ["THAT'LL DO IT",
		"WOW. SUCH LOSE. VERY FAIL.",
		"SO CLOSE!",
		"YOU HAVE SUCCEEDED AT FAILING"];
	var text = texts[Math.floor(Math.random() * texts.length)];
	var textWidth = this.ctx.measureText(text).width;


	this.ctx.beginPath();
	this.ctx.rect(this.maxX / 2 - textWidth / 2 - 20, this.maxY / 2 - 30, textWidth + 40, 60);
	this.ctx.fillStyle = "white";
	this.ctx.fill();
	this.ctx.lineWidth = 4;
	this.ctx.strokeStyle = "black";
	this.ctx.stroke();

	this.ctx.fillStyle = "red";
	this.ctx.fillText(text, this.maxX / 2, this.maxY / 2 + 10)
};

Bounce.prototype.loop = function() {

	// calculate each ball's new position
	for (var i in self.balls)
	{
		var b = self.balls[i];

		// check for a game over
		if (Math.sqrt((self.cursor.x - b.x) * (self.cursor.x - b.x) + (self.cursor.y - b.y) * (self.cursor.y - b.y)) < b.radius)
		{
			// cheerio!
			self.gameOver();
			return;
		}

		// calculate its coordinate deltas
		var dx = b.speed.h * self.loopInterval / 1000;
		var dy = b.speed.v * self.loopInterval / 1000 + b.gravity * Math.pow(self.loopInterval / 1000, 2) / 2;

		// if any of those deltas exceeds the remaining space between the ball
		// and the window boundaries, bounce!
		if (b.x + dx > self.maxX - b.radius)
		{
			dx = dx * 2 - b.radius;
			b.speed.h *= -1;
		}
		else if (b.x + dx < b.radius)
		{
			dx = dx * 2 + b.radius;
			b.speed.h *= -1;
		}

		// (same here with the y axis, but in this case
		// the ball shall not bounce on the ceiling)
		if (b.y+ dy > self.maxY - b.radius)
		{
			dy = dy * 2 - b.radius;
			b.speed.v /= -1;
		}

		b.x += dx;
		b.y += dy;
		
		b.speed.v = b.gravity * self.loopInterval / 1000 + b.speed.v;
	}

	// increase the score
	self.score += 1;

	if (self.score % 40 == 0)
	{
		var newBalls = [];
		for (var i = 0; i < 10; i++)
			newBalls.push(self.generateBall());

		self.balls = self.balls.concat(newBalls);
	}

	self.draw();
	window.setTimeout(self.loop, self.loopInterval);
};