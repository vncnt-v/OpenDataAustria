// Make scene global
var scene;

function init(){
    // Setup der Scene
    // Ein erstelltes Object muss der Scene hinzugefügt werden um angezeigt zu werden!
    scene = new THREE.Scene();
    // Perspektivische Kamera mit einer Sichtweite von min 0.1 und max 10.000 sowie 50 als Krümmung der Perspektive
    var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 10000);
    camera.position.z = 300;
    camera.lookAt( 0, 0, 0 );
    var renderer =  new THREE.WebGLRenderer({antialias: true});
    // Background
    renderer.setClearColor("#151515");
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);
    // Add Orbit Controls
    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    // Add Light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(0,-1,1);
    scene.add( directionalLight );
    // Update function
    var render = function(){
        controls.update();
        requestAnimationFrame(render);
        renderer.render(scene,camera);
    }
    // Resize function
    window.addEventListener('resize',() => {
        renderer.setSize(window.innerWidth,window.innerHeight);
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
    })
    render();
    // Load Map von Map.js 
    loadMapData();
    // Load Corona Data von CoronaData.js
    loadCoronaData();
}