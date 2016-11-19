var now = require("@nathanfaucett/now");


var START_TIME = now.getStartTime(),
    TimePrototype;


module.exports = Time;


function Time() {
    var _this = this,
        LOCAL_START_TIME = now() * 0.001,
        scale = 1,

        globalFixed = 1 / 60,
        fixedDelta = 1 / 60,

        frame = 0,
        last = -1 / 60,
        current = 0,
        delta = 1 / 60,
        fpsFrame = 0,
        fpsLast = 0,

        MIN_DELTA = 0.000001,
        MAX_DELTA = 1;

    this.current = 0;
    this.fps = 60;
    this.delta = 1 / 60;
    this.frame = 0;

    this.start = function() {
        return LOCAL_START_TIME;
    };

    this.now = function() {
        return (now() * 0.001) - LOCAL_START_TIME;
    };

    this.update = function() {
        _this.frame = ++frame;

        last = _this.current;
        current = _this.now();

        fpsFrame++;
        if (fpsLast + 1 < current) {
            _this.fps = fpsFrame / (current - fpsLast);

            fpsLast = current;
            fpsFrame = 0;
        }

        delta = (current - last) * _this.scale;
        _this.delta = delta < MIN_DELTA ? MIN_DELTA : delta > MAX_DELTA ? MAX_DELTA : delta;

        _this.current = current;
    };

    this.scale = scale;
    this.setScale = function(value) {
        _this.scale = value;
        _this.fixedDelta = globalFixed * value;
    };

    this.fixedDelta = fixedDelta;
    this.setFixedDelta = function(value) {
        globalFixed = value;
        _this.fixedDelta = globalFixed * scale;
    };

    this.construct = function() {
        LOCAL_START_TIME = now() * 0.001;
        frame = 0;

        _this.current = 0;
        _this.fps = 60;
        _this.delta = 1 / 60;
        _this.frame = frame;

        _this.setScale(1);
        _this.setFixedDelta(1 / 60);
    };

    this.toJSON = function(json) {

        json = json || {};

        json.start = _this.start();
        json.frame = _this.frame;
        json.scale = _this.scale;
        json.fixedDelta = _this.fixedDelta;

        return json;
    };

    this.fromJSON = function(json) {

        json = json || {};

        LOCAL_START_TIME = json.start;
        _this.frame = frame = json.frame;
        _this.setScale(json.scale);
        _this.setFixedDelta(json.fixedDelta);

        return _this;
    };
}
TimePrototype = Time.prototype;

Time.create = function() {
    return new Time();
};

TimePrototype.stamp = function() {
    return (START_TIME + now()) * 0.001;
};

TimePrototype.stampMS = function() {
    return START_TIME + now();
};