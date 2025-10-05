import { Component, inject, OnInit, signal, model, computed } from "@angular/core";
import { Store } from "@ngxs/store";
import { PositionState } from "../../store/position.state";
import { GetAllPosition } from "../../store/position.action";
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { CommonModule } from "@angular/common";
import { Position } from "../../models/position.model";
import { PositionForm } from "../position-form/position-form.component";
import { NzNotificationService } from "ng-zorro-antd/notification";

@Component({
  selector: 'app-position-tree',
  standalone: true,
  imports: [NzButtonModule, NzIconModule, NzTreeModule, CommonModule, NzDrawerModule, PositionForm],
  template: `
    <div class='min-h-screen bg-gray-50'>
      <div class="max-w-6xl mx-auto pt-5">
        <div class="bg-white p-6 mb-6 border border-gray-200">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Employee Hierarchy</h1>
              <p class="text-gray-600 mt-1">Manage your organization's position structure</p>
            </div>
            <button nz-button nzType="primary" (click)="openCreateDrawer()" ngSkipHydration>
              Create Position
            </button>
          </div>
        </div>

        <div class="h-[73vh] bg-white p-6 border border-gray-200 overflow-auto">
          @if (treeData$ | async; as treeData) {
            @if (treeData && treeData.length > 0) {
              <nz-tree
              ngSkipHydration
                nzBlockNode
                [nzData]="treeData"
                (nzClick)="onNodeClick($event)">
              </nz-tree>
            } @else {
              <div class="text-center mt-32">
                <h3 class="text-xl font-semibold text-gray-500 mb-2">No positions yet</h3>
                <p class="text-gray-500 mb-6">Start building your organization's hierarchy</p>
                <button nz-button nzType="primary" (click)="openCreateDrawer()">
                  Create Position
                </button>
              </div>
            }
          } 
        </div>
        <nz-drawer
          ngSkipHydration
          [nzVisible]="drawerVisible()"
          nzPlacement="right"
          [nzTitle]="drawerTitle()"
          (nzOnClose)="closeDrawer()"
          [nzWidth]="500"
          nzClosable>
          <div *nzDrawerContent class="h-full">
            <app-position-form
              [position]="selectedPosition()"
              [allPosition]="allPosition()"
              [isNew]="isNew()"
              [notify]="notify"
              [(drawerVisible)]="drawerVisible">
            </app-position-form>
          </div>
        </nz-drawer>
      </div>
    </div>
  `
})
export class PositionTree implements OnInit {
  private store = inject(Store);
  private notification = inject(NzNotificationService);

  treeData$ = this.store.select(PositionState.treeNode);
  allPosition = signal<Position[]>([]);
  selectedPosition = signal<Position | null>(null);

  drawerVisible = model(false);
  isNew = signal(false);

  drawerTitle = computed(() => this.isNew() ? 'Create Position' : `Edit: ${this.selectedPosition()?.name || 'Position'}`
);

  ngOnInit() {
    this.store.dispatch(new GetAllPosition());
    this.store.select(PositionState.allPositions).subscribe((positions) => {
      this.allPosition.set(positions);
    });
  }

  onNodeClick(event: any) {
    const node = event.node;
    if (!node) return;

    const found = this.allPosition().find(p => p.id === node.key);
    if (found) {
      queueMicrotask(() => {
        this.isNew.set(false);
        this.selectedPosition.set(found);
        this.drawerVisible.set(true);
      });
    }
  }

  openCreateDrawer() {
    this.isNew.set(true);
    this.selectedPosition.set(null);
    this.drawerVisible.set(true);
  }

  closeDrawer() {
    this.drawerVisible.set(false);
    this.selectedPosition.set(null);
  }

  notify = (type: 'create' | 'update' | 'delete') => {
    const msgMap = {
      create: 'Position created successfully!',
      update: 'Position updated successfully!',
      delete: 'Position deleted successfully!',
    };
    
    const titleMap = {
      create: 'Success',
      update: 'Success', 
      delete: 'Success'
    };

    this.notification.success(
      titleMap[type],
      msgMap[type],
      {
        nzPlacement: 'bottomRight',
        nzDuration: 3000
      }
    );
  };
}