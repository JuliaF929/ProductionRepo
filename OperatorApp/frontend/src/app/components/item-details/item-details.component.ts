import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
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

    isSaving = false;
     
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
        console.log(`Save new item called, this.item is ${this.item}`);
        //after the addNewItem, this.item is just blank, not null, so we need to validate it is not blank.
        //validation of new item sn shall be on the server
        //since more than one operator will be able to create new items
        if ((this.item !== null)      && (this.item.SerialNumber !== '') && 
            (this.item.Type !== null) && (this.item.Type.Name !== '')) 
        {
            console.log(`Going to save item sn ${this.item.SerialNumber}, of type ${this.item.Type!.Name}`)
            this.isSaving = true; // Set wait flag
            document.body.style.cursor = 'wait'; // show wait cursor globally

            this.itemService.createNewItem(this.item!).pipe(
              finalize(() => {
                this.isSaving = false;
                document.body.style.cursor = 'default';
                this.cdr.detectChanges(); // forces UI refresh
              })
            ).subscribe({
              next: () => {
                if (this.item) {
                    console.log(`Item created successfully on server, sn ${this.item.SerialNumber}, type ${this.item.Type!.Name}`);
                    this.newItemSaved.emit(structuredClone(this.item)); // emits a deep copy
                    this.item = { SerialNumber: '', Type: { Name: '' } };
                }
              },
              error: (err: HttpErrorResponse) => {
                /*
                err.status → HTTP code (e.g. 400)
                err.error → body returned by backend (your { "message": "..." })
                err.error.message → the string "Item with this SerialNumber already exists"
                */
                console.error(`Failed to create item on server, err is ${err.error?.message}`);
                alert(`Failed to save item. ${err.error?.message || 'Please try again.'}`);
              },
            });
        }
        else//this.item is blank for some reason...
        {
          console.log(`Tried to save item with blank fields. Failed.`);
          alert(`You are trying to save item with some blank fields. Please try again.`);
        }
    }

    cancel() {
        console.log('Cancelled saving new item by the user.');
        this.newItemSavingCanceled.emit();
      }

  }