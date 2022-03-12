import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-edit-row',
  templateUrl: './add-edit-row.component.html',
  styleUrls: ['./add-edit-row.component.css']
})
export class AddEditRowComponent implements OnInit {
  addEditRowForm:FormGroup;
  selectedValue=null;
  columns;
  row;
  constructor(@Inject(MAT_DIALOG_DATA) public data: {mode:string,title:string,obj:any},
  private dialogRef: MatDialogRef<AddEditRowComponent>) {
    this.columns = [... data.obj.columns];
    this.row = data.obj.row;
  }

  ngOnInit(): void {
    this.createFormControls();
  }

  createFormControls() {
    let form = {};
    for(let i =0;i < this.columns.length;i++) {
      if(this.columns[i].name != 'TaskID') {
        if(typeof(this.row)!="undefined" && this.row != null && this.row !='') {
          if(this.columns[i].dataType == 'DropDownList') {
            //this.selectedValue = this.row[this.columns[i].name];
            this.columns[i].defaultValue = this.row[this.columns[i].name];
          }
      }
        form[this.columns[i].name] = new FormControl(
          typeof(this.row)!="undefined" && this.row != null && this.row !='' ?
          this.row[this.columns[i].name] :  null,
          {
          validators: [Validators.required]
          }
        );
      }
    }
    this.addEditRowForm = new FormGroup(form);

  }

  close() {
    this.dialogRef.close();
  }

  save() {
    if(this.addEditRowForm.invalid) return;
    else {
      //console.log(this.addEditRowForm.value);
      this.dialogRef.close(this.addEditRowForm.value);
    }
  }

}
