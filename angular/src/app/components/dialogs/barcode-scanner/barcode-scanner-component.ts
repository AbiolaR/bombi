import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner-component.html',
  styleUrl: './barcode-scanner-component.scss'
})
export class BarcodeScannerComponent implements OnInit, OnDestroy {
  @Output()
  scannedBarcodeChange: EventEmitter<string> = new EventEmitter<string>();

  isFlashOn: boolean = false;
  isFlashAvailable: boolean = false;
  video: HTMLVideoElement | undefined;
  stream: MediaStream | undefined;
  track: MediaStreamTrack | undefined;  
  reader: BrowserMultiFormatReader | undefined;
  readerProgess: Promise<IScannerControls> | undefined;

  constructor(private dialogRef: MatDialogRef<BarcodeScannerComponent>) { }

  ngOnInit(): void {
    try {
      this.startScan();
    } catch(error) {
      this.close();
    }
  }

  ngOnDestroy(): void {
    this.stream?.getTracks().forEach(track => track.stop());
    this.readerProgess?.then((controls) => controls.stop());
  }

  close() {
    this.dialogRef.close();
  }

  toggleFlash() {
    (this.track as any).applyConstraints({
      advanced: [{ torch: !this.isFlashOn }]
    }).then(() => {
      this.isFlashOn = !this.isFlashOn
    });
  }

  private async startScan() {
    this.video = document.querySelector('video') as HTMLVideoElement;
    this.stream = await (navigator as any).mediaDevices?.getUserMedia(
      { video: { facingMode: "environment", focusMode: "continuous", focusDistance: 0 } }
    ).catch((error: any) => {
      this.close();
      return;
    });

    if (!this.stream) {
      this.close();
      return;
    }
    
    this.track = this.stream?.getVideoTracks()[0];

    try {
      const imageCapture = new (window as any).ImageCapture(this.track as MediaStreamTrack);
      imageCapture.getPhotoCapabilities().then((capabilities: any) => {
        this.isFlashAvailable = capabilities.fillLightMode?.includes('flash');      
      });
    } catch (error) {
    }
    
    this.video.srcObject = this.stream;
    this.video.classList.remove('hidden');
    
    this.reader = new BrowserMultiFormatReader();

    this.readerProgess = this.reader.decodeFromVideoElement(this.video, (result, error) => {
      if (result && this.isIsbn(result.getText())) {
        this.scannedBarcodeChange.emit(result.getText());
        navigator.vibrate(200);
        this.dialogRef.close();
      }
      if (error && !(error.message.includes('No MultiFormat Readers were able to detect the code.'))) {
        if ((window as any).showLogs) console.error(error);
        this.close();
      }
    });
     
  }

  private isIsbn(text: string): boolean {
    text = text.replace(/[-\s]/g, ''); // Remove hyphens and spaces

    if (text.length === 10) {
      return this.isValidIsbn10(text);
    } else if (text.length === 13) {
      return this.isValidIsbn13(text);
    }
    return false;
  }

  private isValidIsbn10(isbn: string): boolean {
    if (!/^\d{9}[\dX]$/.test(isbn)) {
      return false;
    }
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += (i + 1) * parseInt(isbn.charAt(i), 10);
    }
    const checksum = isbn.charAt(9) === 'X' ? 10 : parseInt(isbn.charAt(9), 10);
    sum += 10 * checksum;
    return sum % 11 === 0;
  }

  private isValidIsbn13(isbn: string): boolean {
    if (!/^\d{13}$/.test(isbn)) {
      return false;
    }
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(isbn.charAt(i), 10) * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = parseInt(isbn.charAt(12), 10);
    return (sum + checksum) % 10 === 0;
  }
  

  
}
