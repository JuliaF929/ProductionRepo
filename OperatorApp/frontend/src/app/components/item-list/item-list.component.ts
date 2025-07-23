import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';
import { HttpClientModule } from '@angular/common/http';

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
    @Output() itemSelectedByUser = new EventEmitter<Item>(); // Child selection -> Notify parent

    @Input() itemSelectedByParent: Item | null = null; // Parent selection -> Notify Child
    @Output() createNewItemEvent = new EventEmitter<Item>();

  public filteredItems = [...this.items];

  filters = {
    SerialNumber: '',
    Type: ''
  };

  constructor(private itemService: ItemService, private cdr: ChangeDetectorRef) 
  {
    console.log('ItemListComponent constructor called!');
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item =>
      item.SerialNumber.toLowerCase().includes(this.filters.SerialNumber.toLowerCase()) &&
      item.Type.toLowerCase().includes(this.filters.Type.toLowerCase())
    );
  }

  onSelectItem(item: Item) {
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
      this.cdr.detectChanges(); //Force Angular to refresh the view
    });
  }

  onCreateNewItem(newItem: Item) {
    if (newItem) {
      this.itemService.createNewItem(newItem).subscribe((newItem: Item ) => {
        this.items.push(newItem);
      });
      this.createNewItemEvent.emit(newItem); // Notify parent
    }
  }
}
