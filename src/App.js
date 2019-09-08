import React from 'react';
import gifLoader from './gif/libgif2';
import UploadScreen from './UploadScreen';
import ResizeScreen from './ResizeScreen';
import ExportingScreen from './ExportingScreen';
import './App.css';

const SKIP_UPLOAD_STEP = false;

function loadGifFromUrl(url, callback) {
  var tempImage = document.createElement('img');
  var gif = new gifLoader({ gif: tempImage });
  gif.load_url(url, function() {
    callback(gif);
  });
}

function getFirstFrameFromGif(gifController) {
  const gifCanvas = gifController.get_canvas();
  gifController.pause();
  gifController.move_to(0);

  // Returning the canvas rather than the imageData so that we can use drawImage
  // instead of putImageData, keeping the transparency
  return gifCanvas;
}

export default class App extends React.Component {
  state = {
    curScreen: 'UPLOAD',
    uploadedImg: null,
    homerGifController: null
  };

  firstFrameFromGif = null;

  onImageUploaded = img => {
    this.setState({
      curScreen: 'RESIZE',
      uploadedImg: img
    });
  };

  componentDidMount() {
    // USE THIS TO SKIP UPLOADING IMAGE DURING TESTING
    if (SKIP_UPLOAD_STEP) {
      const img = new Image();
      img.onload = () => {
        this.setState({
          curScreen: 'RESIZE',
          uploadedImg: img
        });
      };
      img.src = '/pizza.jpg';
    }

    loadGifFromUrl('/homer.gif', gifController => {
      this.firstFrameFromGif = getFirstFrameFromGif(gifController);
      this.setState({ homerGifController: gifController });
    });
  }

  onResizeReady = () => {
    this.setState({ curScreen: 'EXPORTING' });
  };

  render() {
    const { curScreen, uploadedImg, homerGifController } = this.state;
    const { firstFrameFromGif } = this;

    return (
      <div className="app">
        <div className="title">
          <h1>Disappearing Homer</h1>
          <h1>Gif Generator</h1>
        </div>
        <div className="content">
          {curScreen === 'UPLOAD' && (
            <UploadScreen onImageUploaded={this.onImageUploaded} />
          )}
          {curScreen === 'RESIZE' && (
            <ResizeScreen
              uploadedImg={uploadedImg}
              firstFrameFromGif={firstFrameFromGif}
              onResizeReady={this.onResizeReady}
            />
          )}
          {curScreen === 'EXPORTING' && (
            <ExportingScreen
              uploadedImg={uploadedImg}
              gifController={homerGifController}
            />
          )}
        </div>
      </div>
    );
  }
}
