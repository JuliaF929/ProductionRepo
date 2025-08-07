
import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { HttpErrorResponse, HttpClientModule  } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';
import { ItemAction } from '../../models/item-action.model';
import { ExecuteActionResponse } from '../../models/execute-action-response.model';

@Component({
    selector: 'item-actions',
    standalone: true,
    templateUrl: './item-actions.component.html',
    styleUrls: ['./item-actions.component.css'],
    imports: [FormsModule, CommonModule, HttpClientModule ],
    providers: [ItemService],
  })

  export class ItemActionsComponent implements OnInit
  {

    public itemActions: ItemAction[] = [];
    item: Item | null = {SerialNumber: "", Type: {Name: ""}};

    selectedPdf: string | null = null; // PDF URL to display

    staticDummyPdf = '/assets/pdfjs/web/viewer.html?file=/assets/pdfjs/reports/testPDF.pdf';
    pdfViewerUrl = this.staticDummyPdf;

    uiBlocked = false;

    constructor(private itemService: ItemService, private cdr: ChangeDetectorRef, public sanitizer: DomSanitizer) 
    {
        console.log('ItemActionsComponent constructor called!');
    }
    ngOnInit() 
    {
        console.log(`ItemActionsComponent - ngOnInit called!`);
    }

    openPdf (reportUrl?: string) {
      console.log(`openPdf - reportUrl is ${reportUrl}.`);
      if (reportUrl !== null) {
        this.pdfViewerUrl = reportUrl!;
        this.selectedPdf = reportUrl!;     
      } else {
        this.pdfViewerUrl = this.staticDummyPdf;
        this.selectedPdf = this.staticDummyPdf;
      }
      this.cdr.detectChanges();
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

        //do not allow any UI user interaction when the action is executed
        this.uiBlocked = true;

        this.itemService.executeAction(action.Name, this.item!.SerialNumber).subscribe({
          next: (actionResponse: ExecuteActionResponse) => {

            action.LatestRunResult = actionResponse.executionResult;
            action.LatestRunDateTime = actionResponse.endExecutionDateTime;
            action.LatestActionVersionNumber = actionResponse.version;
            action.LatestRunResult = actionResponse.executionResult;
        
            console.log(`Finished running ${action.Name} for item ${this.item!.SerialNumber}, version ${actionResponse.version}, result ${actionResponse.executionResult}`);
        
            this.uiBlocked = false;

            this.itemService.createReportForAction(
              action.Name,
              actionResponse.version,
              this.item!.SerialNumber,
              this.item!.Type!.Name
            ).subscribe({
              next: (res: { path: string }) => {
                const reportPdfPath = res.path;
                console.log(`Received report pdf path to show: ${reportPdfPath}.`);
                
                this.cdr.detectChanges();

                const reportPdfPathForAngular = "/assets/pdfjs/web/viewer.html?file=" + reportPdfPath;
                console.log(`Report pdf path to show in angular: ${reportPdfPathForAngular}.`);
                console.log(`Going to open report.`);
                this.openPdf(reportPdfPathForAngular);
                console.log(`Report opened.`);

                action.LatestReportUrl = reportPdfPathForAngular;
              },
              error: (error: HttpErrorResponse) => {
                console.error('Create report failed:', error);
                this.uiBlocked = false;
                this.cdr.detectChanges();
              }
            });
          },
          error: (error: HttpErrorResponse) => {
            console.error('Execution failed:', error);
            this.uiBlocked = false;
            this.cdr.detectChanges();
          }
        });
        
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