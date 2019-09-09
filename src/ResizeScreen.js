import React from 'react';

export default class ResizeScreen extends React.Component {
  static defaultProps = {
    uploadedImg: null,
    firstFrameFromGif: null,
    onResizeReady: () => {}
  };

  state = {
    canvasHeight: 100,
    canvasWidth: 100
  };

  canvasRef = React.createRef();
  firstFrame = null;
  // We start these as instance properties rather than on state because we
  // don't need React to re-render at all, all redering is done by us on the canvas
  isDragging = false;
  imgXOffset = 0;
  imgYOffset = 0;
  zoomLevel = 1;
  dragX = 0;
  dragY = 0;

  componentDidMount() {
    const { uploadedImg } = this.props;

    this.setState({
      canvasHeight: uploadedImg.height,
      canvasWidth: uploadedImg.width
    });
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
      ctx.drawImage(firstFrameFromGif, 0, 0);
    }
  };

  onZoomChange = e => {
    console.log(this.zoomLevel, e.target.value);
  };

  onReadyClicked = () => {
    this.props.onResizeReady();
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
