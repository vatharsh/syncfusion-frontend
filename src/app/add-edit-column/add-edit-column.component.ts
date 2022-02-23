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
  textWrap = false;
  localHeaderObj;
  constructor(@Inject(MAT_DIALOG_DATA) public data: {mode:string,title:string,obj:Object},
  private dialogRef: MatDialogRef<AddEditColumnComponent>) {
    this.localHeaderObj = {...data.obj};
    console.log(this.localHeaderObj);
  }

  ngOnInit(): void {
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
      'textWrap' : new FormControl(this.localHeaderObj == null ?
        null : this.localHeaderObj.textWrap,{
        validators: [Validators.required]
      })
    });
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    //console.log(this.form.invalid);
    if(this.form.invalid) return;
    else {
      this.dialogRef.close(this.form.value);
    }
  }

}
