/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const myAction = new Action('com.2beerminimum.kick-streamdeck-tools.action');

function getViewerCountFromJsonUrl(url) {
	return fetch(url)
	  .then(response => {
		if (!response.ok) {
		  throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response.json();
	  })
	  .then(data => {
		if (data.livestream && data.livestream.viewer_count !== undefined) {
		  return data.livestream.viewer_count;
		} else {
		  return null; // .livestream.viewer_count does not exist
		}
	  })
	  .catch(error => {
		console.error('Error:', error);
		return null; // Return null in case of errors
	  });
  }

function doTheViewerCountCheck(context) {

	// Fetch Viewer Count and log it
	// const url = 'http://localhost:8080/2Beer.channel.json';
	const url = 'https://kick.com/api/v2/channels/2Beer';

	getViewerCountFromJsonUrl(url)
	  .then(viewerCount => {
		if (viewerCount !== null) {
		  console.log(`Viewer Count: ${viewerCount}`);
		//   $SD.setTitle(context, `${viewerCount}`);
		  drawCenteredText(viewerCount);
		  
		} else {
		  console.log('Viewer count not found or an error occurred.');
		  drawCenteredText('offline');
		}

		// update the image
		var base64Image = canvasToBase64();
		  $SD.setImage(context, base64Image);
		
		// come back in a minute
		setTimeout(doTheViewerCountCheck, 60000, context);
	  });
}

function initializeCanvas() {
	// Create a canvas element and set it up
	var imageCanvas = document.createElement("canvas");
	imageCanvas.width = 144;
	imageCanvas.height = 144;
	var ctx = imageCanvas.getContext("2d");

	// Set the font and text properties
	ctx.font = "40px Arial"; // You can adjust the font size
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	// Assign the canvas to the window object
	window.imageCanvas = imageCanvas;
}

// Function to draw the centered number
function drawCenteredText(text) {
	var ctx = imageCanvas.getContext("2d");
	
	// Clear the canvas (optional)
	ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  
	// Calculate the center of the canvas
	var centerX = imageCanvas.width / 2;
	var centerY = imageCanvas.height / 2;
  
	// Fill the canvas with a background color (optional)
	ctx.fillStyle = "#00e701"; // Set your desired background color
	ctx.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
  
	// Set the text color
	ctx.fillStyle = "#0b0e0f"; // Set your desired text color
  
	// Draw the number in the center
	ctx.fillText(text.toString(), centerX, centerY);
  }
  
  // Function to convert the canvas to a base64 image
  function canvasToBase64() {
	return window.imageCanvas.toDataURL("image/png");
  }
  
/**
 * The first event fired when Stream Deck starts
 */
$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
	console.log('Stream Deck connected!');

});


myAction.onWillAppear(({ action, context, device, event, payload }) => {
	console.log("We are showing!");
	// initialize some things here / zero out
	initializeCanvas();

	drawCenteredText('offline');

	// Convert the canvas to a base64 encoded image
	var base64Image = canvasToBase64();
	$SD.setImage(context, base64Image);
	
	// Start the automatic updating
	doTheViewerCountCheck(context);
	
});

myAction.onWillDisappear(({ action, context, device, event, payload }) => {
	// stop the automatic updating
});
