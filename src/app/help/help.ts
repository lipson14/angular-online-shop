import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-help',
  imports: [ReactiveFormsModule, Footer],
  templateUrl: './help.html',
  styleUrl: './help.css'
})
export class Help {

  submitted = false

  helpForm: FormGroup = new FormGroup({
    firstName: new FormControl("", [Validators.required]),
    lastName: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    message: new FormControl("")
  })

  submitHelp() {
    this.submitted = true
    setTimeout(() => {
      this.submitted = false
      this.helpForm.reset()
    }, 3000)
  }
}
