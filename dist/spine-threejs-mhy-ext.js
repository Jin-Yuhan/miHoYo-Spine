"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var u = 180 / Math.PI;
function getValue(v, defaultValue) {
    return typeof v === 'undefined' ? defaultValue : v;
}
var MHYHistory = /** @class */ (function () {
    function MHYHistory() {
        this.current = null;
        this.previous = null;
        this.currentTrackName = '';
    }
    MHYHistory.prototype.check = function (e, t) {
        if (e !== this.currentTrackName) {
            this.previous = this.current;
            this.current = t.createHistory();
            this.currentTrackName = e;
        }
    };
    return MHYHistory;
}());
var BoneSpeedConfig = /** @class */ (function () {
    function BoneSpeedConfig(config) {
        this.timeScale = getValue(config.timeScale, 1);
    }
    return BoneSpeedConfig;
}());
var AutoBone = /** @class */ (function () {
    function AutoBone(extraData, spineObj) {
        var _this = this;
        this.animation = {};
        Object.keys(extraData.animation).forEach(function (key) {
            _this.animation[key] = AutoBone.createAnimation(extraData.animation[key]);
        });
        this.rootMovement = 0;
        this.rootBoneName = extraData.rootBoneName;
        this.endBoneName = extraData.endBoneName;
        this.history = new MHYHistory();
        this.bind(spineObj);
    }
    AutoBone.prototype.bind = function (spineObj) {
        this.spineObj = spineObj;
        this.rootBone = spineObj.skeleton.findBone(this.rootBoneName);
        this.init(this.rootBone);
    };
    AutoBone.prototype.init = function (rootBone) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
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
        var n = (args.length > 0) && (typeof args[0] !== 'undefined') ? args[0] : 0;
        rootBone.children.forEach(function (child) { return _this.init(child, n + 1); });
        if (rootBone.children.length === 0) {
            rootBone.tailAutoMovePrevWorldX = rootBone.y * rootBone.b + rootBone.worldX;
            rootBone.tailAutoMovePrevWorldY = rootBone.y * rootBone.d + rootBone.worldY;
        }
    };
    AutoBone.prototype.reset = function () {
        this.rootMovement = 0;
        this.resetBone();
    };
    AutoBone.prototype.resetBone = function (bone) {
        var _this = this;
        if (typeof bone === 'undefined') {
            bone = this.rootBone;
        }
        bone.worldX = bone.initWorldX;
        bone.worldY = bone.initWorldY;
        bone.scaleX = bone.initScaleX;
        bone.scaleY = bone.initScaleY;
        bone.rotation = bone.initRotation;
        if (bone.name !== this.endBoneName) {
            bone.children.forEach(function (child) { return _this.resetBone(child); });
        }
    };
    AutoBone.prototype.render = function (e, t, n, r) {
        var i = null;
        var s = 1;
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
        this.renderAutoBone(this.currentAnimation, this.history.current, e, t, s);
    };
    AutoBone.prototype.renderAutoBone = function (e, t, n, r, i) {
        var a = e.mode;
        if (1 === a)
            this.updateSineMode(e, r, this.rootBone, 0, i);
        else if (2 === a)
            this.updatePhysicMode(e, t, this.rootBone, r, n, i);
        else if (3 === a) {
            var o = e.moveXFreq, s = e.moveXAmp, l = e.moveXOctaves, c = e.moveXDelay, f = e.moveXCenter, d = e.moveYSameAsX, p = e.moveXSeed, m = 0 === s ? 0 : this.updateWiggleMode(o, s, l, r, c) + f;
            if (this.rootBone.x = this.mixValue(this.rootBone.x, this.rootBone.initX + m, i),
                d)
                m = 0 === s ? 0 : this.updateWiggleMode(o, s, l, r, c + p) + f,
                    this.rootBone.y = this.mixValue(this.rootBone.y, this.rootBone.initY + m, i);
            else {
                var h = e.moveYFreq, v = e.moveYAmp, A = e.moveYOctaves, g = e.moveYDelay, y = e.moveYCenter;
                m = 0 === v ? 0 : this.updateWiggleMode(h, v, A, r, g) + y,
                    this.rootBone.y = this.mixValue(this.rootBone.y, this.rootBone.initY + m, i);
            }
            var b = e.scaleXFreq, _ = e.scaleXAmp, x = e.scaleXOctaves, w = e.scaleXDelay, S = e.scaleXCenter, B = e.scaleYSameAsX;
            if (m = 0 === _ ? 0 : this.updateWiggleMode(b, _, x, r, w) + S,
                this.rootBone.scaleX = this.mixValue(this.rootBone.scaleX, this.rootBone.initScaleX + m, i),
                B)
                this.rootBone.scaleY = this.mixValue(this.rootBone.scaleY, this.rootBone.initScaleY + m, i);
            else {
                var k = e.scaleYFreq, E = e.scaleYAmp, C = e.scaleYOctaves, T = e.scaleYDelay, O = e.scaleYCenter;
                m = 0 === E ? 0 : this.updateWiggleMode(k, E, C, r, T) + O,
                    this.rootBone.scaleY = this.mixValue(this.rootBone.scaleY, this.rootBone.initScaleY + m, i);
            }
            var M = e.rotateSpeed, L = e.rotateFreq, R = e.rotateAmp, I = e.rotateOctaves, P = e.rotateDelay, F = e.rotateCenter, U = e.rotateFollowEnable, D = e.rotateFollowLimit, N = e.rotateFollowSpeed, z = e.rotateFollowFlip, j = e.rotateFollowXMax, H = e.rotateFollowYMax;
            if (m = this.rootBone.initRotation + r * M * 360 + F,
                m += 0 === R ? 0 : this.updateWiggleMode(L, R, I, r, P),
                U) {
                var Q = this.rootBone.worldX - this.rootBone.autoMovePrevWorldX, W = this.rootBone.worldY - this.rootBone.autoMovePrevWorldY, X = void 0, G = (X = 1 === z ? -D * Math.max(-1, Math.min(1, Q / j)) - D * Math.max(-1, Math.min(1, W / H)) : (Math.atan2(W, Q) * u + 360) % 360) - this.rootBone.followRotation;
                G >= 180 ? X -= 360 : G <= -180 && (X += 360),
                    this.rootBone.followRotation += Math.min(D, Math.max(-D, X - this.rootBone.followRotation)) * N,
                    this.rootBone.followRotation = (this.rootBone.followRotation + 360) % 360,
                    2 === z && Math.abs(this.rootBone.followRotation - 180) < 90 && (this.rootBone.scaleY *= -1),
                    m += this.rootBone.followRotation;
            }
            this.rootBone.autoMovePrevWorldX = this.rootBone.worldX,
                this.rootBone.autoMovePrevWorldY = this.rootBone.worldY,
                this.rootBone.rotation = this.mixValue(this.rootBone.rotation, m, i);
        }
        else if (4 === a) {
            var V = this.rootBone.getWorldScale(), Y = V.x, K = V.y;
            this.updateSpringMagic(e, this.rootBone, r, n, 0, i, Y * K < 0 ? -1 : 1);
        }
        else
            5 === a && this.updateElasic(e, this.rootBone, n, i);
    };
    AutoBone.prototype.getHistoryRotate = function (e, t) {
        for (var n = t.length - 1; n > -1; n--) {
            var r = t[n];
            if (r.time > e) {
                for (var i = n - 1; i > -1; i--) {
                    var a = t[i];
                    if (e >= a.time)
                        return a.delta + (r.delta - a.delta) * (e - a.time) / (r.time - a.time);
                }
                return 0;
            }
        }
        return 0;
    };
    AutoBone.prototype.mixValue = function (e, t, n) {
        return e + (t - e) * n;
    };
    AutoBone.prototype.updateSineMode = function (e, t) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : this.rootBone, r = this, i = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 0, a = arguments[4];
        if (n.data.name !== this.endBoneName) {
            n.rotation = this.mixValue(n.rotation, n.initRotation + Math.sin((e.rotateOffset - Math.pow(e.childOffset * i, 1 + e.spring) + t) * Math.PI * 2 / e.rotateTime) * e.rotateRange * Math.pow(1 + i * e.affectByLevel, 1 + e.springLevel) + e.rotateCenter, a);
            var o = 0;
            0 !== e.scaleYRange && (o = Math.sin((e.scaleYOffset - Math.pow(e.scaleYChildOffset * i, 1 + e.scaleYSpring) + t) * Math.PI * 2 / e.scaleYTime) * e.scaleYRange * Math.pow(1 + i * e.scaleYAffectByLevel, 1 + e.springLevel) + e.scaleYCenter,
                n.scaleY = this.mixValue(n.scaleY, n.initScaleY + o, a),
                e.sinScaleXSameAsY && (n.scaleX = this.mixValue(n.scaleX, n.initScaleX + o, a))),
                e.sinScaleXSameAsY || 0 === e.scaleXRange || (o = Math.sin((e.scaleXOffset - Math.pow(e.scaleXChildOffset * i, 1 + e.scaleXSpring) + t) * Math.PI * 2 / e.scaleXTime) * e.scaleXRange * Math.pow(1 + i * e.scaleXAffectByLevel, 1 + e.springLevel) + e.scaleXCenter,
                    n.scaleX = this.mixValue(n.scaleX, n.initScaleX + o, a)),
                n.children.forEach((function (n) {
                    r.updateSineMode(e, t, n, i + 1, a);
                }));
        }
    };
    AutoBone.prototype.updateWiggleMode = function (e, t, n, r, i) {
        for (var a = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : .5, o = 0, s = 1, u = n + 1, l = 1 / (2 - 1 / Math.pow(2, u - 1)), c = l, f = 0, d = 0; d < u; d++)
            o += s * Math.sin(r * c * Math.PI * 2 / e + i),
                c = l * Math.pow(2, d + 1),
                f += s,
                s *= a;
        return o / f * t;
    };
    AutoBone.prototype.updatePhysicMode = function (e, t, n, r, i, a) {
        var o = this, s = Math.min(e.limitRange, Math.max(-e.limitRange, n.autoMovePrevWorldX - n.worldX)), u = Math.min(e.limitRange, Math.max(-e.limitRange, n.autoMovePrevWorldY - n.worldY));
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
            n.children.forEach((function (n) {
                o.updateFollowMode(e, t, n, r, 1, a);
            }));
    };
    AutoBone.prototype.updateFollowMode = function (e, t, n, r, i, a) {
        var o = this;
        n.data.name !== this.endBoneName && (n.rotation = this.mixValue(n.rotation, n.initRotation + this.getHistoryRotate(r - e.delay * (1 + i * e.spring), t.buffer) * e.rotateMoveRange * Math.pow(1 + i * e.affectByLevel, 1 + e.springLevel), a),
            n.children.forEach((function (n) {
                o.updateFollowMode(e, t, n, r, i + 1, a);
            })));
    };
    AutoBone.prototype.updateSpringMagic = function (e, t, n, r, i, a, o) {
        var s = this;
        if (t.data.name !== this.endBoneName) {
            t.updateWorldTransform(),
                t.autoMovePrevWorldX = t.worldX,
                t.autoMovePrevWorldY = t.worldY;
            var l = Math.pow(1 + i * e.affectByLevel, 1 + e.springLevel), c = e.delay * l * r * (0 === i ? 1 + e.spring : 1);
            if (t.children.length > 0)
                t.children.forEach((function (l, f) {
                    if (0 === f) {
                        var d = l.x, p = l.y, m = d * t.a + p * t.b + t.worldX, h = d * t.c + p * t.d + t.worldY;
                        m = (m - l.autoMovePrevWorldX) * c,
                            h = (h - l.autoMovePrevWorldY) * c,
                            t.autoMoveSpeedX += m,
                            t.autoMoveSpeedY += h,
                            t.autoMoveSpeedX *= .7,
                            t.autoMoveSpeedY *= .7;
                        var v = l.autoMovePrevWorldX + t.autoMoveSpeedX, A = l.autoMovePrevWorldY + t.autoMoveSpeedY, g = t.worldToLocalRotation(o * Math.atan2(A - t.worldY, o * (v - t.worldX)) * u + (0 === i ? e.rotateOffset : 0)), y = Math.min(e.limitRange, Math.max(-e.limitRange, g - t.initRotation)) + t.initRotation;
                        t.rotation = s.mixValue(t.rotation, t.initRotation * e.speed + (1 - e.speed) * y, a * t.autoMoveFriction),
                            t.updateWorldTransform();
                    }
                    s.updateSpringMagic(e, l, n, r, i + 1, a, o);
                }));
            else {
                var f = t.x, d = t.y, p = f * t.a + d * t.b + t.worldX, m = f * t.c + d * t.d + t.worldY;
                p = (p - t.tailAutoMovePrevWorldX) * c,
                    m = (m - t.tailAutoMovePrevWorldY) * c,
                    t.autoMoveSpeedX += p,
                    t.autoMoveSpeedY += m,
                    t.autoMoveSpeedX *= .7,
                    t.autoMoveSpeedY *= .7;
                var h = t.tailAutoMovePrevWorldX + t.autoMoveSpeedX, v = t.tailAutoMovePrevWorldY + t.autoMoveSpeedY, A = t.worldToLocalRotation(o * Math.atan2(v - t.worldY, o * (h - t.worldX)) * u + (0 === i ? e.rotateOffset : 0)), g = Math.min(e.limitRange, Math.max(-e.limitRange, A - t.initRotation)) + t.initRotation;
                t.rotation = this.mixValue(t.rotation, t.initRotation * e.speed + (1 - e.speed) * g, a * t.autoMoveFriction),
                    t.updateWorldTransform(),
                    t.tailAutoMovePrevWorldX = f * t.a + d * t.b + t.worldX,
                    t.tailAutoMovePrevWorldY = f * t.c + d * t.d + t.worldY;
            }
            t.autoMoveFriction += .7 * (1 - t.autoMoveFriction) * r;
        }
    };
    AutoBone.prototype.updateElasic = function (e, t, n, r) {
        if (t.data.name !== this.endBoneName) {
            var i = t.parent, a = t.initX, o = t.initY, s = a * i.a + o * i.b + i.worldX, u = a * i.c + o * i.d + i.worldY, l = (s - t.autoMovePrevWorldX) * e.elasticSpring * n, c = (u - t.autoMovePrevWorldY) * e.elasticSpring * n;
            t.elasticSpeedX += l,
                t.elasticSpeedX *= e.elasticFriction,
                t.elasticSpeedY += c,
                t.elasticSpeedY *= e.elasticFriction,
                t.autoMovePrevWorldX += t.elasticSpeedX,
                t.autoMovePrevWorldY += t.elasticSpeedY;
            var f = i.worldToLocal({
                x: t.autoMovePrevWorldX,
                y: t.autoMovePrevWorldY
            }), d = f.x, p = f.y;
            if (!isNaN(d) && !isNaN(p)) {
                var m = 1 - e.elasticSoftness;
                t.x = this.mixValue(t.x, d * e.elasticSoftness + m * t.initX, r * t.autoMoveFriction),
                    t.y = this.mixValue(t.y, p * e.elasticSoftness + m * t.initY, r * t.autoMoveFriction),
                    t.autoMoveFriction += .7 * (1 - t.autoMoveFriction) * n;
            }
        }
    };
    Object.defineProperty(AutoBone.prototype, "currentTrackName", {
        get: function () {
            return this.spineObj.state.tracks.length ? this.spineObj.state.tracks[0].animation.name : "";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AutoBone.prototype, "currentAnimation", {
        get: function () {
            var e = this.spineObj.state.tracks[0].animation.name;
            return this.animation[e] || this.defaultAnimation;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AutoBone.prototype, "defaultAnimation", {
        get: function () {
            return this.animation.default;
        },
        enumerable: false,
        configurable: true
    });
    AutoBone.createAnimation = function (e) {
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
                throw new Error("unknown mode:" + e.mode);
        }
    };
    return AutoBone;
}());
var AnimationBase = /** @class */ (function () {
    function AnimationBase(config) {
        this.name = config.name;
        this.mode = config.mode;
    }
    return AnimationBase;
}());
var AnimationSine = /** @class */ (function (_super) {
    __extends(AnimationSine, _super);
    function AnimationSine(config) {
        var _this = _super.call(this, config) || this;
        _this.rotateOffset = getValue(config.rotateOffset, 0);
        _this.rotateCenter = getValue(config.rotateCenter, 2);
        _this.rotateTime = getValue(config.rotateTime, 10);
        _this.rotateRange = getValue(config.rotateRange, 0);
        _this.affectByLevel = getValue(config.affectByLevel, .25);
        _this.springLevel = getValue(config.springLevel, 0);
        _this.spring = getValue(config.spring, .1);
        _this.childOffset = getValue(config.childOffset, 0);
        _this.scaleYRange = getValue(config.scaleYRange, 0);
        _this.scaleYCenter = getValue(config.scaleYCenter, 2);
        _this.scaleYTime = getValue(config.scaleYTime, 0);
        _this.scaleYOffset = getValue(config.scaleYOffset, 0);
        _this.scaleYChildOffset = getValue(config.scaleYChildOffset, .25);
        _this.scaleYSpring = getValue(config.scaleYSpring, 0);
        _this.scaleYAffectByLevel = getValue(config.scaleYAffectByLevel, .1);
        _this.scaleXRange = getValue(config.scaleXRange, 0);
        _this.scaleXCenter = getValue(config.scaleXCenter, 2);
        _this.scaleXTime = getValue(config.scaleXTime, 0);
        _this.scaleXOffset = getValue(config.scaleXOffset, 0);
        _this.scaleXChildOffset = getValue(config.scaleXChildOffset, .25);
        _this.scaleXSpring = getValue(config.scaleXSpring, 0);
        _this.scaleXAffectByLevel = getValue(config.scaleXAffectByLevel, .1);
        _this.sinScaleXSameAsY = (_this.scaleXRange === _this.scaleYRange) && (_this.scaleXCenter === _this.scaleYCenter) && (_this.scaleXTime === _this.scaleYTime) && (_this.scaleXOffset === _this.scaleYOffset) && (_this.scaleXChildOffset === _this.scaleYChildOffset) && (_this.scaleXSpring === _this.scaleYSpring) && (_this.scaleXAffectByLevel === _this.scaleYAffectByLevel);
        return _this;
    }
    AnimationSine.prototype.createHistory = function () {
        return {
            speedX: 0,
            speedY: 0,
            buffer: []
        };
    };
    return AnimationSine;
}(AnimationBase));
var AnimationPhysic = /** @class */ (function (_super) {
    __extends(AnimationPhysic, _super);
    function AnimationPhysic(config) {
        var _this = _super.call(this, config) || this;
        _this.delay = getValue(config.delay, .1);
        _this.speed = getValue(config.speed, .1);
        _this.affectByRange = getValue(config.affectByRange, 0);
        _this.affectByX = getValue(config.affectByX, 1);
        _this.affectByY = getValue(config.affectByY, 1);
        _this.rotateMoveRange = getValue(config.rotateMoveRange, 1);
        _this.spring = getValue(config.spring, 1);
        _this.affectByLevel = getValue(config.affectByLevel, 0);
        _this.springLevel = getValue(config.springLevel, 0);
        _this.limitRange = getValue(config.limitRange, 10);
        return _this;
    }
    AnimationPhysic.prototype.createHistory = function () {
        return {
            speedX: 0,
            speedY: 0,
            buffer: []
        };
    };
    return AnimationPhysic;
}(AnimationBase));
var AnimationWiggle = /** @class */ (function (_super) {
    __extends(AnimationWiggle, _super);
    function AnimationWiggle(config) {
        var _this = _super.call(this, config) || this;
        _this.moveXFreq = getValue(config.moveXFreq, 1);
        _this.moveXAmp = getValue(config.moveXAmp, 0);
        _this.moveXOctaves = getValue(config.moveXOctaves, 0);
        _this.moveXDelay = getValue(config.moveXDelay, 0);
        _this.moveXCenter = getValue(config.moveXCenter, 0);
        _this.moveXSeed = getValue(config.moveXSeed, Math.floor(1e4 * Math.random()));
        _this.moveYFreq = getValue(config.moveYFreq, _this.moveXFreq);
        _this.moveYAmp = getValue(config.moveYAmp, _this.moveXAmp);
        _this.moveYOctaves = getValue(config.moveYOctaves, _this.moveXOctaves);
        _this.moveYDelay = getValue(config.moveYDelay, _this.moveXDelay);
        _this.moveYCenter = getValue(config.moveYCenter, _this.moveXCenter);
        _this.moveYSameAsX = (_this.moveXFreq === _this.moveYFreq) && (_this.moveXAmp === _this.moveYAmp) && (_this.moveXOctaves === _this.moveYOctaves) && (_this.moveXDelay === _this.moveYDelay) && (_this.moveXCenter === _this.moveYCenter);
        _this.scaleXFreq = getValue(config.scaleXFreq, 1);
        _this.scaleXAmp = getValue(config.scaleXAmp, 0);
        _this.scaleXOctaves = getValue(config.scaleXOctaves, 0);
        _this.scaleXDelay = getValue(config.scaleXDelay, 0);
        _this.scaleXCenter = getValue(config.scaleXCenter, 0);
        _this.scaleYFreq = getValue(config.scaleYFreq, _this.scaleXFreq);
        _this.scaleYAmp = getValue(config.scaleYAmp, _this.scaleXAmp);
        _this.scaleYOctaves = getValue(config.scaleYOctaves, _this.scaleXOctaves);
        _this.scaleYDelay = getValue(config.scaleYDelay, _this.scaleXDelay);
        _this.scaleYCenter = getValue(config.scaleYCenter, _this.scaleXCenter);
        _this.scaleYSameAsX = (_this.scaleXFreq === _this.scaleYFreq) && (_this.scaleXAmp === _this.scaleYAmp) && (_this.scaleXOctaves === _this.scaleYOctaves) && (_this.scaleXDelay === _this.scaleYDelay) && (_this.scaleXCenter === _this.scaleYCenter);
        _this.rotateSpeed = getValue(config.rotateSpeed, 0);
        _this.rotateFreq = getValue(config.rotateFreq, 1);
        _this.rotateAmp = getValue(config.rotateAmp, 0);
        _this.rotateOctaves = getValue(config.rotateOctaves, 0);
        _this.rotateDelay = getValue(config.rotateDelay, 0);
        _this.rotateCenter = getValue(config.rotateCenter, 0);
        _this.rotateFollowLimit = getValue(config.rotateFollowLimit, 0);
        _this.rotateFollowEnable = 0 !== _this.rotateFollowLimit;
        _this.rotateFollowSpeed = getValue(config.rotateFollowSpeed, .1);
        _this.rotateFollowFlip = getValue(config.rotateFollowFlip, 0);
        _this.rotateFollowXMax = getValue(config.rotateFollowXMax, 20);
        _this.rotateFollowYMax = getValue(config.rotateFollowYMax, 20);
        return _this;
    }
    AnimationWiggle.prototype.createHistory = function () {
        return {
            speedX: 0,
            speedY: 0,
            buffer: []
        };
    };
    return AnimationWiggle;
}(AnimationBase));
var AnimationSpringMagic = /** @class */ (function (_super) {
    __extends(AnimationSpringMagic, _super);
    function AnimationSpringMagic(config) {
        var _this = _super.call(this, config) || this;
        _this.delay = getValue(config.delay, .1);
        _this.speed = getValue(config.speed, .1);
        _this.spring = getValue(config.spring, 0);
        _this.affectByLevel = getValue(config.affectByLevel, 0);
        _this.springLevel = getValue(config.springLevel, 0);
        _this.limitRange = getValue(config.limitRange, 80);
        _this.rotateOffset = getValue(config.rotateOffset, 0);
        return _this;
    }
    AnimationSpringMagic.prototype.createHistory = function () {
        return {
            speedX: 0,
            speedY: 0,
            buffer: []
        };
    };
    return AnimationSpringMagic;
}(AnimationBase));
var AnimationElasic = /** @class */ (function (_super) {
    __extends(AnimationElasic, _super);
    function AnimationElasic(config) {
        var _this = _super.call(this, config) || this;
        _this.elasticSpring = getValue(config.elasticSpring, .4);
        _this.elasticFriction = getValue(config.elasticFriction, .6);
        _this.elasticSoftness = getValue(config.elasticSoftness, 1);
        return _this;
    }
    AnimationElasic.prototype.createHistory = function () {
        return {
            speedX: 0,
            speedY: 0,
            buffer: []
        };
    };
    return AnimationElasic;
}(AnimationBase));
