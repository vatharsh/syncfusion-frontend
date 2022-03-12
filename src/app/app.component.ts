// import { sampleData } from './dataSource/datasource';
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
declare function bindMinColWidth(headers:[]):any;
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
  rowSelectionMode ='Single';
  public filterSettings: Object;
  public sortSettings: any =  { columns: []}
  @ViewChild('multiSort')
  public multiSort:ElementRef;
//{ columns: []};
  public selectionSettings: Object;
  mode = null;
  constructor(private dataService: DataService,private dialog: MatDialog,
   private socketService: SocketService, private render:Renderer2,private elRef:ElementRef) { }
  @ViewChild('treegrid') treegrid : TreeGrid=new TreeGrid();
  innerHeight:any;
  isRowActive = false;
  internalEvent =false;
  isLongPress = false;

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
        $('#multiSelect-row').prop('checked', false);
        //maintainStateOfGridAfterActionComplete(this.treeGridHeaders,false);
        bindMinColWidth(this.treeGridHeaders);
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
            this.treegrid.selectionSettings.type = 'Single';
              //this.selectionSettings = { type: 'Single' };
            this.rowSelectionMode = 'Single';
            this.bindChooseColumnOptions();
            this.setDefaultsAndBindEventsOnGridReload();
            $('#multiSelect-row').prop('checked', false);
            //maintainStateOfGridAfterActionComplete(this.treeGridHeaders,false);
            this.treegrid.clearFiltering();
            this.treegrid.hideSpinner();
            this.currentSelectedRows=[];
            bindMinColWidth(this.treeGridHeaders);
            this.mode=null;
          } else {
            this.treegrid.hideSpinner();
          }
        });
      }
    });

    this.socketServiceSub = this.socketService.listen('TreeGrid data modified').subscribe( data => {
      this.treegrid.showSpinner();
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
            $('#multiSelect-row').prop('checked', false);
            this.treegrid.hideSpinner();
            this.currentSelectedRows=[];
            bindMinColWidth(this.treeGridHeaders);
            this.mode=null;
          }else {
            alert(res.message);
            this.treegrid.hideSpinner();
          }
        });
      } else this.treegrid.hideSpinner();
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
          // this.treegrid.enableInfiniteScrolling = true;
          this.treegrid.dataSource= this.treeGridData;
          this.treegrid.hideSpinner();
        }, 2000);
        this.treegrid.selectionSettings = this.selectionSettings;
        this.treegrid.allowRowDragAndDrop = true;
        this.treegrid.height=screen.height-172;

        this.treegrid.editSettings= {
          allowEditing: true,
          allowAdding: true,
          allowDeleting: true,
          mode: "Row"
        };

        this.treegrid.rowSelected.subscribe((e)=>{
            setTimeout(() => {
              var isPressureEventTriggered = $('#pressure-event-triggered-val').val() == '1';
              if(!isPressureEventTriggered)
                    this.treeGridSelectAndDeselectRows(e,'selected');
            }, 300);
        });

        this.treegrid.rowDeselected.subscribe((e)=>{
          setTimeout(() => {
            var isContextMenuVisible = $('.ui-dialog').is(':visible') == true;
            console.log(isContextMenuVisible);
            if(!isContextMenuVisible) {
              this.treeGridSelectAndDeselectRows(e,'deselected');
            }
          }, 300);
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

  onTreeGridRowSelecting(e) {
    //console.log(this.isLongPress);
    if(this.isLongPress)
        e.cancel = true;
  }

  onTreeGridRowDeslecting(e) {
    //e.cancel = true;
  }

  makeTreeGridHeaders () {
    let headers = this.treeGridHeaders;//['taskID','taskName','startDate','duration','priority'];
    let colms = [];
    var index= 0;
    for(var i in headers)
    {
      var colmElem = { field: headers[i].name, headerText: headers[i].name,
        textAlign: headers[i].alignment,
        width:'200%',
        //minWidth:headers[i].minColumnWidth,
        customAttributes: headers[i].textWrap == true ? {
          class: "cell-text-wrap" ,
          ['style']: {
            'background-color':headers[i].backgroundColor,
            'color':headers[i].fontColor,
            'font-size':headers[i].fontSize +"px",
            'min-width' : headers[i].minColumnWidth
          }
      } : {
        ['style']: {
          'background-color':headers[i].backgroundColor,
          'color':headers[i].fontColor,
          'font-size':headers[i].fontSize +"px",
          'min-width' : headers[i].minColumnWidth
        }
      },
        isPrimaryKey: headers[i].name == 'TaskID' ? true:false};//,type:headers[i].dataType};
        //visible: headers[i].name == 'TaskID' ? false:true
      colms.push(colmElem);
      index++;
    }
    return colms;
  }

  bindChooseColumnOptions() {
    this.chooseColumnOptions = [];
    var i =1;
    var optionSelectAll = {
      index: 0,
      name : 'Select All',
      isChecked : true,
      click:"selectAll()"
    }
    this.chooseColumnOptions.push(optionSelectAll);

    this.treeGridHeaders.forEach(element => {
    if(element.name !='TaskID') {
      var option = {
        index: i,
        name : element.name,
        isChecked : true,
        click:""
      }
    this.chooseColumnOptions.push(option);
    }
    i++;
    });
    //console.log(this.chooseColumnOptions);
  }

  selectAll(ele: any) {
    //console.log(ele.srcElement.defaultValue);
    var colval = ele.srcElement.defaultValue;
    var isChecked = ele.target.checked;
    if(colval == "Select All") {
      if(isChecked) {
        this.chooseColumnOptions.filter((value, index) => {
          this.chooseColumnOptions[index].isChecked = true;
        });
      } else {
        this.chooseColumnOptions.filter((value, index) => {
          this.chooseColumnOptions[index].isChecked = false;
        });
      }
    } else {
      if(!isChecked) {
        this.chooseColumnOptions[0].isChecked = false;
      } else {
        //console.log(this.chooseColumnOptions.find((o)=>o.isChecked == false && o.name != "Select All" && o.name !=colval));
        var isAllSelected = typeof(this.chooseColumnOptions.find((o)=>o.isChecked == false && o.name != "Select All" && o.name !=colval))=="undefined";
        if(isAllSelected) this.chooseColumnOptions[0].isChecked = true;
      }
    }
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
    this.setDefaultsAndBindEventsOnGridReload();
    if(confirm('Are you sure, delete cannot be undone?') == true) {
      this.treegrid.showSpinner();
      var elemToDeletePos = $('#current-selected-index').val();
      var dropColumnObj = this.treeGridHeaders[elemToDeletePos];
      if(dropColumnObj.name !="TaskID") {
        this.dataService.deleteHeaderColumnObject(elemToDeletePos);
      }else {
        alert("Can't delete primary key column!");
        this.treegrid.hideSpinner();
      }
      //this.dataService.deleteHeaderColumnObject(elemToDeletePos);
    }
  }

  setDefaultsAndBindEventsOnGridReload() {
    $('#trigger-defaults-initial-load-events').trigger('click');
  }

  hideShowSelectedColumns() {
    this.chooseColumnOptions.filter((value, index) => {
      if(value.name != "Select All") {
        var column = this.treegrid.getColumnByField(value.name);
        if(!value.isChecked) {
          column.visible = false;
        } else  {
          column.visible = true;
        }
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
      }, 500);

    }else {
      this.treegrid.enableVirtualization=true;
      this.treegrid.enableInfiniteScrolling = false;
      this.treegrid.frozenColumns = 0;
      $('#current-frozed-index').val('');
      setTimeout(() => {
        this.treegrid.dataSource= this.treeGridData;
        this.treegrid.refreshHeader();
        bindMinColWidth(this.treeGridHeaders);
      }, 500);
    }
    this.setDefaultsAndBindEventsOnGridReload();
  }

  openAddDialog() {
    this.treegrid.showSpinner();
    this.setDefaultsAndBindEventsOnGridReload();
    setTimeout(() => {
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
        //console.log(jsonObj);
        this.dataService.addHeaderColumnObject(index,jsonObj);
      }
    });
    }, 500);

  }

  openEditDialog() {
    this.treegrid.showSpinner();
    var index = $('#current-selected-index').val();
    var dropColumnObj = this.treeGridHeaders[index];
    this.setDefaultsAndBindEventsOnGridReload();

    setTimeout(() => {
      if(dropColumnObj.name =="TaskID") {
        alert("Can't edit primary key column!");
        this.treegrid.hideSpinner();
        return false;
      }
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
        mode: 'Edit',
        title: 'Add/Edit Column',
        obj : {...this.treeGridHeaders[index]}
      };
      //this.dialog.open(AddEditColumnComponent,dialogConfig);
      const dialogRef = this.dialog.open(AddEditColumnComponent,dialogConfig);
      dialogRef.afterOpened().subscribe((data)=>{
        this.treegrid.hideSpinner();
      });
      dialogRef.afterClosed().subscribe((data)=>{
        if(typeof(data)!="undefined" && data != null && data !='') {
          //console.log(data)
          var jsonObj = JSON.stringify(data);
          this.dataService.updateHeaderColumnObject(index,jsonObj);
          //addClassToHeader(elementRef,data.name,data.fontColor,data.backgroundColor);
        }
      });
    }, 500);
  }

  onTreeGridActionComplete(args:any) {
    //console.log(this.treeGridHeaders);
    //maintainStateOfGridAfterActionComplete(this.treeGridHeaders,false);
  }

  onTreeGridDataBound(args:any) {
     //maintainStateOfGridAfterActionComplete(this.treeGridHeaders,false);
    // this.setClassBackAfterGridDataBound();

  }

  onTreeGridRowDataBound (args:any) {
    if(args.row.childNodes[0].className.indexOf('e-active')>-1 && this.mode !=null) {
      this.render.addClass(args.row,"e-row-cut-copy");
    }else {
      this.render.removeClass(args.row,"e-row-cut-copy");
    }

  }

  onTreeGridRowDrop(args:any) {
    // console.log(args);
    this.mode ='cut';
    if(args.dropPosition != 'Invalid') {
      this.treegrid.showSpinner();
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

  onTreeGridColumnDrop(args:any) {
    // console.log(args);
    // console.log(this.treeGridHeaders[args.column.index]);
    // console.log(args.target.innerText);
      setTimeout(() => {
      this.treegrid.showSpinner();
      var columnCurrIndex = args.column.index;
      var dropColumnObj = this.treeGridHeaders[columnCurrIndex];
      var targetName = args.target.innerText;
      var targetIndex = this.treeGridHeaders.findIndex((o)=>o.name ==targetName);//this.treegrid.getColumnByField(targetName).index;
      console.log(targetIndex);
      if(targetIndex >=0) {
        if(parseInt(targetIndex) != parseInt(columnCurrIndex))
          this.dataService.dragDropColumn(columnCurrIndex,dropColumnObj,targetIndex);
        else this.treegrid.hideSpinner();
      }else this.treegrid.hideSpinner();
    }, 100);
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
    this.currentSelectedRows = [];

    if(isChecked) {
      this.treegrid.selectionSettings.type = 'Multiple';
      //this.selectionSettings = { type: 'Multiple' };
      this.rowSelectionMode = 'Multiple';
    }
    else  {
      this.treegrid.selectionSettings.type = 'Single';
      //this.selectionSettings = { type: 'Single' };
      this.rowSelectionMode = 'Single';
    }
    //this.treegrid.dataSource = this.treeGridData;
    //this.treegrid.refreshColumns();
    this.setDefaultsAndBindEventsOnGridReload();
  }

  disableDragAndDrop(ele:any) {
    var isChecked = ele.target.checked;
    if(isChecked) {
      this.treegrid.allowRowDragAndDrop = false;
    }
    else  {
      this.treegrid.allowRowDragAndDrop = true;
    }
    this.currentSelectedRows=[];
    this.mode=null;
    this.setDefaultsAndBindEventsOnGridReload();
  }

  openAddRowNextDialog() {
    this.treegrid.showSpinner();
    var index = $('#current-selected-row-index').val();
    this.toggleRowSelection(parseInt(index));
    this.treegrid.selectRow(parseInt(index));
    this.setDefaultsAndBindEventsOnGridReload();
    setTimeout(() => {
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
      dialogRef.afterOpened().subscribe((data)=>{
        this.treegrid.hideSpinner();
      });
      dialogRef.afterClosed().subscribe((data)=>{
        if(typeof(data)!="undefined" && data != null && data !='') {
          var jsonObj = data;
          // console.log(jsonObj);
          // console.log(this.currentSelectedRows);
          var row = this.treegrid.getRowByIndex(parseInt(index));
          var rowInfo = this.treegrid.getRowInfo(row);
          var rowdata:any = rowInfo.rowData;
          this.dataService.addRowNext(jsonObj,rowdata);
        }
      });
    }, 500);
  }

  openAddRowChildDialog() {
    this.treegrid.showSpinner();
    var index = $('#current-selected-row-index').val();
    this.toggleRowSelection(parseInt(index));
    this.treegrid.selectRow(parseInt(index));
    this.setDefaultsAndBindEventsOnGridReload();
    setTimeout(() => {
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


        dialogRef.afterOpened().subscribe((data)=>{
          this.treegrid.hideSpinner();
        });
        dialogRef.afterClosed().subscribe((data)=>{
          if(typeof(data)!="undefined" && data != null && data !='') {
            var jsonObj = data;
            // console.log(jsonObj);
            // console.log(this.currentSelectedRows);
            var row = this.treegrid.getRowByIndex(parseInt(index));
            var rowInfo = this.treegrid.getRowInfo(row);
            var rowdata:any = rowInfo.rowData;
            this.dataService.addRowChild(jsonObj,rowdata);
          }
        });
    }, 500);

  }

  openEditRowDialog() {
    this.treegrid.showSpinner();
    var index = $('#current-selected-row-index').val();
    this.internalEvent =true;
    this.toggleRowSelection(parseInt(index));
    this.treegrid.selectRow(parseInt(index));
    this.setDefaultsAndBindEventsOnGridReload();

    setTimeout(() => {
      var row = this.treegrid.getRowByIndex(parseInt(index));
      var rowInfo = this.treegrid.getRowInfo(row);
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
          row :rowInfo.rowData
        }
      };
      //this.dialog.open(AddEditColumnComponent,dialogConfig);
      const dialogRef = this.dialog.open(AddEditRowComponent,dialogConfig);

      dialogRef.afterOpened().subscribe((data)=>{
        this.treegrid.hideSpinner();
        this.internalEvent =false;
      });
      dialogRef.afterClosed().subscribe((data)=>{
        if(typeof(data)!="undefined" && data != null && data !='') {
          var jsonObj = data;
          // console.log(jsonObj);
          // console.log(this.currentSelectedRows);
          var row = this.treegrid.getRowByIndex(parseInt(index));
          var rowInfo = this.treegrid.getRowInfo(row);
          var rowdata:any = rowInfo.rowData;
          this.dataService.editRow(jsonObj,rowdata.TaskID);
        }
      });
    }, 500);

  }

  deleteRow() {
    var index = $('#current-selected-row-index').val();
    if(this.treegrid.getSelectedRowIndexes().length <=0) {
      this.toggleRowSelection(parseInt(index));
      this.treegrid.selectRow(parseInt(index));
    }
    this.setDefaultsAndBindEventsOnGridReload();

    if(confirm('Are you sure, delete cannot be undone?') == true) {
      setTimeout(() => {
        var rows = [];
        var currSelectedRowsIndexes = this.treegrid.getSelectedRowIndexes();
        currSelectedRowsIndexes.forEach(index => {
          var row = this.treegrid.getRowByIndex(index);
          var rowInfo = this.treegrid.getRowInfo(row);
          var selectedRowObj = {
            row: rowInfo.rowData
          }
          if(this.mode != null) this.render.addClass(row,"e-row-cut-copy");
          rows.push(selectedRowObj);
        });
        // console.log(rows);
        this.dataService.deleteRow(rows);
      }, 500);

    }
    this.setDefaultsAndBindEventsOnGridReload();
  }

  treeGridSelectAndDeselectRows(obj,action) {
    // console.log(action);
    // console.log(this.mode);
    if(action !="selected"){
      this.mode = null;
      if(typeof(obj.row)!="undefined" && typeof(obj.row.length)!="undefined") {
        obj.row.forEach(element => {
          if(typeof(element)!="undefined") {
            this.render.removeClass(element,"e-row-cut-copy");
          }

        });
      } else {
        if(typeof(obj.row)!="undefined") {
          this.render.removeClass(obj.row,"e-row-active");
          this.render.removeClass(obj.row,"e-row-cut-copy");
        }
      }
    }

    this.currentSelectedRows = [];
    var currSelectedRowsIndexes = this.treegrid.getSelectedRowIndexes();
    currSelectedRowsIndexes.forEach(index => {
      var row = this.treegrid.getRowByIndex(index);
      var selectedRowObj = {
        row: row
      }
      if(this.mode != null) this.render.addClass(row,"e-row-cut-copy");
      this.currentSelectedRows.push(selectedRowObj);
    });


  }

  setClassBackAfterGridDataBound() {
    //console.log(this.currentSelectedRows);
    //console.log(this.treegrid.getSelectedRecords());
    this.currentSelectedRows.forEach(element => {
      $('tr[aria-rowindex="'+element.data.index+'"]').addClass(element.row.className);
      //console.log(this.treegrid.getRowByIndex(element.data.index));

    });

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
    var index = $('#current-selected-row-index').val();
    if(this.treegrid.getSelectedRowIndexes().length <=0) {
      this.treegrid.selectRow(parseInt(index));
    }
    // console.log(this.currentSelectedRows);
    // console.log(this.treegrid.getSelectedRecords());
    // for(var i=0;i<this.currentSelectedRows.length;i++) {
    //   // $('tr[aria-rowindex="'+this.currentSelectedRows[i].data.index+'"]').removeClass("e-row-active");
    //   // $('tr[aria-rowindex="'+this.currentSelectedRows[i].data.index+'"]').addClass("e-row-cut-copy");
    //   if(typeof(this.currentSelectedRows[i])!="undefined") {
    //    //this.render.removeClass(this.currentSelectedRows[i].row,"e-row-active");
    //    this.render.addClass(this.currentSelectedRows[i].row,"e-row-cut-copy");
    //   }
    // }

    var currSelectedRowsIndexes = this.treegrid.getSelectedRowIndexes();
    currSelectedRowsIndexes.forEach(index => {
      var row = this.treegrid.getRowByIndex(index);
      this.render.addClass(row,"e-row-cut-copy");
    });

    $('#pressure-event-triggered-val').val(0);
    this.setDefaultsAndBindEventsOnGridReload();
  }

  cutRow() {
    this.mode = 'cut';
    if(this.treegrid.getSelectedRowIndexes().length <=0) {
      var index = $('#current-selected-row-index').val();
      this.treegrid.selectRow(parseInt(index));
    }

    // for(var i=0;i<this.currentSelectedRows.length;i++) {
    //   // $('tr[aria-rowindex="'+this.currentSelectedRows[i].data.index+'"]').removeClass("e-row-active");
    //   // $('tr[aria-rowindex="'+this.currentSelectedRows[i].data.index+'"]').addClass("e-row-cut-copy");
    //   if(typeof(this.currentSelectedRows[i])!="undefined") {
    //     this.render.removeClass(this.currentSelectedRows[i].row,"e-row-active");
    //     this.render.addClass(this.currentSelectedRows[i].row,"e-row-cut-copy");
    //    }
    // }

    var currSelectedRowsIndexes = this.treegrid.getSelectedRowIndexes();
    currSelectedRowsIndexes.forEach(index => {
      var row = this.treegrid.getRowByIndex(index);
      this.render.addClass(row,"e-row-cut-copy");
    });

    $('#pressure-event-triggered-val').val(0);
    this.setDefaultsAndBindEventsOnGridReload();
    //this.currentSelectedRows.sort((a, b) => parseFloat(a.rowIndex) - parseFloat(b.rowIndex));
  }

  pasteNext() {
    this.treegrid.showSpinner();
    this.currentSelectedRows.sort((a, b) => parseFloat(a.rowIndex) - parseFloat(b.rowIndex));
    //var rowsObj = [... this.currentSelectedRows];
    var rowsObj = [... this.treegrid.getSelectedRecords()];
    var index = $('#current-selected-row-index').val();
    var row = this.treegrid.getRowByIndex(parseInt(index));
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
    //console.log(rowsObj);


    this.dataService.pasteRowDataNext(rowsObj,taskId,this.mode);
    this.currentSelectedRows=[];
    this.setDefaultsAndBindEventsOnGridReload();
  }

  pasteChild() {
    this.treegrid.showSpinner();
    this.currentSelectedRows.sort((a, b) => parseFloat(a.rowIndex) - parseFloat(b.rowIndex));
    //var rowsObj = [... this.currentSelectedRows];
    var rowsObj:any = [... this.treegrid.getSelectedRecords()];
    var index = $('#current-selected-row-index').val();
    //console.log(index);

    var row = this.treegrid.getRowByIndex(parseInt(index));
    var rowInfo = this.treegrid.getRowInfo(row);
    var rowData = rowInfo.rowData;
    // console.log(row);
    // console.log(rowData);
    if(typeof(rowData) =='undefined') return false;
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
    // var isSameRow = rowsObj.findIndex((o)=>o.data.TaskID == taskId) > -1;
    var isSameRow = rowsObj.findIndex((o)=>o.TaskID == taskId) > -1;
    if(this.mode == 'cut') {
      if(!isSameRow)
        this.dataService.pasteRowDataChild(rowsObj,taskId,this.mode);
      else {
        alert('Identical parent child combination, operation denied.')
      }
    } else {
            this.dataService.pasteRowDataChild(rowsObj,taskId,this.mode);
    }
    this.currentSelectedRows=[];
    this.setDefaultsAndBindEventsOnGridReload();
  }

  ngOnDestroy(): void {
    this.dataServiceSub.unsubscribe();
    //this.socketServiceSub.unsubscribe();
  }


}


