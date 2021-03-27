(function () {
	var carousel = document.querySelector('.carousel');
	var background = document.querySelector('#background');
	var entries = [{
		handle: 'Tiger Mask',
		url: 'https://crejo.fun',
		entry: './assets/tiger-jaw-mask.png',
		background: 'hsl(35, 60 %, 50 %)', // bg color when only mask is displayed. 
	}];


	const toggleBtn = document.querySelector('#visibilityToggle');
	const toggleBtnLabel = document.querySelector('#visibilityToggle > span');

	function toggleWebcamVisibility(e) {
		toggleBtn.classList.toggle('on');
		webcam.classList.toggle('visible');
		if (toggleBtn.classList.contains('on')) {
			toggleBtnLabel.textContent = 'Webcam visible';
		} else {
			toggleBtnLabel.textContent = 'Webcam hidden';
		}
	}
	toggleBtn.addEventListener('click', toggleWebcamVisibility);
	const webcam = document.querySelector('#webcam');
	let model, faceCanvas, w, h;
	const loaderMsg = document.querySelector('#loaderMsg');


	async function renderPredictions(t) {
		requestAnimationFrame(renderPredictions);
		const predictions = await model.estimateFaces(webcam);

		if (predictions.length > 0) {
			const positionBufferData = predictions[0].scaledMesh.reduce((acc, pos) => acc.concat(pos), []);
			// console.log('[positionBufferData]', positionBufferData) 
			// flattened `predictions.scaledMesh` of len (468keypoints * 3coords) = `1404`

			if (!faceCanvas) {
				const props = {
					id: 'faceCanvas', // `id` of `canvas element`
					textureFilePath: entries[0].entry, // image to be displayed
					w,
					h
				}
				faceCanvas = new FacePaint(props);
				return;
			}
			faceCanvas.render(positionBufferData);
		}
	}
	async function main() {
		try {
			//loaderMsg.textContent = 'Load webcam';
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: false
			});
			webcam.srcObject = stream; // `video` tag
			await new Promise(function (res) {
				webcam.onloadedmetadata = function () {
					w = webcam.videoWidth;
					h = webcam.videoHeight;
					res();
				}
			});

			webcam.height = h;
			webcam.width = w;
			webcam.setAttribute('autoplay', true);
			webcam.setAttribute('muted', true);
			webcam.setAttribute('playsinline', true);
			webcam.play();
			//loaderMsg.textContent = 'Load model';
			// Load the MediaPipe facemesh model.
			model = await facemesh.load({
				maxContinuousChecks: 5,
				detectionConfidence: 0.9,
				maxFaces: 1,
				iouThreshold: 0.3,
				scoreThreshold: 0.75
			});

			//loaderMsg.textContent = 'Load media';

			renderPredictions();
		} catch (e) {
			alert(e);
			console.error(e);
		}
	}
	tf.env().set('WEBGL_CPU_FORWARD', false);
	main();
})();
