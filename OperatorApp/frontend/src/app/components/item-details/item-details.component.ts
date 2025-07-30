import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, SimpleChanges } from '@angular/core';
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
    @Output() newItemSavingCanceled = new EventEmitter<void>();

    @Input() public item: Item | null = { SerialNumber: '', Type: {Name:''} };
    
    public availableTypes: ItemType[] = [];

    @Input() public readonly: boolean = false;
     
    constructor(private itemService: ItemService, private cdr: ChangeDetectorRef) 
    {
        console.log('ItemDetailsComponent constructor called!');
    }

    ngOnChanges(changes: SimpleChanges) 
    {
        if (changes['item'] && this.item) {
            this.item = structuredClone(this.item); // make local copy to avoid binding issues
            // Match item.Type by name with one from availableTypes
            const match = this.availableTypes.find(t => t.Name === this.item!.Type?.Name);
            if (match) {
              this.item.Type = match;
            }
          }
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
        if (this.item === null)
            console.log("The item is null and this fails...");

        this.item = { SerialNumber: '', Type: {Name: ''} };
        this.cdr.detectChanges();
    }

    setItemDetails(item: Item)
    {
        this.item = { SerialNumber: item.SerialNumber, Type: { Name: item?.Type?.Name } };
    }

    saveNewItem()
    {
        console.log('Save new item called');

        //validation of new item sn shall be on the server
        //since more than one operator will be able to create new items
        if (this.item) {
            this.itemService.createNewItem(this.item).subscribe({
              next: (createdItem: Item) => {
                if (this.item) {
                    console.log('Item created successfully on backend:', createdItem);
                    this.newItemSaved.emit(structuredClone(this.item)); // emits a deep copy
                    this.item = { SerialNumber: '', Type: { Name: '' } };
                }
              },
              error: (err: HttpErrorResponse) => {
                console.error('Failed to create item on backend', err);
              }
            });
        }
        console.log('Saved new item:', this.item);
    }

    cancel() {
        console.log('Cancelled saving new item by the user.');
        this.newItemSavingCanceled.emit();
      }

  }