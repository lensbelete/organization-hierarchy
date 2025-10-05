import { Position } from "../models/position.model";

export class CreatePosition {
    static readonly type = '[Position] Create';
    constructor(public position: Omit<Position, 'id'>){}
}

export class GetAllPosition {
    static readonly type = '[Position] GetAll'
}

export class GetPosition {
    static readonly type = '[Position] Get'
    constructor(public id: string){}
}

export class UpdatePosition {
    static readonly type = '[Position] Update'
    constructor(public position: Position){}
}

export class DeletePosition {
    static readonly type = '[Position] Delete'
    constructor(public id: string){}
}