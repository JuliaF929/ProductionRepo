import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges  } from '@angular/core';
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
export class ItemListComponent implements OnInit, OnChanges {
    public items: Item[] = []; 
    @Output() itemSelectedByUser = new EventEmitter<Item | null>(); // Child selection -> Notify parent

    @Input() itemSelectedByParent: Item | null = null; // Parent selection -> Notify Child
    @Output() createNewItemEvent = new EventEmitter<Item | null>();

  public filteredItems = [...this.items];
  public itemCount = 0;
  public itemTypeCount = 0;

  showMessageBox = false;
  messageBoxText = '';

  selectedRow: any = null;

  filters = {
    SerialNumber: '',
    Type: ''
  };

  constructor(private itemService: ItemService, private cdr: ChangeDetectorRef) 
  {
    console.log('ItemListComponent constructor called!');
  }

  closeMessageBox() {
    console.log('Closing message box and application.');
    console.log("chrome.webview exists?", !!(window as any).chrome?.webview);
    // Close the app if versions are not valid
    (window as any).chrome?.webview?.postMessage({Type: 'EXIT_APP'});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemSelectedByParent'] && this.itemSelectedByParent) {
      this.selectedRow = this.itemSelectedByParent;
    }
  }

  onRowClicked(item: any) {
    this.selectedRow = item;
    this.itemSelectedByUser.emit(item);
  }

  isRowSelected(item: any) {
    return this.selectedRow?.SerialNumber === item.SerialNumber;
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
    this.validateSystemVersions();
    this.loadItems();
  }

  validateSystemVersions() {
    this.itemService.validateSystemVersions().subscribe({
      next: (response: any) => {
        console.log('System versions valid.');
      },
      error: (error: HttpErrorResponse) => {
        let msg = `System versions validation failed:\n ${error.error}`;

        console.error(msg);
        this.messageBoxText = msg;
        this.showMessageBox = true;
      }
    });
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
