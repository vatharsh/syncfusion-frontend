import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/syncfusion';

@Injectable({providedIn:'root'})
export class DataService  {
  private data: any;
  private dataServiceListener = new Subject<boolean>();

  constructor (private http: HttpClient) {
  }

  getDataServiceListener() {
    return this.dataServiceListener.asObservable();
  }

  getTreeGridData() {
    return this.http
    .get<{message:string, data: any}>(
      BACKEND_URL+"/getJsonSampleData"
    );
  }

  updateHeaderColumnName(id:string, colName: string){
    let headerColumnData;

    headerColumnData = {
        id:id,
        colName:colName
      }
      this.http.put(BACKEND_URL+"/updateHeaderColumnName",headerColumnData).subscribe((response:any)=>{
        if(response.message=='success') {
          this.dataServiceListener.next(true);
        }else {
          alert(response.message);
        }
    });
  }

  addHeaderColumnName(id:string, colName: string){
      let headerColumnData;

      headerColumnData = {
          id:id,
          colName:colName
        }
        this.http.put(BACKEND_URL+"/addHeaderColumnName",headerColumnData).subscribe((response:any)=>{
          if(response.message=='success') {
            this.dataServiceListener.next(true);
          }else {
            alert(response.message);
          }
      });
  }

  deleteHeaderColumnName(id:string){
        let headerColumnData;

        headerColumnData = {
            id:id
          }
          this.http.put(BACKEND_URL+"/removeHeaderColumnName",headerColumnData).subscribe((response:any)=>{
            if(response.message=='success') {
              this.dataServiceListener.next(true);
            }else {
              alert(response.message);
            }
        });
  }

  addHeaderColumnObject(id,obj) {
    //{ "name":"taskID","dataType": "Num","defaultValue": 0,"minColumnWidth":20,"fontSize":10,"fontColor":"red","backgroundColor":"red","alignment":"right","textWrap":true}
    let headerColumnData;
    headerColumnData = {
        id:id,
        obj:obj
      }
      this.http.put(BACKEND_URL+"/addHeaderColumnObject",headerColumnData).subscribe((response:any)=>{
        if(response.message=='success') {
          this.dataServiceListener.next(true);
        }else {
          alert(response.message);
        }
    });
  }

  updateHeaderColumnObject(id,obj) {
    let headerColumnData;
    headerColumnData = {
        id:id,
        obj:obj
      }
      this.http.put(BACKEND_URL+"/updateHeaderColumnObject",headerColumnData).subscribe((response:any)=>{
        if(response.message=='success') {
          this.dataServiceListener.next(true);
        }else {
          alert(response.message);
        }
    });
  }

  deleteHeaderColumnObject(id:string){
    let headerColumnData;

    headerColumnData = {
        id:id
      }
      this.http.put(BACKEND_URL+"/removeHeaderColumnObject",headerColumnData).subscribe((response:any)=>{
        if(response.message=='success') {
          this.dataServiceListener.next(true);
        } else {
          alert(response.message);
        }
    });
  }

  dragDropRows(dragDropEventObj:any) {
    let dragDropEvent;
    //console.log(dragDropEventObj.target);
    dragDropEvent = {
        dragDropEventObjData:dragDropEventObj.data,
        dropIndex : dragDropEventObj.dropIndex,
        fromIndex:dragDropEventObj.fromIndex,
        target : dragDropEventObj.target,
        dropPosition : dragDropEventObj.dropPosition
      }

      var payLoad = {dragDropEvent};
      this.http.put(BACKEND_URL+"/dragDropRows",payLoad).subscribe((response:any)=>{
        if(response.message=='success') {
          console.log(response.data);
          //this.dataServiceListener.next(true);
        } else {
          alert(response.message);
        }
    });
  }

  addRowNext(newRowObject:Object,selectedRowObject:Object) {
    let addRowEvent;
    addRowEvent = {
      newRowObj : newRowObject,
      selectedRowObj:selectedRowObject
    };
    // console.log(addRowEvent);
    this.http.put(BACKEND_URL+"/addRowNext",addRowEvent).subscribe((response:any)=>{
      if(response.message=='success') {
        this.dataServiceListener.next(true);
      } else {
        alert(response.message);
      }
    });
  }

  addRowChild(newRowObject:Object,selectedRowObject:Object) {
    let addRowEvent;
    addRowEvent = {
      newRowObj : newRowObject,
      selectedRowObj:selectedRowObject
    };
    // console.log(addRowEvent);
    this.http.put(BACKEND_URL+"/addRowChild",addRowEvent).subscribe((response:any)=>{
      if(response.message=='success') {
        this.dataServiceListener.next(true);
      } else {
        alert(response.message);
      }
    });
  }

  deleteRow(selectedRowObjects:any) {
    let deleteRowEvent;
    deleteRowEvent = {
      selectedRowObjs:selectedRowObjects
    };
    // console.log(addRowEvent);
    this.http.put(BACKEND_URL+"/deleteRow",deleteRowEvent).subscribe((response:any)=>{
      if(response.message=='success') {
        this.dataServiceListener.next(true);
      } else {
        alert(response.message);
      }
    });
  }

  editRow(modifyRowObj:Object,taskId) {
    let editRowEvent;
    editRowEvent = {
      modifyRowObj:modifyRowObj,
      taskId:taskId
    };
    // console.log(addRowEvent);
    this.http.put(BACKEND_URL+"/updateRow",editRowEvent).subscribe((response:any)=>{
      if(response.message=='success') {
        this.dataServiceListener.next(true);
      } else {
        alert(response.message);
      }
    });
  }

  pasteRowDataNext(rowsObj:Object,taskId,mode) {
    let pasteRowNextEvent;
    pasteRowNextEvent = {
      rowsObj : rowsObj,
      taskId:taskId,
      mode:mode
    };
    // console.log(addRowEvent);
    this.http.put(BACKEND_URL+"/pasteRowDataNext",pasteRowNextEvent).subscribe((response:any)=>{
      if(response.message=='success') {
        this.dataServiceListener.next(true);
      } else {
        alert(response.message);
      }
    });
  }

  pasteRowDataChild(rowsObj:Object,taskId,mode) {
    let pasteRowChildEvent;
    pasteRowChildEvent = {
      rowsObj : rowsObj,
      taskId:taskId,
      mode:mode
    };
    // console.log(addRowEvent);
    this.http.put(BACKEND_URL+"/pasteRowDataChild",pasteRowChildEvent).subscribe((response:any)=>{
      if(response.message=='success') {
        this.dataServiceListener.next(true);
      } else {
        alert(response.message);
      }
    });
  }

  pasteRowDataTop(rowsObj:Object,taskId,mode) {
    let pasteRowTopEvent;
    pasteRowTopEvent = {
      rowsObj : rowsObj,
      taskId:taskId,
      mode:mode
    };
    // console.log(addRowEvent);
    this.http.put(BACKEND_URL+"/pasteRowDataTop",pasteRowTopEvent).subscribe((response:any)=>{
      if(response.message=='success') {
        this.dataServiceListener.next(true);
      } else {
        alert(response.message);
      }
    });
  }

  dragDropColumn(columnCurrIndex,columnObj,targetIndex) {
    let dropColumnEvent;
    dropColumnEvent = {
      columnCurrIndex : columnCurrIndex,
      columnObj:columnObj,
      targetIndex:targetIndex
    };
    this.http.put(BACKEND_URL+"/dragDropColumn",dropColumnEvent).subscribe((response:any)=>{
      if(response.message=='success') {
        this.dataServiceListener.next(true);
      } else {
        alert(response.message);
      }
    });
  }

}


