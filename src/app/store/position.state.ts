import { inject, Injectable } from "@angular/core";
import { Position } from "../models/position.model";
import {Action, Selector, State, StateContext, UpdateState} from '@ngxs/store';
import { PositionService } from "../services/position.service";
import { CreatePosition, DeletePosition, GetAllPosition, GetPosition, UpdatePosition } from "./position.action";

export interface TreeNode {
  title: string;
  key: string;
  children?: TreeNode[];
  expanded?: boolean;
  isLeaf?: boolean;
  origin?: Position;
}

export interface PositionStateModel{
    positions: Position[];
    selectedPosition?:  Position
}

@State<PositionStateModel>({
    name: 'positions',
    defaults:{
        positions: [],

    }
})

@Injectable()
export class PositionState{
    positionService = inject(PositionService);

    @Selector()
    static allPositions(state: PositionStateModel){
        return state.positions
    }

    @Selector()
    static selectedPosition(state:PositionStateModel){
        return state.selectedPosition
    }

    @Selector()
    static treeNode(state: PositionStateModel){
        return PositionState.buildTree(state.positions)
    }
    private static buildTree(positions: Position[]): TreeNode[] {
        const map = new Map<number | string, TreeNode>();
            positions.forEach(p => {
                map.set(p.id, {
                    title: p.name,
                    key: p.id,
                    children: [],
                    origin: p,
                    expanded: true,
                    isLeaf: true
                });
            })

            const roots : TreeNode[]  = [];
            map.forEach(node => {
                const parentId = node.origin?.parentId ?? null;
                if (parentId == null){
                    roots.push(node)
                } else {
                    const parentNode = map.get(parentId);
                    if (parentNode) {
                        parentNode.children!.push(node)
                        parentNode.isLeaf = false
                    } else{
                        roots.push(node)
                    }
                }
            });
            roots.sort((a,b)=> a.title.localeCompare(b.title));
            map.forEach(node => {
                if (node.children) {
                    node.children.sort((a,b) => a.title.localeCompare(b.title))
                }
            })
            return roots
        }

    @Action(CreatePosition)
    createPosition(ctx: StateContext<PositionStateModel>, action: CreatePosition){
        return this.positionService.create(action.position).subscribe(position => {
            const state = ctx.getState();
            ctx.patchState({positions: [...state.positions, position]})
        })
    }

    @Action(GetAllPosition)
    getAll(ctx:StateContext<PositionStateModel>){
        return this.positionService.getAll().subscribe(positions =>{
            ctx.patchState({positions})
        })
    }

    @Action(GetPosition)
    getPositions(ctx: StateContext<PositionStateModel>, action: GetPosition){
        return this.positionService.getById(action.id).subscribe(position => {
            ctx.patchState({selectedPosition: position})
        })
    }

    @Action(UpdatePosition)
    updatePosition(ctx: StateContext<PositionStateModel>, action: UpdatePosition){
        return this.positionService.update(action.position).subscribe(updated => {
            const state = ctx.getState();
            const updatedPositions = state.positions.map(p => p.id === updated.id ? updated : p)
            ctx.patchState({positions: updatedPositions})
        })

    }

    @Action(DeletePosition)
    deletePositions(ctx: StateContext<PositionStateModel>, action: DeletePosition){
        return this.positionService.delete(action.id).subscribe(() => {
            const state = ctx.getState();
            ctx.patchState({positions: state.positions.filter(p => p.id !== action.id)})
        })
    }
}
