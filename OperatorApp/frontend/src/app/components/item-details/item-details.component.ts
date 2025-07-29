import { Component, Output, EventEmitter, OnInit, ChangeDetectorRef  } from '@angular/core';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Item } from '../../models/item.model';
import { ItemType } from '../../models/item-type.model';
import { ItemService } from '../../services/item.service';

@Component({
    selector: 'item-details',
    standalone: true,
    templateUrl: './item-details.component.html',
    styleUrls: ['./item-details.component.css'],
    imports: [FormsModule, HttpClientModule, CommonModule],
    providers: [ItemService],
  })

  export class ItemDetailsComponent implements OnInit{

    @Output() newItemSaved = new EventEmitter<Item>();

    public item = { SerialNumber: '', Type: {Name:''} };
    public availableTypes: ItemType[] = [];//['Type A', 'Type B', 'Type C'];
     
    constructor(private itemService: ItemService, private cdr: ChangeDetectorRef) 
    {
        console.log('ItemDetailsComponent constructor called!');
    }

    ngOnInit() {
        this.loadItemTypes();
      }
    
      loadItemTypes() {
        console.log("Here is a loadItemTypes of item-details.component.ts.")
        this.itemService.getItemTypes().subscribe((itemTypesFromBE: ItemType[]) => {
          console.log('Those are all item types:', itemTypesFromBE);
          this.availableTypes = itemTypesFromBE;

          // Force Angular to update the DOM
          this.cdr.detectChanges();
        });

      }

    addNewItem()
    {
        this.item = { SerialNumber: '', Type: {Name: ''} };
    }

    setItemDetails(item: Item)
    {
        this.item = { SerialNumber: item.SerialNumber, Type: { Name: item.Type?.Name } };
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
                //this.newItemSaved.emit(this.item);// Notify parent
                this.newItemSaved.emit(structuredClone(this.item)); // ✅ emits a deep copy
                this.item = { SerialNumber: '', Type: { Name: '' } };
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