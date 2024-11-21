import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

let camera, cameraTarget, scene, renderer, controls, clock, mixer, clip;

init();

async function init(){

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( animate );
	document.body.appendChild( renderer.domElement );

	clock = new THREE.Clock();
	window.addEventListener('resize', onWindowResize);

	controls = new OrbitControls( camera, renderer.domElement );

	scene.add( new THREE.HemisphereLight( 0x8d7c7c, 0x494966, 3 ) );

	const animationGroup = new THREE.AnimationObjectGroup();

	const file_loader = new THREE.FileLoader();
	await file_loader.loadAsync('model.json').then( async function (response) {
		const data = await JSON.parse(response);

		const models = data["models"];
		for (const [name, filename] of Object.entries(models)) {
			const stl_loader = new STLLoader();
			await stl_loader.loadAsync(filename).then( (geometry) => {
						const material = new THREE.MeshPhongMaterial( { color: 0xff9c7c, specular: 0x494949, shininess: 200 } );
						const mesh = new THREE.Mesh( geometry, material );
						mesh.name = name;
						mesh.castShadow = true;
						mesh.receiveShadow = true;
						animationGroup.add( mesh );
						scene.add(mesh);
					});
			mixer = new THREE.AnimationMixer( animationGroup );
			const animations = data["animations"];
			clip = await THREE.AnimationClip.parse(animations);
		};
	});

	addShadowedLight( 1, 1, 1, 0xffffff, 3.5 );
	addShadowedLight( 0.5, 1, - 1, 0xffffff, 3 );

	camera.position.z = 200;
	controls.update();

	const clipAction = await mixer.clipAction(clip);
	clipAction.play();
}

function addShadowedLight( x, y, z, color, intensity ) {

	const directionalLight = new THREE.DirectionalLight( color, intensity );
	directionalLight.position.set( x, y, z );
	scene.add( directionalLight );

	directionalLight.castShadow = true;

	const d = 1;
	directionalLight.shadow.camera.left = - d;
	directionalLight.shadow.camera.right = d;
	directionalLight.shadow.camera.top = d;
	directionalLight.shadow.camera.bottom = - d;

	directionalLight.shadow.camera.near = 1;
	directionalLight.shadow.camera.far = 4;

	directionalLight.shadow.bias = - 0.002;

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function render() {
	renderer.render( scene, camera );
}

function animate() {

	const delta = clock.getDelta();

	if ( mixer ) {
		mixer.update( delta );

	}

	controls.update();
	render();

}