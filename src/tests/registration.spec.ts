import { action, NgxsDataPluginModule, NgxsDataRepository, StateRepository } from '@ngxs-labs/data';
import { NgxsModule, Select, State, Store } from '@ngxs/store';
import { Any } from '../lib/interfaces/internal.interface';
import { Observable } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, OnInit } from '@angular/core';

describe('Check correct deep instance', () => {
    let component: AppComponent;
    let store: Store;
    let fixture: ComponentFixture<AppComponent>;

    interface IFormState {
        dirty?: boolean;
        model: Any;
    }

    class FormState {
        public dirty?: boolean = false;
        public model: Any = undefined;
    }

    interface IRegistrationStateModel {
        address: IFormState;
    }

    class RegistrationStateModel {
        public address: FormState = new FormState();
    }

    @StateRepository()
    @State<IRegistrationStateModel>({
        name: 'registration',
        defaults: new RegistrationStateModel()
    })
    class RegistrationState extends NgxsDataRepository<IRegistrationStateModel> {
        @Select((state: Any) => state.registration)
        public address$: Observable<IFormState>;

        @action()
        public addAddress(address: IFormState) {
            return this.ctx.setState(() => ({ address }));
        }
    }

    @Component({
        selector: 'my-app',
        template: ''
    })
    class AppComponent implements OnInit {
        public name = 'Angular + NGXS';
        public result: Any = null;

        constructor(private registration: RegistrationState) {}

        public ngOnInit() {
            this.result = this.registration.addAddress({ dirty: true, model: { hello: 'world' } });
        }
    }

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([RegistrationState]), NgxsDataPluginModule.forRoot()],
            declarations: [AppComponent]
        });

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        store = TestBed.get(Store);
    });

    it('should be correct ngOnInit', () => {
        expect(component.name).toEqual('Angular + NGXS');
        expect(store.snapshot()).toEqual({ registration: { address: { dirty: false } } });

        component.ngOnInit();

        expect(store.snapshot()).toEqual({ registration: { address: { dirty: true, model: { hello: 'world' } } } });
        expect(component.result).toEqual(undefined);
    });
});
