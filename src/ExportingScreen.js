import React from 'react';
import gifExporter from './gif/gifExporter';

export default class ExportingScreen extends React.Component {
  static defaultProps = {
    uploadedImg: null,
    gifController: null
  };

  state = {
    completionPercentage: 0,
    completedImage: null,
    imgSizeMb: 0
  };

  componentDidMount() {
    const { uploadedImg, gifController } = this.props;
    const numFrames = gifController.get_length();
    const gifCanvas = gifController.get_canvas();
    const gif = new gifExporter({
      workerPath: 'js/Animated_GIF.worker.min.js'
    });
    gif.setSize(uploadedImg.width, uploadedImg.height);
    gif.setDelay(100);
    gifController.pause();
    gif.onRenderProgress(progress => {
      const completionPercentage = (progress * 100).toFixed(2);
      this.setState({ completionPercentage });
    });

    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    tempCanvas.height = uploadedImg.height;
    tempCanvas.width = uploadedImg.width;

    for (let i = 0; i < numFrames; i++) {
      ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      gifController.move_to(i);
      ctx.drawImage(uploadedImg, 0, 0);
      ctx.drawImage(gifCanvas, 0, 0);
      gif.addFrameImageData(
        ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
      );
    }

    gif.getBase64GIF(image => {
      const size = image.length / 1000000; // size of image in mb
      this.setState({ completedImage: image, imgSizeMb: size.toFixed(2) });
    });
  }

  render() {
    const { completedImage, imgSizeMb } = this.state;
    return (
      <div>
        {!completedImage && (
          <p>Exporting: {this.state.completionPercentage}%</p>
        )}
        {completedImage && <p>Done!</p>}
        {completedImage && (
          <img src={completedImage} alt="Disappearing Homer"></img>
        )}
        {completedImage && <p>Size: {imgSizeMb}Mb</p>}
      </div>
    );
  }
}
