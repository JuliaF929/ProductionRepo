import { Component } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [CommonModule, NgForOf, NgIf, FormsModule]
})
export class App {
  constructor(public sanitizer: DomSanitizer) {}

  pdfViewerUrl = '/assets/pdfjs/web/viewer.html?file=/assets/pdfjs/reports/testPDF.pdf';
  selectedPdf: string | null = null; // PDF URL to display

  items = [
    { sn: '001', type: 'Type A' },
    { sn: '002', type: 'Type B' },
    { sn: '003', type: 'Type C' },
  ];

  filteredItems = [...this.items];

  filters = {
    sn: '',
    type: ''
  };

  selectedItem: any = null;

  addItem() {
    console.log('Add new item');
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item =>
      item.sn.toLowerCase().includes(this.filters.sn.toLowerCase()) &&
      item.type.toLowerCase().includes(this.filters.type.toLowerCase())
    );
  }

  formItem = { type: '', sn: '' };

  dynamicActions: {
    label: string;
    status: 'pass' | 'fail' | 'not-started';
    reportUrl?: string;
    date?: Date;
    executedBy?: string;
    handler: () => void;
  }[] = [];

  addNewItem() {
    this.formItem = { type: '', sn: '' };
    this.selectedItem = null;
    this.dynamicActions = [];
    this.selectedPdf = null;
  }

  selectItem(item: any) {
    this.selectedItem = item;
    this.formItem = { ...item };
    this.selectedPdf = null; // Close any open PDF when selecting a new item

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
    console.log(`Performed: ${actionName} on item ${this.selectedItem.sn}`);
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
    if (this.selectedItem) {
      this.selectedItem.type = this.formItem.type;
      this.selectedItem.sn = this.formItem.sn;
    } else {
      this.items.push({ ...this.formItem });
    }
    console.log('Saved item:', this.formItem);
  }

  cancel() {
    if (this.selectedItem) {
      // Restore original values if editing existing item
      this.formItem = { ...this.selectedItem };
    } else {
      // Clear form if adding new item
      this.formItem = { type: '', sn: '' };
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
