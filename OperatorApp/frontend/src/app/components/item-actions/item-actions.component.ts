
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

    openPdf (action: ItemAction) {
      if (action.LatestReportUrl !== null) {
        this.pdfViewerUrl = action.LatestReportUrl!;
        this.selectedPdf = action.LatestReportUrl!;     
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

        console.log(`Going to run action ${action.Name}, ver#${action.PlannedVersion}, path ${action.CloudPath}, exeName ${action.ExeName} for item ${this.item!.SerialNumber}`);

        this.closePdf();

        //do not allow any UI user interaction when the action is executed
        this.uiBlocked = true;

        this.itemService.executeAction(action.Name, this.item!.SerialNumber, this.item!.Type!.Name, action.PlannedVersion, action.ExeName).subscribe({
          next: (actionResponse: ExecuteActionResponse) => {

            action.LatestRunResult = actionResponse.executionResult;
            action.LatestRunDateTime = actionResponse.endExecutionDateTime;
            action.LatestActionVersionNumber = actionResponse.version;
            action.LatestRunResult = actionResponse.executionResult;
        
            const reportPdfPath = actionResponse.reportPdfPath;
            console.log(`Received report pdf path to show: ${reportPdfPath}.`);

            const reportPdfPathForAngular = "/assets/pdfjs/web/viewer.html?file=" + reportPdfPath;
            console.log(`Report pdf path to show in angular: ${reportPdfPathForAngular}.`);
            console.log(`Going to open report.`);

            action.LatestReportUrl = reportPdfPathForAngular;
            this.openPdf(action);

            console.log(`Report opened.`);
            console.log(`Finished running ${action.Name} for item ${this.item!.SerialNumber}, version ${actionResponse.version}, result ${actionResponse.executionResult}`);
        
            this.uiBlocked = false;
            this.cdr.detectChanges();
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

      this.closePdf();
      
      this.itemActions.length = 0;
      this.item = null;
      this.cdr.detectChanges(); //Force Angular to refresh the view
    }

    setItemActions(item: Item | null)
    {
        if (item == null)
        {
          console.log(`ItemActionsComponent - setItemActions called, item is null. Clearing actions list.`);
          this.clear();
          return;
        }
        
        console.log(`ItemActionsComponent - setItemActions called, item is ${JSON.stringify(item, null, 2)}`);

        this.closePdf();

        //get list of item actions from be
        this.itemService.getItemActions(item).subscribe((itemActionsListFromBE: ItemAction[]) => {
          console.log('Those are all item actions:', itemActionsListFromBE);
          this.itemActions = itemActionsListFromBE;
          this.item = item;
          this.cdr.detectChanges(); //Force Angular to refresh the view
        });

    }
}