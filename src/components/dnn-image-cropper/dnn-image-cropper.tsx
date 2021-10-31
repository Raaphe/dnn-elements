import { Component, Host, h, State, Prop, Event, EventEmitter } from '@stencil/core';

/**
 * Allows cropping an image in-browser with the option to enforce a specific final size.
 * All computation happens in the browser and the final image is emmited
 * in an event that has a data-url of the image.
 */
@Component({
  tag: 'dnn-image-cropper',
  styleUrl: 'dnn-image-cropper.scss',
  shadow: true,
})
export class DnnImageCropper {
  /** Sets the desired final image width. */
  @Prop() width: number = 600;

  /** Sets the desired final image height. */
  @Prop() height: number = 600;

  /** Can be used to customize controls text. */
  @Prop() resx: {
    capture: string;
    dragAndDropFile: string;
    or: string;
    takePicture: string;
    uploadFile: string;
  } = {
    capture: "Capture",
    dragAndDropFile: "Drag and drop an image",
    or: "or",
    takePicture: "Take a picture",
    uploadFile: "Upload an image",
  }

  /** Sets the output quality of the corpped image (number between 0 and 1). */
  @Prop() quality: number = 0.8;

  /** When the image crop changes, emits the dataurl for the new cropped image. */
  @Event() imageCropChanged: EventEmitter<string>;

  @State() view: IComponentInterfaces["View"];
  
  private host: HTMLElement;
  private hasPictureView: HTMLDivElement;
  private noPictureView: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private image: HTMLImageElement;
  private crop: HTMLDivElement;

  componentDidLoad() {
    this.setView("noPictureView");
  }

  private setView(newView: IComponentInterfaces["View"]){
    const views = this.host.shadowRoot.querySelectorAll(".view");
    views.forEach(v =>
      v.classList.remove("visible"));
    switch (newView) {
      case "noPictureView":
        this.noPictureView.classList.add("visible");
        break;
      case "hasPictureView":
        this.hasPictureView.classList.add("visible");
        break;
      default:
        break;
    }
    this.view = newView;
  }

  private initCrop(){
    var wantedRatio = this.width / this.height;
    var imageRect = this.image.getBoundingClientRect();
    var imageRatio = imageRect.width / imageRect.height;
    
    if (wantedRatio > imageRatio){
        var wantedHeight = imageRect.width / wantedRatio;
        var diff = imageRect.height - wantedHeight;
        this.crop.style.top = Math.round(diff/2).toString() + "px";
        this.crop.style.height = Math.round(wantedHeight).toString() + "px";
    }
    else{
      var wantedWidth = imageRect.height * wantedRatio;
      var diff = imageRect.width - wantedWidth;
        this.crop.style.left = Math.round(diff/2).toString() + "px";
        this.crop.style.width = Math.round(wantedWidth).toString() + "px";
    }
  }

  private setImage(){
    this.image.src = this.canvas.toDataURL();
    window.requestAnimationFrame(() => {
      this.initCrop();
      this.emitImage();
    });
  }

  private handleNewFile(file: File): void {
    if (file.type.split('/')[0] != "image"){
      return;
    }
    
    var reader = new FileReader();
    reader.onload = readerLoadEvent => {
      var img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        var ctx = this.canvas.getContext("2d");
        ctx.drawImage(img,0,0);
        this.setView("hasPictureView");
        this.setImage();
      }
      img.src = readerLoadEvent.target.result.toString();
    }
    reader.readAsDataURL(file);
  }

  private handleCropMouseDown = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const element = event.target as HTMLElement;
    const className = element.classList[0];

    document.addEventListener("mouseup", this.handleImageCropFinished, false);
    switch (className) {
      case "crop":
        document.addEventListener("mousemove", this.handleCropDrag, false);
        document.addEventListener("mouseup", () => document.removeEventListener("mousemove", this.handleCropDrag));
        break;
      case "nw":
        document.addEventListener("mousemove", this.handleNwMouseMove, false);
        document.addEventListener("mouseup", () => document.removeEventListener("mousemove", this.handleNwMouseMove));
        break;
      case "ne":
        document.addEventListener("mousemove", this.handleNeMouseMove, false);
        document.addEventListener("mouseup", () => document.removeEventListener("mousemove", this.handleNeMouseMove));
        break
      case "se":
        document.addEventListener("mousemove", this.handleSeMouseMove, false);
        document.addEventListener("mouseup", () => document.removeEventListener("mousemove", this.handleSeMouseMove));
        break;
      case "sw":
        document.addEventListener("mousemove", this.handleSwMouseMove, false);
        document.addEventListener("mouseup", () => document.removeEventListener("mousemove", this.handleSwMouseMove));
        break;
      default:
        break;
    }
  };

  private handleImageCropFinished = (_ev: MouseEvent) => {
    this.emitImage();
    document.removeEventListener("mouseup", this.handleImageCropFinished);
  }

  private emitImage() {
    var x = this.crop.offsetLeft / this.image.width * this.image.naturalWidth;
    var y = this.crop.offsetTop / this.image.height * this.image.naturalHeight;

    var cropRect = this.crop.getBoundingClientRect();
    var width = cropRect.width / this.image.width * this.image.naturalWidth;
    var height = cropRect.height / this.image.height * this.image.naturalHeight;

    if (x < 0)
      x = 0;
    if (x > this.image.naturalWidth)
      x = this.image.naturalWidth;
    if (y < 0)
      y = 0;
    if (y > this.image.naturalWidth)
      y = this.image.naturalWidth;
    if (width > this.image.naturalWidth)
      width = this.image.naturalWidth;
    if (height > this.image.naturalHeight)
      height = this.image.naturalHeight;

    var dataUrl = this.generateCroppedImage(x, y, width, height, this.width, this.height);
    this.imageCropChanged.emit(dataUrl);
  }

  private generateCroppedImage(x: number, y: number, width: number, height: number, desiredWidth: number, desiredHeight: number) {
    this.canvas.width = desiredWidth;
    this.canvas.height = desiredHeight;
    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, desiredWidth, desiredHeight);
    context.drawImage(this.image, x, y, width, height, 0, 0, desiredWidth, desiredHeight);

    return this.canvas.toDataURL("image/jpeg", this.quality);
  }

  private handleNwMouseMove = (event: MouseEvent) => {
    let left = 0;
    let top = 0;
    let newWidth = 0;
    let newHeight = 0;
    let orientation: "horizontal" | "vertical" = "horizontal";
    const wantedRatio = this.width / this.height;
    const cropRect = this.crop.getBoundingClientRect();
    const imageRect = this.image.getBoundingClientRect();
    
    if (Math.abs(event.movementX) < Math.abs(event.movementY)){
      orientation = "vertical";
    }

    if (orientation == "horizontal"){
      newWidth = cropRect.width - event.movementX;
      newHeight = newWidth / wantedRatio;
    }
    else{
      newHeight = cropRect.height - event.movementY;
      newWidth = newHeight * wantedRatio;
    }

    const leftOffset = cropRect.width - newWidth;
    left = this.crop.offsetLeft + leftOffset;
    const topOffset = cropRect.height - newHeight;
    top = this.crop.offsetTop + topOffset;

    if (left < 0) left = 0;
    if (left > imageRect.width) left = imageRect.width;
    if (top < 0) top = 0;
    if (top > imageRect.height) top = imageRect.height;
    if (left + newWidth > imageRect.width) newWidth = imageRect.width - left;
    if (top + newHeight > imageRect.height) newHeight = imageRect.height - top;
    this.crop.style.left = left + "px";
    this.crop.style.top = top + "px";
    this.crop.style.width = newWidth + "px";
    this.crop.style.height = newHeight + "px";
  }

  private handleNeMouseMove = (event: MouseEvent) => {
    let left = 0;
    let top = 0;
    let newWidth = 0;
    let newHeight = 0;
    let orientation: "horizontal" | "vertical" = "horizontal";
    const wantedRatio = this.width / this.height;
    const cropRect = this.crop.getBoundingClientRect();
    const imageRect = this.image.getBoundingClientRect();
    
    if (Math.abs(event.movementX) < Math.abs(event.movementY)){
      orientation = "vertical";
    }

    if (orientation == "horizontal"){
      newWidth = cropRect.width + event.movementX;
      newHeight = newWidth / wantedRatio;
    }
    else{
      newHeight = cropRect.height - event.movementY;
      newWidth = newHeight * wantedRatio;
    }

    const topOffset = cropRect.height - newHeight;
    top = this.crop.offsetTop + topOffset;

    if (top < 0) top = 0;
    if (top > imageRect.height) top = imageRect.height;
    if (left + newWidth > imageRect.width) newWidth = imageRect.width - left;
    if (top + newHeight > imageRect.height) newHeight = imageRect.height - top;
    this.crop.style.top = top + "px";
    this.crop.style.width = newWidth + "px";
    this.crop.style.height = newHeight + "px";
  }

  private handleSeMouseMove = (event: MouseEvent) => {
    let left = this.crop.offsetLeft;
    let top = this.crop.offsetTop;
    let newWidth = 0;
    let newHeight = 0;
    let orientation: "horizontal" | "vertical" = "horizontal";
    const wantedRatio = this.width / this.height;
    const cropRect = this.crop.getBoundingClientRect();
    const imageRect = this.image.getBoundingClientRect();
    
    if (Math.abs(event.movementX) < Math.abs(event.movementY)){
      orientation = "vertical";
    }

    if (orientation == "horizontal"){
      newWidth = cropRect.width + event.movementX;
      newHeight = newWidth / wantedRatio;
    }
    else{
      newHeight = cropRect.height + event.movementY;
      newWidth = newHeight * wantedRatio;
    }

    if (top < 0) top = 0;
    if (top > imageRect.height) top = imageRect.height;
    if (left + newWidth > imageRect.width) newWidth = imageRect.width - left;
    if (top + newHeight > imageRect.height) newHeight = imageRect.height - top;
    this.crop.style.top = top + "px";
    this.crop.style.width = newWidth + "px";
    this.crop.style.height = newHeight + "px";
  }

  private handleSwMouseMove = (event: MouseEvent) => {
    let left = 0;
    let top = this.crop.offsetTop;
    let newWidth = 0;
    let newHeight = 0;
    let orientation: "horizontal" | "vertical" = "horizontal";
    const wantedRatio = this.width / this.height;
    const cropRect = this.crop.getBoundingClientRect();
    const imageRect = this.image.getBoundingClientRect();
    
    if (Math.abs(event.movementX) < Math.abs(event.movementY)){
      orientation = "vertical";
    }

    if (orientation == "horizontal"){
      newWidth = cropRect.width - event.movementX;
      newHeight = newWidth / wantedRatio;
    }
    else{
      newHeight = cropRect.height + event.movementY;
      newWidth = newHeight * wantedRatio;
    }

    const leftOffset = cropRect.width - newWidth;
    left = this.crop.offsetLeft + leftOffset;

    if (left < 0) left = 0;
    if (left > imageRect.width) left = imageRect.width;
    if (top < 0) top = 0;
    if (top > imageRect.height) top = imageRect.height;
    if (left + newWidth > imageRect.width) newWidth = imageRect.width - left;
    if (top + newHeight > imageRect.height) newHeight = imageRect.height - top;
    this.crop.style.left = left + "px";
    this.crop.style.top = top + "px";
    this.crop.style.width = newWidth + "px";
    this.crop.style.height = newHeight + "px";
  }

  private handleCropDrag = (ev: MouseEvent) => {
    let newLeft = this.crop.offsetLeft + ev.movementX;
    let newTop = this.crop.offsetTop + ev.movementY;
    var imageRect = this.image.getBoundingClientRect();
    var cropRect = this.crop.getBoundingClientRect();
    if (newLeft < 0){
      newLeft = 0;
    }
    if (newTop < 0){
      newTop = 0;
    }
    if (newLeft + cropRect.width > imageRect.width){
      newLeft = this.crop.offsetLeft;
    }
    if (newTop + cropRect.height > imageRect.height){
      newTop = this.crop.offsetTop;
    }
    this.crop.style.left = newLeft + "px";
    this.crop.style.top = newTop + "px";
  };
  
  render() {
    return (
      <Host ref={el => this.host = el}>
        <canvas ref={el => this.canvas = el} />
        <div
          class="view"
          ref={el => this.hasPictureView = el}
        >
          <div class="cropper">
            <img ref={el => this.image = el} />
            <div class="backdrop" />
            <div
              class="crop"
              ref={e => this.crop = e}
              onMouseDown={this.handleCropMouseDown}
            >
              <div class="nw" />
              <div class="ne" />
              <div class="se" />
              <div class="sw" />
            </div>
          </div>
        </div>
        <div
          class="view"
          ref={el => this.noPictureView = el}>
            <dnn-dropzone
              allowCameraMode
              onFilesSelected={e => this.handleNewFile(e.detail[0])}
              resx={
                {
                  capture: this.resx.capture,
                  dragAndDropFile: this.resx.dragAndDropFile,
                  or: this.resx.or,
                  takePicture: this.resx.takePicture,
                  uploadFile: this.resx.uploadFile,
                }
              }
            />
        </div>
      </Host>
    );
  }
}

interface IComponentInterfaces
{
  View: "noPictureView" | "takingPictureView" | "hasPictureView" | "hasCroppedPictureView";
}