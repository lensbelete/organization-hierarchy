import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Position } from "../models/position.model";

@Injectable({providedIn: 'root'})
export class PositionService{
    private baseUrl = 'http://localhost:3000/positions';
    http = inject(HttpClient)

    getAll(){
        return this.http.get<Position[]>(this.baseUrl);
    }

    getById(id: string){
        return this.http.get<Position>(`${this.baseUrl}/${id}`)
    }

    create(position: Omit<Position, 'id'>){
        return this.http.post<Position>(this.baseUrl, position)
    }

    update(position: Position){
        return this.http.put<Position>(`${this.baseUrl}/${position.id}`, position)
    }

    delete(id: string){
        return this.http.delete(`${this.baseUrl}/${id}`)
    }
}
