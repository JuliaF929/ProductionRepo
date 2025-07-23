import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Item } from './models/item.model';
import { ItemListComponent } from './components/item-list/item-list.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [CommonModule, NgForOf, NgIf, FormsModule, HttpClientModule, ItemListComponent]
})
export class App {
  constructor(public sanitizer: DomSanitizer) {}

  pdfViewerUrl = '/assets/pdfjs/web/viewer.html?file=/assets/pdfjs/reports/testPDF.pdf';
  selectedPdf: string | null = null; // PDF URL to display

  //@Output() itemCreated = new EventEmitter<Item>();

  // items = [
  //   { sn: '001', type: 'Type A' },
  //   { sn: '002', type: 'Type B' },
  //   { sn: '003', type: 'Type C' },
  // ];


  selectedItem: Item | null = null;

  onItemSelected(item: Item) {
    this.selectedItem = item;
    console.log('Parent received selected item:', item);
  }

  formItem = { SerialNumber: '', Type: '' };

  dynamicActions: {
    label: string;
    status: 'pass' | 'fail' | 'not-started';
    reportUrl?: string;
    date?: Date;
    executedBy?: string;
    handler: () => void;
  }[] = [];

  addNewItem() {
    console.log('addNewItem');
    this.formItem = { SerialNumber: '', Type: '' };
    this.selectedItem = null;
    this.dynamicActions = [];
    this.selectedPdf = null;
  }

  selectItem(item: any) {
    this.selectedItem = item;
    this.formItem = { ...item };
    this.selectedPdf = null; 

    if (item.sn === '001') {
      this.dynamicActions = [
        {
          label: 'Check A',
          status: 'pass',
          reportUrl: '/assets/reports/checkA.pdf',
          date: new Date(),
          executedBy: 'John Doe',
          handler: () => this.performAction('Check A')
        },
        {
          label: 'Check B',
          status: 'not-started',
          handler: () => this.performAction('Check B')
        }
      ];
    } else if (item.sn === '002') {
      this.dynamicActions = [
        {
          label: 'Inspection X',
          status: 'fail',
          reportUrl: '/assets/reports/inspectionX.pdf',
          date: new Date(),
          executedBy: 'Jane Smith',
          handler: () => this.performAction('Inspection X')
        }
      ];
    } else {
      this.dynamicActions = [
        {
          label: 'Validation Y',
          status: 'not-started',
          handler: () => this.performAction('Validation Y')
        },
        {
          label: 'Validation Z',
          status: 'pass',
          reportUrl: '/assets/reports/validationZ.pdf',
          date: new Date(),
          executedBy: 'Alice Johnson',
          handler: () => this.performAction('Validation Z')
        }
      ];
    }
  }

  performAction(actionName: string) {
    console.log(`Performed: ${actionName} on item ${this.selectedItem?.SerialNumber}`);
  }

  openPdf(reportUrl?: string) {
    if (reportUrl) {
      this.selectedPdf = reportUrl;
    } else {
      console.warn('PDF URL not defined');
    }
  }
  closePdf() {
    this.selectedPdf = null;
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  save() {
    console.log('Save called');
    if (this.selectedItem) {
      this.selectedItem.Type = this.formItem.Type;
      this.selectedItem.SerialNumber = this.formItem.SerialNumber;
    } else {
      //this.items.push({ ...this.formItem });
      //this.itemListComponent.onCreateNewItem(this.formItem);
      //this.itemCreated.emit(this.formItem); 
    }
    console.log('Saved kuku item:', this.formItem);
  }

  onCreateNewItem(newItem: Item) {
    // Let child handle adding the item
    console.log('Parent notified of new item:', newItem);
  }

  cancel() {
    if (this.selectedItem) {
      // Restore original values if editing existing item
      this.formItem = { ...this.selectedItem };
    } else {
      // Clear form if adding new item
      this.formItem = { SerialNumber: '', Type: '' };
    }
    console.log('Cancelled edit, restored form:', this.formItem);
  }

  getSafePdfUrl(): SafeResourceUrl {
    if (!this.selectedPdf) return '';
    const encodedUrl = encodeURIComponent(this.selectedPdf);
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.pdfViewerUrl}?file=${encodedUrl}`
    );
  }
}
