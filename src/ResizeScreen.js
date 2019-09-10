import React from 'react';

const MAX_IMAGE_DIMENSION = 500;

// We need to set a max size of the outputted image for a couple of reasons:
// 1. It makes moving homer on the image super annoying because of the sheer
//    number of pixels (especially is screen shots from high dpi screens)
// 2. Outputting takes ages (and results in a massive gif)
// 3. Scaling homer to _fit_ on a massive image makes him look terrible
// So we set a max size and scale the src image based on that
function getCalculatedImageHeight(uploadedImg) {
  const { height, width } = uploadedImg;
  if (height < MAX_IMAGE_DIMENSION && width < MAX_IMAGE_DIMENSION) {
    return { imgHeight: height, imgWidth: width };
  }

  const xScaling = width > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / width : 1;
  const yScaling = height > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / height : 1;
  // We want to scale both dimensions evenly, so take the biggest scaling factor
  const maxScaling = Math.min(xScaling, yScaling);
  const newWidth = Math.round(width * maxScaling);
  const newHeight = Math.round(height * maxScaling);

  return { imgWidth: newWidth, imgHeight: newHeight };
}

// Since we'll be scaling homer somewhere between 0 and 100% of the size of the
// input image, we'll need to set his default size based on that. We'll use a
// similar approach to the one above, by finding which dimensions are too large
// and scaling the whole image based on the larger one
function getHomerSize({ imgHeight, imgWidth, firstFrameFromGif }) {
  const { height, width } = firstFrameFromGif;
  if (height < imgHeight && width < imgWidth) {
    return { homerHeight: height, homerWidth: width };
  }

  const xScaling = width > imgWidth ? imgWidth / width : 1;
  const yScaling = height > imgHeight ? imgHeight / height : 1;
  // We want to scale both dimensions evenly, so take the biggest scaling factor
  const maxScaling = Math.min(xScaling, yScaling);
  const newWidth = Math.round(width * maxScaling);
  const newHeight = Math.round(height * maxScaling);

  return { homerWidth: newWidth, homerHeight: newHeight };
}

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
  homerHeight = 0;
  homerWidth = 0;

  componentDidMount() {
    const { uploadedImg, firstFrameFromGif } = this.props;
    const canvas = this.canvasRef.current;
    const { imgHeight, imgWidth } = getCalculatedImageHeight(uploadedImg);
    const { homerHeight, homerWidth } = getHomerSize({ imgHeight, imgWidth, firstFrameFromGif });

    canvas.addEventListener('mousedown', this.startDrag);
    canvas.addEventListener('mousemove', this.updateDrag);
    canvas.addEventListener('mouseup', this.endDrag);
    canvas.addEventListener('mouseleave', this.endDrag);
    canvas.addEventListener('touchstart', this.startDrag);
    canvas.addEventListener('touchend', this.endDrag);
    canvas.addEventListener('touchmove', this.updateDrag);

    this.homerWidth = homerWidth;
    this.homerHeight = homerHeight;

    this.setState({
      canvasHeight: imgHeight,
      canvasWidth: imgWidth
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

  componentDidUpdate() {
    // if rendering causes the canvas to be remounted, we need to redraw it
    this.updateCanvas();
  }

  updateCanvas = homer => {
    const { uploadedImg, firstFrameFromGif } = this.props;
    const { canvasHeight, canvasWidth } = this.state;
    const { homerHeight, homerWidth, zoomLevel } = this;

    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(uploadedImg, 0, 0, canvasWidth, canvasHeight);
    if (firstFrameFromGif) {
      const { imgXOffset, imgYOffset } = this;
      ctx.drawImage(firstFrameFromGif, imgXOffset, imgYOffset, homerWidth * zoomLevel, homerHeight * zoomLevel);
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
    this.zoomLevel = parseFloat(e.target.value);
    this.updateCanvas();
  };

  onReadyClicked = () => {
    const { imgXOffset, imgYOffset, homerHeight, homerWidth, zoomLevel } = this;
    const { canvasWidth, canvasHeight } = this.state;
    this.props.onResizeReady({
      imgXOffset,
      imgYOffset,
      canvasHeight,
      canvasWidth,
      homerHeight: homerHeight * zoomLevel,
      homerWidth: homerWidth * zoomLevel
    });
  };

  render() {
    const { canvasHeight, canvasWidth } = this.state;
    return (
      <div>
        <p>Great! Now drag Homer wherever you want</p>
        <canvas ref={this.canvasRef} height={canvasHeight} width={canvasWidth} className="resizeCanvas"></canvas>
        <p>Zoom Level</p>
        <input type="range" onChange={this.onZoomChange} min="0" max="2" defaultValue={this.zoomLevel} step="0.01" />
        <div style={{ marginTop: '30px' }}>
          <button type="button" className="upload-button" onClick={this.onReadyClicked}>
            Ready!
          </button>
        </div>
      </div>
    );
  }
}
