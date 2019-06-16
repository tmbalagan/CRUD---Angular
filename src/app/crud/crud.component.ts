import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { User } from '../crud/user.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.css']
})
export class CrudComponent implements OnInit {
  userForm: FormGroup;
  isValidForm: any;
  id: any;
  usersList: Array<{ email: string, password: string }> = [];
  isEmpty: Function;


  constructor(private formBuilder: FormBuilder, private toastr: ToastrService) { }

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      password: ['', [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{5,}')]],
      id: ['']
    });

    if (Array.isArray(JSON.parse(window.localStorage.getItem('user')))) {
      this.usersList = JSON.parse(window.localStorage.getItem('user'));
    }

    this.isEmpty = (value: any) => {
      if (typeof value === undefined || value === undefined) { return true; }
      if (typeof value === null || value === null) { return true; }
      if (value.constructor === Array && value.length === 0) { return true; }
      if (value.constructor === Object && Object.entries(value).length === 0) { return true; }
      // if (value.constructor === Boolean && value === false) { return true; }
      return false;
    };
  }

  validateAllFormFields(formGroup: FormGroup) {
    let failureReason;
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (!this.isEmpty(control) && control instanceof FormControl) {
        if (!this.isEmpty(control.valid) && control.valid === false) {
          failureReason = ('Kindly Fill ' + field + ' Field');
        }
      }
    });
    return failureReason;
  }
  newUser({ value, valid }: { value: User, valid: boolean }) {
    if (valid) {
      this.isValidForm = this.validateAllFormFields(this.userForm);
      if (!this.isEmpty(this.isValidForm)) {
        this.toastr.error(this.isValidForm);
      } else {
        if (!this.isEmpty(value.id)) {
          if (Array.isArray(this.usersList) && this.usersList.length > 0) {
            const checkEmailExist = this.usersList.filter(function (val: any) {
              return (val.email === value.email);
            }).length > 0;

            if (checkEmailExist) {
              this.toastr.warning('User email exist already');
            } else {
              this.usersList.push(value);
              window.localStorage.setItem('user', JSON.stringify(this.usersList));
              this.toastr.info('User updated');
            }
          }
        } else {
          this.id = new Date().getUTCMilliseconds();
          value.id = this.id;
          this.usersList.push(value);
          window.localStorage.setItem('user', JSON.stringify(this.usersList));
          this.toastr.success('Added new user');
        }
        this.userForm.reset();
      }
    } else {
      this.toastr.error('Kindly fill all fields');
    }
  }
  editUser(user: any) {
    this.userForm.setValue({
      email: user.email,
      password: user.password,
      id: user.id
    });
  }

  deleteUser(index) {
    const sure = confirm('Are you sure you want to delete?');
    if (sure) {
      const deluser = JSON.parse(window.localStorage.getItem('user'));
      const delUserInfo = deluser[index];
      deluser.splice(index, 1);
      this.usersList = deluser;
      window.localStorage.setItem('user', JSON.stringify(this.usersList));
      this.userForm.reset();
      this.toastr.error('Deleted ' + delUserInfo.email + ' Successfully');
    }
  }
}
