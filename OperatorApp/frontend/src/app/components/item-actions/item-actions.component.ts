
import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { HttpErrorResponse, HttpClientModule  } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';
import { ItemAction } from '../../models/item-action.model';
import { BE2FE_ExecuteActionResponse } from '../../DTOs/BE2FE_ExecuteActionResponse';
import { BE2FE_ActionForItemDto } from '../../DTOs/BE2FE_ActionForItemDto';

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

    showMessageBox = false;
    messageBoxText = '';

    constructor(private itemService: ItemService, private cdr: ChangeDetectorRef, public sanitizer: DomSanitizer) 
    {
        console.log('ItemActionsComponent constructor called!');
    }
    
    closeMessageBox() {
      this.showMessageBox = false;
    }

    ngOnInit() 
    {
        console.log(`ItemActionsComponent - ngOnInit called!`);

    }

    downloadAndOpenPdf(action: ItemAction)
    {
      
    }
    openPdf (reportPdfPath: string) {
      if (reportPdfPath !== null) {
        this.pdfViewerUrl = reportPdfPath!;
        this.selectedPdf = reportPdfPath!;     
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

        console.log(`Going to run action ${action.actionName}, ver#${action.actionSWVersionForExecution}, exeName ${action.actionExeName} for item ${this.item!.SerialNumber}`);

        this.closePdf();

        //do not allow any UI user interaction when the action is executed
        this.uiBlocked = true;

        this.itemService.executeAction(action.actionName, this.item!.SerialNumber, this.item!.Type!.Name, action.actionSWVersionForExecution, action.actionExeName).subscribe({
          next: (actionResponse: BE2FE_ExecuteActionResponse) => {

            action.latestResult = actionResponse.executionResult;
            action.latestExecutionDateTimeUTC = actionResponse.endExecutionDateTimeUTC;
            action.latestActionVersionNumber = actionResponse.version;
            action.latestOperatorName = actionResponse.operatorName;
        
            const reportPdfPath = actionResponse.reportPdfPath;
            console.log(`Received report pdf path to show: ${reportPdfPath}.`);

            const reportPdfPathForAngular = "/assets/pdfjs/web/viewer.html?file=" + reportPdfPath;
            console.log(`Report pdf path to show in angular: ${reportPdfPathForAngular}.`);
            console.log(`Going to open report.`);

            this.openPdf(reportPdfPathForAngular);

            console.log(`Report opened.`);
            console.log(`Finished running ${action.actionName} for item ${this.item!.SerialNumber}, version ${actionResponse.version}, result ${actionResponse.executionResult}`);
        
            this.uiBlocked = false;
            this.cdr.detectChanges();
          },
          error: (error: HttpErrorResponse) => {
            console.error('Execution failed:', error);
            this.uiBlocked = false;
            this.cdr.detectChanges();

            this.messageBoxText = `Execution of ${action.actionName} failed.`;
            this.showMessageBox = true;
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
        this.itemService.getItemActions(item)
        .subscribe({next: (itemActionsListFromBE: BE2FE_ActionForItemDto[]) => 
        {
          console.log('Those are all item actions:', itemActionsListFromBE);

          //this.itemActions = itemActionsListFromBE;

          //copy returned from be item actions to local itemActions array
          this.itemActions.length = 0; //clear existing actions
          for (const actionDto of itemActionsListFromBE) {
            const itemAction: ItemAction = {
              Index: this.itemActions.length + 1,
              itemSerialNumber: actionDto.itemSerialNumber,
              itemType: actionDto.itemType,
              actionName: actionDto.actionName,
              actionSWVersionForExecution: actionDto.actionSWVersionForExecution,
              actionExeName: actionDto.actionExeName,
              latestExecutionDateTimeUTC: actionDto.latestExecutionDateTimeUTC,
              latestResult: actionDto.latestResult,
              latestOperatorName: actionDto.latestOperatorName,
              latestActionVersionNumber: actionDto.latestActionVersionNumber
            };
            this.itemActions.push(itemAction);
          }

          console.log('Local itemActions array:', this.itemActions);

          this.item = item;//julia - what is it for?
          this.cdr.detectChanges(); //Force Angular to refresh the view
        },
        error: (error: HttpErrorResponse) => {
          this.messageBoxText = `Failed to get all item's ${this.item?.SerialNumber} actions: ${error}.`;

          console.error(this.messageBoxText);
          this.cdr.detectChanges();

          this.showMessageBox = true;
          this.cdr.detectChanges();
        }       
      });
    }
}