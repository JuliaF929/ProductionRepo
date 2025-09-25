import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Item } from './models/item.model';
import { ItemListComponent } from './components/item-list/item-list.component';
import { ItemDetailsComponent } from './components/item-details/item-details.component';
import { HttpClientModule } from '@angular/common/http';
import { ItemActionsComponent } from './components/item-actions/item-actions.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [CommonModule, FormsModule, HttpClientModule, ItemListComponent, ItemDetailsComponent, ItemActionsComponent]
})
export class App {
  constructor() {}

  @ViewChild(ItemListComponent) itemListComponent!: ItemListComponent;
  @ViewChild(ItemDetailsComponent) itemDetailsComponent!: ItemDetailsComponent;
  @ViewChild(ItemActionsComponent) itemActionsComponent!: ItemActionsComponent;

  public selectedItem: Item | null = null;
  public isNewItemMode = false;
  public isSidebarOpen = false;

  onItemSelected(item: Item | null) {
    this.selectedItem = item;
    this.isNewItemMode = false;
    this.itemActionsComponent.setItemActions(item);
    console.log('Parent received selected item:', item);
  }

  onNewItemSaved(newItem: Item) {
    this.selectedItem = null;
    this.isNewItemMode = false;
    this.isSidebarOpen = false;
    this.itemListComponent.onNewItemCreated(newItem);
    this.itemActionsComponent.clear();
  }

  onNewItemSavingCanceled() {
    this.selectedItem = null;
    this.isNewItemMode = false;
    this.isSidebarOpen = false;
    this.itemActionsComponent.clear();
  }

  onRefreshClicked(){
    //TODO: implement
    alert("Refresh button still not implemented.");
  }


  appAddNewItem() {
    console.log(`appAddNewItem, selectedItem is ${this.selectedItem}`);
    this.selectedItem = { SerialNumber: '', Type: { Name: '' }};
    this.isNewItemMode = true;
    this.isSidebarOpen = true;

    this.itemDetailsComponent.addNewItem();
    this.itemActionsComponent.clear();
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    this.isNewItemMode = false;
    this.selectedItem = null;
    this.itemActionsComponent.clear();
  }

  selectItem(item: any) {
    console.log('app: selectItem');
    this.selectedItem = item;
    this.itemDetailsComponent.setItemDetails(item);
  }

  onItemAddedToTable(newItem: Item | null) {

     console.log('Parent notified of new item creation:', newItem);

     this.selectedItem = newItem;
     this.isNewItemMode = false;
     this.itemActionsComponent.setItemActions(newItem);
   }


}
