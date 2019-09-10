import React from 'react';

export default class UploadScreen extends React.Component {
  static defaultProps = {
    onImageUploaded: () => {}
  };

  fileInputRef = React.createRef();

  onFileChange = e => {
    const files = e.target.files;
    if (files.length !== 1) {
      alert('Error: Expected exactly 1 file');
      return;
    }
    if (!files[0].type.startsWith('image/')) {
      alert('Error: Expected an image file');
      return;
    }
    const image = files[0];
    const fileReader = new FileReader();
    fileReader.onload = e => {
      const img = new Image();
      img.onload = () => {
        this.props.onImageUploaded(img);
      };
      img.src = e.target.result;
    };
    fileReader.readAsDataURL(image);
  };

  uploadClicked = () => {
    // We'll use the button click to trigger a click on the hidden file input field
    this.fileInputRef.current.click();
  };

  render() {
    return (
      <div>
        <p>Create a gif of Homer disappearing into things... Because why not?</p>
        <img src="/homer-crop.gif" alt="Homer disappearing" style={{ maxHeight: '40vh' }}></img>
        <p>Upload a background image to begin!</p>
        <button type="button" className="upload-button" onClick={this.uploadClicked}>
          Upload
        </button>
        <input
          type="file"
          id="imageUpload"
          style={{ display: 'none' }}
          ref={this.fileInputRef}
          onChange={this.onFileChange}
        />
      </div>
    );
  }
}
