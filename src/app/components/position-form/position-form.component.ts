import { CommonModule } from "@angular/common";
import { Component, computed, inject, model, effect } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Store } from "@ngxs/store";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Position } from "../../models/position.model";
import { CreatePosition, DeletePosition, UpdatePosition } from "../../store/position.action";

@Component({
  selector: 'app-position-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule, NzSelectModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <div class="space-y-2">
        <label>Position Name <span class="text-red-500">*</span></label>
        <input nz-input formControlName="name" placeholder="Enter Name" />
      </div>

      <div class="space-y-2">
        <label>Description</label>
        <textarea nz-input formControlName="description" rows="3" placeholder="Enter Description"></textarea>
      </div>

      <div class="space-y-2">
        <label>Parent Position</label>
        <nz-select formControlName="parentId" nzAllowClear nzShowSearch nzPlaceHolder="Select Parent Position" class="w-full">
          @for (option of parentOptions(); track option?.id) {
            <nz-option [nzValue]="option.id" [nzLabel]="option.name"></nz-option>
          }
        </nz-select>
      </div>
          
      <div class="flex justify-between items-center pt-4 border-t border-gray-200">
        <button nz-button nzType="primary" [disabled]="form.invalid" type="submit">
          {{ isNew() ? 'Create Position' : 'Update Position' }}
        </button>
        @if(showDeleteButton()){
          <button nz-button nzDanger type="button" (click)="deletePosition()">Delete</button>
        }
      </div>
    </form>
  `
})
export class PositionForm {
  position = model<Position | null>();
  allPosition = model<Position[]>([]);
  isNew = model(false);
  notify = model<(type: 'create' | 'update' | 'delete') => void>();
  drawerVisible = model<boolean>(false);
  


  private fb = inject(FormBuilder);
  private store = inject(Store);

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    parentId: [null as string | null],
  });

  constructor(){
    effect(() => {
      const pos = this.position();
      const isNew = this.isNew();

      if (!isNew && pos) {
        this.form.patchValue({
          name: pos.name,
          description: pos.description ?? '',
          parentId: pos.parentId ?? null
        });
      } else if (isNew) {
        this.form.reset({
          name: '',
          description: '',
          parentId: null
        });
      }
    });
  }

  
  parentOptions = computed(() => {
    return this.allPosition()
      .filter(p => p.id !== this.position()?.id)
      .map(p => ({ id: p.id, name: p.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  showDeleteButton = computed(() => !this.isNew() && this.position()?.id);

  submit() {
    const value = this.form.value;
    if (this.isNew()) {
        const payload: Omit<Position, "id"> = {
        name: value.name ?? '',
        description: value.description ?? '',
        parentId: value.parentId ?? null,
        };
      this.store.dispatch(new CreatePosition(payload));
      this.notify()?.('create');
    } else {
        const currentPosition = this.position();
        if(!currentPosition?.id){
            return;
        }
        const payload: Position ={
            id: currentPosition.id,
            name: value.name ?? '',
            description: value.description ?? '',
            parentId: value.parentId
        }
        this.store.dispatch(new UpdatePosition(payload))
        this.notify()?.('update');
    }
    this.drawerVisible.set(false);
  }

  deletePosition() {
    const pos = this.position();
    if (!pos) return;
    this.store.dispatch(new DeletePosition(pos.id));
    this.notify()?.('delete');
    this.drawerVisible.set(false);
  }
}
