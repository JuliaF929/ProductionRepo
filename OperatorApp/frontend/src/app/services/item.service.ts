import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from '../models/item.model';
import { ItemType } from '../models/item-type.model';
import { ItemAction } from '../models/item-action.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private apiItemsUrl = '/api/items';
  private apiItemTypesUrl = '/api/itemtype';
  private apiItemActionsUrl = '/api/itemactions';

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
    const params = new HttpParams().set('itemSN', item.SerialNumber);
    return this.http.get<ItemAction[]>(this.apiItemActionsUrl, { params });

  }
}
