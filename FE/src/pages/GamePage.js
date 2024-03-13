import * as THREE from 'three';
import { FontLoader } from '../../node_modules/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from '../../node_modules/three/examples/jsm/geometries/TextGeometry.js';

import { changeUrl } from '../index.js';

const html = String.raw;

class GamePage {
	template() {
		return html`
			<div
				id="score"
				style="
					display: flex;
					justify-content: center;
					color: white;
					font-size: 48px;
					margin: 10px;
					"
			>
				<div class="player1 score" style="margin-right: 40px">0</div>
				<div>:</div>
				<div class="player2 score" style="margin-left: 40px">0</div>
			</div>
			<div
				class="game-container"
				style="display: flex; justify-content: center"
			></div>
			<div class="result" style="display: flex; justify-content: center"></div>
			<button class="return-button" style="margin: 30px">Return</button>
		`;
	}

	addEventListeners() {
		// const INIT_BALL_SPEED = 0.05;
		// const REFLECT_SPEED = 0.1;
		// const PADDLE_SPEED = 0.07;
		// const WIN_SCORE = '10';

		// // get score element with querySelector
		// const player1Score = document.querySelector('.player1');
		// const player2Score = document.querySelector('.player2');

		// Create a scene
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x141343);

		// Create a camera
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		// Create a renderer
		const renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		renderer.setSize(window.innerWidth / 1.8, window.innerHeight / 1.8);

		// Append the renderer to the game-container
		const gameContainer = document.querySelector('.game-container');
		gameContainer.appendChild(renderer.domElement);

		// create a pong board
		const board = new THREE.BoxGeometry(6, 4, 0.1);
		const edges = new THREE.EdgesGeometry(board);
		const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
		const line = new THREE.LineSegments(edges, lineMaterial);
		const plane = new THREE.PlaneGeometry(6, 4);
		const planeMaterial = new THREE.MeshPhysicalMaterial({
			color: 0x000000,
			metalness: 0.5,
			roughness: 0.5,
			clearcoat: 1,
			clearcoatRoughness: 0.5,
			side: THREE.DoubleSide
		});
		const planeMesh = new THREE.Mesh(plane, planeMaterial);
		planeMesh.position.z = -0.05;
		scene.add(planeMesh);
		scene.add(line);

		// Create a middle line
		const lineDashedMaterial = new THREE.LineDashedMaterial({
			color: 0xffffff,
			dashSize: 0.1,
			gapSize: 0.1
		});
		const points = [];
		points.push(new THREE.Vector3(0, 2, 0));
		points.push(new THREE.Vector3(0, -2, 0));

		const lineDashed = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints(points),
			lineDashedMaterial
		);
		lineDashed.computeLineDistances();
		scene.add(lineDashed);

		// Create a ball
		const ball = new THREE.SphereGeometry(0.04, 32, 32);
		const ballMaterial = new THREE.MeshPhysicalMaterial({
			color: 0xffffff,
			metalness: 0.5,
			roughness: 0.5,
			clearcoat: 1,
			clearcoatRoughness: 0.5,
			side: THREE.DoubleSide,
			emissive: 0xffff00,
			emissiveIntensity: 0.5
		});
		const ballMesh = new THREE.Mesh(ball, ballMaterial);
		scene.add(ballMesh);

		// Create a light emitting from the ball
		const ballLight = new THREE.PointLight(0xffff00, 0.5, 100);
		ballLight.position.set(0, 0, 0);
		scene.add(ballLight);

		// Create a paddle
		const paddle = new THREE.BoxGeometry(0.1, 0.5, 0.1);
		const paddleMaterial = new THREE.MeshPhysicalMaterial({
			color: 0xffffff,
			metalness: 0.5,
			roughness: 0.5,
			clearcoat: 1,
			clearcoatRoughness: 0.5,
			emissive: 0x0000ff,
			emissiveIntensity: 0.5,
			side: THREE.DoubleSide
		});
		const paddleMesh1 = new THREE.Mesh(paddle, paddleMaterial);
		scene.add(paddleMesh1);

		// Create a paddle
		const paddleMesh2 = new THREE.Mesh(paddle, paddleMaterial);
		scene.add(paddleMesh2);

		// Create lights for the paddles
		const paddleLightGroup1 = new THREE.Group();
		const paddleLightGroup2 = new THREE.Group();

		for (
			let i = paddleMesh1.position.y - 0.25;
			i <= paddleMesh1.position.y + 0.25;
			i += 0.1
		) {
			const paddleLight = new THREE.PointLight(0x0000ff, 0.1, 100);
			paddleLight.position.set(-2.8, i, 0.2);
			paddleLightGroup1.add(paddleLight);
		}

		for (
			let i = paddleMesh2.position.y - 0.25;
			i <= paddleMesh2.position.y + 0.25;
			i += 0.1
		) {
			const paddleLight = new THREE.PointLight(0x0000ff, 0.1, 100);
			paddleLight.position.set(2.8, i, 0.2);
			paddleLightGroup2.add(paddleLight);
		}

		scene.add(paddleLightGroup1);
		scene.add(paddleLightGroup2);

		// Set the position of the ball
		ballMesh.position.x = 0;
		ballMesh.position.y = 0;
		ballMesh.position.z = -0.01;

		// Set the position of the paddle
		paddleMesh1.position.x = -2.8;

		// Set the position of the paddle
		paddleMesh2.position.x = 2.8;

		// Create a ambientLight
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);

		// Create a pointLight
		const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
		pointLight.position.set(0, 0, 1);
		scene.add(pointLight);

		// Set the camera position
		camera.position.z = 3;

		// // Set the ball movement
		// // seed from PI / 2 to 3 * PI / 2
		// let ballSpeed = 0;
		// let seed = Math.PI * (3 / 4) + (Math.random() * Math.PI) / 2;
		// const direction = new THREE.Vector3(
		// 	Math.cos(seed) * ballSpeed,
		// 	Math.sin(seed) * ballSpeed,
		// 	0
		// );

		// // Set the paddle movement
		// // mesh1 moves key W and S
		// // mesh2 moves key UP and DOWN
		// const paddleSpeed = PADDLE_SPEED;
		// const keyDownList = new Set();

		// document.addEventListener('keydown', (event) => {
		// 	if (event.code === 'KeyW') {
		// 		keyDownList.add('w');
		// 	}
		// 	if (event.code === 'KeyS') {
		// 		keyDownList.add('s');
		// 	}
		// 	if (event.code === 'ArrowUp') {
		// 		keyDownList.add('ArrowUp');
		// 	}
		// 	if (event.code === 'ArrowDown') {
		// 		keyDownList.add('ArrowDown');
		// 	}
		// });

		// document.addEventListener('keyup', (event) => {
		// 	if (event.code === 'KeyW') {
		// 		keyDownList.delete('w');
		// 	}
		// 	if (event.code === 'KeyS') {
		// 		keyDownList.delete('s');
		// 	}
		// 	if (event.code === 'ArrowUp') {
		// 		keyDownList.delete('ArrowUp');
		// 	}
		// 	if (event.code === 'ArrowDown') {
		// 		keyDownList.delete('ArrowDown');
		// 	}
		// });

		// // Set the ball reflection
		// const reflect = (axis) => {
		// 	direction[axis] *= -1;
		// };

		// // Set the ball reflection from the paddle
		// const calculateReflection = (paddleMesh) => {
		// 	const paddleY = paddleMesh.position.y;
		// 	const ballY = ballMesh.position.y;
		// 	const relativeIntersectY = ballY - paddleY;
		// 	const normalizedRelativeIntersectionY =
		// 		relativeIntersectY / (paddleMesh.geometry.parameters.height / 2);
		// 	const bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 2.5);
		// 	return bounceAngle;
		// };

		// Load a font for ready text
		const fontLoader = new FontLoader();

		fontLoader.load('fonts/esamanru_medium.typeface.json', (font) => {
			const textGeometry = new TextGeometry('Ready', {
				font,
				size: 0.4,
				height: 0.1,
				curveSegments: 12,
				bevelEnabled: true,
				bevelThickness: 0.03,
				bevelSize: 0.01,
				bevelOffset: 0,
				bevelSegments: 1
			});
			const textMaterial = new THREE.MeshPhysicalMaterial({
				color: 0xffffff,
				metalness: 0.5,
				roughness: 0.5,
				clearcoat: 1,
				clearcoatRoughness: 0.5,
				emissive: 0xff00ff,
				emissiveIntensity: 0.5
			});
			const textMesh = new THREE.Mesh(textGeometry, textMaterial);
			textMesh.visible = false;
			textMesh.position.x = -0.96;
			textMesh.position.y = -0.13;
			textMesh.position.z = 0.5;
			scene.add(textMesh);
		});

		let frame = 0;
		// let winner = 0;

		// // Create an animation
		// const animate = () => {
		// 	frame += 2;

		// 	if (winner === 1) {
		// 		camera.lookAt(paddleMesh1.position);
		// 	}
		// 	if (winner === 2) {
		// 		camera.lookAt(paddleMesh2.position);
		// 	}

		// 	// Camera movement
		// 	if (frame < 200) {
		// 		camera.position.x = -4;
		// 		camera.position.y = -1 + (frame / 200) * 2;
		// 		camera.lookAt(paddleMesh1.position);
		// 	}
		// 	if (frame >= 200 && frame < 400) {
		// 		camera.position.x = 4;
		// 		camera.position.y = 1 - ((frame - 200) / 200) * 2;
		// 		camera.lookAt(paddleMesh2.position);
		// 	}
		// 	if (frame >= 400 && frame <= 600) {
		// 		camera.position.x = 0;
		// 		camera.position.y = 0;
		// 		camera.position.z =
		// 			2.5 +
		// 			Math.sin((3 / 2) * Math.PI + ((frame - 400) / 200) * Math.PI) *
		// 				(1 / 2);
		// 		camera.lookAt(0, 0, 0);
		// 		if (frame === 400) {
		// 			scene.children[scene.children.length - 1].visible = true;
		// 		}
		// 		if (frame >= 550 && frame < 600 && frame % 8 === 0) {
		// 			scene.children[scene.children.length - 1].visible =
		// 				!scene.children[scene.children.length - 1].visible;
		// 		}
		// 		if (frame === 600) {
		// 			scene.children[scene.children.length - 1].visible = false;
		// 			ballSpeed = INIT_BALL_SPEED;
		// 			direction.x = Math.cos(seed) * ballSpeed;
		// 			direction.y = Math.sin(seed) * ballSpeed;
		// 		}
		// 	}

		// 	// Ball movement
		// 	ballMesh.position.add(direction);
		// 	ballLight.position.copy(ballMesh.position);

		// 	// Ball reflection
		// 	if (ballMesh.position.y <= -2 || ballMesh.position.y >= 2) {
		// 		reflect('y');
		// 	}

		// 	if (ballMesh.position.x <= -3 || ballMesh.position.x >= 3) {
		// 		seed = Math.PI * (3 / 4) + (Math.random() * Math.PI) / 2;
		// 		ballSpeed = INIT_BALL_SPEED;
		// 		direction.x = Math.cos(seed) * ballSpeed;
		// 		direction.y = Math.sin(seed) * ballSpeed;
		// 		if (ballMesh.position.x <= -3) {
		// 			player2Score.textContent = Number(player2Score.textContent) + 1;
		// 		}
		// 		if (ballMesh.position.x >= 3) {
		// 			player1Score.textContent = Number(player1Score.textContent) + 1;
		// 			direction.x *= -1;
		// 		}
		// 		ballMesh.position.x = 0;
		// 		ballMesh.position.y = 0;

		// 		if (
		// 			player1Score.textContent === WIN_SCORE ||
		// 			player2Score.textContent === WIN_SCORE
		// 		) {
		// 			ballSpeed = 0;
		// 			direction.x = Math.cos(seed) * ballSpeed;
		// 			direction.y = Math.sin(seed) * ballSpeed;

		// 			// print winner
		// 			const result = document.querySelector('.result');
		// 			const winnerContainer = document.createElement('div');
		// 			winnerContainer.style =
		// 				'color: white; font-size: 2rem; margin: 10px;';
		// 			if (player1Score.textContent === WIN_SCORE) {
		// 				winnerContainer.textContent = 'Player 1 wins!';
		// 				camera.position.x = -4;
		// 				camera.position.z = 3;
		// 				winner = 1;
		// 			}
		// 			if (player2Score.textContent === WIN_SCORE) {
		// 				winnerContainer.textContent = 'Player 2 wins!';
		// 				camera.position.x = 4;
		// 				camera.position.z = 3;
		// 				winner = 2;
		// 			}
		// 			result.appendChild(winnerContainer);
		// 		}
		// 	}

		// 	// Ball reflection on paddle
		// 	if (
		// 		ballMesh.position.x <= -2.7 &&
		// 		ballMesh.position.x >= -2.8 &&
		// 		ballMesh.position.y <= paddleMesh1.position.y + 0.25 &&
		// 		ballMesh.position.y >= paddleMesh1.position.y - 0.25 &&
		// 		direction.x < 0
		// 	) {
		// 		const angle = calculateReflection(paddleMesh1);
		// 		ballSpeed = REFLECT_SPEED;
		// 		direction.x = Math.cos(angle) * ballSpeed;
		// 		direction.y = Math.sin(angle) * ballSpeed;
		// 	}
		// 	if (
		// 		ballMesh.position.x >= 2.7 &&
		// 		ballMesh.position.x <= 2.8 &&
		// 		ballMesh.position.y <= paddleMesh2.position.y + 0.25 &&
		// 		ballMesh.position.y >= paddleMesh2.position.y - 0.25 &&
		// 		direction.x > 0
		// 	) {
		// 		const angle = calculateReflection(paddleMesh2);
		// 		ballSpeed = REFLECT_SPEED;
		// 		direction.x = Math.cos(angle) * ballSpeed * -1;
		// 		direction.y = Math.sin(angle) * ballSpeed;
		// 	}

		// 	// Paddle movement
		// 	if (keyDownList.has('w')) {
		// 		if (paddleMesh1.position.y < 1.75) {
		// 			paddleMesh1.position.y += paddleSpeed;
		// 			paddleLightGroup1.position.y += paddleSpeed;
		// 		}
		// 	}
		// 	if (keyDownList.has('s')) {
		// 		if (paddleMesh1.position.y > -1.75) {
		// 			paddleMesh1.position.y -= paddleSpeed;
		// 			paddleLightGroup1.position.y -= paddleSpeed;
		// 		}
		// 	}
		// 	if (keyDownList.has('ArrowUp')) {
		// 		if (paddleMesh2.position.y < 1.75) {
		// 			paddleMesh2.position.y += paddleSpeed;
		// 			paddleLightGroup2.position.y += paddleSpeed;
		// 		}
		// 	}
		// 	if (keyDownList.has('ArrowDown')) {
		// 		if (paddleMesh2.position.y > -1.75) {
		// 			paddleMesh2.position.y -= paddleSpeed;
		// 			paddleLightGroup2.position.y -= paddleSpeed;
		// 		}
		// 	}

		// 	renderer.render(scene, camera);

		// 	requestAnimationFrame(animate);
		// };

		// animate();

		renderer.render(scene, camera);

		// Resize the window
		window.addEventListener('resize', () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(window.innerWidth / 1.8, window.innerHeight / 1.8);
		});

		// -------------------------------------------------------------------------------------------------------------------------
		// websocket 통신

		const websocket = new WebSocket('ws://localhost:8000/ws/game-server/');

		function isOpen(ws) {
			return ws.readyState === ws.OPEN;
		}

		websocket.onclose = () => {
			console.log('Disconnected from server');
		};

		websocket.onerror = (error) => {
			console.log(`Error: ${error}`);
		};

		// 게임 서버로 게임 초기 정보 전송
		function sendGameSessionInfo() {
			const message = {
				type: 'game',
				subtype: 'session_info',
				message: '',
				data: {
					battle_mode: 1,
					total_score: 4,
					level: 2,
					color: {
						paddle: '#FFFFFF',
						background: '#FFFFFF'
					}
				}
			};
			websocket.send(JSON.stringify(message));
		}

		// 게임 서버로 매치 시작 요청 전송
		function sendGameStartRequest() {
			const message = {
				type: 'game',
				subtype: 'match_start',
				message: 'go!',
				data: '',
				match_id: 123
			};
			websocket.send(JSON.stringify(message));
		}

		const player1Score = document.querySelector('.player1');
		const player2Score = document.querySelector('.player2');

		// 화면 렌더링
		function renderThreeJs(data) {
			frame += 2;

			// if (winner === 1) {
			// 	camera.lookAt(paddleMesh1.position);
			// }
			// if (winner === 2) {
			// 	camera.lookAt(paddleMesh2.position);
			// }

			// Camera movement
			if (frame < 200) {
				camera.position.x = -4;
				camera.position.y = -1 + (frame / 200) * 2;
				camera.lookAt(paddleMesh1.position);
			}
			if (frame >= 200 && frame < 400) {
				camera.position.x = 4;
				camera.position.y = 1 - ((frame - 200) / 200) * 2;
				camera.lookAt(paddleMesh2.position);
			}
			if (frame >= 400 && frame <= 600) {
				camera.position.x = 0;
				camera.position.y = 0;
				camera.position.z =
					2.5 +
					Math.sin((3 / 2) * Math.PI + ((frame - 400) / 200) * Math.PI) *
						(1 / 2);
				camera.lookAt(0, 0, 0);
				if (frame === 400) {
					scene.children[scene.children.length - 1].visible = true;
				}
				if (frame >= 550 && frame < 600 && frame % 8 === 0) {
					scene.children[scene.children.length - 1].visible =
						!scene.children[scene.children.length - 1].visible;
				}
				if (frame === 600) {
					scene.children[scene.children.length - 1].visible = false;
					// ballSpeed = INIT_BALL_SPEED;
					// direction.x = Math.cos(seed) * ballSpeed;
					// direction.y = Math.sin(seed) * ballSpeed;
				}
			}

			// object destructuring
			const { ball: ballData, paddle1, paddle2, score } = data;

			ballMesh.position.x = ballData.x;
			ballMesh.position.y = ballData.y;
			paddleMesh1.position.y = paddle1.y;
			paddleLightGroup1.position.y = paddle1.y;
			paddleMesh2.position.y = paddle2.y;
			paddleLightGroup2.position.y = paddle2.y;

			player1Score.textContent = score.player1;
			player2Score.textContent = score.player2;

			ballLight.position.copy(ballMesh.position);

			renderer.render(scene, camera);
		}

		// 사용자 키 입력 이벤트리스너 등록

		const keyDownList = new Set();
		document.addEventListener('keydown', (event) => {
			if (isOpen(websocket)) {
				let isChange = false;

				if (
					['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'].includes(event.code) &&
					!keyDownList.has(event.code)
				) {
					keyDownList.add(event.code);
					isChange = true;
				}

				if (isChange) {
					const message = JSON.stringify({
						type: 'game',
						subtype: 'key_down',
						message: 'key!',
						match_id: 1,
						data: {
							key_set: Array.from(keyDownList)
						}
					});
					websocket.send(message);
				}
			}
		});

		document.addEventListener('keyup', (event) => {
			if (isOpen(websocket)) {
				let isChange = false;

				if (keyDownList.has(event.code)) {
					keyDownList.delete(event.code);
					isChange = true;
				}

				if (isChange) {
					const message = JSON.stringify({
						type: 'game',
						subtype: 'key_down',
						message: 'key!',
						match_id: 1,
						data: {
							key_set: Array.from(keyDownList)
						}
					});
					websocket.send(message);
				}
			}
		});

		async function receiveMessages() {
			websocket.onmessage = (event) => {
				const message = JSON.parse(event.data);
				switch (message.type) {
					case 'connection_established':
						sendGameSessionInfo();
						break;

					case 'game':
						if (message.subtype === 'match_init_setting') {
							sendGameStartRequest();
						} else if (message.subtype === 'match_run') {
							renderThreeJs(message.data);
						} else if (message.subtype === 'match_end') {
							console.log('match_end');
							const disconnectMessage = {
								type: 'disconnect',
								message: 'plz!'
							};
							player1Score.textContent = message.data.player1.score;
							player2Score.textContent = message.data.player2.score;
							websocket.send(JSON.stringify(disconnectMessage));
						}
						break;

					default:
						console.log('default');
						break;
				}
			};
		}

		websocket.onopen = () => {
			console.log('Connected to server');
			Promise.all([receiveMessages()]);
		};

		// -------------------------------------------------------------------------------------------------------------------------
		// Return to the main page
		const returnButton = document.querySelector('.return-button');
		returnButton.addEventListener('click', () => {
			changeUrl('');
		});
	}
}

export default new GamePage();
