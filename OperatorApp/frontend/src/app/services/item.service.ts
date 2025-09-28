import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from '../models/item.model';
import { ItemType } from '../models/item-type.model';
import { ItemAction } from '../models/item-action.model';
import { ExecuteActionResponse } from '../models/execute-action-response.model';
import { ActionReportResponse } from '../models/action-report.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})


export class ItemService {
  private apiItemsUrl = '/api/items';
  private apiItemTypesUrl = '/api/itemtype';
  private apiItemActionsUrl = '/api/itemactions';
  private apiActionUrl = '/api/action';

  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiItemsUrl);
  }

  createNewItem(newItem: Item): Observable<Item> {
    return this.http.post<Item>(this.apiItemsUrl, { SerialNumber: newItem.SerialNumber, Type: { Name: newItem.Type.Name } });
  }

  getItemTypes(): Observable<ItemType[]> {
    return this.http.get<ItemType[]>(this.apiItemTypesUrl);
  }

  getItemActions(item: Item): Observable<ItemAction[]> {
    const params = new HttpParams()
                                  .set('itemSN', item.SerialNumber)
                                  .set('itemTypeName', item.Type.Name);
    return this.http.get<ItemAction[]>(this.apiItemActionsUrl, { params });

  }

  executeAction(actionName: string, 
                itemSN: string,
                itemType: string,
                actionVersion: string, 
                actionPath: string,
                actionExeName: string) : Observable<ExecuteActionResponse> {
    const params = new HttpParams()
                                  .set('actionName', actionName)
                                  .set('itemSN', itemSN)
                                  .set('itemType', itemType)
                                  .set('actionVersion', actionVersion)
                                  .set('actionPath', actionPath)
                                  .set('actionExeName', actionExeName);

    console.log("Calling:", this.apiActionUrl + "/execute");
    console.log("With params:", params.toString());

    return this.http.get<ExecuteActionResponse>(this.apiActionUrl + "/execute", {params});
  }

  createReportForAction(actionName: string, actionVersionNumber: string, itemSN: string, itemType: string) : Observable<ActionReportResponse> {
    const params = new HttpParams()
                                  .set('actionName', actionName)
                                  .set('actionVersionNumber', actionVersionNumber)
                                  .set('itemSN', itemSN)
                                  .set('itemType', itemType);

    console.log("Calling:", this.apiActionUrl + "/create-report");
    console.log("With params:", params.toString());
                              
    return this.http.get<ActionReportResponse>(this.apiActionUrl + "/create-report", {params});
  }
}