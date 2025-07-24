import { Component, Output, EventEmitter } from '@angular/core';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';

@Component({
    selector: 'item-details',
    standalone: true,
    templateUrl: './item-details.component.html',
    styleUrls: ['./item-details.component.css'],
    imports: [FormsModule, HttpClientModule],
    providers: [ItemService],
  })

  export class ItemDetailsComponent {

    @Output() newItemSaved = new EventEmitter<Item>();

    public item = { SerialNumber: '', Type: '' };

    constructor(private itemService: ItemService) 
    {
        console.log('ItemDetailsComponent constructor called!');
    }

    addNewItem()
    {
        this.item = { SerialNumber: '', Type: '' };
    }

    setItemDetails(item: Item)
    {
        this.item = { SerialNumber: item.SerialNumber, Type: item.Type };
    }

    saveNewItem()
    {
        console.log('Save new item called');

        //validation of new item sn shall be on the server
        //since more than one operator will be able to create new items
        if (this.item) {
            this.itemService.createNewItem(this.item).subscribe({
              next: (createdItem: Item) => {
                console.log('Item created successfully on backend:', createdItem);
                this.newItemSaved.emit(this.item);// Notify parent
              },
              error: (err: HttpErrorResponse) => {
                console.error('Failed to create item on backend', err);
              }
            });
        }
        console.log('Saved new item:', this.item);
    }

    cancel() {
        // if (this.selectedItem) {
        //   // Restore original values if editing existing item
        //   this.formItem = { ...this.selectedItem };
        // } else {
        //   // Clear form if adding new item
        //   this.formItem = { SerialNumber: '', Type: '' };
        // }
        console.log('Cancelled saving new item, restored form:');
      }

  }