import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from '../models/item.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private apiUrl = '/api/items';

  constructor(private http: HttpClient) {}

  // getItems() {
  //   this.http.get<Item[]>(this.apiUrl).subscribe(
  //     (allItems: Item[]) => {
  //       console.log('Those are all items:', allItems);
  //       return allItems;
  //     },
  //     (error: HttpErrorResponse) => {
  //       console.error('Failed to fetch items', error);
  //     }
  //   );
  // }

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }

  createNewItem(newItem: Item): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, { SerialNumber: newItem.SerialNumber, Type: newItem.Type });
  }
}
