const u = 180 / Math.PI;

function getValue(v: any, defaultValue: any) {
  return typeof v === 'undefined' ? defaultValue : v;
}

class MHYHistory {
  public current: any;
  public previous: any;
  public currentTrackName: any;

  public constructor() {
    this.current = null;
    this.previous = null;
    this.currentTrackName = '';
  }

  public check(e: any, t: any) {
    if (e !== this.currentTrackName) {
      this.previous = this.current;
      this.current = t.createHistory();
      this.currentTrackName = e;
    }
  }
}

class BoneSpeedConfig {
  public timeScale: number;

  public constructor(config: any) {
    this.timeScale = getValue(config.timeScale, 1);
  }
}

class AutoBone {
  public animation: Record<string, any>;
  public rootMovement: any;
  public rootBoneName: string;
  public endBoneName: string;
  public history: MHYHistory;
  public spineObj: any;
  public rootBone: any;

  public constructor(extraData: any, spineObj: any) {
    this.animation = {};

    Object.keys(extraData.animation).forEach(key => {
      this.animation[key] = AutoBone.createAnimation(extraData.animation[key]);
    });

    this.rootMovement = 0;
    this.rootBoneName = extraData.rootBoneName;
    this.endBoneName = extraData.endBoneName;
    this.history = new MHYHistory();
    this.bind(spineObj)
  }

  public bind(spineObj: any) {
    this.spineObj = spineObj;
    this.rootBone = spineObj.skeleton.findBone(this.rootBoneName);
    this.init(this.rootBone);
  }

  public init(rootBone: any, ...args: any[]) {
    rootBone.initX = rootBone.x;
    rootBone.initY = rootBone.y;
    rootBone.initWorldX = rootBone.worldX;
    rootBone.initWorldY = rootBone.worldY;
    rootBone.initScaleX = rootBone.scaleX;
    rootBone.initScaleY = rootBone.scaleY;
    rootBone.initRotation = rootBone.rotation;
    rootBone.autoMovePrevWorldX = rootBone.worldX;
    rootBone.autoMovePrevWorldY = rootBone.worldY;
    rootBone.autoMoveSpeedX = 0;
    rootBone.autoMoveSpeedY = 0;
    rootBone.autoMoveFriction = 0;
    rootBone.followRotation = 0;
    rootBone.elasticSpeedX = 0;
    rootBone.elasticSpeedY = 0;

    const n = (args.length > 0) && (typeof args[0] !== 'undefined') ? args[0] : 0;
    rootBone.children.forEach((child: any) => this.init(child, n + 1));

    if (rootBone.children.length === 0) {
      rootBone.tailAutoMovePrevWorldX = rootBone.y * rootBone.b + rootBone.worldX;
      rootBone.tailAutoMovePrevWorldY = rootBone.y * rootBone.d + rootBone.worldY;
    }
  }

  public reset() {
    this.rootMovement = 0;
    this.resetBone();
  }

  public resetBone(bone?: any) {
    if (typeof bone === 'undefined') {
      bone = this.rootBone;
    }

    bone.worldX = bone.initWorldX;
    bone.worldY = bone.initWorldY;
    bone.scaleX = bone.initScaleX;
    bone.scaleY = bone.initScaleY;
    bone.rotation = bone.initRotation;

    if (bone.name !== this.endBoneName) {
      bone.children.forEach((child: any) => this.resetBone(child));
    }
  }

  public render(e: any, t: any, n: any, r: any) {
    let i = null;
    let s = 1;

    if (!this.history.current) {
      this.history.check(this.currentTrackName, this.currentAnimation);
    }

    if (r && this.currentTrackName !== r) {
      i = (this.animation[r] || this.defaultAnimation);
      this.history.check(this.currentTrackName, this.currentAnimation);
    }

    if (i && 1 !== n) {
      s = n;
      this.renderAutoBone(i, this.history.previous, e, t, 1);
    }

    this.renderAutoBone(this.currentAnimation, this.history.current, e, t, s)
  }

  public renderAutoBone(e: any, t: any, n: any, r: any, i: any) {
    var a = e.mode;
    if (1 === a)
      this.updateSineMode(e, r, this.rootBone, 0, i);
    else if (2 === a)
      this.updatePhysicMode(e, t, this.rootBone, r, n, i);
    else if (3 === a) {
      var o = e.moveXFreq
        , s = e.moveXAmp
        , l = e.moveXOctaves
        , c = e.moveXDelay
        , f = e.moveXCenter
        , d = e.moveYSameAsX
        , p = e.moveXSeed
        , m = 0 === s ? 0 : this.updateWiggleMode(o, s, l, r, c) + f;
      if (this.rootBone.x = this.mixValue(this.rootBone.x, this.rootBone.initX + m, i),
        d)
        m = 0 === s ? 0 : this.updateWiggleMode(o, s, l, r, c + p) + f,
          this.rootBone.y = this.mixValue(this.rootBone.y, this.rootBone.initY + m, i);
      else {
        var h = e.moveYFreq
          , v = e.moveYAmp
          , A = e.moveYOctaves
          , g = e.moveYDelay
          , y = e.moveYCenter;
        m = 0 === v ? 0 : this.updateWiggleMode(h, v, A, r, g) + y,
          this.rootBone.y = this.mixValue(this.rootBone.y, this.rootBone.initY + m, i)
      }
      var b = e.scaleXFreq
        , _ = e.scaleXAmp
        , x = e.scaleXOctaves
        , w = e.scaleXDelay
        , S = e.scaleXCenter
        , B = e.scaleYSameAsX;
      if (m = 0 === _ ? 0 : this.updateWiggleMode(b, _, x, r, w) + S,
        this.rootBone.scaleX = this.mixValue(this.rootBone.scaleX, this.rootBone.initScaleX + m, i),
        B)
        this.rootBone.scaleY = this.mixValue(this.rootBone.scaleY, this.rootBone.initScaleY + m, i);
      else {
        var k = e.scaleYFreq
          , E = e.scaleYAmp
          , C = e.scaleYOctaves
          , T = e.scaleYDelay
          , O = e.scaleYCenter;
        m = 0 === E ? 0 : this.updateWiggleMode(k, E, C, r, T) + O,
          this.rootBone.scaleY = this.mixValue(this.rootBone.scaleY, this.rootBone.initScaleY + m, i)
      }
      var M = e.rotateSpeed
        , L = e.rotateFreq
        , R = e.rotateAmp
        , I = e.rotateOctaves
        , P = e.rotateDelay
        , F = e.rotateCenter
        , U = e.rotateFollowEnable
        , D = e.rotateFollowLimit
        , N = e.rotateFollowSpeed
        , z = e.rotateFollowFlip
        , j = e.rotateFollowXMax
        , H = e.rotateFollowYMax;
      if (m = this.rootBone.initRotation + r * M * 360 + F,
        m += 0 === R ? 0 : this.updateWiggleMode(L, R, I, r, P),
        U) {
        var Q = this.rootBone.worldX - this.rootBone.autoMovePrevWorldX
          , W = this.rootBone.worldY - this.rootBone.autoMovePrevWorldY
          , X: any = void 0
          , G = (X = 1 === z ? -D * Math.max(-1, Math.min(1, Q / j)) - D * Math.max(-1, Math.min(1, W / H)) : (Math.atan2(W, Q) * u + 360) % 360) - this.rootBone.followRotation;
        G >= 180 ? X -= 360 : G <= -180 && (X += 360),
          this.rootBone.followRotation += Math.min(D, Math.max(-D, X - this.rootBone.followRotation)) * N,
          this.rootBone.followRotation = (this.rootBone.followRotation + 360) % 360,
          2 === z && Math.abs(this.rootBone.followRotation - 180) < 90 && (this.rootBone.scaleY *= -1),
          m += this.rootBone.followRotation
      }
      this.rootBone.autoMovePrevWorldX = this.rootBone.worldX,
        this.rootBone.autoMovePrevWorldY = this.rootBone.worldY,
        this.rootBone.rotation = this.mixValue(this.rootBone.rotation, m, i)
    } else if (4 === a) {
      var V = this.rootBone.getWorldScale()
        , Y = V.x
        , K = V.y;
      this.updateSpringMagic(e, this.rootBone, r, n, 0, i, Y * K < 0 ? -1 : 1)
    } else
      5 === a && this.updateElasic(e, this.rootBone, n, i)
  }

  public getHistoryRotate(e: any, t: any) {
    for (var n = t.length - 1; n > -1; n--) {
      var r = t[n];
      if (r.time > e) {
        for (var i = n - 1; i > -1; i--) {
          var a = t[i];
          if (e >= a.time)
            return a.delta + (r.delta - a.delta) * (e - a.time) / (r.time - a.time)
        }
        return 0
      }
    }
    return 0
  }

  public mixValue(e: any, t: any, n: any) {
    return e + (t - e) * n
  }

  public updateSineMode(e: any, t: any, ...args: any[]) {
    var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : this.rootBone
      , r = this
      , i = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 0
      , a = arguments[4];
    if (n.data.name !== this.endBoneName) {
      n.rotation = this.mixValue(n.rotation, n.initRotation + Math.sin((e.rotateOffset - Math.pow(e.childOffset * i, 1 + e.spring) + t) * Math.PI * 2 / e.rotateTime) * e.rotateRange * Math.pow(1 + i * e.affectByLevel, 1 + e.springLevel) + e.rotateCenter, a);
      var o = 0;
      0 !== e.scaleYRange && (o = Math.sin((e.scaleYOffset - Math.pow(e.scaleYChildOffset * i, 1 + e.scaleYSpring) + t) * Math.PI * 2 / e.scaleYTime) * e.scaleYRange * Math.pow(1 + i * e.scaleYAffectByLevel, 1 + e.springLevel) + e.scaleYCenter,
        n.scaleY = this.mixValue(n.scaleY, n.initScaleY + o, a),
        e.sinScaleXSameAsY && (n.scaleX = this.mixValue(n.scaleX, n.initScaleX + o, a))),
        e.sinScaleXSameAsY || 0 === e.scaleXRange || (o = Math.sin((e.scaleXOffset - Math.pow(e.scaleXChildOffset * i, 1 + e.scaleXSpring) + t) * Math.PI * 2 / e.scaleXTime) * e.scaleXRange * Math.pow(1 + i * e.scaleXAffectByLevel, 1 + e.springLevel) + e.scaleXCenter,
          n.scaleX = this.mixValue(n.scaleX, n.initScaleX + o, a)),
        n.children.forEach((function (n: any) {
          r.updateSineMode(e, t, n, i + 1, a)
        }
        ))
    }
  }

  public updateWiggleMode(e: any, t: any, n: any, r: any, i: any) {
    for (var a = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : .5, o = 0, s = 1, u = n + 1, l = 1 / (2 - 1 / Math.pow(2, u - 1)), c = l, f = 0, d = 0; d < u; d++)
      o += s * Math.sin(r * c * Math.PI * 2 / e + i),
        c = l * Math.pow(2, d + 1),
        f += s,
        s *= a;
    return o / f * t
  }

  public updatePhysicMode(e: any, t: any, n: any, r: any, i: any, a: any) {
    var o = this
      , s = Math.min(e.limitRange, Math.max(-e.limitRange, n.autoMovePrevWorldX - n.worldX))
      , u = Math.min(e.limitRange, Math.max(-e.limitRange, n.autoMovePrevWorldY - n.worldY));
    t.speedX += (e.affectByX * s - t.speedX) * e.speed * i,
      t.speedY += (e.affectByY * u - t.speedY) * e.speed * i,
      n.autoMovePrevWorldX = n.worldX,
      n.autoMovePrevWorldY = n.worldY;
    var l = e.affectByRange * (-t.speedX * n.c + t.speedY * n.d);
    n.rotation = this.mixValue(n.rotation, l + n.initRotation, a),
      t.buffer.push({
        time: r,
        delta: l
      }),
      t.buffer.length > 300 && t.buffer.shift(),
      n.children.forEach((function (n: any) {
        o.updateFollowMode(e, t, n, r, 1, a)
      }
      ))
  }

  public updateFollowMode(e: any, t: any, n: any, r: any, i: any, a: any) {
    var o = this;
    n.data.name !== this.endBoneName && (n.rotation = this.mixValue(n.rotation, n.initRotation + this.getHistoryRotate(r - e.delay * (1 + i * e.spring), t.buffer) * e.rotateMoveRange * Math.pow(1 + i * e.affectByLevel, 1 + e.springLevel), a),
      n.children.forEach((function (n: any) {
        o.updateFollowMode(e, t, n, r, i + 1, a)
      }
      )))
  }

  public updateSpringMagic(e: any, t: any, n: any, r: any, i: any, a: any, o: any) {
    var s = this;
    if (t.data.name !== this.endBoneName) {
      t.updateWorldTransform(),
        t.autoMovePrevWorldX = t.worldX,
        t.autoMovePrevWorldY = t.worldY;
      var l = Math.pow(1 + i * e.affectByLevel, 1 + e.springLevel)
        , c = e.delay * l * r * (0 === i ? 1 + e.spring : 1);
      if (t.children.length > 0)
        t.children.forEach((function (l: any, f: any) {
          if (0 === f) {
            var d = l.x
              , p = l.y
              , m = d * t.a + p * t.b + t.worldX
              , h = d * t.c + p * t.d + t.worldY;
            m = (m - l.autoMovePrevWorldX) * c,
              h = (h - l.autoMovePrevWorldY) * c,
              t.autoMoveSpeedX += m,
              t.autoMoveSpeedY += h,
              t.autoMoveSpeedX *= .7,
              t.autoMoveSpeedY *= .7;
            var v = l.autoMovePrevWorldX + t.autoMoveSpeedX
              , A = l.autoMovePrevWorldY + t.autoMoveSpeedY
              , g = t.worldToLocalRotation(o * Math.atan2(A - t.worldY, o * (v - t.worldX)) * u + (0 === i ? e.rotateOffset : 0))
              , y = Math.min(e.limitRange, Math.max(-e.limitRange, g - t.initRotation)) + t.initRotation;
            t.rotation = s.mixValue(t.rotation, t.initRotation * e.speed + (1 - e.speed) * y, a * t.autoMoveFriction),
              t.updateWorldTransform()
          }
          s.updateSpringMagic(e, l, n, r, i + 1, a, o)
        }
        ));
      else {
        var f = t.x
          , d = t.y
          , p = f * t.a + d * t.b + t.worldX
          , m = f * t.c + d * t.d + t.worldY;
        p = (p - t.tailAutoMovePrevWorldX) * c,
          m = (m - t.tailAutoMovePrevWorldY) * c,
          t.autoMoveSpeedX += p,
          t.autoMoveSpeedY += m,
          t.autoMoveSpeedX *= .7,
          t.autoMoveSpeedY *= .7;
        var h = t.tailAutoMovePrevWorldX + t.autoMoveSpeedX
          , v = t.tailAutoMovePrevWorldY + t.autoMoveSpeedY
          , A = t.worldToLocalRotation(o * Math.atan2(v - t.worldY, o * (h - t.worldX)) * u + (0 === i ? e.rotateOffset : 0))
          , g = Math.min(e.limitRange, Math.max(-e.limitRange, A - t.initRotation)) + t.initRotation;
        t.rotation = this.mixValue(t.rotation, t.initRotation * e.speed + (1 - e.speed) * g, a * t.autoMoveFriction),
          t.updateWorldTransform(),
          t.tailAutoMovePrevWorldX = f * t.a + d * t.b + t.worldX,
          t.tailAutoMovePrevWorldY = f * t.c + d * t.d + t.worldY
      }
      t.autoMoveFriction += .7 * (1 - t.autoMoveFriction) * r
    }
  }

  public updateElasic(e: any, t: any, n: any, r: any) {
    if (t.data.name !== this.endBoneName) {
      var i = t.parent
        , a = t.initX
        , o = t.initY
        , s = a * i.a + o * i.b + i.worldX
        , u = a * i.c + o * i.d + i.worldY
        , l = (s - t.autoMovePrevWorldX) * e.elasticSpring * n
        , c = (u - t.autoMovePrevWorldY) * e.elasticSpring * n;
      t.elasticSpeedX += l,
        t.elasticSpeedX *= e.elasticFriction,
        t.elasticSpeedY += c,
        t.elasticSpeedY *= e.elasticFriction,
        t.autoMovePrevWorldX += t.elasticSpeedX,
        t.autoMovePrevWorldY += t.elasticSpeedY;
      var f = i.worldToLocal({
        x: t.autoMovePrevWorldX,
        y: t.autoMovePrevWorldY
      })
        , d = f.x
        , p = f.y;
      if (!isNaN(d) && !isNaN(p)) {
        var m = 1 - e.elasticSoftness;
        t.x = this.mixValue(t.x, d * e.elasticSoftness + m * t.initX, r * t.autoMoveFriction),
          t.y = this.mixValue(t.y, p * e.elasticSoftness + m * t.initY, r * t.autoMoveFriction),
          t.autoMoveFriction += .7 * (1 - t.autoMoveFriction) * n
      }
    }
  }

  public get currentTrackName() {
    return this.spineObj.state.tracks.length ? this.spineObj.state.tracks[0].animation.name : ""
  }

  public get currentAnimation() {
    var e = this.spineObj.state.tracks[0].animation.name;
    return this.animation[e] || this.defaultAnimation
  }

  public get defaultAnimation() {
    return this.animation.default
  }

  private static createAnimation(e: any) {
    switch (e.mode) {
      case 1:
        return new AnimationSine(e);
      case 2:
        return new AnimationPhysic(e);
      case 3:
        return new AnimationWiggle(e);
      case 4:
        return new AnimationSpringMagic(e);
      case 5:
        return new AnimationElasic(e);
      default:
        throw new Error("unknown mode:" + e.mode)
    }
  }
}

class AnimationBase {
  public name: string;
  public mode: number;

  public constructor(config: any) {
    this.name = config.name;
    this.mode = config.mode;
  }
}

class AnimationSine extends AnimationBase {
  public rotateOffset: number;
  public rotateCenter: number;
  public rotateTime: number;
  public rotateRange: number;
  public affectByLevel: number;
  public springLevel: number;
  public spring: number;
  public childOffset: number;
  public scaleYRange: number;
  public scaleYCenter: number;
  public scaleYTime: number;
  public scaleYOffset: number;
  public scaleYChildOffset: number;
  public scaleYSpring: number;
  public scaleYAffectByLevel: number;
  public scaleXRange: number;
  public scaleXCenter: number;
  public scaleXTime: number;
  public scaleXOffset: number;
  public scaleXChildOffset: number;
  public scaleXSpring: number;
  public scaleXAffectByLevel: number;
  public sinScaleXSameAsY: boolean;

  public constructor(config: any) {
    super(config);
    this.rotateOffset = getValue(config.rotateOffset, 0);
    this.rotateCenter = getValue(config.rotateCenter, 2);
    this.rotateTime = getValue(config.rotateTime, 10);
    this.rotateRange = getValue(config.rotateRange, 0);
    this.affectByLevel = getValue(config.affectByLevel, .25);
    this.springLevel = getValue(config.springLevel, 0);
    this.spring = getValue(config.spring, .1);
    this.childOffset = getValue(config.childOffset, 0);
    this.scaleYRange = getValue(config.scaleYRange, 0);
    this.scaleYCenter = getValue(config.scaleYCenter, 2);
    this.scaleYTime = getValue(config.scaleYTime, 0);
    this.scaleYOffset = getValue(config.scaleYOffset, 0);
    this.scaleYChildOffset = getValue(config.scaleYChildOffset, .25);
    this.scaleYSpring = getValue(config.scaleYSpring, 0);
    this.scaleYAffectByLevel = getValue(config.scaleYAffectByLevel, .1);
    this.scaleXRange = getValue(config.scaleXRange, 0);
    this.scaleXCenter = getValue(config.scaleXCenter, 2);
    this.scaleXTime = getValue(config.scaleXTime, 0);
    this.scaleXOffset = getValue(config.scaleXOffset, 0);
    this.scaleXChildOffset = getValue(config.scaleXChildOffset, .25);
    this.scaleXSpring = getValue(config.scaleXSpring, 0);
    this.scaleXAffectByLevel = getValue(config.scaleXAffectByLevel, .1);
    this.sinScaleXSameAsY = (this.scaleXRange === this.scaleYRange) && (this.scaleXCenter === this.scaleYCenter) && (this.scaleXTime === this.scaleYTime) && (this.scaleXOffset === this.scaleYOffset) && (this.scaleXChildOffset === this.scaleYChildOffset) && (this.scaleXSpring === this.scaleYSpring) && (this.scaleXAffectByLevel === this.scaleYAffectByLevel);
  }

  public createHistory() {
    return {
      speedX: 0,
      speedY: 0,
      buffer: []
    }
  }
}

class AnimationPhysic extends AnimationBase {
  public delay: number;
  public speed: number;
  public affectByRange: number;
  public affectByX: number;
  public affectByY: number;
  public rotateMoveRange: number;
  public spring: number;
  public affectByLevel: number;
  public springLevel: number;
  public limitRange: number;

  public constructor(config: any) {
    super(config);
    this.delay = getValue(config.delay, .1);
    this.speed = getValue(config.speed, .1);
    this.affectByRange = getValue(config.affectByRange, 0);
    this.affectByX = getValue(config.affectByX, 1);
    this.affectByY = getValue(config.affectByY, 1);
    this.rotateMoveRange = getValue(config.rotateMoveRange, 1);
    this.spring = getValue(config.spring, 1);
    this.affectByLevel = getValue(config.affectByLevel, 0);
    this.springLevel = getValue(config.springLevel, 0);
    this.limitRange = getValue(config.limitRange, 10);
  }

  public createHistory() {
    return {
      speedX: 0,
      speedY: 0,
      buffer: []
    }
  }
}

class AnimationWiggle extends AnimationBase {
  public moveXFreq: number;
  public moveXAmp: number;
  public moveXOctaves: number;
  public moveXDelay: number;
  public moveXCenter: number;
  public moveXSeed: number;
  public moveYFreq: number;
  public moveYAmp: number;
  public moveYOctaves: number;
  public moveYDelay: number;
  public moveYCenter: number;
  public moveYSameAsX: boolean;
  public scaleXFreq: number;
  public scaleXAmp: number;
  public scaleXOctaves: number;
  public scaleXDelay: number;
  public scaleXCenter: number;
  public scaleYFreq: number;
  public scaleYAmp: number;
  public scaleYOctaves: number;
  public scaleYDelay: number;
  public scaleYCenter: number;
  public scaleYSameAsX: boolean;
  public rotateSpeed: number;
  public rotateFreq: number;
  public rotateAmp: number;
  public rotateOctaves: number;
  public rotateDelay: number;
  public rotateCenter: number;
  public rotateFollowLimit: number;
  public rotateFollowEnable: boolean;
  public rotateFollowSpeed: number;
  public rotateFollowFlip: number;
  public rotateFollowXMax: number;
  public rotateFollowYMax: number;


  public constructor(config: any) {
    super(config);
    this.moveXFreq = getValue(config.moveXFreq, 1);
    this.moveXAmp = getValue(config.moveXAmp, 0);
    this.moveXOctaves = getValue(config.moveXOctaves, 0);
    this.moveXDelay = getValue(config.moveXDelay, 0);
    this.moveXCenter = getValue(config.moveXCenter, 0);
    this.moveXSeed = getValue(config.moveXSeed, Math.floor(1e4 * Math.random()));
    this.moveYFreq = getValue(config.moveYFreq, this.moveXFreq);
    this.moveYAmp = getValue(config.moveYAmp, this.moveXAmp);
    this.moveYOctaves = getValue(config.moveYOctaves, this.moveXOctaves);
    this.moveYDelay = getValue(config.moveYDelay, this.moveXDelay);
    this.moveYCenter = getValue(config.moveYCenter, this.moveXCenter);
    this.moveYSameAsX = (this.moveXFreq === this.moveYFreq) && (this.moveXAmp === this.moveYAmp) && (this.moveXOctaves === this.moveYOctaves) && (this.moveXDelay === this.moveYDelay) && (this.moveXCenter === this.moveYCenter);
    this.scaleXFreq = getValue(config.scaleXFreq, 1);
    this.scaleXAmp = getValue(config.scaleXAmp, 0);
    this.scaleXOctaves = getValue(config.scaleXOctaves, 0);
    this.scaleXDelay = getValue(config.scaleXDelay, 0);
    this.scaleXCenter = getValue(config.scaleXCenter, 0);
    this.scaleYFreq = getValue(config.scaleYFreq, this.scaleXFreq);
    this.scaleYAmp = getValue(config.scaleYAmp, this.scaleXAmp);
    this.scaleYOctaves = getValue(config.scaleYOctaves, this.scaleXOctaves);
    this.scaleYDelay = getValue(config.scaleYDelay, this.scaleXDelay);
    this.scaleYCenter = getValue(config.scaleYCenter, this.scaleXCenter);
    this.scaleYSameAsX = (this.scaleXFreq === this.scaleYFreq) && (this.scaleXAmp === this.scaleYAmp) && (this.scaleXOctaves === this.scaleYOctaves) && (this.scaleXDelay === this.scaleYDelay) && (this.scaleXCenter === this.scaleYCenter);
    this.rotateSpeed = getValue(config.rotateSpeed, 0);
    this.rotateFreq = getValue(config.rotateFreq, 1);
    this.rotateAmp = getValue(config.rotateAmp, 0);
    this.rotateOctaves = getValue(config.rotateOctaves, 0);
    this.rotateDelay = getValue(config.rotateDelay, 0);
    this.rotateCenter = getValue(config.rotateCenter, 0);
    this.rotateFollowLimit = getValue(config.rotateFollowLimit, 0);
    this.rotateFollowEnable = 0 !== this.rotateFollowLimit;
    this.rotateFollowSpeed = getValue(config.rotateFollowSpeed, .1);
    this.rotateFollowFlip = getValue(config.rotateFollowFlip, 0);
    this.rotateFollowXMax = getValue(config.rotateFollowXMax, 20);
    this.rotateFollowYMax = getValue(config.rotateFollowYMax, 20);
  }

  public createHistory() {
    return {
      speedX: 0,
      speedY: 0,
      buffer: []
    }
  }
}

class AnimationSpringMagic extends AnimationBase {
  public delay: number;
  public speed: number;
  public spring: number;
  public affectByLevel: number;
  public springLevel: number;
  public limitRange: number;
  public rotateOffset: number;

  public constructor(config: any) {
    super(config);
    this.delay = getValue(config.delay, .1);
    this.speed = getValue(config.speed, .1);
    this.spring = getValue(config.spring, 0);
    this.affectByLevel = getValue(config.affectByLevel, 0);
    this.springLevel = getValue(config.springLevel, 0);
    this.limitRange = getValue(config.limitRange, 80);
    this.rotateOffset = getValue(config.rotateOffset, 0);
  }

  public createHistory() {
    return {
      speedX: 0,
      speedY: 0,
      buffer: []
    }
  }
}

class AnimationElasic extends AnimationBase {
  public elasticSpring: number;
  public elasticFriction: number;
  public elasticSoftness: number;

  public constructor(config: any) {
    super(config);
    this.elasticSpring = getValue(config.elasticSpring, .4);
    this.elasticFriction = getValue(config.elasticFriction, .6);
    this.elasticSoftness = getValue(config.elasticSoftness, 1);
  }

  public createHistory() {
    return {
      speedX: 0,
      speedY: 0,
      buffer: []
    }
  }
}
