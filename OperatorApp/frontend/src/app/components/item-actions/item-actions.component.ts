
import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';
import { ItemAction } from '../../models/item-action.model';

@Component({
    selector: 'item-actions',
    standalone: true,
    templateUrl: './item-actions.component.html',
    styleUrls: ['./item-actions.component.css'],
    imports: [FormsModule, HttpClientModule, CommonModule],
    providers: [ItemService],
  })

  export class ItemActionsComponent implements OnInit
  {

    public itemActions: ItemAction[] = [];
    item: Item | null = {SerialNumber: "", Type: {Name: ""}};

    selectedPdf: string | null = null; // PDF URL to display

    pdfViewerUrl = '/assets/pdfjs/web/viewer.html?file=/assets/pdfjs/reports/testPDF.pdf';

    constructor(private itemService: ItemService, private cdr: ChangeDetectorRef, public sanitizer: DomSanitizer) 
    {
        console.log('ItemActionsComponent constructor called!');
    }
    ngOnInit() 
    {
        console.log(`ItemActionsComponent - ngOnInit called!`);
    }

    openPdf() {//reportUrl?: string) {
      if (this.pdfViewerUrl) {
        this.selectedPdf = this.pdfViewerUrl;
      } else {
        console.warn('PDF URL not defined');
      }
    }

    closePdf() {
      this.selectedPdf = null;
    }

    startAction(actionName: string) {
      console.log(`Performed: ${actionName} on item X`);//${this.selectedItem?.SerialNumber}`);
    }
    
    sanitizeUrl(url: string): SafeResourceUrl {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    //on add new item
    //   this.dynamicActions = [];
    //this.selectedPdf = null;

    //on select item
    //    this.selectedPdf = null; 

    getSafePdfUrl(): SafeResourceUrl {
      if (!this.selectedPdf) return '';
      const encodedUrl = encodeURIComponent(this.selectedPdf);
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `${this.pdfViewerUrl}?file=${encodedUrl}`
      );
    }

    executeAction(action: ItemAction)
    {
        
        
        if (this.item === null)
        {
          console.log("Item is null, cant run action.");
          return;
        }

        console.log(`Going to run action ${action.Name} for item ${this.item!.SerialNumber}`);

        //TODO: do not allow any UI user interaction when the action is executed

        this.itemService.executeAction(action.Name, this.item!.SerialNumber).subscribe(() => {});
    }

    clear()
    {
      console.log(`ItemActionsComponent - clearing table of actions.`);
      this.itemActions.length = 0;
      this.item = null;
      this.cdr.detectChanges(); //Force Angular to refresh the view
    }

    setItemActions(item: Item)
    {
        console.log(`ItemActionsComponent - setItemActions called, item is ${JSON.stringify(item, null, 2)}`);

        //get list of item actions from be
        this.itemService.getItemActions(item).subscribe((itemActionsListFromBE: ItemAction[]) => {
          console.log('Those are all item actions:', itemActionsListFromBE);
          this.itemActions = itemActionsListFromBE;
          this.item = item;
          this.cdr.detectChanges(); //Force Angular to refresh the view
        });

    }
}