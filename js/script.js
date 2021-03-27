(function () {
	var carousel = document.querySelector('.carousel');
	var background = document.querySelector('#background');
	var entries = [{
		handle: 'Tiger Mask',
		url: 'https://crejo.fun',
		entry: './assets/tiger-jaw-mask.png',
		background: 'hsl(35, 60 %, 50 %)', // bg color when only mask is displayed. 
	}];

	var videoFormats = ['mov', 'm4v', 'mp4'];
	// var imageFormats = ['png', 'jpg'];
	var assets = [];

	for (var i = 0; i < entries.length; i++) {
		var obj = entries[i];
		var el;
		//console.log(videoFormats.indexOf(obj.entry.split('.')[2]), obj.entry.split('.')[2])
		//-1, "png"
		if (videoFormats.indexOf(obj.entry.split('.')[2]) > -1) {
			el = document.createElement('video');
			el.setAttribute('playsinline', true);
			el.setAttribute('loop', true);
			el.setAttribute('muted', true);
			el.setAttribute('autoplay', true);
			el.setAttribute('preload', 'auto');
			assets.push(new Promise(res => {
				el.onloadeddata = res;
			}));
		} else {
			el = document.createElement('img');
			assets.push(new Promise(res => {
				el.onload = res;
			}));
		}
		el.src = obj.entry;
		el.classList.add('texture');
		el.setAttribute('id', obj.handle)
		carousel.appendChild(el);
	}

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
			// await Promise.all(assets);

			renderPredictions();
		} catch (e) {
			alert(e);
			console.error(e);
		}
	}
	tf.env().set('WEBGL_CPU_FORWARD', false);
	main();
})();
