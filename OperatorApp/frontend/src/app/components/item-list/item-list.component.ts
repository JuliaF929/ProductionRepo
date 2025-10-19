import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Item } from '../../models/item.model';
import { ItemType } from '../../models/item-type.model';
import { ItemService } from '../../services/item.service';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'item-list',
  standalone: true,
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
  imports: [CommonModule, NgForOf, NgIf, FormsModule, HttpClientModule ],
  providers: [ItemService],
})
export class ItemListComponent implements OnInit {
    public items: Item[] = []; 
    @Output() itemSelectedByUser = new EventEmitter<Item | null>(); // Child selection -> Notify parent

    @Input() itemSelectedByParent: Item | null = null; // Parent selection -> Notify Child
    @Output() createNewItemEvent = new EventEmitter<Item | null>();

  public filteredItems = [...this.items];
  public itemCount = 0;
  public itemTypeCount = 0;

  filters = {
    SerialNumber: '',
    Type: ''
  };

  constructor(private itemService: ItemService, private cdr: ChangeDetectorRef) 
  {
    console.log('ItemListComponent constructor called!');
  }

  trackBySerialNumber(index: number, item: Item): string {
    return item.SerialNumber;
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item =>
      item.SerialNumber.toLowerCase().includes(this.filters.SerialNumber.toLowerCase()) &&
      item.Type?.Name.toLowerCase().includes(this.filters.Type.toLowerCase())
    );

    this.itemCount = this.filteredItems.length;
    this.itemTypeCount = new Set(this.filteredItems.map(i => i.Type.Name)).size;

     // Clear selection if filtered list no longer contains the selected item
     if ((this.itemSelectedByParent) && (!this.filteredItems.some(it => it.SerialNumber === this.itemSelectedByParent!.SerialNumber)))
     {
        this.onSelectItem(null);
     }
  }

  onSelectItem(item: Item | null) {
    this.itemSelectedByParent = item; // persistently sets selected
    this.itemSelectedByUser.emit(item); //Emit selected item
  }

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    console.log("Here is a loadItems of item-list.component.ts.")
    this.itemService.getItems().subscribe((itemsListFromBE: Item[]) => {
      console.log('Those are all items:', itemsListFromBE);
      this.items = itemsListFromBE;
      this.filteredItems = [...this.items]; // <-- populate filteredItems
      this.itemCount = this.items.length;
      this.itemTypeCount = new Set(this.items.map(i => i.Type.Name)).size;
      this.cdr.detectChanges(); //Force Angular to refresh the view
    });
  }

  onNewItemCreated(newItem: Item) {
    if (newItem) 
    {
      console.log('ItemListComponent: onNewItemCreated, updating the list of items.', newItem);
      this.loadItems();
                  
      this.applyFilters();
      this.createNewItemEvent.emit(newItem);// Notify parent
    }
  }
  
}
