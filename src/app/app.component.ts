import { AddEditRowComponent } from './add-edit-row/add-edit-row.component';
import { SocketService } from './webSocket/socket-service';
import { AddEditColumnComponent } from './add-edit-column/add-edit-column.component';
import { DataService } from './dataSource/data.service';
import { Component, OnInit, ViewChild,OnDestroy, ElementRef } from '@angular/core';
import { VirtualScrollService, FreezeService,SortService,
  ReorderService,ResizeService,RowDDService,InfiniteScrollService} from '@syncfusion/ej2-angular-treegrid';
import { TreeGrid } from '@syncfusion/ej2-treegrid';
import * as $ from 'jquery';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Renderer2 } from '@angular/core';

declare function maintainStateOfGridAfterActionComplete(headers,bindLocal):any;
@Component({
  selector: 'app-root',
  providers:[VirtualScrollService,FreezeService,ReorderService,ResizeService,
    SortService,RowDDService,InfiniteScrollService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit,OnDestroy {
  bodyText: string;
  private dataServiceSub:Subscription;
  private socketServiceSub : Subscription;
  public data: Object[];
  //public data: DataManager;
  title = 'frontEnd-demo';
  treeGridData = null;
  treeGridHeaders = null;
  //public treegrid:TreeGrid = null;
  chooseColumnOptions = [] ;
  currentSelectedRows = [];
  public filterSettings: Object;
  public sortSettings: any =  { columns: []}
  @ViewChild('multiSort')
  public multiSort:ElementRef;
//{ columns: []};
  public selectionSettings: Object;
  mode = null;
  constructor(private dataService: DataService,private dialog: MatDialog,
   private socketService: SocketService, private render:Renderer2) { }
  @ViewChild('treegrid') treegrid : TreeGrid=new TreeGrid();
  innerHeight:any;

  ngOnInit(): void {
    this.selectionSettings = { type: 'Single' };
    this.filterSettings = { type: 'FilterBar', hierarchyMode: 'Both', mode: 'Immediate' };

    this.dataService.getTreeGridData().subscribe((res:any)=>{
      if(res.message == 'success') {
        this.treeGridHeaders = [...res.data.treegrid.headers]; //res.data.treegrid.headers;
        this.treeGridData = [...res.data.data];
        this.loadTreeGrid();
        this.bindChooseColumnOptions();
        this.treegrid.clearFiltering();
        //maintainStateOfGridAfterActionComplete(this.treeGridHeaders,false);
      }else {
        alert(res.message);
      }
    });

    this.dataServiceSub = this.dataService.getDataServiceListener().subscribe(()=>{
      this.treegrid.showSpinner();
      if(this.treegrid != null) {
        this.dataService.getTreeGridData().subscribe((res:any)=>{
          if(res.message == 'success') {
            this.treegrid.dataSource = [...res.data.data];
            this.treeGridHeaders = [...res.data.treegrid.headers]; //res.data.treegrid.headers;
            var colms = this.makeTreeGridHeaders();
            this.treeGridData = [...res.data.data];
            this.treegrid.columns = colms;
            this.bindChooseColumnOptions();
            this.setDefaultsAndBindEventsOnGridReload();
            //maintainStateOfGridAfterActionComplete(this.treeGridHeaders,false);
            this.treegrid.clearFiltering();
            this.treegrid.hideSpinner();
          } else {
            this.treegrid.hideSpinner();
          }
        });
      }
    });

    this.socketServiceSub = this.socketService.listen('TreeGrid data modified').subscribe( data => {
      if(data =='CODE:x000SX1') {
        alert('TreeGrid data modified, grid will refresh');
        this.dataService.getTreeGridData().subscribe((res:any)=>{
          //console.log(res);
          this.treegrid.showSpinner();
          if(res.message == 'success') {
            this.treegrid.dataSource = [...res.data.data];
            this.treeGridHeaders = [...res.data.treegrid.headers]; //res.data.treegrid.headers;
            var colms = this.makeTreeGridHeaders();
            this.treeGridData = [...res.data.data];
            this.treegrid.columns = colms;
            this.bindChooseColumnOptions();
            this.setDefaultsAndBindEventsOnGridReload();
            //maintainStateOfGridAfterActionComplete(this.treeGridHeaders,false);
            this.treegrid.hideSpinner();
          }else {
            alert(res.message);
            this.treegrid.hideSpinner();
          }
        });
      }
      console.log("data from server: ", data);
    });

  }

  loadTreeGrid() {
    var treeGridControl = $('#TreeGrid_gridcontrol');
    this.treegrid.showSpinner();
    var isTreeGridLoaded = typeof(treeGridControl)!="undefined" ? $('#TreeGrid_gridcontrol').length == 1 : false;
    if(!isTreeGridLoaded || this.treegrid == null) {
        var colms = this.makeTreeGridHeaders();
        this.treegrid.enableAdaptiveUI = true;
        this.treegrid.childMapping= 'subtasks'; //'Crew';
        this.treegrid.treeColumnIndex= 1;
        this.treegrid.columns = colms;
        this.treegrid.allowReordering=true;
        this.treegrid.allowResizing=true;
        setTimeout(() => {
          this.treegrid.enableVirtualization=true;
          //this.treegrid.enableInfiniteScrolling = true;
          this.treegrid.dataSource= this.treeGridData;
          this.treegrid.hideSpinner();
        }, 2000);
        this.treegrid.selectionSettings = this.selectionSettings;
        this.treegrid.allowRowDragAndDrop = true;
        this.treegrid.height=screen.height-172;
        this.treegrid.rowSelected.subscribe((e)=>{
          this.treeGridSelectAndDeselectRows(e,'selected');
        });

        this.treegrid.rowDeselected.subscribe((e)=>{
          this.treeGridSelectAndDeselectRows(e,'deselected');
        });

        setTimeout(() => {
          document.getElementById("loader").style.display = 'none';
          this.treegrid.allowFiltering=true;
          this.treegrid.filterSettings= this.filterSettings;
        }, 300);

    } else {
      this.treegrid.dataSource = this.treeGridData;
    }
  }

  makeTreeGridHeaders () {
    let headers = this.treeGridHeaders;//['taskID','taskName','startDate','duration','priority'];
    let colms = [];
    var index= 0;
    for(var i in headers)
    {
      //console.log(headers[i]);
      var colmElem = { field: headers[i].name, headerText: headers[i].name,
        textAlign: headers[i].alignment, minWidth:headers[i].minColumnWidth, isPrimaryKey: headers[i].name == 'TaskID' ? true:false};//,type:headers[i].dataType};
        //visible: headers[i].name == 'TaskID' ? false:true
      colms.push(colmElem);
      index++;
    }
    return colms;
  }

  bindChooseColumnOptions() {
    this.chooseColumnOptions = [];
    var i =0;
    this.treeGridHeaders.forEach(element => {
    if(element.name !='TaskID') {
      var option = {
        index: i,
        name : element.name,
        isChecked : true
      }
    this.chooseColumnOptions.push(option);
    }
    i++;
    });
    //console.log(this.chooseColumnOptions);
  }

  // start - obsolete methods
  updateHeader(e : Event) {
    var newHeaderval = $('#input-menu-edit').val();
    var contextVal = $('#ok-menu-edit').attr('context-menu');
    var headerVal = contextVal.split('@')[0];
    var index = contextVal.split('@')[1];
    this.dataService.updateHeaderColumnName(index,newHeaderval);
  }

  addHeader(e : Event) {
    var newHeaderval = $('#input-menu-add').val();
    var contextVal = $('#ok-menu-add').attr('context-menu');
    var headerVal = contextVal.split('@')[0];
    var index = contextVal.split('@')[1];
    this.dataService.addHeaderColumnName(index,newHeaderval);
  }

  deleteHeader() {
    if(confirm('Are you sure?') == true) {
      var elemToDeletePos = $('#current-selected-index').val();
      this.dataService.deleteHeaderColumnName(elemToDeletePos);
    }
  }
  // end - obsolete methods

  deleteHeaderObject() {
    if(confirm('Are you sure, delete cannot be undone?') == true) {
      var elemToDeletePos = $('#current-selected-index').val();
      this.dataService.deleteHeaderColumnObject(elemToDeletePos);
    }
  }

  setDefaultsAndBindEventsOnGridReload() {
    $('#trigger-defaults-initial-load-events').trigger('click');
  }

  hideShowSelectedColumns() {
    this.chooseColumnOptions.filter((value, index) => {
      var column = this.treegrid.getColumnByField(value.name);
      if(!value.isChecked) {
        column.visible = false;
      } else  {
        column.visible = true;
      }
    });
    this.setDefaultsAndBindEventsOnGridReload();
    this.treegrid.refreshColumns();
  }

  frozeColumns(e) {
    var isChecked = e.target.checked;
    if(isChecked) {
      this.treegrid.enableVirtualization=false;
      this.treegrid.enableInfiniteScrolling = true;
      var elemToFreezePos = $('#current-selected-index').val();
      this.treegrid.frozenColumns = parseInt(elemToFreezePos)+1;
      $('#current-frozed-index').val(elemToFreezePos);
      setTimeout(() => {
        this.treegrid.dataSource= this.treeGridData;
        this.treegrid.refreshColumns();
      }, 100);

    }else {
      this.treegrid.enableVirtualization=true;
      this.treegrid.enableInfiniteScrolling = false;
      this.treegrid.frozenColumns = 0;
      $('#current-frozed-index').val('');
      setTimeout(() => {
        this.treegrid.dataSource= this.treeGridData;
      }, 100);
    }
    this.setDefaultsAndBindEventsOnGridReload();
  }

  openAddDialog() {
    this.treegrid.showSpinner();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    // dialogConfig.position = {
    //   'top': '0',
    //   left: '0',
    // };
    dialogConfig.maxWidth=500;
    dialogConfig.width="450px";
    dialogConfig.panelClass ="add-edit-modal";
    dialogConfig.data = {
      mode: 'Add',
      title: 'Add/Edit Column',
      obj : null
    };
    //this.dialog.open(AddEditColumnComponent,dialogConfig);
    const dialogRef = this.dialog.open(AddEditColumnComponent,dialogConfig);
    dialogRef.afterOpened().subscribe((data)=>{
      this.treegrid.hideSpinner();
    });
    dialogRef.afterClosed().subscribe((data)=>{
      if(typeof(data)!="undefined" && data != null && data !='') {
        var jsonObj = JSON.stringify(data);
        var index = $('#current-selected-index').val();
        this.dataService.addHeaderColumnObject(index,jsonObj);
      }
    });
    this.setDefaultsAndBindEventsOnGridReload();
  }

  openEditDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    var index = $('#current-selected-index').val();
    // dialogConfig.position = {
    //   'top': '0',
    //   left: '0',
    // };
    dialogConfig.maxWidth=500;
    dialogConfig.width="450px";
    dialogConfig.panelClass ="add-edit-modal";
    dialogConfig.data = {
      mode: 'Edit',
      title: 'Add/Edit Column',
      obj : {...this.treeGridHeaders[index]}
    };
    //this.dialog.open(AddEditColumnComponent,dialogConfig);
    const dialogRef = this.dialog.open(AddEditColumnComponent,dialogConfig);

    dialogRef.afterClosed().subscribe((data)=>{
      if(typeof(data)!="undefined" && data != null && data !='') {
        var jsonObj = JSON.stringify(data);
        console.log(jsonObj);
        this.dataService.updateHeaderColumnObject(index,jsonObj);
        //addClassToHeader(elementRef,data.name,data.fontColor,data.backgroundColor);
      }
    });
    this.setDefaultsAndBindEventsOnGridReload();

  }

  onTreeGridActionComplete(args:any) {
    //console.log(this.treeGridHeaders);
    //maintainStateOfGridAfterActionComplete(this.treeGridHeaders,false);
  }

  onTreeGridDataBound(args:any) {
    maintainStateOfGridAfterActionComplete(this.treeGridHeaders,false);
  }

  onTreeGridActionBegin(args:any) {
  }

  onTreeGridRowDrop(args:any) {
    // console.log(args);
    this.mode ='cut';
    if(args.dropPosition != 'Invalid') {
      var index = args.dropIndex;
      var row = this.treegrid.getRowByIndex(index);
      var rowInfo = this.treegrid.getRowInfo(row);
      var rowData = rowInfo.rowData;
      var taskId = 0;
      for(const prop in rowData){
        if (rowData.hasOwnProperty(prop)) {
          if(prop == 'TaskID') {
              taskId = rowData[prop];
              break;
          }
        }
      }
      if(typeof(taskId)=="undefined" || taskId == null || taskId == 0)
          taskId = $('tr[aria-rowindex="'+index+'"]').find('td').eq(1).text();
      if(args.dropPosition=='bottomSegment')
          this.dataService.pasteRowDataNext(args.data,taskId,this.mode);
      else if (args.dropPosition=='middleSegment')
        this.dataService.pasteRowDataChild(args.data,taskId,this.mode);
      else this.dataService.pasteRowDataTop(args.data,taskId,this.mode);
      this.mode =null;
      this.setDefaultsAndBindEventsOnGridReload();
    }
  }

  onTreeGridRowDrag(args:any) {
    //console.log(args);
  }

  enableSortOnColumn(ele:any) {
    var isChecked = ele.target.checked;
    //var columnName = $('#current-selected-header-val').val();
    //var sortSettings = { field: columnName, direction: 'Ascending'  }
    if(isChecked) {
      // this.sortSettings.columns.push(sortSettings);
      //this.treegrid.grid.sortColumn('taskID', 'Descending',true);
      this.treegrid.allowSorting = true;
      this.treegrid.allowMultiSorting = true;
    }
    else  {
      // console.log(this.sortSettings.columns);
      // //console.log(this.sortSettings.columns.find(o => o.field == columnName));
      // var index = this.sortSettings.columns.findIndex(o => o.field == columnName);
      // if(index != -1) {
      //   this.sortSettings.columns.splice(index,1);
      //   this.treegrid.grid.removeSortColumn(columnName);
      // }
      // console.log(this.sortSettings.columns);
      // this.treegrid.refreshHeader();
      // console.log(index);
      this.treegrid.allowSorting = false;
      this.treegrid.allowMultiSorting = false;
    }
    this.setDefaultsAndBindEventsOnGridReload();

  }

  enableMultiSelect(ele:any) {
    var isChecked = ele.target.checked;
    if(isChecked) {
      this.treegrid.selectionSettings.type = 'Multiple';
    }
    else  {
      this.treegrid.selectionSettings.type = 'Single';
    }
    this.setDefaultsAndBindEventsOnGridReload();
  }

  openAddRowNextDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.maxWidth=500;
    dialogConfig.width="450px";
    dialogConfig.panelClass ="add-edit-modal";
    dialogConfig.data = {
      mode: 'Add Next -',
      title: 'Add/Edit Row',
      obj : {
        columns : [... this.treeGridHeaders]
      }
    };
    //this.dialog.open(AddEditColumnComponent,dialogConfig);
    const dialogRef = this.dialog.open(AddEditRowComponent,dialogConfig);
    var index = $('#current-selected-row-index').val();
    this.toggleRowSelection(parseInt(index));
    this.treegrid.selectRow(parseInt(index));

    dialogRef.afterClosed().subscribe((data)=>{
      if(typeof(data)!="undefined" && data != null && data !='') {
        var jsonObj = data;
        // console.log(jsonObj);
        // console.log(this.currentSelectedRows);
        this.dataService.addRowNext(jsonObj,this.currentSelectedRows[0]);
      }
    });
    this.setDefaultsAndBindEventsOnGridReload();

  }

  openAddRowChildDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.maxWidth=500;
    dialogConfig.width="450px";
    dialogConfig.panelClass ="add-edit-modal";
    dialogConfig.data = {
      mode: 'Add Child -',
      title: 'Add/Edit Row',
      obj : {
        columns : [... this.treeGridHeaders]
      }
    };
    //this.dialog.open(AddEditColumnComponent,dialogConfig);
    const dialogRef = this.dialog.open(AddEditRowComponent,dialogConfig);
    var index = $('#current-selected-row-index').val();
    this.toggleRowSelection(parseInt(index));
    this.treegrid.selectRow(parseInt(index));

    dialogRef.afterClosed().subscribe((data)=>{
      if(typeof(data)!="undefined" && data != null && data !='') {
        var jsonObj = data;
        // console.log(jsonObj);
        // console.log(this.currentSelectedRows);
        this.dataService.addRowChild(jsonObj,this.currentSelectedRows[0]);
      }
    });
    this.setDefaultsAndBindEventsOnGridReload();
  }

  openEditRowChildDialog() {
    var index = $('#current-selected-row-index').val();
    this.toggleRowSelection(parseInt(index));
    this.treegrid.selectRow(parseInt(index));

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.maxWidth=500;
    dialogConfig.width="450px";
    dialogConfig.panelClass ="add-edit-modal";
    dialogConfig.data = {
      mode: 'Edit -',
      title: 'Add/Edit Row',
      obj : {
        columns : [... this.treeGridHeaders],
        row :this.currentSelectedRows[0]
      }
    };
    //this.dialog.open(AddEditColumnComponent,dialogConfig);
    const dialogRef = this.dialog.open(AddEditRowComponent,dialogConfig);

    dialogRef.afterClosed().subscribe((data)=>{
      if(typeof(data)!="undefined" && data != null && data !='') {
        var jsonObj = data;
        // console.log(jsonObj);
        // console.log(this.currentSelectedRows);
        this.dataService.editRow(jsonObj,this.currentSelectedRows[0].data.TaskID);
      }
    });
    this.setDefaultsAndBindEventsOnGridReload();
  }

  deleteRow() {
    if(confirm('Are you sure, delete cannot be undone?') == true) {
      var index = $('#current-selected-row-index').val();
      this.toggleRowSelection(parseInt(index));
      this.treegrid.selectRow(parseInt(index));
      this.dataService.deleteRow(this.currentSelectedRows[0]);
    }
    this.setDefaultsAndBindEventsOnGridReload();

  }

  treeGridSelectAndDeselectRows(obj,action) {
    if(action == 'selected') {
        var index =this.currentSelectedRows.findIndex((o)=>o.rowIndex==obj.rowIndex);
        if(index == -1) {
          this.currentSelectedRows.push(obj);
          if(this.mode == null)
            this.render.addClass(obj.row,"e-row-active");
          else this.render.addClass(obj.row,"e-row-cut-copy");
        }
    }
    else {
      this.mode = null;
      if(typeof(obj.rowIndexes)!="undefined" && obj.rowIndexes !=null && obj.rowIndexes.length>0) {
        for(var i=0;i<obj.rowIndexes.length;i++) {
          var index =this.currentSelectedRows.findIndex((o)=>o.rowIndex==obj.rowIndexes[i]);
          this.render.removeClass(this.currentSelectedRows[index].row,"e-row-active");
          this.render.removeClass(this.currentSelectedRows[index].row,"e-row-cut-copy");
          this.currentSelectedRows.splice(index,1);
        }
      } else {
          var index =this.currentSelectedRows.findIndex((o)=>o.rowIndex==obj.rowIndex);
          this.render.removeClass(this.currentSelectedRows[index].row,"e-row-active");
          this.render.removeClass(this.currentSelectedRows[index].row,"e-row-cut-copy");
          this.currentSelectedRows.splice(index,1);
      }
    }
    //console.log(this.currentSelectedRows);
  }

  toggleRowSelection(index) {
    for(var i=0;i<this.currentSelectedRows.length;i++) {
      if(this.currentSelectedRows[i].rowIndex != index) {
        this.treegrid.selectRow(this.currentSelectedRows[i].index,true);
      }
    }
  }

  copyRow() {
    this.mode = 'copy';
    if(this.currentSelectedRows.length <=0) {
      var index = $('#current-selected-row-index').val();
      this.treegrid.selectRow(parseInt(index));
    }
    for(var i=0;i<this.currentSelectedRows.length;i++) {
      this.render.removeClass(this.currentSelectedRows[i].row,"e-row-active");
      this.render.addClass(this.currentSelectedRows[i].row,"e-row-cut-copy");
    }
    this.setDefaultsAndBindEventsOnGridReload();
  }

  cutRow() {
    this.mode = 'cut';
    if(this.currentSelectedRows.length <=0) {
      var index = $('#current-selected-row-index').val();
      this.treegrid.selectRow(parseInt(index));
    }

    for(var i=0;i<this.currentSelectedRows.length;i++) {
      this.render.removeClass(this.currentSelectedRows[i].row,"e-row-active");
      this.render.addClass(this.currentSelectedRows[i].row,"e-row-cut-copy");
    }
    this.setDefaultsAndBindEventsOnGridReload();
    //this.currentSelectedRows.sort((a, b) => parseFloat(a.rowIndex) - parseFloat(b.rowIndex));
  }

  pasteNext() {
    this.currentSelectedRows.sort((a, b) => parseFloat(a.rowIndex) - parseFloat(b.rowIndex));
    var rowsObj = [... this.currentSelectedRows];
    var index = $('#current-selected-row-index').val();
    var row = this.treegrid.getRowByIndex(index);
    var rowInfo = this.treegrid.getRowInfo(row);
    var rowData = rowInfo.rowData;
    var taskId = 0;
    for(const prop in rowData){
      if (rowData.hasOwnProperty(prop)) {
        if(prop == 'TaskID') {
            taskId = rowData[prop];
            break;
        }
     }
    }

    if(typeof(taskId)=="undefined" || taskId == null || taskId == 0)
        taskId = $('tr[aria-rowindex="'+index+'"]').find('td').eq(1).text();
    this.dataService.pasteRowDataNext(rowsObj,taskId,this.mode);
    this.setDefaultsAndBindEventsOnGridReload();
  }

  pasteChild() {
    this.currentSelectedRows.sort((a, b) => parseFloat(a.rowIndex) - parseFloat(b.rowIndex));
    var rowsObj = [... this.currentSelectedRows];
    var index = $('#current-selected-row-index').val();
    var row = this.treegrid.getRowByIndex(index);
    var rowInfo = this.treegrid.getRowInfo(row);
    var rowData = rowInfo.rowData;
    var taskId = 0;
    for(const prop in rowData){
      if (rowData.hasOwnProperty(prop)) {
        if(prop == 'TaskID') {
            taskId = rowData[prop];
            console.log(taskId)
            break;
        }
     }
    }
    if(typeof(taskId)=="undefined" || taskId == null || taskId == 0)
        taskId = $('tr[aria-rowindex="'+index+'"]').find('td').eq(1).text();
    var isSameRow = rowsObj.findIndex((o)=>o.data.TaskID == taskId) > -1;
    if(this.mode == 'cut') {
      if(!isSameRow)
        this.dataService.pasteRowDataChild(rowsObj,taskId,this.mode);
      else {
        alert('Identical parent child combination, operation denied.')
      }
    } else this.dataService.pasteRowDataChild(rowsObj,taskId,this.mode);
    this.setDefaultsAndBindEventsOnGridReload();
  }

  ngOnDestroy(): void {
    this.dataServiceSub.unsubscribe();
    this.socketServiceSub.unsubscribe();
  }


}


