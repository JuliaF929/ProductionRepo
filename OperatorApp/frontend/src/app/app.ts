import { Component, ViewChild } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Item } from './models/item.model';
import { ItemListComponent } from './components/item-list/item-list.component';
import { ItemDetailsComponent } from './components/item-details/item-details.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [CommonModule, NgForOf, NgIf, FormsModule, HttpClientModule, ItemListComponent, ItemDetailsComponent]
})
export class App {
  constructor(public sanitizer: DomSanitizer) {}

  pdfViewerUrl = '/assets/pdfjs/web/viewer.html?file=/assets/pdfjs/reports/testPDF.pdf';
  selectedPdf: string | null = null; // PDF URL to display

  @ViewChild(ItemListComponent) itemListComponent!: ItemListComponent;
  @ViewChild(ItemDetailsComponent) itemDetailsComponent!: ItemDetailsComponent;

  public selectedItem: Item | null = null;
  public isNewItemMode = false;

  onItemSelected(item: Item) {
    this.selectedItem = item;
    this.isNewItemMode = false;
    console.log('Parent received selected item:', item);
  }

  onNewItemSaved(newItem: Item) {
    this.selectedItem = null;
    this.isNewItemMode = false;
    this.itemListComponent.onNewItemCreated(newItem);
  }

  onNewItemSavingCanceled() {
    this.selectedItem = null;
    this.isNewItemMode = false;
  }


  dynamicActions: {
    label: string;
    status: 'pass' | 'fail' | 'not-started';
    reportUrl?: string;
    date?: Date;
    executedBy?: string;
    handler: () => void;
  }[] = [];

  appAddNewItem() {
    console.log(`appAddNewItem, selectedItem is ${this.selectedItem}`);
    this.selectedItem = { SerialNumber: '', Type: { Name: '' } };
    this.isNewItemMode = true;

    this.dynamicActions = [];
    this.selectedPdf = null;
    this.itemDetailsComponent.addNewItem();
  }

  selectItem(item: any) {
    console.log('app: selectItem');
    this.selectedItem = item;
    this.itemDetailsComponent.setItemDetails(item);
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

  onItemAddedToTable(newItem: Item) {

     console.log('Parent notified of new item creation:', newItem);

     this.selectedItem = newItem;
     this.isNewItemMode = false;
   }

  getSafePdfUrl(): SafeResourceUrl {
    if (!this.selectedPdf) return '';
    const encodedUrl = encodeURIComponent(this.selectedPdf);
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.pdfViewerUrl}?file=${encodedUrl}`
    );
  }
}
