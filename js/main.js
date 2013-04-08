
//BOX2D
var box2d = {
    b2Vec2 : Box2D.Common.Math.b2Vec2,
    b2BodyDef : Box2D.Dynamics.b2BodyDef,
    b2Body : Box2D.Dynamics.b2Body,
    b2FixtureDef : Box2D.Dynamics.b2FixtureDef,
    b2Fixture : Box2D.Dynamics.b2Fixture,
    b2World : Box2D.Dynamics.b2World,
    b2MassData : Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape : Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape : Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw : Box2D.Dynamics.b2DebugDraw
};

//GLOBAL VARs
var stage,queue,world;
const FPS = 60, SCALE = 30, WORLD_X = 900, WORLD_Y = 500, GROUND_X = 700, GROUND_Y = 5;

//on start
function init(){
    console.log("init()");
    stage = new createjs.Stage(document.getElementById("canvas"));
    TweenLite.to( $("#canvas"), 0.0, {css:{alpha:0}} );
    queue = new createjs.LoadQueue();
    queue.addEventListener("complete",setUpPhysics);
    queue.loadManifest([
        {id:"word1",src:"img/word1.png"},
        {id:"word2",src:"img/word2.png"},
        {id:"word3",src:"img/word3.png"},
        {id:"word4",src:"img/word4.png"},
        {id:"word5",src:"img/word5.png"},
        {id:"word6",src:"img/word6.png"},
        {id:"word7",src:"img/word7.png"},
        {id:"word8",src:"img/word8.png"},
        {id:"word9",src:"img/word9.png"},
        {id:"word10",src:"img/word10.png"},
        {id:"word11",src:"img/word11.png"},
        {id:"word12",src:"img/word12.png"},
        {id:"word13",src:"img/word13.png"},
        {id:"logo",src:"img/logo.png"}
    ])
}

//set up physics
function setUpPhysics(){
    console.log("setUpPhysics()");
    createjs.Ticker.addListener(stage);
    createjs.Ticker.setFPS(FPS);
    createjs.Ticker.addEventListener("tick", handleTick);
    TweenLite.to( $("#canvas"), 0.5, {css:{alpha:1, delay:0.7 } });
    createjs.Touch.enable(stage);
    createjs.Ticker.useRAF = true;
    world = new box2d.b2World(new box2d.b2Vec2(0, 50), true);

    //create ground
    var shape = new createjs.Shape();
    shape.graphics.beginFill("#5c5c56").drawRect(0,0,GROUND_X,GROUND_Y);
    shape.regX = GROUND_X / 2;
    shape.regY = GROUND_Y / 2;
    stage.addChild(shape);
    var fixDef = new box2d.b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.8;
    fixDef.restitution = 0.5;
    var bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_staticBody;
    bodyDef.position.x = WORLD_X / 2 / SCALE; //var width = $("#canvas").width();
    bodyDef.position.y = (WORLD_Y - GROUND_Y) / SCALE;
    bodyDef.userData = shape;
    fixDef.shape = new box2d.b2PolygonShape;
    fixDef.shape.SetAsBox((GROUND_X/SCALE)/2, (GROUND_Y/SCALE)/2);
    world.CreateBody(bodyDef).CreateFixture(fixDef);

    //create words
    var wordSizeX = [38,49,45,47,42,53,47,49,55,41,52,46,50];
    var wordSizeY = [51,52,51,51,52,52,52,52,50,50,50,50,50];
    for(var i=0; i<wordSizeX.length; i++){
        createObj("word"+(i+1),
            {x:wordSizeX[i],y:wordSizeY[i]},
            {x:i*53+(WORLD_X-GROUND_X)/2+30,y:i*-25},
            {d:0.5,f:0.4,r:0.2},
            true);
    }
    for(var i=0; i<50; i++){
        createjs.Tween.get({}).wait(3000+i*400)
            .call(createObj,["logo",{x:78,y:78},{x:Math.random()*WORLD_X,y:-50},{d:20,f:0.5,r:0.4},false]);
    }
    stage.update();

    //debug
    var debugDraw = new box2d.b2DebugDraw();
    debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
    debugDraw.SetDrawScale(SCALE);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(box2d.b2DebugDraw.e_shapeBit | box2d.b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);
}


//create box
function createObj(id,size,pos,fix,isBox){
    //create bitmap
    var bmp = new createjs.Bitmap(queue.getResult(id));
    //console.log(bmp);
    bmp.regX = size.x/2;
    bmp.regY = size.y/2;
    stage.addChild(bmp);
    //create box
    var fixDef = new box2d.b2FixtureDef();
    fixDef.density = fix.d;
    fixDef.friction = fix.f;
    fixDef.restitution = fix.r;
    var bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_dynamicBody;
    bodyDef.position.x = pos.x / SCALE;
    bodyDef.position.y = pos.y / SCALE;
    //bodyDef.angle = Math.random()*180;
    bodyDef.userData = bmp;
    if(isBox){
        //box
        fixDef.shape = new box2d.b2PolygonShape();
        fixDef.shape.SetAsBox(size.x/2/SCALE,size.y/2/SCALE);
    }else{
        //circle
        var radius = (size.x > size.y)? size.x : size.y;
        fixDef.shape = new box2d.b2CircleShape(radius/2/SCALE);
    }
    world.CreateBody(bodyDef).CreateFixture(fixDef);
}

//ticker
function handleTick(){
    world.Step(1/FPS,8,3);
    //world.DrawDebugData();//debug
    world.ClearForces();
    var body = world.GetBodyList();
    while(body){
        var obj = body.GetUserData();
        if(obj){
            var position = body.GetPosition();
            obj.x = position.x * SCALE;
            obj.y = position.y * SCALE;
            obj.rotation = body.GetAngle() * (180/Math.PI);
            //console.log("id=%s x=%s y=%s",obj.id,obj.x,obj.y);
        }
        body = body.GetNext();
    }

    stage.update();
}
