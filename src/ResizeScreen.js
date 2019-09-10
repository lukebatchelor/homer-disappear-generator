import React from 'react';
import { MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT } from './constants';

// We need to
function getOutputImageSize({ uploadedImg, firstFrameFromGif }) {}

export default class ResizeScreen extends React.Component {
  static defaultProps = {
    uploadedImg: null,
    firstFrameFromGif: null,
    onResizeReady: () => {}
  };

  state = {
    // canvas height and wdith will become the outputted image's dimensions
    // if the uploaded image is larger than MAX_IMAGE_WIDTH or MAX_IMAGE_HEIGHT
    // the the canvas will be scaled down (keeping its aspect ratio) until it is
    // smaller
    canvasHeight: 0,
    canvasWidth: 0
  };

  canvasRef = React.createRef();
  firstFrame = null;
  // We store these as instance properties rather than on state because we
  // don't need React to re-render at all, all redering is done by us on the canvas
  isDragging = false;
  imgXOffset = 0;
  imgYOffset = 0;
  zoomLevel = 1;
  dragX = 0;
  dragY = 0;

  componentDidMount() {
    const { uploadedImg } = this.props;
    const canvas = this.canvasRef.current;
    const { height: imgHeight, width: imgWidth } = uploadedImg;
    const { height: canvasHeight, width: canvasWidth } = canvas;

    canvas.addEventListener('mousedown', this.startDrag);
    canvas.addEventListener('mousemove', this.updateDrag);
    canvas.addEventListener('mouseup', this.endDrag);
    canvas.addEventListener('mouseleave', this.endDrag);
    canvas.addEventListener('touchstart', this.startDrag);
    canvas.addEventListener('touchend', this.endDrag);
    canvas.addEventListener('touchmove', this.updateDrag);

    this.setState({
      canvasHeight: uploadedImg.height,
      canvasWidth: uploadedImg.width
    });
  }

  componentWillUnmount() {
    const canvas = this.canvasRef.current;
    canvas.removeEventListener('mousedown', this.startDrag);
    canvas.removeEventListener('mousemove', this.updateDrag);
    canvas.removeEventListener('mouseup', this.endDrag);
    canvas.removeEventListener('mouseleave', this.endDrag);
    canvas.removeEventListener('touchstart', this.startDrag);
    canvas.removeEventListener('touchend', this.endDrag);
    canvas.removeEventListener('touchmove', this.updateDrag);
  }

  componentDidUpdate(prevProps) {
    // if rendering causes the canvas to be remounted, we need to redraw it
    this.updateCanvas();
  }

  updateCanvas = homer => {
    const { uploadedImg, firstFrameFromGif } = this.props;

    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(uploadedImg, 0, 0);
    if (firstFrameFromGif) {
      const { imgXOffset, imgYOffset } = this;
      ctx.drawImage(firstFrameFromGif, imgXOffset, imgYOffset);
    }
  };

  startDrag = e => {
    this.isDragging = true;

    if (e.touches) {
      this.dragX = e.touches[0].clientX;
      this.dragY = e.touches[0].clientY;
    } else {
      this.dragX = e.offsetX;
      this.dragY = e.offsetY;
    }
  };

  updateDrag = e => {
    if (this.isDragging) {
      let newX = e.offsetX;
      let newY = e.offsetY;
      if (e.touches) {
        newX = e.touches[0].clientX;
        newY = e.touches[0].clientY;
      }

      this.imgXOffset -= this.dragX - newX;
      this.imgYOffset -= this.dragY - newY;
      this.dragX = newX;
      this.dragY = newY;

      this.updateCanvas();
    }
  };

  endDrag = e => {
    this.isDragging = false;
  };

  onZoomChange = e => {
    console.log(this.zoomLevel, e.target.value);
  };

  onReadyClicked = () => {
    const { imgXOffset, imgYOffset } = this;
    this.props.onResizeReady({ imgXOffset, imgYOffset });
  };

  render() {
    const { canvasHeight, canvasWidth } = this.state;
    return (
      <div>
        <canvas
          ref={this.canvasRef}
          height={canvasHeight}
          width={canvasWidth}
          className="resizeCanvas"
        ></canvas>
        <p>Zoom Level</p>
        <input
          type="range"
          onChange={this.onZoomChange}
          min="0"
          max="1"
          defaultValue={this.zoomLevel}
          step="0.01"
        />
        <div style={{ marginTop: '30px' }}>
          <button
            type="button"
            className="upload-button"
            onClick={this.onReadyClicked}
          >
            Ready!
          </button>
        </div>
      </div>
    );
  }
}
