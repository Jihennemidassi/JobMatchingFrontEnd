import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  form: FormGroup;
  showEntrepriseField = false;
  loading = false;
  errorMessage: string | null = null;
 roles = [
    { value: 'candidat', label: 'Candidate' },
    { value: 'recruteur', label: 'Recruiter' },
    { value: 'admin', label: 'Admin' }
  ];
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      role: ['', Validators.required],
      prenom: ['', [Validators.required, Validators.minLength(3)]],
      nom: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
      entreprise: ['']
    });

    // Dynamic field for recruiters
    this.form.get('role')?.valueChanges.subscribe(role => {
      this.showEntrepriseField = role === 'recruteur';
      const entrepriseControl = this.form.get('entreprise');
      if (role === 'recruteur') {
        entrepriseControl?.setValidators([Validators.required]);
      } else {
        entrepriseControl?.clearValidators();
      }
      entrepriseControl?.updateValueAndValidity();
    });
  }
//    private navigateByRole(data:any) {
//   const routes: Record<string, string> = {
//     admin: '/profile/home',
//     recruteur: '/recruteur/profile-recruteur',
//     candidat: '/candidat/profile-candidat'
//   };
//   const route = routes[data.role] || '/home';
//   //cookies save data 
//     document.cookie = `userRole=${data.role}; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
//     document.cookie = `token=${data.acess_token}; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
//     document.cookie = `id=${data.id}; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
//     document.cookie = `email=${data.email}; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;


//   this.router.navigate([route]);
// }

submit() {console.log("Form valid?", this.form.valid);
console.log("Form value:", this.form.value);

  if (this.form.invalid) {
    this.markFormGroupTouched(this.form);
    return;
  }

  this.loading = true;
  this.errorMessage = null;

  this.authService.sinscrire(this.form.value).pipe(
    catchError((error: HttpErrorResponse) => {
      this.errorMessage =
        error.status === 400
          ? 'Veuillez vérifier les informations saisies.'
          : 'Échec de l\'inscription. Veuillez réessayer.';
      return of(null);
    }),
    finalize(() => this.loading = false)
  ).subscribe(response => {
    console.log("SIGNUP RESPONSE =", response);

    if (response) {
      this.navigateByRole(response);
    }
  });
  return{}
}
 private navigateByRole(data:any) {
  const routes: Record<string, string> = {
    admin: '/profile/home',
    recruteur: '/recruteur/profile-recruteur',
    candidat: '/candidat/profile-candidat'
  };
const role = data.user.role?.toLowerCase(); // <-- fix here
  const route = routes[role];
  //cookies save data 
    document.cookie = `userRole=${data.role}; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
    document.cookie = `token=${data.access_token}; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
    document.cookie = `id=${data.id}; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
    document.cookie = `email=${data.email}; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;


  this.router.navigate([route]);
}

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }


}