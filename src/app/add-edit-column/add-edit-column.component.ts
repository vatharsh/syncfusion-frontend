import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-add-edit-column',
  templateUrl: './add-edit-column.component.html',
  styleUrls: ['./add-edit-column.component.css']
})
export class AddEditColumnComponent implements OnInit {
  form:FormGroup;
  dataType = ['Text', 'Num','Date','Boolean'];
  selectedDataType ='Text'
  textWrap = false;
  localHeaderObj;
  element=null;
  elementList = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: {mode:string,title:string,obj:Object},
  private dialogRef: MatDialogRef<AddEditColumnComponent>) {
    this.localHeaderObj = {...data.obj};
    this.selectedDataType =this.localHeaderObj.dataType;
    if(typeof(this.localHeaderObj.dropDownValues)!="undefined") {
      if(this.localHeaderObj.dropDownValues.length > 0) {
        this.localHeaderObj.dropDownValues.forEach(element => {
          this.elementList.push(element);
        });
      }
    }
  }

  ngOnInit(): void {
    this.textWrap =this.localHeaderObj == null ?
    false : this.localHeaderObj.textWrap;

    this.form = new FormGroup({
      'name' : new FormControl(this.localHeaderObj == null ?
        null : this.localHeaderObj.name,{
        validators: [Validators.required]
      }),
      'dataType' : new FormControl(this.localHeaderObj == null ?
        null : this.localHeaderObj.dataType,{
        validators: [Validators.required]
      }),
      'defaultValue' : new FormControl(this.localHeaderObj == null ?
        null : this.localHeaderObj.defaultValue,{
        validators: [Validators.required]
      }),
      'minColumnWidth' : new FormControl(this.localHeaderObj == null ?
        null : this.localHeaderObj.minColumnWidth,{
        validators: [Validators.required]
      }),
      'fontSize' : new FormControl(this.localHeaderObj == 10 ?
        null : this.localHeaderObj.fontSize,{
        validators: [Validators.required]
      }),
      'fontColor' : new FormControl(this.localHeaderObj == null ?
        null : this.localHeaderObj.fontColor,{
        validators: [Validators.required]
      }),
      'backgroundColor' : new FormControl(this.localHeaderObj == null ?
        null : this.localHeaderObj.backgroundColor,{
        validators: [Validators.required]
      }),
      'alignment' : new FormControl(this.localHeaderObj == null ?
        null : this.localHeaderObj.alignment,{
        validators: [Validators.required]
      }),
      'textWrap' : new FormControl({
        validators: [Validators.required]
      }),
      'dropDownValues' : new FormControl(this.elementList)
    });
  }

  dataTypeSelected() {
      //console.log(this.selectedDataType)
  }

  addElement() {
    if(typeof(this.element)!="undefined" && this.element != null && this.element.trim() !='') {
      if(this.elementList.indexOf(this.element) === -1 ) {
        this.elementList.push(this.element);
        this.element = null;
      }
      else alert("Item already exists!");
    }
  }

  deleteElement(ele) {
    var index = this.elementList.indexOf(ele);
    this.elementList.splice(index,1);

  }

  close() {
    // console.log(this.form.value);
    this.dialogRef.close();
  }

  save() {
    if(this.selectedDataType == 'DropDownList' && this.elementList.length ==0) {
      alert('Enter valid dropdown values!');
      return;
    }
    //console.log(this.form.value);
    this.form.patchValue({
          'dropDownValues' : this.elementList
    });
    if(this.form.invalid) return;
    else {
      this.dialogRef.close(this.form.value);
    }
  }

}
