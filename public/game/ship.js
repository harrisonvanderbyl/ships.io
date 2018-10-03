/* global Victor Actor */
class Ship extends Actor {
	constructor(
		id,
		pos = new Victor(10, 10),
		mode = "client",
		pname = "Pilot0",
		size = new Victor(30, 30),
		vel = 0.5,
		ang = 0,
		accel = 1.4,
		velCap = 7,
		turnSpeed = 0.12,
		brakeSpeed = 0.125,
		attraction = new Victor(0, 0),
		obeysBoundarys = true,
		bulletSpeed = 8,
		shotRate = 30,
		image = "#110011",
		weight = 0.75,
		isDead = false,
		deathTimer = opts.RESPAWN_TIME
	) {
		super(id, pos, mode, size, vel, ang, accel, velCap, turnSpeed, brakeSpeed, 
			attraction, obeysBoundarys, "ship", image, weight);
		this.keys = { left: false, right: false, forward: false, backward: false, shoot: false };
		this.bulletSpeed = bulletSpeed;
		this.shotRate = shotRate;
		this.shotCD = 0;
		this.bullets = [];

		this.isDead = isDead;
		this.deathTimer = deathTimer;
		this.respawnTimer = -1;
		this.pname = pname;
	}

	kill() {
		if(!this.isDead) {
			this.isDead = true;
			this.respawnTimer = this.deathTimer;
			console.log(this.id, "DIED");
		} else {
			
		}
	}

	revive(sea) {
		if(this.mode == "server") {
			let tpos = new Victor(0, 0).randomize(new Victor(0, 0), sea.size);
			this.pos = tpos;
			console.log(this.id, "REVIVED");
			this.isDead = false;
			this.respawnTimer = -1;
		}
	}

	shoot(sea, btype) {
		if(this.shotCD <= 0 && !this.isDead) {
			let thead = this.headVector;

			let tbullets = this.getBullets(thead, btype);
			if(this.mode == "server") {
				for(let i in tbullets) sea.actors.push(tbullets[i]);
			}

			this.shotCD = this.shotRate;
			return true;
		} else {
			return false;
		}
	}

	getBullets(tpos, btype) {
		// TODO: support for multishot / other btypes
		let tbullets = [];

		if(btype == "bh") { //TODO: review the way velocity is made here
			let tbh = new BlackHole(makeSlug(7, 7), this.id, tpos, this.bulletSpeed + this.vel / 4, this.mode, this.ang);
			tbullets.push(tbh);
		}

		return tbullets;
	}

	exportState() {
		let state = super.exportState();
		state.keys = this.keys;
		state.health = this.health;
		state.isDead = this.isDead;
		state.pname = this.pname;
		return state;
	}

	importState(state) {
		super.importState(state);
		this.health = state.health;
		this.keys = state.keys;
		this.isDead = state.isDead;
		this.pname = state.pname;
	}

	setKey(e, tf = true) {
		this.keys = this.retKey(e, tf);
	}

	retKey(e, tf = true) {
		let tkeys = this.keys;
		if (e == 37 || e == 65) tkeys.left = tf;
		if (e == 39 || e == 68) tkeys.right = tf;
		if (e == 38 || e == 87) tkeys.forward = tf;
		if (e == 40 || e == 83) tkeys.backward = tf;
		if (e == 32 || e == 13) tkeys.shoot = tf;
		return tkeys;
	}

	update(sea) {
		super.update(sea);
		
		if(!this.isDead) {
			if (this.keys.left) super.turn(-1);
			if (this.keys.right) super.turn(+1);

			if (this.keys.forward) super.boost();
			if (this.keys.backward) super.brake();

			if (this.keys.shoot) this.shoot(sea, "bh");
		} else {
			this.respawnTimer -= 1;
			if(this.respawnTimer <= 0) {
				this.revive(sea);
			}
		}
	}

	post_update(sea) {
		super.post_update(sea);

		if(this.shotCD > 0) {
			this.shotCD -= opts.TIMESTEP;
		}
	}

	draw(ctx, cam) {
		let centerPos = new Victor(this.pos.x, this.pos.y);
		if(!this.isDead) {
			ctx.save();
			ctx.translate(centerPos.x, centerPos.y);
			ctx.rotate(this.ang);
			ctx.lineWidth = 4;
			ctx.strokeStyle = "#cecefe";
			ctx.beginPath();
			ctx.moveTo(0, this.size.y / 2);
			ctx.lineTo(this.size.x / 2, -this.size.y / 2);
			ctx.lineTo(0, -this.size.y / 3);
			ctx.lineTo(-this.size.x / 2, -this.size.y / 2);
			ctx.lineTo(0, this.size.y / 2);
			ctx.closePath();
			ctx.stroke();
			//ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
			ctx.restore();

			ctx.fillStyle = "#ccc";
			ctx.font = "16px Arial";
			ctx.fillText(this.pname, this.pos.x - (16/4*this.pname.length), this.pos.y+this.size.y + 10); 
		} else {
			//TODO: dead screen drawing
		}
	}
}
