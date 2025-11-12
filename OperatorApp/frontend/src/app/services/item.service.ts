import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from '../models/item.model';
import { ItemType } from '../models/item-type.model';
import { ItemAction } from '../models/item-action.model';
import { BE2FE_ExecuteActionResponse } from '../DTOs/BE2FE_ExecuteActionResponse';
import { ActionReportResponse } from '../models/action-report.model';
import { Observable } from 'rxjs';
import { BE2FE_ActionForItemDto } from '../DTOs/BE2FE_ActionForItemDto';

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

  getItemActions(item: Item): Observable<BE2FE_ActionForItemDto[]> {
    const params = new HttpParams()
                                  .set('itemSN', item.SerialNumber)
                                  .set('itemTypeName', item.Type.Name);
    return this.http.get<BE2FE_ActionForItemDto[]>(this.apiItemActionsUrl, { params });

  }

  executeAction(actionName: string, 
                itemSN: string,
                itemType: string,
                actionVersion: string, 
                actionExeName: string) : Observable<BE2FE_ExecuteActionResponse> {
    const params = new HttpParams()
                                  .set('actionName', actionName)
                                  .set('itemSN', itemSN)
                                  .set('itemType', itemType)
                                  .set('actionVersion', actionVersion)
                                  .set('actionExeName', actionExeName);

    console.log("Calling:", this.apiActionUrl + "/execute");
    console.log("With params:", params.toString());

    return this.http.get<BE2FE_ExecuteActionResponse>(this.apiActionUrl + "/execute", {params});
  }

}